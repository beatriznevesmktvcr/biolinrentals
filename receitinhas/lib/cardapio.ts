import { z } from "zod";

/** Esquema do cardápio gerado pela IA (compartilhado entre a rota e a página). */
export const IdeiaSchema = z.object({
  nome: z.string().describe("Nome curto e simpático da receita"),
  emoji: z.string().describe("Um único emoji que represente o prato"),
  ingredientes: z.array(z.string()).describe("Ingredientes com quantidades aproximadas"),
  modo: z.array(z.string()).describe("Passos curtos do preparo, de 2 a 4 passos"),
  tempoMin: z.number().describe("Tempo total aproximado em minutos"),
  comoServir: z
    .string()
    .describe("Como cortar/oferecer de forma segura para a idade informada, em uma frase"),
});

export const CardapioSchema = z.object({
  cafe: z.array(IdeiaSchema).describe("Exatamente 7 opções de café da manhã"),
  almocoJantar: z.array(IdeiaSchema).describe("Exatamente 7 opções de almoço ou jantar"),
  lanche: z.array(IdeiaSchema).describe("Exatamente 7 opções de lanche"),
  listaDeCompras: z
    .array(z.string())
    .describe("Até 8 itens básicos que faltam e completariam a semana (pode ser vazio)"),
});

export type Cardapio = z.infer<typeof CardapioSchema>;
export type Ideia = z.infer<typeof IdeiaSchema>;

export const PedidoSchema = z.object({
  ingredientes: z.string().trim().min(3, "Conte o que você tem em casa").max(2000),
  idade: z.enum(["6m", "9m", "12m", "24m"]),
  restricoes: z.array(z.enum(["semOvo", "semTrigo", "semLeite", "semBanana"])).default([]),
  observacoes: z.string().trim().max(500).optional().default(""),
});

export type Pedido = z.infer<typeof PedidoSchema>;

export const IDADE_LABEL: Record<Pedido["idade"], string> = {
  "6m": "6 a 8 meses",
  "9m": "9 a 11 meses",
  "12m": "1 ano",
  "24m": "2 anos ou mais",
};
