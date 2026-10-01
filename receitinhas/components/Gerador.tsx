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

interface Me {
  loginDisponivel: boolean;
  geradorDoSite: boolean;
  usuario: { nome: string; foto: string | null; usaPlano: boolean } | null;
}

export function Gerador() {
  const [me, setMe] = useState<Me | null>(null);
  const [avisoLogin, setAvisoLogin] = useState<string | null>(null);

  const carregarMe = () =>
    fetch("/api/me", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: Me) => setMe(d))
      .catch(() => setMe({ loginDisponivel: false, geradorDoSite: false, usuario: null }));

  // status de login e retorno do OAuth (?login=ok|erro|nao-configurado)
  useEffect(() => {
    carregarMe();
    const q = new URLSearchParams(window.location.search);
    const login = q.get("login");
    if (login === "ok") setAvisoLogin("✅ Você entrou com o ChatGPT!");
    if (login === "erro") setAvisoLogin(`😕 Não deu para entrar com o ChatGPT: ${q.get("motivo") ?? "tente de novo"}.`);
    if (login === "nao-configurado")
      setAvisoLogin("😕 O login com ChatGPT ainda não foi configurado neste site (falta o client ID da OpenAI).");
    if (login) window.history.replaceState({}, "", window.location.pathname);
  }, []);

  async function sair() {
    await fetch("/api/auth/chatgpt/sair", { method: "POST" });
    setAvisoLogin(null);
    carregarMe();
  }

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
  const [origem, setOrigem] = useState<"plano" | "site" | null>(null);

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
      const data = (await res.json()) as { cardapio?: Cardapio; erro?: string; origem?: "plano" | "site" };
      if (!res.ok || !data.cardapio) {
        setErro(data.erro ?? "Não deu certo. Tente de novo.");
        return;
      }
      setCardapio(data.cardapio);
      setOrigem(data.origem ?? null);
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
      <section className="card p-5 md:p-6 no-print bg-lilac/40" aria-live="polite">
        {avisoLogin && <p className="mb-3 font-bold">{avisoLogin}</p>}
        {me?.usuario ? (
          <div className="flex flex-wrap items-center gap-3">
            {me.usuario.foto ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={me.usuario.foto} alt="" className="w-10 h-10 rounded-full border-2 border-white" />
            ) : (
              <span className="text-3xl" aria-hidden>
                🧑‍🍳
              </span>
            )}
            <div className="flex-1 min-w-[12rem]">
              <p className="font-bold">Olá, {me.usuario.nome}!</p>
              <p className="text-sm text-ink-soft">
                {me.usuario.usaPlano
                  ? "As receitas serão geradas com o seu plano do ChatGPT."
                  : me.geradorDoSite
                    ? "Seu plano do ChatGPT não liberou uso em outros apps, então vamos usar a IA do site."
                    : "Seu plano do ChatGPT não liberou uso em outros apps (precisa ser Plus ou Pro)."}
              </p>
            </div>
            <button type="button" className="btn btn-ghost" onClick={sair}>
              Sair
            </button>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-[12rem]">
              <p className="font-bold">Quer gerar com o seu ChatGPT?</p>
              <p className="text-sm text-ink-soft">
                Entre com a sua conta: se você tem ChatGPT Plus ou Pro, as receitas usam o seu plano.
                {me?.geradorDoSite ? " Sem login, usamos a IA do site mesmo." : ""}
              </p>
            </div>
            <a
              href="/api/auth/chatgpt/start"
              className={`btn btn-primary ${me && !me.loginDisponivel ? "opacity-60" : ""}`}
              aria-disabled={me ? !me.loginDisponivel : undefined}
              title={me && !me.loginDisponivel ? "Login ainda não configurado" : undefined}
            >
              <ChatGptLogo /> Entrar com ChatGPT
            </a>
          </div>
        )}
      </section>

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
              {salvoEm && (
                <p className="text-sm text-ink-soft">
                  Gerado em {salvoEm}
                  {origem === "plano" ? " com o seu ChatGPT" : origem === "site" ? " com a IA do site" : ""} · fica salvo
                  neste navegador
                </p>
              )}
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
      <p className="text-sm rounded-2xl bg-mint/40 px-3 py-2">💡 {ideia.dica}</p>

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

function ChatGptLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M22.28 9.82a5.98 5.98 0 0 0-.51-4.91 6.05 6.05 0 0 0-6.51-2.9A6.07 6.07 0 0 0 4.98 4.18a5.98 5.98 0 0 0-4 2.9 6.05 6.05 0 0 0 .74 7.1 5.98 5.98 0 0 0 .51 4.91 6.05 6.05 0 0 0 6.51 2.9 5.98 5.98 0 0 0 4.51 2.01 6.06 6.06 0 0 0 5.77-4.21 5.98 5.98 0 0 0 4-2.9 6.06 6.06 0 0 0-.74-7.07zm-9.02 12.61a4.47 4.47 0 0 1-2.88-1.04l.14-.08 4.78-2.76a.78.78 0 0 0 .39-.68v-6.74l2.02 1.17a.07.07 0 0 1 .04.05v5.58a4.5 4.5 0 0 1-4.49 4.5zm-9.66-4.13a4.47 4.47 0 0 1-.54-3.01l.14.09 4.78 2.76a.78.78 0 0 0 .78 0l5.84-3.37v2.33a.08.08 0 0 1-.03.06L9.74 19.95a4.5 4.5 0 0 1-6.14-1.65zM2.34 7.9a4.49 4.49 0 0 1 2.37-1.97v5.68a.77.77 0 0 0 .39.68l5.81 3.35-2.02 1.17a.08.08 0 0 1-.07 0L4 14.03A4.5 4.5 0 0 1 2.34 7.9zm16.6 3.86-5.84-3.38 2.02-1.16a.08.08 0 0 1 .07 0l4.83 2.79a4.49 4.49 0 0 1-.68 8.1v-5.68a.79.79 0 0 0-.4-.67zm2.01-3.02-.14-.09-4.77-2.78a.78.78 0 0 0-.79 0L9.41 9.24V6.91a.07.07 0 0 1 .03-.06l4.83-2.78a4.5 4.5 0 0 1 6.68 4.66zM8.31 12.86l-2.02-1.16a.08.08 0 0 1-.04-.06V6.07a4.5 4.5 0 0 1 7.38-3.45l-.14.08-4.78 2.76a.78.78 0 0 0-.39.68zm1.1-2.37L12 8.99l2.6 1.5v3l-2.6 1.5-2.6-1.5z" />
    </svg>
  );
}
