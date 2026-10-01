"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { receitas } from "@/data/receitas";
import { ALERGENOS, IDADES, REFEICOES, type Alergeno, type Idade, type Refeicao } from "@/lib/types";
import { ReceitaCard } from "./ReceitaCard";

const ORDEM_IDADE: Idade[] = ["6m", "9m", "12m"];

export function FiltroReceitas() {
  const params = useSearchParams();
  const router = useRouter();

  const [alergenos, setAlergenos] = useState<Alergeno[]>(() =>
    params.getAll("filtro").filter((f): f is Alergeno => f in ALERGENOS),
  );
  const [refeicao, setRefeicao] = useState<Refeicao | "todas">(() => {
    const r = params.get("refeicao");
    return r && r in REFEICOES ? (r as Refeicao) : "todas";
  });
  const [idade, setIdade] = useState<Idade | "todas">("todas");
  const [busca, setBusca] = useState("");

  // mantém a URL compartilhável
  useEffect(() => {
    const q = new URLSearchParams();
    alergenos.forEach((a) => q.append("filtro", a));
    if (refeicao !== "todas") q.set("refeicao", refeicao);
    const s = q.toString();
    router.replace(s ? `/receitas?${s}` : "/receitas", { scroll: false });
  }, [alergenos, refeicao, router]);

  const toggleAlergeno = (a: Alergeno) =>
    setAlergenos((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  const lista = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return receitas.filter((r) => {
      if (alergenos.some((a) => !r[a])) return false;
      if (refeicao !== "todas" && r.refeicao !== refeicao) return false;
      if (idade !== "todas" && ORDEM_IDADE.indexOf(r.idadeMin) > ORDEM_IDADE.indexOf(idade)) return false;
      if (termo) {
        const texto = [r.nome, ...r.ingredientes].join(" ").toLowerCase();
        if (!texto.includes(termo)) return false;
      }
      return true;
    });
  }, [alergenos, refeicao, idade, busca]);

  return (
    <div className="space-y-6">
      <div className="card p-5 space-y-4 no-print">
        <div>
          <p className="font-bold mb-2">🩺 Restrições (pode marcar mais de uma)</p>
          <div className="flex flex-wrap gap-2">
            {(Object.keys(ALERGENOS) as Alergeno[]).map((a) => {
              const on = alergenos.includes(a);
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => toggleAlergeno(a)}
                  aria-pressed={on}
                  className={`chip ${on ? "bg-coral text-white" : "bg-cream text-ink border-ink/10"}`}
                >
                  {ALERGENOS[a].emoji} {ALERGENOS[a].label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <p className="font-bold mb-2">🍽️ Refeição</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setRefeicao("todas")}
                className={`chip ${refeicao === "todas" ? "bg-ink text-white" : "bg-cream"}`}
              >
                Todas
              </button>
              {(Object.keys(REFEICOES) as Refeicao[]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setRefeicao(k)}
                  className={`chip ${refeicao === k ? `${REFEICOES[k].cor} ring-2 ring-ink/30` : "bg-cream"}`}
                >
                  {REFEICOES[k].emoji} {REFEICOES[k].label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="font-bold mb-2">👶 Idade do bebê</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setIdade("todas")}
                className={`chip ${idade === "todas" ? "bg-ink text-white" : "bg-cream"}`}
              >
                Todas
              </button>
              {ORDEM_IDADE.map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIdade(i)}
                  className={`chip ${idade === i ? "bg-sky ring-2 ring-ink/30" : "bg-cream"}`}
                >
                  {IDADES[i]}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label className="block">
          <span className="font-bold mb-2 block">🔎 Buscar por nome ou ingrediente</span>
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Ex.: abóbora, frango, aveia..."
            className="w-full rounded-full border-2 border-ink/10 bg-cream px-5 py-3 outline-none focus:border-coral"
          />
        </label>
      </div>

      <p className="text-ink-soft font-bold">
        {lista.length === 0
          ? "Nenhuma receita com essa combinação ainda. Tente tirar um filtro ou use o gerador com IA ✨"
          : `${lista.length} ${lista.length === 1 ? "receita" : "receitas"} encontrada${lista.length === 1 ? "" : "s"}`}
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {lista.map((r) => (
          <ReceitaCard key={r.slug} receita={r} />
        ))}
      </div>
    </div>
  );
}
