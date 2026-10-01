import { Suspense } from "react";
import type { Metadata } from "next";
import { FiltroReceitas } from "@/components/FiltroReceitas";

export const metadata: Metadata = {
  title: "Receitas",
  description: "Receitas sem açúcar e sal opcional para bebês e crianças, com filtros por alergia.",
};

export default function ReceitasPage() {
  return (
    <div className="pt-10 space-y-6">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">📖 Receitas</h1>
        <p className="text-ink-soft text-lg max-w-2xl">
          Todas sem açúcar e com sal opcional. Marque as restrições da sua família e a gente mostra só o
          que serve.
        </p>
      </header>
      <Suspense fallback={<p className="text-ink-soft">Carregando receitinhas...</p>}>
        <FiltroReceitas />
      </Suspense>
    </div>
  );
}
