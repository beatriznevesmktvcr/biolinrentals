import { exigirUsuario } from "@/lib/auth";

/** Toda a área de receitas exige login. A checagem fica aqui, acima do limite de carregamento. */
export default async function ReceitasLayout({ children }: { children: React.ReactNode }) {
  await exigirUsuario("/receitas");
  return <>{children}</>;
}
