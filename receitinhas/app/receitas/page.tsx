import type { Metadata } from "next";
import { FiltroReceitas } from "@/components/FiltroReceitas";
import { receitas } from "@/data/receitas";
import { exigirUsuario } from "@/lib/auth";

export const metadata: Metadata = { title: "Receitas" };

type Props = { searchParams: Promise<{ filtro?: string | string[]; refeicao?: string }> };

export default async function ReceitasPage({ searchParams }: Props) {
  const [u, sp] = await Promise.all([exigirUsuario("/receitas"), searchParams]);
  const filtroInicial = sp.filtro ? (Array.isArray(sp.filtro) ? sp.filtro : [sp.filtro]) : [];
  return (
    <div className="pt-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl">📖 Receitas</h1>
        <p className="text-ink-soft text-lg max-w-2xl font-light">
          Oi, {u.nome.split(" ")[0]}! Todas sem açúcar e com sal opcional. Marque as restrições da sua
          família e a gente mostra só o que serve.
        </p>
      </header>
      <FiltroReceitas receitas={receitas} filtroInicial={filtroInicial} refeicaoInicial={sp.refeicao} />
    </div>
  );
}
