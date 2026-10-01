import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getReceita, receitas } from "@/data/receitas";
import { TagIdade, TagRefeicao, TagsAlergenos } from "@/components/Tags";
import { PrintButton } from "@/components/PrintButton";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return receitas.map((r) => ({ slug: r.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = getReceita(slug);
  return { title: r ? r.nome : "Receita" };
}

export default async function ReceitaPage({ params }: Props) {
  const { slug } = await params;
  const r = getReceita(slug);
  if (!r) notFound();

  const parecidas = receitas
    .filter((x) => x.slug !== r.slug && x.refeicao === r.refeicao)
    .slice(0, 3);

  return (
    <article className="pt-10 space-y-8 max-w-3xl mx-auto">
      <Link href="/receitas" className="chip bg-white no-print">
        ← Voltar para as receitas
      </Link>

      <header className="card p-6 md:p-8 space-y-4">
        <div className="text-7xl" aria-hidden>
          {r.emoji}
        </div>
        <h1 className="text-3xl md:text-5xl font-bold leading-tight">{r.nome}</h1>
        <div className="flex flex-wrap gap-2">
          <TagRefeicao refeicao={r.refeicao} />
          <TagIdade idade={r.idadeMin} />
          <span className="chip bg-cream text-ink text-xs">⏱️ {r.tempo} min</span>
          <span className="chip bg-cream text-ink text-xs">🍽️ {r.rende}</span>
        </div>
        <TagsAlergenos receita={r} />
        <p className="text-sm text-ink-soft">
          🚫🍬 Sem açúcar · 🧂 Sal opcional (só acima de 1 ano, uma pitadinha)
        </p>
      </header>

      <div className="grid md:grid-cols-5 gap-6">
        <section className="card p-6 md:col-span-2">
          <h2 className="text-2xl font-bold mb-3">🧺 Ingredientes</h2>
          <ul className="space-y-2">
            {r.ingredientes.map((i) => (
              <li key={i} className="flex gap-2">
                <span className="text-mint-dark">●</span>
                <span>{i}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-6 md:col-span-3">
          <h2 className="text-2xl font-bold mb-3">👩‍🍳 Modo de preparo</h2>
          <ol className="space-y-3">
            {r.modo.map((passo, i) => (
              <li key={i} className="flex gap-3">
                <span className="shrink-0 w-8 h-8 rounded-full bg-coral text-white font-display font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <span className="pt-1">{passo}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {(r.dicas?.length || r.trocas?.length) && (
        <section className="card p-6 bg-sun/50 space-y-3">
          {r.dicas?.map((d) => (
            <p key={d}>
              <strong>💡 Dica:</strong> {d}
            </p>
          ))}
          {r.trocas?.map((t) => (
            <p key={t}>
              <strong>🔁 Troca:</strong> {t}
            </p>
          ))}
        </section>
      )}

      <div className="flex flex-wrap gap-3 no-print">
        <PrintButton />
        <Link href="/gerar" className="btn btn-ghost">
          ✨ Gerar cardápio com IA
        </Link>
      </div>

      {parecidas.length > 0 && (
        <section className="space-y-3 no-print">
          <h2 className="text-2xl font-bold">Você também pode gostar</h2>
          <ul className="flex flex-wrap gap-2">
            {parecidas.map((p) => (
              <li key={p.slug}>
                <Link href={`/receitas/${p.slug}`} className="chip bg-white">
                  {p.emoji} {p.nome}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
