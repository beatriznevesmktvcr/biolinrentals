import { EncryptJWT, jwtDecrypt } from "jose";
import { createHash } from "node:crypto";
import { compare, hash } from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { q, um } from "./db";

export const COOKIE = "receitinhas_sessao";
const DIAS_SESSAO = 90;

export interface Usuario {
  id: number;
  email: string;
  nome: string;
  papel: "admin" | "membro";
  ativo: boolean;
  observacao: string;
  criado_em: string;
  ultimo_acesso: string | null;
}

function chave() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") throw new Error("Defina a variável SESSION_SECRET.");
    return createHash("sha256").update("segredo-de-desenvolvimento").digest();
  }
  return createHash("sha256").update(secret).digest();
}

export const gerarHash = (senha: string) => hash(senha, 10);
export const conferirSenha = (senha: string, senhaHash: string) => compare(senha, senhaHash);

export async function iniciarSessao(usuarioId: number) {
  const token = await new EncryptJWT({ uid: usuarioId })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${DIAS_SESSAO}d`)
    .encrypt(chave());
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: DIAS_SESSAO * 24 * 3600,
  });
}

export async function encerrarSessao() {
  (await cookies()).set(COOKIE, "", { path: "/", maxAge: 0 });
}

/** Usuário logado e ativo, ou null. Deduplicado por requisição. */
export const usuarioAtual = cache(async (): Promise<Usuario | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtDecrypt(token, chave());
    const uid = Number(payload.uid);
    if (!uid) return null;
    const u = await um<Usuario>(
      "SELECT id, email, nome, papel, ativo, observacao, criado_em, ultimo_acesso FROM usuarios WHERE id = $1",
      [uid],
    );
    return u && u.ativo ? u : null;
  } catch {
    return null;
  }
});

export async function exigirUsuario(voltar?: string): Promise<Usuario> {
  const u = await usuarioAtual();
  if (!u) redirect(`/entrar${voltar ? `?voltar=${encodeURIComponent(voltar)}` : ""}`);
  return u;
}

export async function exigirAdmin(): Promise<Usuario> {
  const u = await exigirUsuario("/admin");
  if (u.papel !== "admin") redirect("/receitas");
  return u;
}

/* ---------- proteção simples contra tentativas repetidas de login ---------- */
const tentativas = new Map<string, { n: number; ate: number }>();
const LIMITE = 6;
const JANELA_MS = 15 * 60 * 1000;

export async function chaveTentativa(email: string) {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local";
  return `${ip}|${email}`;
}

export function bloqueado(k: string) {
  const t = tentativas.get(k);
  if (!t) return false;
  if (Date.now() > t.ate) {
    tentativas.delete(k);
    return false;
  }
  return t.n >= LIMITE;
}

export function registrarFalha(k: string) {
  const t = tentativas.get(k);
  if (!t || Date.now() > t.ate) tentativas.set(k, { n: 1, ate: Date.now() + JANELA_MS });
  else t.n += 1;
}

export const limparFalhas = (k: string) => tentativas.delete(k);

/** Senha fácil de ditar por WhatsApp: 3 sílabas + 3 números (ex.: lumeta482). */
export function gerarSenha() {
  const c = "bcdfghjklmnprstv", v = "aeiou";
  const s = () => c[Math.floor(Math.random() * c.length)] + v[Math.floor(Math.random() * v.length)];
  return `${s()}${s()}${s()}${Math.floor(100 + Math.random() * 900)}`;
}

export async function registrarAcesso(id: number) {
  await q("UPDATE usuarios SET ultimo_acesso = now() WHERE id = $1", [id]);
}
