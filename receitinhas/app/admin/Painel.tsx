"use client";

import { useActionState, useState, useTransition } from "react";
import type { Usuario } from "@/lib/auth";
import { alternarAtivo, criarMembro, excluirMembro, novaSenha, type EstadoAdmin } from "./actions";

function Credenciais({ c }: { c: NonNullable<EstadoAdmin["credenciais"]> }) {
  const texto = `Oi, ${c.nome.split(" ")[0]}! 💛 Seu acesso ao Receitinhas está liberado.\n\nEntre em: ${typeof window !== "undefined" ? window.location.origin : ""}\nLogin: ${c.email}\nSenha: ${c.senha}\n\nO acesso é vitalício. Qualquer dúvida é só chamar!`;
  const [copiado, setCopiado] = useState(false);
  return (
    <div className="rounded-2xl bg-mint/50 p-4 space-y-2 pop">
      <p className="font-semibold">✅ Pronto! Copie e mande no WhatsApp (a senha só aparece agora):</p>
      <pre className="whitespace-pre-wrap text-sm bg-white/70 rounded-xl p-3 font-body">{texto}</pre>
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => navigator.clipboard.writeText(texto).then(() => setCopiado(true))}
      >
        {copiado ? "Copiado ✓" : "📋 Copiar mensagem"}
      </button>
    </div>
  );
}

function Aviso({ estado }: { estado: EstadoAdmin }) {
  if (estado.erro) return <p role="alert" className="rounded-2xl bg-coral/15 border border-coral/40 px-4 py-3 text-sm">😕 {estado.erro}</p>;
  if (estado.credenciais) return <Credenciais c={estado.credenciais} />;
  if (estado.ok) return <p className="rounded-2xl bg-mint/50 px-4 py-3 text-sm">✅ {estado.ok}</p>;
  return null;
}

export function FormNovoMembro() {
  const [estado, action, pendente] = useActionState<EstadoAdmin, FormData>(criarMembro, {});
  return (
    <form action={action} className="card p-6 space-y-4">
      <h2 className="text-2xl">➕ Criar login</h2>
      <label className="block">
        <span className="font-semibold block mb-1">Nome</span>
        <input name="nome" required className="field" placeholder="Maria da Silva" />
      </label>
      <label className="block">
        <span className="font-semibold block mb-1">E-mail (vai ser o login)</span>
        <input name="email" type="email" required className="field" placeholder="maria@email.com" />
      </label>
      <label className="block">
        <span className="font-semibold block mb-1">Senha (opcional, deixe em branco para gerar uma fácil)</span>
        <input name="senha" className="field" minLength={6} placeholder="gerada automaticamente" />
      </label>
      <label className="block">
        <span className="font-semibold block mb-1">Observação (opcional)</span>
        <input name="observacao" className="field" placeholder="Ex.: Pix de 01/10, indicação da Ana" />
      </label>
      <Aviso estado={estado} />
      <button type="submit" disabled={pendente} className="btn btn-primary w-full">
        {pendente ? "Criando..." : "Criar login"}
      </button>
    </form>
  );
}

export function LinhaMembro({ membro }: { membro: Usuario }) {
  const [estado, action, pendente] = useActionState<EstadoAdmin, FormData>(novaSenha, {});
  const [transicao, start] = useTransition();
  const data = (d: string | null) => (d ? new Date(d).toLocaleDateString("pt-BR") : "nunca");

  return (
    <div className="p-4 space-y-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="text-2xl" aria-hidden>
          {membro.ativo ? "💛" : "💤"}
        </span>
        <div className="flex-1 min-w-[12rem]">
          <p className="font-semibold">
            {membro.nome} {!membro.ativo && <span className="chip sm bg-cream text-xs ml-1">desativado</span>}
          </p>
          <p className="text-sm text-ink-soft font-light">
            {membro.email} · criado em {data(membro.criado_em)} · último acesso: {data(membro.ultimo_acesso)}
            {membro.observacao ? ` · ${membro.observacao}` : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <form action={action}>
            <input type="hidden" name="id" value={membro.id} />
            <button type="submit" disabled={pendente} className="chip bg-sky">
              🔁 Nova senha
            </button>
          </form>
          <button
            type="button"
            disabled={transicao}
            onClick={() => start(() => alternarAtivo(membro.id))}
            className="chip bg-cream"
          >
            {membro.ativo ? "⏸️ Desativar" : "▶️ Reativar"}
          </button>
          <button
            type="button"
            disabled={transicao}
            onClick={() => {
              if (confirm(`Excluir o login de ${membro.nome}? Essa ação não pode ser desfeita.`)) start(() => excluirMembro(membro.id));
            }}
            className="chip bg-coral/20"
          >
            🗑️
          </button>
        </div>
      </div>
      <Aviso estado={estado} />
    </div>
  );
}
