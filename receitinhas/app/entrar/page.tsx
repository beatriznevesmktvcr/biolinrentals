import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { FormLogin } from "./FormLogin";

export const metadata: Metadata = { title: "Entrar" };

export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ voltar?: string }> }) {
  const { voltar } = await searchParams;
  if (await usuarioAtual()) redirect(voltar || "/receitas");

  return (
    <div className="pt-12 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="text-6xl" aria-hidden>
          🔑
        </div>
        <h1 className="text-4xl">Entrar</h1>
        <p className="text-ink-soft font-light">Use o login e a senha que você recebeu no WhatsApp.</p>
      </div>
      <FormLogin voltar={voltar ?? ""} />
      <p className="text-center text-sm text-ink-soft font-light">
        Ainda não tem acesso?{" "}
        <a href="/#como-comprar" className="text-coral-dark font-semibold">
          Veja como comprar
        </a>
      </p>
    </div>
  );
}
