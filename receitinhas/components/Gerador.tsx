"use client";

import { useEffect, useState } from "react";
import { ALERGENOS, type Alergeno } from "@/lib/types";
import { IDADE_LABEL, type Cardapio, type Ideia, type Pedido } from "@/lib/cardapio";

const EXEMPLO =
  "ovos, aveia em flocos, batata-doce, abóbora, cenoura, frango, carne moída, arroz, feijão, maçã, mamão, abacate, leite de coco, azeite, alho, cebola";

const MENSAGENS_ESPERA = [
  "Abrindo a geladeira... 🧊",
  "Lavando os legumes... 🥕",
  "Escolhendo as frutinhas... 🍓",
  "Cortando tudo em palitinhos seguros... 🔪",
  "Mexendo a panela... 🍲",
  "Quase pronto, só ajeitando o pratinho... 🍽️",
];

const SECOES: { chave: keyof Omit<Cardapio, "listaDeCompras">; label: string; emoji: string; cor: string }[] = [
  { chave: "cafe", label: "Café da manhã", emoji: "🌞", cor: "bg-sun" },
  { chave: "almocoJantar", label: "Almoço & jantar", emoji: "🍽️", cor: "bg-mint" },
  { chave: "lanche", label: "Lanche", emoji: "🍓", cor: "bg-berry" },
];

const STORAGE_KEY = "receitinhas:ultimo-cardapio";

