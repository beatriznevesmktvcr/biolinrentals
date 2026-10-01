"use server";

import { revalidatePath } from "next/cache";
import { q, um } from "@/lib/db";
import { exigirAdmin, gerarHash, gerarSenha } from "@/lib/auth";
import { CHAVES, salvarConfiguracao } from "@/lib/config";

export interface EstadoAdmin {
  erro?: string;
  ok?: string;
  /** Senha recém-criada, mostrada uma única vez para você copiar e mandar no WhatsApp. */
  credenciais?: { nome: string; email: string; senha: string };
}

export async function criarMembro(_prev: EstadoAdmin, form: FormData): Promise<EstadoAdmin> {
  await exigirAdmin();
  const nome = String(form.get("nome") ?? "").trim();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const observacao = String(form.get("observacao") ?? "").trim();
  const senhaInformada = String(form.get("senha") ?? "").trim();

  if (!nome || !email) return { erro: "Preencha nome e e-mail." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { erro: "Esse e-mail não parece válido." };
  if (senhaInformada && senhaInformada.length < 6) return { erro: "A senha precisa ter pelo menos 6 caracteres." };
  if (await um("SELECT 1 FROM usuarios WHERE email = $1", [email])) return { erro: "Já existe um login com esse e-mail." };

  const senha = senhaInformada || gerarSenha();
  await q("INSERT INTO usuarios (email, nome, senha_hash, papel, observacao) VALUES ($1, $2, $3, 'membro', $4)", [
    email,
    nome,
    await gerarHash(senha),
    observacao,
  ]);
  revalidatePath("/admin");
  return { ok: `Login criado para ${nome}.`, credenciais: { nome, email, senha } };
}

export async function alternarAtivo(id: number) {
  const admin = await exigirAdmin();
  if (id === admin.id) return;
  await q("UPDATE usuarios SET ativo = NOT ativo WHERE id = $1 AND papel = 'membro'", [id]);
  revalidatePath("/admin");
}

export async function novaSenha(_prev: EstadoAdmin, form: FormData): Promise<EstadoAdmin> {
  await exigirAdmin();
  const id = Number(form.get("id"));
  const u = await um<{ nome: string; email: string }>("SELECT nome, email FROM usuarios WHERE id = $1", [id]);
  if (!u) return { erro: "Membro não encontrado." };
  const senha = gerarSenha();
  await q("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [await gerarHash(senha), id]);
  revalidatePath("/admin");
  return { ok: `Nova senha gerada para ${u.nome}.`, credenciais: { nome: u.nome, email: u.email, senha } };
}

export async function excluirMembro(id: number) {
  const admin = await exigirAdmin();
  if (id === admin.id) return;
  await q("DELETE FROM usuarios WHERE id = $1 AND papel = 'membro'", [id]);
  revalidatePath("/admin");
}

export async function salvarLoja(_prev: EstadoAdmin, form: FormData): Promise<EstadoAdmin> {
  await exigirAdmin();
  await Promise.all([
    salvarConfiguracao(CHAVES.comoComprar, String(form.get("comoComprar") ?? "").trim()),
    salvarConfiguracao(CHAVES.whatsapp, String(form.get("whatsapp") ?? "").trim()),
    salvarConfiguracao(CHAVES.valor, String(form.get("valor") ?? "").trim()),
  ]);
  revalidatePath("/");
  revalidatePath("/admin");
  return { ok: "Textos da vitrine salvos." };
}
