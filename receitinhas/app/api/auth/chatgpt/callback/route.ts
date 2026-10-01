import { NextResponse } from "next/server";
import {
  APP_URL,
  COOKIE_SESSAO,
  COOKIE_TX,
  abrirTransacao,
  cookieOpts,
  selarSessao,
  tokenConcedePlano,
  trocarCodigo,
  verificarIdToken,
  type Sessao,
} from "@/lib/siwc";

export const runtime = "nodejs";

/** Volta da OpenAI: confere o state, troca o código por tokens e cria a sessão. */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const cookieTx = req.headers.get("cookie")?.match(new RegExp(`${COOKIE_TX}=([^;]+)`))?.[1];
  const tx = await abrirTransacao(cookieTx ? decodeURIComponent(cookieTx) : undefined);
  const voltar = new URL(tx?.voltar || `${APP_URL}/gerar`);

  const falhar = (motivo: string) => {
    voltar.searchParams.set("login", "erro");
    voltar.searchParams.set("motivo", motivo);
    const res = NextResponse.redirect(voltar);
    res.cookies.delete(COOKIE_TX);
    return res;
  };

  const erroOAuth = url.searchParams.get("error");
  if (erroOAuth) return falhar(url.searchParams.get("error_description") ?? erroOAuth);

  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!tx || !code || !state || state !== tx.state) return falhar("sessão de login inválida, tente de novo");

  try {
    const t = await trocarCodigo(code, tx.verifier);
    let perfil: { sub?: string; name?: string; email?: string; picture?: string } = {};
    if (t.id_token) {
      perfil = await verificarIdToken(t.id_token, tx.nonce);
    }
    if (!perfil.sub) return falhar("a OpenAI não devolveu a identidade da conta");

    const sessao: Sessao = {
      sub: perfil.sub,
      nome: perfil.name,
      email: perfil.email,
      foto: perfil.picture,
      accessToken: t.access_token,
      refreshToken: t.refresh_token,
      expiraEm: Date.now() + (t.expires_in ?? 3600) * 1000,
      usaPlano: tokenConcedePlano(t),
    };

    voltar.searchParams.set("login", "ok");
    const res = NextResponse.redirect(voltar);
    res.cookies.delete(COOKIE_TX);
    res.cookies.set(COOKIE_SESSAO, await selarSessao(sessao), cookieOpts(30 * 24 * 3600));
    return res;
  } catch (e) {
    console.error("Falha no login com ChatGPT", e);
    return falhar(e instanceof Error ? e.message : "não deu para concluir o login");
  }
}
