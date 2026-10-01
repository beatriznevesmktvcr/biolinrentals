"use client";

import { useState } from "react";
import { FASES_LABEL, FORMAS, frutas } from "@/data/cortes";
import { CorteIcon } from "./CorteIcon";

type FaseKey = keyof typeof FASES_LABEL;

export function GuiaCortes() {
  const [fase, setFase] = useState<FaseKey>("6m");
  const [busca, setBusca] = useState("");

  const lista = frutas.filter((f) => f.nome.toLowerCase().includes(busca.trim().toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="card p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Fase do bebê">
          {(Object.keys(FASES_LABEL) as FaseKey[]).map((k) => {
            const on = fase === k;
            return (
              <button
                key={k}
                role="tab"
                aria-selected={on}
                type="button"
                onClick={() => setFase(k)}
                className={`chip text-sm md:text-base ${on ? "bg-coral text-white shadow-md" : "bg-cream"}`}
              >
                {FASES_LABEL[k].emoji} {FASES_LABEL[k].titulo}
              </button>
            );
          })}
        </div>
        <input
          type="search"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar fruta..."
          className="md:ml-auto rounded-full border-2 border-ink/10 bg-cream px-5 py-2 outline-none focus:border-coral"
        />
      </div>

      <p className="text-ink-soft">
        <strong>{FASES_LABEL[fase].titulo}:</strong> {FASES_LABEL[fase].sub}.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lista.map((f) => {
          const fs = f.fases[fase];
          return (
            <div key={f.slug} className="card p-5 flex flex-col gap-3 pop">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-4xl" aria-hidden>
                    {f.emoji}
                  </span>
                  <h3 className="text-xl font-bold">{f.nome}</h3>
                </div>
                <CorteIcon forma={fs.forma} cor={f.cor} size={56} />
              </div>
              <span className="chip bg-mint/70 text-ink text-xs self-start">✂️ {FORMAS[fs.forma]}</span>
              <p>{fs.texto}</p>
              {f.alerta && (
                <p className="text-sm rounded-2xl bg-coral/15 border border-coral/40 px-3 py-2">
                  ⚠️ <strong>Atenção:</strong> {f.alerta}
                </p>
              )}
              {f.dica && <p className="text-sm text-ink-soft">💡 {f.dica}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