export function Gerador() {
  const [ingredientes, setIngredientes] = useState("");
  const [idade, setIdade] = useState<Pedido["idade"]>("9m");
  const [restricoes, setRestricoes] = useState<Alergeno[]>([]);
  const [observacoes, setObservacoes] = useState("");

  const [carregando, setCarregando] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [erro, setErro] = useState<string | null>(null);
  const [cardapio, setCardapio] = useState<Cardapio | null>(null);
  const [secao, setSecao] = useState<(typeof SECOES)[number]["chave"]>("cafe");
  const [salvoEm, setSalvoEm] = useState<string | null>(null);

  // recupera o último cardápio salvo no navegador
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const salvo = JSON.parse(raw) as { cardapio: Cardapio; quando: string; pedido: Pedido };
        setCardapio(salvo.cardapio);
        setSalvoEm(salvo.quando);
        setIngredientes(salvo.pedido.ingredientes);
        setIdade(salvo.pedido.idade);
        setRestricoes(salvo.pedido.restricoes);
      }
    } catch {
      /* sem localStorage, segue o jogo */
    }
  }, []);

  useEffect(() => {
    if (!carregando) return;
    const id = setInterval(() => setMsgIndex((i) => (i + 1) % MENSAGENS_ESPERA.length), 2500);
    return () => clearInterval(id);
  }, [carregando]);

  const toggle = (a: Alergeno) =>
    setRestricoes((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));

  async function gerar(e: React.FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);
    setMsgIndex(0);
    const pedido: Pedido = { ingredientes, idade, restricoes, observacoes };
    try {
      const res = await fetch("/api/gerar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido),
      });
      const data = (await res.json()) as { cardapio?: Cardapio; erro?: string };
      if (!res.ok || !data.cardapio) {
        setErro(data.erro ?? "Não deu certo. Tente de novo.");
        return;
      }
      setCardapio(data.cardapio);
      setSecao("cafe");
      const quando = new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
      setSalvoEm(quando);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ cardapio: data.cardapio, quando, pedido }));
      } catch {
        /* ignora */
      }
      setTimeout(() => document.getElementById("resultado")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch {
      setErro("Sem conexão com o servidor. Confira a internet e tente de novo.");
    } finally {
      setCarregando(false);
    }
  }

  function limpar() {
    setCardapio(null);
    setSalvoEm(null);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignora */
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={gerar} className="card p-6 md:p-8 space-y-6 no-print">
        <label className="block">
          <span className="font-bold text-lg block mb-2">🧺 O que você tem em casa?</span>
          <textarea
            required
            minLength={3}
            value={ingredientes}
            onChange={(e) => setIngredientes(e.target.value)}
            rows={4}
            placeholder="Ex.: ovos, aveia, batata-doce, frango, cenoura, maçã..."
            className="w-full rounded-3xl border-2 border-ink/10 bg-cream px-5 py-4 outline-none focus:border-coral resize-y"
          />
          <button
            type="button"
            onClick={() => setIngredientes(EXEMPLO)}
            className="text-sm font-bold text-coral-dark mt-2 hover:underline"
          >
            Usar uma lista de exemplo
          </button>
        </label>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <span className="font-bold text-lg block mb-2">👶 Idade</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(IDADE_LABEL) as Pedido["idade"][]).map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setIdade(k)}
                  aria-pressed={idade === k}
                  className={`chip ${idade === k ? "bg-sky ring-2 ring-ink/30" : "bg-cream"}`}
                >
                  {IDADE_LABEL[k]}
                </button>
              ))}
            </div>
          </div>
          <div>
            <span className="font-bold text-lg block mb-2">🩺 Restrições</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ALERGENOS) as Alergeno[]).map((a) => {
                const on = restricoes.includes(a);
                return (
                  <button
                    key={a}
                    type="button"
                    onClick={() => toggle(a)}
                    aria-pressed={on}
                    className={`chip ${on ? "bg-coral text-white" : "bg-cream"}`}
                  >
                    {ALERGENOS[a].emoji} {ALERGENOS[a].label}
                  </button>
                );
              })}
            </div>
            {restricoes.length === 0 && (
              <p className="text-xs text-ink-soft mt-2">Nenhuma marcada: receitas gerais (sem açúcar, sal opcional).</p>
            )}
          </div>
        </div>

        <label className="block">
          <span className="font-bold text-lg block mb-2">💬 Alguma observação? (opcional)</span>
          <input
            value={observacoes}
            onChange={(e) => setObservacoes(e.target.value)}
            maxLength={500}
            placeholder="Ex.: não gosta de brócolis, tenho pouco tempo, estamos sem forno..."
            className="w-full rounded-full border-2 border-ink/10 bg-cream px-5 py-3 outline-none focus:border-coral"
          />
        </label>

        {erro && (
          <p role="alert" className="rounded-2xl bg-coral/15 border border-coral/40 px-4 py-3">
            😕 {erro}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button type="submit" disabled={carregando} className="btn btn-primary text-lg">
            {carregando ? "Cozinhando..." : "✨ Gerar 21 ideias"}
          </button>
          {carregando && (
            <span className="flex items-center gap-2 text-ink-soft font-bold" aria-live="polite">
              <span className="flex gap-1">
                <span className="dot w-2 h-2 rounded-full bg-coral" />
                <span className="dot w-2 h-2 rounded-full bg-coral" style={{ animationDelay: "0.2s" }} />
                <span className="dot w-2 h-2 rounded-full bg-coral" style={{ animationDelay: "0.4s" }} />
              </span>
              {MENSAGENS_ESPERA[msgIndex]}
            </span>
          )}
        </div>
      </form>

      {cardapio && (
        <section id="resultado" className="space-y-6 pop">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-3xl font-bold">Seu cardápio da semana</h2>
              {salvoEm && <p className="text-sm text-ink-soft">Gerado em {salvoEm} · fica salvo neste navegador</p>}
            </div>
            <div className="flex gap-2 no-print">
              <button type="button" className="btn btn-ghost" onClick={() => window.print()}>
                🖨️ Imprimir
              </button>
              <button type="button" className="btn btn-ghost" onClick={limpar}>
                🗑️ Limpar
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 no-print" role="tablist">
            {SECOES.map((s) => (
              <button
                key={s.chave}
                role="tab"
                aria-selected={secao === s.chave}
                type="button"
                onClick={() => setSecao(s.chave)}
                className={`chip text-base ${secao === s.chave ? `${s.cor} ring-2 ring-ink/30` : "bg-white"}`}
              >
                {s.emoji} {s.label} <span className="opacity-60">({cardapio[s.chave].length})</span>
              </button>
            ))}
          </div>

          {SECOES.map((s) => (
            <div key={s.chave} className={secao === s.chave ? "block" : "hidden print:block"}>
              <h3 className="text-2xl font-bold mb-3 hidden print:block">
                {s.emoji} {s.label}
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {cardapio[s.chave].map((ideia, i) => (
                  <IdeiaCard key={`${s.chave}-${i}`} ideia={ideia} numero={i + 1} cor={s.cor} />
                ))}
              </div>
            </div>
          ))}

          {cardapio.listaDeCompras.length > 0 && (
            <div className="card p-6 bg-lilac/50">
              <h3 className="text-2xl font-bold mb-2">🛒 Faltou pouco: lista de compras</h3>
              <ul className="flex flex-wrap gap-2">
                {cardapio.listaDeCompras.map((item) => (
                  <li key={item} className="chip bg-white text-ink">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

function IdeiaCard({ ideia, numero, cor }: { ideia: Ideia; numero: number; cor: string }) {
  const [aberto, setAberto] = useState(false);
  return (
    <div className="card p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-2">
        <span className={`chip ${cor} text-ink text-xs`}>Dia {numero}</span>
        <span className="text-xs font-bold text-ink-soft">⏱️ {ideia.tempoMin} min</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden>
          {ideia.emoji}
        </span>
        <h4 className="text-xl font-bold leading-snug">{ideia.nome}</h4>
      </div>
      <p className="text-sm rounded-2xl bg-mint/40 px-3 py-2">🔪 {ideia.comoServir}</p>

      <button
        type="button"
        onClick={() => setAberto((a) => !a)}
        className="text-sm font-bold text-coral-dark self-start no-print"
        aria-expanded={aberto}
      >
        {aberto ? "Esconder receita ▲" : "Ver receita ▼"}
      </button>

      <div className={aberto ? "block space-y-3" : "hidden print:block space-y-3"}>
        <div>
          <p className="font-bold">🧺 Ingredientes</p>
          <ul className="list-disc pl-5 text-sm space-y-0.5">
            {ideia.ingredientes.map((i, k) => (
              <li key={k}>{i}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="font-bold">👩‍🍳 Preparo</p>
          <ol className="list-decimal pl-5 text-sm space-y-0.5">
            {ideia.modo.map((m, k) => (
              <li key={k}>{m}</li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
