"use client";

import { useActionState } from "react";
import { trocarSenha, type EstadoSenha } from "./actions";

export function FormSenha() {
  const [estado, action, pendente] = useActionState<EstadoSenha, FormData>(trocarSenha, {});

  return (
    <form action={action} className="card p-6 md:p-8 space-y-4">
      <h2 className="text-2xl">Trocar minha senha</h2>
      <label className="block">
        <span className="font-semibold block mb-1">Senha atual</span>
        <input name="atual" type="password" autoComplete="current-password" required className="field" />
      </label>
      <label className="block">
        <span className="font-semibold block mb-1">Nova senha</span>
        <input name="nova" type="password" autoComplete="new-password" required minLength={6} className="field" />
      </label>
      <label className="block">
        <span className="font-semibold block mb-1">Confirmar nova senha</span>
        <input name="confirma" type="password" autoComplete="new-password" required minLength={6} className="field" />
      </label>
      {estado.erro && (
        <p role="alert" className="rounded-2xl bg-coral/15 border border-coral/40 px-4 py-3 text-sm">
          😕 {estado.erro}
        </p>
      )}
      {estado.ok && <p className="rounded-2xl bg-mint/50 px-4 py-3 text-sm">✅ Senha trocada com sucesso!</p>}
      <button type="submit" disabled={pendente} className="btn btn-primary w-full">
        {pendente ? "Salvando..." : "Salvar nova senha"}
      </button>
    </form>
  );
}
