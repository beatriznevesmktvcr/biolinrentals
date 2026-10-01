/**
 * Sign in with ChatGPT (SIWC): OAuth 2.0 Authorization Code + PKCE + OpenID Connect.
 *
 * A pessoa entra com a conta do ChatGPT e, se tiver um plano elegível (Plus/Pro) e
 * autorizar, o gerador usa o plano dela para chamar a API (escopo chatgpt.tokens.use.direct).
 *
 * Variáveis de ambiente:
 *   SIWC_CLIENT_ID   - client id fornecido pela OpenAI (começa com "oaiapp_")
 *   APP_URL          - endereço público do app (ex.: https://receitinhas.vercel.app)
 *   SESSION_SECRET   - texto longo e aleatório que criptografa o cookie de sessão
 *   SIWC_ISSUER      - opcional, padrão https://auth.openai.com
 *   SIWC_RESOURCE    - opcional, identificador do recurso pedido no OAuth
 *   SIWC_SCOPES      - opcional, escopos separados por espaço
 */
import { createRemoteJWKSet, jwtVerify, EncryptJWT, jwtDecrypt, type JWTPayload } from "jose";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";

export const ISSUER = (process.env.SIWC_ISSUER ?? "https://auth.openai.com").replace(/\/$/, "");
export const CLIENT_ID = process.env.SIWC_CLIENT_ID ?? "";
export const APP_URL = (process.env.APP_URL ?? "").replace(/\/$/, "");
export const RESOURCE = process.env.SIWC_RESOURCE ?? "https://api.openai.com/v1/responses";
export const PLAN_SCOPE = "chatgpt.tokens.use.direct";
export const SCOPES =
  process.env.SIWC_SCOPES ?? `openid profile email offline_access resource.invoke ${PLAN_SCOPE}`;

export const loginConfigurado = () => Boolean(CLIENT_ID && APP_URL && process.env.SESSION_SECRET);
export const redirectUri = () => `${APP_URL}/api/auth/chatgpt/callback`;

/* ---------- endpoints (descoberta OIDC com fallback documentado) ---------- */
interface Endpoints {
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  jwks_uri: string;
  revocation_endpoint?: string;
}

const FALLBACK: Endpoints = {
  authorization_endpoint: `${ISSUER}/api/accounts/authorize`,
  token_endpoint: `${ISSUER}/api/accounts/oauth/token`,
  userinfo_endpoint: `${ISSUER}/api/accounts/oauth/userinfo`,
  jwks_uri: `${ISSUER}/.well-known/jwks.json`,
};

let cache: { at: number; eps: Endpoints } | null = null;

export async function endpoints(): Promise<Endpoints> {
  if (cache && Date.now() - cache.at < 6 * 60 * 60 * 1000) return cache.eps;
  try {
    const res = await fetch(`${ISSUER}/.well-known/openid-configuration`, { signal: AbortSignal.timeout(5000) });
    if (res.ok) {
      const doc = (await res.json()) as Partial<Endpoints>;
      const eps: Endpoints = {
        authorization_endpoint: doc.authorization_endpoint ?? FALLBACK.authorization_endpoint,
        token_endpoint: doc.token_endpoint ?? FALLBACK.token_endpoint,
        userinfo_endpoint: doc.userinfo_endpoint ?? FALLBACK.userinfo_endpoint,
        jwks_uri: doc.jwks_uri ?? FALLBACK.jwks_uri,
        revocation_endpoint: doc.revocation_endpoint,
      };
      cache = { at: Date.now(), eps };
      return eps;
    }
  } catch {
    /* usa o fallback */
  }
  return FALLBACK;
}

/* ---------- PKCE ---------- */
const b64url = (b: Buffer) => b.toString("base64url");
export const aleatorio = (bytes = 32) => b64url(randomBytes(bytes));
export const desafioPkce = (verifier: string) => b64url(createHash("sha256").update(verifier).digest());

/* ---------- cookies criptografados (JWE com SESSION_SECRET) ---------- */
const chave = () => createHash("sha256").update(process.env.SESSION_SECRET ?? "").digest();

async function selar(payload: JWTPayload, expiraEm: string) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(expiraEm)
    .encrypt(chave());
}

async function abrir<T>(token: string | undefined): Promise<T | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, chave());
    return payload as T;
  } catch {
    return null;
  }
}

