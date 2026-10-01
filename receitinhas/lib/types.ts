export type Refeicao = "cafe" | "almoco" | "lanche";
export type Idade = "6m" | "9m" | "12m";

export type Alergeno = "semOvo" | "semTrigo" | "semLeite" | "semBanana";

export interface Receita {
  slug: string;
  nome: string;
  emoji: string;
  refeicao: Refeicao;
  idadeMin: Idade;
  tempo: number; // minutos
  rende: string;
  semOvo: boolean;
  semTrigo: boolean;
  semLeite: boolean;
  semBanana: boolean;
  ingredientes: string[];
  modo: string[];
  dicas?: string[];
  trocas?: string[];
}

export const REFEICOES: Record<Refeicao, { label: string; emoji: string; cor: string }> = {
  cafe: { label: "Café da manhã", emoji: "🌞", cor: "bg-sun" },
  almoco: { label: "Almoço & jantar", emoji: "🍽️", cor: "bg-mint" },
  lanche: { label: "Lanche", emoji: "🍓", cor: "bg-berry" },
};

export const IDADES: Record<Idade, string> = {
  "6m": "6+ meses",
  "9m": "9+ meses",
  "12m": "1 ano+",
};

export const ALERGENOS: Record<
  Alergeno,
  { label: string; curto: string; emoji: string; descricao: string }
> = {
  semOvo: {
    label: "Sem ovo",
    curto: "sem ovo",
    emoji: "🥚",
    descricao: "Receitas que não levam ovo (ou usam chia/linhaça no lugar).",
  },
  semTrigo: {
    label: "Sem trigo",
    curto: "sem trigo",
    emoji: "🌾",
    descricao: "Sem farinha de trigo: usamos farinha de aveia, tapioca ou polvilho.",
  },
  semLeite: {
    label: "Sem leite (APLV)",
    curto: "sem leite",
    emoji: "🥛",
    descricao: "Sem leite de vaca e derivados. Quando precisa, vai leite vegetal ou nada.",
  },
  semBanana: {
    label: "Sem banana",
    curto: "sem banana",
    emoji: "🍌",
    descricao: "Para quem tem alergia ou não gosta de banana.",
  },
};
