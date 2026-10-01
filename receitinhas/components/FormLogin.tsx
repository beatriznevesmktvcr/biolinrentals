"use client";

import { useActionState } from "react";
import { entrar, type EstadoLogin } from "@/lib/login-action";

export function FormLogin({ voltar }: { voltar: string }) {
  const [estado, action, pendente] = useActionState<EstadoLogin, FormData>(entrar, {});

  return (
    <form action={action} className="card p-6 md:p-8 space-y-4">
      <input type="hidden" name="voltar" value={voltar} />
      <label className="block">
        <span className="font-semibold block mb-1">E-mail</span>
        <input name="email" type="email" autoComplete="username" required className="field" placeholder="voce@email.com" />
      </label>
      <label className="block">
        <span className="font-semibold block mb-1">Senha</span>
        <input name="senha" type="password" autoComplete="current-password" required className="field" placeholder="••••••••" />
      </label>
      {estado.erro && (
        <p role="alert" className="rounded-2xl bg-coral/15 border border-coral/40 px-4 py-3 text-sm">
          😕 {estado.erro}
        </p>
      )}
      <button type="submit" disabled={pendente} className="btn btn-primary w-full text-lg">
        {pendente ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
