import Link from "next/link";
import type { Receita } from "@/lib/types";
import { TagIdade, TagRefeicao, TagsAlergenos } from "./Tags";

export function ReceitaCard({ receita }: { receita: Receita }) {
  return (
    <Link
      href={`/receitas/${receita.slug}`}
      className="card p-5 flex flex-col gap-3 hover:-translate-y-1 transition-transform pop"
    >
      {receita.foto ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={receita.foto} alt="" className="w-full aspect-[4/3] object-cover rounded-2xl -mt-1" loading="lazy" />
      ) : null}
      <div className="flex items-start justify-between gap-3">
        <div className="text-5xl leading-none" aria-hidden>
          {receita.emoji}
        </div>
        <span className="text-xs font-semibold text-ink-soft whitespace-nowrap">⏱️ {receita.tempo} min</span>
      </div>
      <h3 className="text-xl leading-snug">{receita.nome}</h3>
      <div className="flex flex-wrap gap-1.5">
        <TagRefeicao refeicao={receita.refeicao} />
        <TagIdade idade={receita.idadeMin} />
      </div>
      <TagsAlergenos receita={receita} compact />
    </Link>
  );
}
