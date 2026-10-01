import type { Metadata } from "next";
import { regrasDeOuro } from "@/data/cortes";
import { GuiaCortes } from "@/components/GuiaCortes";

export const metadata: Metadata = {
  title: "Cortes seguros de frutas",
  description: "Como cortar cada fruta em cada fase do bebê para evitar engasgos.",
};

export default function CortesPage() {
  return (
    <div className="pt-10 space-y-10">
      <header className="space-y-2">
        <h1 className="text-4xl md:text-5xl font-bold">🔪 Cortes seguros de frutas</h1>
        <p className="text-ink-soft text-lg max-w-2xl">
          O formato certo muda conforme a fase do bebê. Escolha a idade e veja como oferecer cada fruta.
          O gerador com IA usa estas mesmas regras quando monta o cardápio.
        </p>
      </header>

      <GuiaCortes />

      <section className="space-y-4">
        <h2 className="text-3xl font-bold">Regras de ouro contra engasgos</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {regrasDeOuro.map((r) => (
            <div key={r.titulo} className="card p-5">
              <div className="text-4xl" aria-hidden>
                {r.emoji}
              </div>
              <h3 className="text-xl font-bold mt-2">{r.titulo}</h3>
              <p className="text-ink-soft mt-1">{r.texto}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6 bg-sky/50">
        <h2 className="text-2xl font-bold mb-2">🧑‍⚕️ Faça um curso de primeiros socorros</h2>
        <p className="text-ink-soft">
          Saber a manobra de desengasgo para bebês (manobra de Heimlich adaptada) dá muita segurança para
          toda a família. Procure cursos presenciais na sua cidade: bombeiros, hospitais e cruz vermelha
          costumam oferecer.
        </p>
      </section>
    </div>
  );
}
