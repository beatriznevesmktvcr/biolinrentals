import { redirect } from "next/navigation";
import { usuarioAtual } from "@/lib/auth";
import { FormLogin } from "@/components/FormLogin";

type Props = { searchParams: Promise<{ voltar?: string }> };

/** Página inicial = login. Quem já está logado vai direto para as receitas. */
export default async function Home({ searchParams }: Props) {
  const [usuario, { voltar }] = await Promise.all([usuarioAtual(), searchParams]);
  if (usuario) redirect(voltar && voltar.startsWith("/") && !voltar.startsWith("//") ? voltar : "/receitas");

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-3">
          <div className="text-6xl flex justify-center gap-2" aria-hidden>
            <span className="float">🍓</span>
            <span className="float" style={{ animationDelay: "0.6s" }}>
              🥣
            </span>
            <span className="float" style={{ animationDelay: "1.2s" }}>
              🥕
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-light">
            <span className="text-coral-dark font-medium">Receitinhas</span>
          </h1>
          <p className="text-ink-soft font-light">Entre com o e-mail e a senha que você recebeu.</p>
        </div>
        <FormLogin voltar={voltar ?? ""} />
      </div>
    </div>
  );
}
