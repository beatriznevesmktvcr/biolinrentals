import { q, um } from "./db";

export const CHAVES = {
  comoComprar: "como_comprar",
  whatsapp: "whatsapp",
  valor: "valor",
} as const;

export async function configuracao(chave: string, padrao = ""): Promise<string> {
  const r = await um<{ valor: string }>("SELECT valor FROM configuracoes WHERE chave = $1", [chave]);
  return r?.valor ?? padrao;
}

export async function salvarConfiguracao(chave: string, valor: string) {
  await q(
    "INSERT INTO configuracoes (chave, valor) VALUES ($1, $2) ON CONFLICT (chave) DO UPDATE SET valor = EXCLUDED.valor",
    [chave, valor],
  );
}

export async function textosDaLoja() {
  const [comoComprar, whatsapp, valor] = await Promise.all([
    configuracao(
      CHAVES.comoComprar,
      "Faça o Pix e me mande o comprovante no WhatsApp. Em seguida eu te envio seu login e senha. O acesso é vitalício: paga uma vez e usa para sempre.",
    ),
    configuracao(CHAVES.whatsapp, ""),
    configuracao(CHAVES.valor, ""),
  ]);
  return { comoComprar, whatsapp, valor };
}
