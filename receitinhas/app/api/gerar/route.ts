import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { NextResponse } from "next/server";
import { CardapioSchema, IDADE_LABEL, PedidoSchema } from "@/lib/cardapio";
import { frutas, regrasDeOuro } from "@/data/cortes";
import { ALERGENOS } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = "claude-opus-5-5";

const client = new Anthropic();

/** Permite que o receitinhas.html (WordPress ou outro site) chame esta rota. */
const CORS = {
  "Access-Control-Allow-Origin": process.env.ALLOWED_ORIGIN ?? "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: CORS });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

/** Regras de corte resumidas: a IA usa isso para dizer como servir cada ideia. */
function guiaDeCortes(idade: keyof typeof IDADE_LABEL) {
  const fase = idade === "6m" ? "6m" : idade === "9m" ? "9m" : "12m";
  const linhas = frutas.map((f) => `- ${f.nome}: ${f.fases[fase].texto}${f.alerta ? ` ATENÇÃO: ${f.alerta}` : ""}`);
  const regras = regrasDeOuro.map((r) => `- ${r.titulo}: ${r.texto}`);
  return `GUIA DE CORTES SEGUROS (fase: ${IDADE_LABEL[idade]})\n${linhas.join("\n")}\n\nREGRAS DE OURO\n${regras.join("\n")}`;
}

const SYSTEM = `Você é a chef da plataforma "Receitinhas", que ajuda mães e pais brasileiros a terem ideias de comida para bebês e crianças pequenas. Escreva sempre em português do Brasil, com tom carinhoso, simples e direto.

REGRAS INEGOCIÁVEIS
- Nunca use açúcar, mel, adoçante, melado, rapadura, achocolatado, leite condensado ou qualquer produto açucarado. Frutas e no máximo 1 tâmara por porção podem adoçar.
- Sal é sempre opcional: para menores de 1 ano, não use. Para maiores, escreva "sal: opcional, uma pitadinha". Dê sabor com ervas, alho, cebola, limão e especiarias suaves.
- Nunca use ultraprocessados (salsicha, nuggets prontos, biscoito recheado, temperos em pó industrializados).
- Respeite TODAS as restrições informadas. Se a família disser "sem leite", não use leite de vaca, queijo, iogurte, manteiga ou requeijão; use leite vegetal ou nenhum. Se "sem trigo", use farinha de aveia, tapioca, polvilho ou arroz. Se "sem ovo", use chia ou linhaça hidratada como liga. Se "sem banana", nenhuma banana.
- Use principalmente os ingredientes que a família tem em casa. Pode assumir itens básicos (água, azeite, alho, cebola, ervas secas) mesmo que não listados. Se precisar de algo que falta, coloque na listaDeCompras.
- As receitas devem ser rápidas, com poucos ingredientes e passos curtos (2 a 4 passos).
- Para cada ideia, no campo comoServir, diga em uma frase como cortar e oferecer com segurança para a idade informada, seguindo o guia de cortes. Nunca sugira alimentos redondos e duros inteiros (uva, tomate-cereja, pipoca, nozes inteiras).
- Varie bastante entre as 7 opções de cada refeição: proteínas, cores, texturas e modos de preparo diferentes.
- Retorne exatamente 7 ideias de café da manhã, 7 de almoço/jantar e 7 de lanche.`;

export async function POST(req: Request) {
  let pedido;
  try {
    pedido = PedidoSchema.parse(await req.json());
  } catch {
    return json({ erro: "Pedido inválido. Confira os ingredientes e tente de novo." }, 400);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return json({ erro: "O gerador ainda não está configurado: falta a variável ANTHROPIC_API_KEY no servidor." }, 503);
  }

  const restricoes =
    pedido.restricoes.length > 0
      ? pedido.restricoes.map((r) => ALERGENOS[r].label).join(", ")
      : "nenhuma (receitas gerais: sem açúcar e sal opcional)";

  const userText = [
    `Idade da criança: ${IDADE_LABEL[pedido.idade]}.`,
    `Restrições: ${restricoes}.`,
    `Ingredientes que tenho em casa:\n${pedido.ingredientes}`,
    pedido.observacoes ? `Observações da família: ${pedido.observacoes}` : "",
    "",
    guiaDeCortes(pedido.idade),
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await client.beta.messages.parse({
      model: MODEL,
      max_tokens: 16000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      system: [{ type: "text", text: SYSTEM, cache_control: { type: "ephemeral" } }],
      output_config: { effort: "low", format: betaZodOutputFormat(CardapioSchema) },
      messages: [{ role: "user", content: userText }],
    });

    if (response.stop_reason === "refusal") {
      return json({ erro: "Não consegui gerar esse cardápio. Tente descrever os ingredientes de outra forma." }, 422);
    }
    if (response.stop_reason === "max_tokens" || !response.parsed_output) {
      return json({ erro: "A resposta veio incompleta. Tente de novo." }, 502);
    }

    const cardapio = CardapioSchema.parse(response.parsed_output);
    return json({ cardapio });
  } catch (error) {
    if (error instanceof Anthropic.AuthenticationError) {
      return json({ erro: "A chave da API está inválida. Verifique a ANTHROPIC_API_KEY." }, 503);
    }
    if (error instanceof Anthropic.RateLimitError) {
      return json({ erro: "Muita gente cozinhando agora 🍳 Tente de novo em um minutinho." }, 429);
    }
    if (error instanceof Anthropic.APIError) {
      console.error("Erro da API Anthropic", error.status, error.message);
      return json({ erro: "O gerador deu uma engasgadinha. Tente de novo." }, 502);
    }
    console.error("Erro inesperado ao gerar cardápio", error);
    return json({ erro: "Algo deu errado. Tente de novo." }, 500);
  }
}
