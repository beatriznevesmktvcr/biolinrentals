import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { NextResponse } from "next/server";
import { CardapioSchema, IDADE_LABEL, PedidoSchema } from "@/lib/cardapio";
import { ALERGENOS } from "@/lib/types";
import { COOKIE_SESSAO, cookieOpts, lerSessao, selarSessao, sessaoComTokenValido, type Sessao } from "@/lib/siwc";
import { cors } from "@/lib/cors";

export const runtime = "nodejs";
export const maxDuration = 120;

const MODEL = process.env.OPENAI_MODEL ?? "gpt-5-mini";

const json = (body: unknown, status = 200, extra?: { sessao?: Sessao }) =>
  Promise.resolve(extra?.sessao ? selarSessao(extra.sessao) : null).then((cookie) => {
    const res = NextResponse.json(body, { status, headers: cors() });
    if (cookie) res.cookies.set(COOKIE_SESSAO, cookie, cookieOpts(30 * 24 * 3600));
    return res;
  });

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors() });
}

const SYSTEM = `Você é a chef da plataforma "Receitinhas", que ajuda mães e pais brasileiros a terem ideias de comida para bebês e crianças pequenas. Escreva sempre em português do Brasil, com tom carinhoso, simples e direto.

REGRAS INEGOCIÁVEIS
- Nunca use açúcar, mel, adoçante, melado, rapadura, achocolatado, leite condensado ou qualquer produto açucarado. Frutas e no máximo 1 tâmara por porção podem adoçar.
- Sal é sempre opcional: para menores de 1 ano, não use. Para maiores, escreva "sal: opcional, uma pitadinha". Dê sabor com ervas, alho, cebola, limão e especiarias suaves.
- Nunca use ultraprocessados (salsicha, nuggets prontos, biscoito recheado, temperos em pó industrializados).
- Respeite TODAS as restrições informadas. Se a família disser "sem leite", não use leite de vaca, queijo, iogurte, manteiga ou requeijão; use leite vegetal ou nenhum. Se "sem trigo", use farinha de aveia, tapioca, polvilho ou arroz. Se "sem ovo", use chia ou linhaça hidratada como liga. Se "sem banana", nenhuma banana.
- Use principalmente os ingredientes que a família tem em casa. Pode assumir itens básicos (água, azeite, alho, cebola, ervas secas) mesmo que não listados. Se precisar de algo que falta, coloque na listaDeCompras.
- As receitas devem ser rápidas, com poucos ingredientes e passos curtos (2 a 4 passos).
- Segurança: nada de mel antes de 1 ano; nunca sugira alimentos redondos e duros inteiros (uva, tomate-cereja, pipoca, nozes inteiras, uva-passa inteira); para 6 a 8 meses, prefira texturas macias em palitos ou amassadas; para 9 a 11 meses, pedacinhos pequenos.
- Em "dica", escreva uma frase útil: textura ideal para a idade, como oferecer, ou uma troca de ingrediente.
- Varie bastante entre as 7 opções de cada refeição: proteínas, cores, texturas e modos de preparo diferentes.
- Retorne exatamente 7 ideias de café da manhã, 7 de almoço/jantar e 7 de lanche.`;

type Credencial = { client: OpenAI; origem: "plano" | "site"; sessaoRenovada?: Sessao };

/** Escolhe quem paga a geração: o plano ChatGPT da pessoa logada ou a chave do site. */
async function credencial(): Promise<Credencial | { erro: string; status: number }> {
  const s = await lerSessao();
  if (s?.usaPlano) {
    try {
      const { sessao, renovada } = await sessaoComTokenValido(s);
      return {
        client: new OpenAI({ apiKey: sessao.accessToken }),
        origem: "plano",
        sessaoRenovada: renovada ? sessao : undefined,
      };
    } catch {
      /* sessão vencida sem refresh: cai para a chave do site, se houver */
    }
  }
  if (process.env.OPENAI_API_KEY) return { client: new OpenAI(), origem: "site" };
  if (s && !s.usaPlano) {
    return {
      erro: "Sua conta do ChatGPT entrou, mas o plano dela não liberou uso em outros apps (precisa ser Plus ou Pro e aceitar a permissão). E o site ainda não tem a própria chave configurada.",
      status: 503,
    };
  }
  return {
    erro: "O gerador ainda não está configurado: entre com o ChatGPT ou peça para quem cuida do site definir a OPENAI_API_KEY.",
    status: 503,
  };
}

export async function POST(req: Request) {
  let pedido;
  try {
    pedido = PedidoSchema.parse(await req.json());
  } catch {
    return json({ erro: "Pedido inválido. Confira os ingredientes e tente de novo." }, 400);
  }

  const cred = await credencial();
  if ("erro" in cred) return json({ erro: cred.erro }, cred.status);

  const restricoes =
    pedido.restricoes.length > 0
      ? pedido.restricoes.map((r) => ALERGENOS[r].label).join(", ")
      : "nenhuma (receitas gerais: sem açúcar e sal opcional)";

  const userText = [
    `Idade da criança: ${IDADE_LABEL[pedido.idade]}.`,
    `Restrições: ${restricoes}.`,
    `Ingredientes que tenho em casa:\n${pedido.ingredientes}`,
    pedido.observacoes ? `Observações da família: ${pedido.observacoes}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await cred.client.responses.parse({
      model: MODEL,
      instructions: SYSTEM,
      input: userText,
      store: false,
      reasoning: { effort: "low" },
      max_output_tokens: 12000,
      text: { format: zodTextFormat(CardapioSchema, "cardapio") },
    });

    const recusa = response.output.find((o) => o.type === "message")?.content.find((c) => c.type === "refusal");
    if (recusa) {
      return json({ erro: "Não consegui gerar esse cardápio. Tente descrever os ingredientes de outra forma." }, 422);
    }
    if (response.incomplete_details || !response.output_parsed) {
      return json({ erro: "A resposta veio incompleta. Tente de novo." }, 502);
    }

    const cardapio = CardapioSchema.parse(response.output_parsed);
    return json({ cardapio, origem: cred.origem }, 200, { sessao: cred.sessaoRenovada });
  } catch (error) {
    if (error instanceof OpenAI.AuthenticationError || error instanceof OpenAI.PermissionDeniedError) {
      return json(
        {
          erro:
            cred.origem === "plano"
              ? "O ChatGPT não aceitou sua autorização. Saia e entre de novo com o ChatGPT."
              : "A chave da API está inválida. Verifique a OPENAI_API_KEY.",
        },
        503,
      );
    }
    if (error instanceof OpenAI.RateLimitError) {
      return json(
        {
          erro:
            cred.origem === "plano"
              ? "Seu plano do ChatGPT atingiu o limite de uso por agora. Tente mais tarde."
              : "Muita gente cozinhando agora 🍳 Tente de novo em um minutinho.",
        },
        429,
      );
    }
    if (error instanceof OpenAI.NotFoundError) {
      console.error("Modelo não disponível para esta credencial:", MODEL);
      return json({ erro: `O modelo "${MODEL}" não está disponível para essa conta. Ajuste a variável OPENAI_MODEL.` }, 502);
    }
    if (error instanceof OpenAI.APIError) {
      console.error("Erro da API OpenAI", error.status, error.message);
      return json({ erro: "O gerador deu uma engasgadinha. Tente de novo." }, 502);
    }
    console.error("Erro inesperado ao gerar cardápio", error);
    return json({ erro: "Algo deu errado. Tente de novo." }, 500);
  }
}
