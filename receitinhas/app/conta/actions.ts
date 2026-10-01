"use server";

import { q, um } from "@/lib/db";
import { conferirSenha, exigirUsuario, gerarHash } from "@/lib/auth";

export interface EstadoSenha {
  erro?: string;
  ok?: boolean;
}

export async function trocarSenha(_prev: EstadoSenha, form: FormData): Promise<EstadoSenha> {
  const u = await exigirUsuario("/conta");
  const atual = String(form.get("atual") ?? "");
  const nova = String(form.get("nova") ?? "");
  const confirma = String(form.get("confirma") ?? "");

  if (nova.length < 6) return { erro: "A nova senha precisa ter pelo menos 6 caracteres." };
  if (nova !== confirma) return { erro: "A confirmação não bate com a nova senha." };

  const row = await um<{ senha_hash: string }>("SELECT senha_hash FROM usuarios WHERE id = $1", [u.id]);
  if (!row || !(await conferirSenha(atual, row.senha_hash))) return { erro: "A senha atual está incorreta." };

  await q("UPDATE usuarios SET senha_hash = $1 WHERE id = $2", [await gerarHash(nova), u.id]);
  return { ok: true };
}
