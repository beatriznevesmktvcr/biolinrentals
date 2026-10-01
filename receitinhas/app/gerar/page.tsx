import type { Metadata } from "next";
import { Gerador } from "@/components/Gerador";

export const metadata: Metadata = {
  title: "Gerar cardápio com IA",
  description:
    "Conte o que você tem em casa e receba 7 ideias de café da manhã, 7 de almoço/jantar e 7 de lanche, sem açúcar e respeitando as alergias.",
};

export default function GerarPage() {
  return (
    <div className="pt-10 space-y-8">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">✨ Gerar cardápio com IA</h1>
        <p className="text-ink-soft text-lg max-w-2xl">
          Escreva o que tem na sua geladeira e despensa. A gente devolve 7 cafés da manhã, 7 almoços ou
          jantares e 7 lanches, sem açúcar e respeitando as restrições. Se quiser, entre com a sua conta
          do ChatGPT para gerar com o seu próprio plano.
        </p>
      </header>
      <Gerador />
    </div>
  );
}
