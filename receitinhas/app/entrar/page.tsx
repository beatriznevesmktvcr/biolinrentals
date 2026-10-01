import { redirect } from "next/navigation";

/** Endereço antigo do login: manda para a página inicial, que agora é o login. */
export default async function EntrarPage({ searchParams }: { searchParams: Promise<{ voltar?: string }> }) {
  const { voltar } = await searchParams;
  redirect(voltar ? `/?voltar=${encodeURIComponent(voltar)}` : "/");
}
