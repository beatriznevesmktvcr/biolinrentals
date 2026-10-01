import { ALERGENOS, IDADES, REFEICOES, type Alergeno, type Receita } from "@/lib/types";

export function TagRefeicao({ refeicao }: { refeicao: Receita["refeicao"] }) {
  const r = REFEICOES[refeicao];
  return (
    <span className={`chip ${r.cor} text-ink text-xs`}>
      {r.emoji} {r.label}
    </span>
  );
}

export function TagIdade({ idade }: { idade: Receita["idadeMin"] }) {
  return <span className="chip bg-sky text-ink text-xs">👶 {IDADES[idade]}</span>;
}

export function TagsAlergenos({ receita, compact = false }: { receita: Receita; compact?: boolean }) {
  const ativos = (Object.keys(ALERGENOS) as Alergeno[]).filter((k) => receita[k]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {ativos.map((k) => (
        <span key={k} className="chip bg-mint/70 text-ink text-[11px] px-2 py-1" title={ALERGENOS[k].label}>
          ✓ {compact ? ALERGENOS[k].curto : ALERGENOS[k].label}
        </span>
      ))}
    </div>
  );
}