/** Cookie cross-site só quando o receitinhas.html roda em outro domínio (ALLOWED_ORIGIN definido). */
const crossSite = () => Boolean(process.env.ALLOWED_ORIGIN && process.env.ALLOWED_ORIGIN !== "*");
export const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: (crossSite() ? "none" : "lax") as "none" | "lax",
  path: "/",
  maxAge,
});

export const COOKIE_TX = "siwc_tx";
export const COOKIE_SESSAO = "receitinhas_sessao";

export interface Transacao extends JWTPayload {
  state: string;
  verifier: string;
  nonce: string;
  voltar: string;
}

export interface Sessao extends JWTPayload {
  sub: string;
  nome?: string;
  email?: string;
  foto?: string;
  accessToken: string;
  refreshToken?: string;
  expiraEm: number; // epoch ms
  usaPlano: boolean; // escopo chatgpt.tokens.use.direct concedido
}

export const selarTransacao = (t: Transacao) => selar(t, "10m");
export const abrirTransacao = (c?: string) => abrir<Transacao>(c);
export const selarSessao = (s: Sessao) => selar(s, "30d");

export async function lerSessao(): Promise<Sessao | null> {
  const jar = await cookies();
  return abrir<Sessao>(jar.get(COOKIE_SESSAO)?.value);
}

/* ---------- troca de código e refresh ---------- */
interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
}

async function postToken(form: Record<string, string>): Promise<TokenResponse> {
  const { token_endpoint } = await endpoints();
  const res = await fetch(token_endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
    body: new URLSearchParams(form),
    signal: AbortSignal.timeout(15000),
  });
  const data = (await res.json().catch(() => ({}))) as TokenResponse & { error?: string; error_description?: string };
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description ?? data.error ?? `token endpoint respondeu ${res.status}`);
  }
  return data;
}

export function trocarCodigo(code: string, verifier: string) {
  return postToken({
    grant_type: "authorization_code",
    client_id: CLIENT_ID,
    code,
    code_verifier: verifier,
    redirect_uri: redirectUri(),
    resource: RESOURCE,
  });
}

export function renovarToken(refreshToken: string) {
  return postToken({
    grant_type: "refresh_token",
    client_id: CLIENT_ID,
    refresh_token: refreshToken,
    resource: RESOURCE,
  });
}

/** Garante um access token válido; renova (e devolve a sessão nova) se estiver vencendo. */
export async function sessaoComTokenValido(s: Sessao): Promise<{ sessao: Sessao; renovada: boolean }> {
  if (Date.now() < s.expiraEm - 60_000) return { sessao: s, renovada: false };
  if (!s.refreshToken) throw new Error("sessão expirada");
  const t = await renovarToken(s.refreshToken);
  const sessao: Sessao = {
    ...s,
    accessToken: t.access_token,
    refreshToken: t.refresh_token ?? s.refreshToken,
    expiraEm: Date.now() + (t.expires_in ?? 3600) * 1000,
    usaPlano: t.scope ? t.scope.split(" ").includes(PLAN_SCOPE) : s.usaPlano,
  };
  return { sessao, renovada: true };
}

/* ---------- verificação do id_token ---------- */
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

export async function verificarIdToken(idToken: string, nonce: string) {
  const { jwks_uri } = await endpoints();
  jwks ??= createRemoteJWKSet(new URL(jwks_uri));
  const { payload } = await jwtVerify(idToken, jwks, { issuer: ISSUER, audience: CLIENT_ID });
  if (payload.nonce !== nonce) throw new Error("nonce inválido");
  return payload as JWTPayload & { name?: string; email?: string; picture?: string };
}

export function tokenConcedePlano(t: TokenResponse) {
  return (t.scope ?? "").split(" ").includes(PLAN_SCOPE);
}

/** Só aceita voltar para o próprio app ou para o site autorizado (receitinhas.html). */
export function destinoSeguro(voltar: string | null): string {
  const padrao = `${APP_URL}/gerar`;
  if (!voltar) return padrao;
  const permitidos = [APP_URL, process.env.ALLOWED_ORIGIN ?? ""].filter((o) => o && o !== "*");
  try {
    const u = new URL(voltar);
    return permitidos.some((o) => u.origin === new URL(o).origin) ? u.toString() : padrao;
  } catch {
    return padrao;
  }
}
