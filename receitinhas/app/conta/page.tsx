import type { Metadata } from "next";
import { exigirUsuario } from "@/lib/auth";
import { FormSenha } from "./FormSenha";

export const metadata: Metadata = { title: "Minha conta" };

export default async function ContaPage() {
  const u = await exigirUsuario("/conta");
  const desde = new Date(u.criado_em).toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

  return (
    <div className="pt-12 max-w-md mx-auto space-y-6">
      <div className="text-center space-y-2">
        <div className="text-6xl" aria-hidden>
          👩
        </div>
        <h1 className="text-4xl">Olá, {u.nome.split(" ")[0]}!</h1>
        <p className="text-ink-soft font-light">
          {u.email} · membro desde {desde} · acesso vitalício 💛
        </p>
      </div>
      <FormSenha />
    </div>
  );
}
