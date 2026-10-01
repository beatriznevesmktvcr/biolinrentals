import Link from "next/link";
import { receitas } from "@/data/receitas";
import { ALERGENOS, REFEICOES, type Alergeno } from "@/lib/types";
import { ReceitaCard } from "@/components/ReceitaCard";

const atalhos: { href: string; titulo: string; texto: string; emoji: string; cor: string }[] = [
  {
    href: "/receitas",
    titulo: "Receitas",
    texto: "Sem açúcar, sal opcional e separadas por alergia. Café, almoço, jantar e lanche.",
    emoji: "📖",
    cor: "bg-peach",
  },
  {
    href: "/gerar",
    titulo: "Gerar com IA",
    texto: "Diga o que tem na geladeira e receba 7 cafés, 7 almoços/jantares e 7 lanches. Pode usar o seu ChatGPT.",
    emoji: "✨",
    cor: "bg-lilac",
  },
];

export default function Home() {
  const destaques = ["panqueca-de-aveia-sem-ovo", "almondegas-de-carne-com-aveia", "cookies-de-aveia-e-maca"]
    .map((slug) => receitas.find((r) => r.slug === slug))
    .filter((r): r is NonNullable<typeof r> => Boolean(r));

  const contagem = (chave: Alergeno) => receitas.filter((r) => r[chave]).length;

  return (
    <div className="space-y-14 pt-10">
      {/* HERO */}
      <section className="text-center space-y-6">
        <div className="text-6xl md:text-7xl flex justify-center gap-3" aria-hidden>
          <span className="float">🍓</span>
          <span className="float" style={{ animationDelay: "0.6s" }}>
            🥑
          </span>
          <span className="float" style={{ animationDelay: "1.2s" }}>
            🥕
          </span>
        </div>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight">
          Ideias de <span className="text-coral-dark">receitinhas</span>
          <br />
          para todo dia, sem sufoco
        </h1>
        <p className="text-lg md:text-xl text-ink-soft max-w-2xl mx-auto">
          Receitas sem açúcar, com sal opcional, pensadas para bebês e crianças. Filtre por alergia ou
          gere um cardápio da semana com o que você tem em casa.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/gerar" className="btn btn-primary text-lg">
            ✨ Gerar cardápio com IA
          </Link>
          <Link href="/receitas" className="btn btn-ghost text-lg">
            📖 Ver todas as receitas
          </Link>
        </div>
      </section>

      {/* ATALHOS */}
      <section className="grid md:grid-cols-2 gap-5">
        {atalhos.map((a) => (
          <Link
            key={a.href}
            href={a.href}
            className={`card ${a.cor} p-6 hover:-translate-y-1 transition-transform block`}
          >
            <div className="text-5xl mb-3" aria-hidden>
              {a.emoji}
            </div>
            <h2 className="text-2xl font-bold">{a.titulo}</h2>
            <p className="text-ink-soft mt-1">{a.texto}</p>
          </Link>
        ))}
      </section>

      {/* CATEGORIAS */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Escolha pela necessidade da sua família</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <Link href="/receitas" className="card p-5 hover:-translate-y-1 transition-transform">
            <div className="text-4xl" aria-hidden>
              🌟
            </div>
            <h3 className="text-xl font-bold mt-2">Gerais</h3>
            <p className="text-sm text-ink-soft">Sem açúcar e sal opcional, sempre.</p>
            <p className="text-xs font-bold text-coral-dark mt-2">{receitas.length} receitas</p>
          </Link>
          {(Object.keys(ALERGENOS) as Alergeno[]).map((k) => (
            <Link
              key={k}
              href={`/receitas?filtro=${k}`}
              className="card p-5 hover:-translate-y-1 transition-transform"
            >
              <div className="text-4xl" aria-hidden>
                {ALERGENOS[k].emoji}
              </div>
              <h3 className="text-xl font-bold mt-2">{ALERGENOS[k].label}</h3>
              <p className="text-sm text-ink-soft">{ALERGENOS[k].descricao}</p>
              <p className="text-xs font-bold text-coral-dark mt-2">{contagem(k)} receitas</p>
            </Link>
          ))}
        </div>
      </section>

      {/* REFEIÇÕES */}
      <section className="flex flex-wrap gap-3">
        {(Object.keys(REFEICOES) as (keyof typeof REFEICOES)[]).map((k) => (
          <Link key={k} href={`/receitas?refeicao=${k}`} className={`chip ${REFEICOES[k].cor} text-ink text-base`}>
            {REFEICOES[k].emoji} {REFEICOES[k].label}
          </Link>
        ))}
      </section>

      {/* DESTAQUES */}
      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Queridinhas da casa</h2>
        <div className="grid md:grid-cols-3 gap-5">
          {destaques.map((r) => (
            <ReceitaCard key={r.slug} receita={r} />
          ))}
        </div>
      </section>

      {/* REGRINHAS */}
      <section className="card p-6 md:p-8 bg-sun/60">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">Nossas regrinhas de ouro</h2>
        <ul className="grid md:grid-cols-3 gap-4 text-ink">
          <li className="flex gap-3">
            <span className="text-3xl" aria-hidden>
              🚫🍬
            </span>
            <span>
              <strong>Zero açúcar</strong> até os 2 anos: nem mel, nem adoçante, nem suco de caixinha.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-3xl" aria-hidden>
              🧂
            </span>
            <span>
              <strong>Sal opcional:</strong> nada antes de 1 ano, e só uma pitadinha depois.
            </span>
          </li>
          <li className="flex gap-3">
            <span className="text-3xl" aria-hidden>
              🥣
            </span>
            <span>
              <strong>Comida de verdade:</strong> ingredientes simples que você já tem em casa.
            </span>
          </li>
        </ul>
      </section>
    </div>
  );
}
