"use server";

import { redirect } from "next/navigation";
import { um } from "@/lib/db";
import {
  bloqueado,
  chaveTentativa,
  conferirSenha,
  iniciarSessao,
  limparFalhas,
  registrarAcesso,
  registrarFalha,
} from "@/lib/auth";

export interface EstadoLogin {
  erro?: string;
}

export async function entrar(_prev: EstadoLogin, form: FormData): Promise<EstadoLogin> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const senha = String(form.get("senha") ?? "");
  const voltar = String(form.get("voltar") ?? "");

  if (!email || !senha) return { erro: "Preencha e-mail e senha." };

  const k = await chaveTentativa(email);
  if (bloqueado(k)) return { erro: "Muitas tentativas. Espere 15 minutos e tente de novo." };

  const u = await um<{ id: number; senha_hash: string; ativo: boolean }>(
    "SELECT id, senha_hash, ativo FROM usuarios WHERE email = $1",
    [email],
  );
  const ok = u ? await conferirSenha(senha, u.senha_hash) : false;
  if (!u || !ok) {
    registrarFalha(k);
    return { erro: "E-mail ou senha incorretos." };
  }
  if (!u.ativo) return { erro: "Seu acesso está desativado. Fale com a gente pelo WhatsApp." };

  limparFalhas(k);
  await iniciarSessao(u.id);
  await registrarAcesso(u.id);
  redirect(voltar.startsWith("/") && !voltar.startsWith("//") ? voltar : "/receitas");
}
