export type Forma =
  | "amassado"
  | "ralado"
  | "palito"
  | "meia-lua"
  | "fatia-fina"
  | "cubinhos"
  | "quartos"
  | "esmagado"
  | "pedaco-grande";

export interface Fase {
  forma: Forma;
  texto: string;
}

export interface Fruta {
  slug: string;
  nome: string;
  emoji: string;
  cor: string; // cor da polpa para o desenho
  fases: { "6m": Fase; "9m": Fase; "12m": Fase };
  alerta?: string;
  dica?: string;
}

export const FORMAS: Record<Forma, string> = {
  amassado: "Amassado",
  ralado: "Ralado",
  palito: "Palito do tamanho do dedo",
  "meia-lua": "Meia-lua",
  "fatia-fina": "Fatia fininha",
  cubinhos: "Cubinhos pequenos",
  quartos: "Cortado em 4 no comprimento",
  esmagado: "Esmagado com o dedo",
  "pedaco-grande": "Pedaço grande (maior que a boca)",
};

export const FASES_LABEL = {
  "6m": { titulo: "6 a 9 meses", sub: "pegada de mão inteira (palmar)", emoji: "🖐️" },
  "9m": { titulo: "9 a 12 meses", sub: "pegada de pinça (polegar + indicador)", emoji: "🤏" },
  "12m": { titulo: "1 ano ou mais", sub: "já mastiga melhor, mas ainda sem pressa", emoji: "🧒" },
} as const;

export const frutas: Fruta[] = [
  {
    slug: "banana",
    nome: "Banana",
    emoji: "🍌",
    cor: "#f8e7a1",
    fases: {
      "6m": {
        forma: "palito",
        texto:
          "Meia banana descascada em palito, ou deixe um pedaço da casca como 'cabo' para o bebê segurar.",
      },
      "9m": { forma: "cubinhos", texto: "Pedacinhos pequenos para treinar a pinça." },
      "12m": { forma: "meia-lua", texto: "Rodelas ou pedaços cortados ao meio." },
    },
    dica: "Escorrega da mão? Passe o palito em aveia em flocos ou coco ralado.",
  },
  {
    slug: "maca",
    nome: "Maçã",
    emoji: "🍎",
    cor: "#fbe3c4",
    fases: {
      "6m": {
        forma: "palito",
        texto: "Sempre cozida ou assada até ficar bem macia, em palitos. Crua, só ralada fininha.",
      },
      "9m": { forma: "cubinhos", texto: "Cozida em cubinhos, ou crua ralada." },
      "12m": {
        forma: "fatia-fina",
        texto: "Crua em fatias bem finas, sem casca. Pedaços grossos de maçã crua só depois dos 4 anos.",
      },
    },
    alerta: "Maçã crua e dura é uma das principais causas de engasgo em bebês.",
  },
  {
    slug: "pera",
    nome: "Pera",
    emoji: "🍐",
    cor: "#e9f0c2",
    fases: {
      "6m": { forma: "palito", texto: "Bem madura e macia em palitos. Se estiver dura, cozinhe no vapor." },
      "9m": { forma: "cubinhos", texto: "Madura em cubinhos pequenos." },
      "12m": { forma: "fatia-fina", texto: "Fatias finas, sem sementes." },
    },
  },
  {
    slug: "mamao",
    nome: "Mamão",
    emoji: "🧡",
    cor: "#ffb48a",
    fases: {
      "6m": { forma: "palito", texto: "Palitos grossos, sem sementes. É macio e perfeito para começar." },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos." },
      "12m": { forma: "cubinhos", texto: "Cubos um pouco maiores." },
    },
  },
  {
    slug: "manga",
    nome: "Manga",
    emoji: "🥭",
    cor: "#ffcf5c",
    fases: {
      "6m": {
        forma: "palito",
        texto: "Palitos grossos de manga madura, ou o caroço com um pouco de polpa para chupar (com supervisão).",
      },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos." },
      "12m": { forma: "cubinhos", texto: "Cubos ou fatias." },
    },
    dica: "Manga fibrosa pode ser difícil: prefira variedades macias como palmer ou tommy bem madura.",
  },
  {
    slug: "melancia",
    nome: "Melancia",
    emoji: "🍉",
    cor: "#ff8a8a",
    fases: {
      "6m": {
        forma: "palito",
        texto: "Palitos sem sementes, ou um triângulo com a casca como 'cabo'.",
      },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos, sem nenhuma semente." },
      "12m": { forma: "cubinhos", texto: "Cubos ou fatias finas sem sementes." },
    },
    alerta: "Retire TODAS as sementes, inclusive as brancas.",
  },
  {
    slug: "melao",
    nome: "Melão",
    emoji: "🍈",
    cor: "#e4f2b0",
    fases: {
      "6m": { forma: "palito", texto: "Palitos grossos de melão maduro." },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos." },
      "12m": { forma: "cubinhos", texto: "Cubos ou fatias." },
    },
  },
  {
    slug: "morango",
    nome: "Morango",
    emoji: "🍓",
    cor: "#ff7a90",
    fases: {
      "6m": {
        forma: "pedaco-grande",
        texto: "Morango grande e maduro inteiro (maior que a boca do bebê), ou amassado. Morango pequeno: cortado em 4.",
      },
      "9m": { forma: "quartos", texto: "Cortado em 4 no comprimento, ou em pedacinhos." },
      "12m": { forma: "quartos", texto: "Em quartos ou metades no comprimento. Inteiro pequeno só depois dos 4 anos." },
    },
  },
  {
    slug: "uva",
    nome: "Uva",
    emoji: "🍇",
    cor: "#c6a3e3",
    fases: {
      "6m": { forma: "esmagado", texto: "Esmagada ou cortada em 4 no comprimento, sem casca e sem sementes." },
      "9m": { forma: "quartos", texto: "Sempre em 4 no comprimento." },
      "12m": { forma: "quartos", texto: "Sempre em 4 no comprimento, até os 5 anos." },
    },
    alerta: "Uva inteira ou cortada ao meio na largura é um dos maiores riscos de engasgo. Sempre em 4, no sentido do comprimento.",
  },
  {
    slug: "abacate",
    nome: "Abacate",
    emoji: "🥑",
    cor: "#c5e39a",
    fases: {
      "6m": { forma: "palito", texto: "Palitos grossos de abacate maduro, ou amassado na colher." },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos." },
      "12m": { forma: "fatia-fina", texto: "Fatias ou cubos." },
    },
    dica: "Passe em aveia em flocos para não escorregar da mão.",
  },
  {
    slug: "laranja",
    nome: "Laranja e tangerina",
    emoji: "🍊",
    cor: "#ffb15c",
    fases: {
      "6m": {
        forma: "pedaco-grande",
        texto: "Um quarto da laranja com a casca para segurar, sem sementes. Ou gomo grande sem a pele fininha.",
      },
      "9m": { forma: "cubinhos", texto: "Gomos sem a pele fininha e sem sementes, cortados em pedacinhos." },
      "12m": { forma: "cubinhos", texto: "Gomos picados, sem sementes." },
    },
    alerta: "A película dos gomos pode grudar no céu da boca: retire enquanto o bebê for pequeno.",
  },
  {
    slug: "kiwi",
    nome: "Kiwi",
    emoji: "🥝",
    cor: "#b7e08a",
    fases: {
      "6m": { forma: "palito", texto: "Bem maduro, sem casca, em palitos ou metade grande." },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos." },
      "12m": { forma: "fatia-fina", texto: "Fatias finas ou cubos." },
    },
  },
  {
    slug: "pessego",
    nome: "Pêssego, ameixa e nectarina",
    emoji: "🍑",
    cor: "#ffcf9e",
    fases: {
      "6m": { forma: "palito", texto: "Madura, sem casca e SEM caroço, em palitos ou metade grande." },
      "9m": { forma: "cubinhos", texto: "Cubinhos pequenos, sem caroço." },
      "12m": { forma: "fatia-fina", texto: "Fatias finas, sem caroço." },
    },
    alerta: "Sempre retire o caroço antes de oferecer.",
  },
  {
    slug: "mirtilo",
    nome: "Mirtilo (blueberry)",
    emoji: "🫐",
    cor: "#9aa7e6",
    fases: {
      "6m": { forma: "esmagado", texto: "Esmagado com o dedo até achatar." },
      "9m": { forma: "esmagado", texto: "Esmagado ou cortado ao meio." },
      "12m": { forma: "quartos", texto: "Cortado ao meio ou em 4 até os 4 anos." },
    },
    alerta: "Redondo e firme: nunca inteiro para menores de 4 anos.",
  },
  {
    slug: "tomate-cereja",
    nome: "Tomate-cereja",
    emoji: "🍅",
    cor: "#ff8c7a",
    fases: {
      "6m": { forma: "quartos", texto: "Em 4 no comprimento, sem a pele se possível. Tomate grande: em meia-lua." },
      "9m": { forma: "quartos", texto: "Sempre em 4 no comprimento." },
      "12m": { forma: "quartos", texto: "Sempre em 4 no comprimento, até os 5 anos." },
    },
    alerta: "Mesma regra da uva: nunca inteiro ou ao meio.",
  },
  {
    slug: "cereja",
    nome: "Cereja",
    emoji: "🍒",
    cor: "#e0556f",
    fases: {
      "6m": { forma: "esmagado", texto: "Sem caroço, esmagada ou picadinha." },
      "9m": { forma: "quartos", texto: "Sem caroço, em 4." },
      "12m": { forma: "quartos", texto: "Sem caroço, em 4 até os 5 anos." },
    },
    alerta: "O caroço é pequeno e redondo: tire sempre, sem exceção.",
  },
  {
    slug: "abacaxi",
    nome: "Abacaxi",
    emoji: "🍍",
    cor: "#ffe08a",
    fases: {
      "6m": { forma: "palito", texto: "Palito grande e fino, bem maduro, sem o miolo. Sirva com supervisão." },
      "9m": { forma: "cubinhos", texto: "Cubinhos bem pequenos, sem fibras." },
      "12m": { forma: "cubinhos", texto: "Cubos pequenos." },
    },
    dica: "Ácido demais pode irritar a pele ao redor da boca: ofereça pouco no começo.",
  },
];

export const regrasDeOuro = [
  {
    emoji: "🪑",
    titulo: "Sentado e acordado",
    texto: "Bebê sempre sentadinho, com o tronco reto, nunca deitado ou no carrinho em movimento.",
  },
  {
    emoji: "👀",
    titulo: "Nunca sozinho",
    texto: "Um adulto sempre ao lado, olhando. Nada de celular na hora da comida.",
  },
  {
    emoji: "⭕",
    titulo: "Redondo e duro, nunca",
    texto: "Uva, tomate-cereja, mirtilo, cereja: sempre em 4 no comprimento. Nozes inteiras, pipoca e balas: só depois dos 5 anos.",
  },
  {
    emoji: "🍯",
    titulo: "Sem mel antes de 1 ano",
    texto: "Risco de botulismo. E sem açúcar nenhum até os 2 anos, segundo o Ministério da Saúde.",
  },
  {
    emoji: "🧂",
    titulo: "Sal opcional e pouquinho",
    texto: "Antes de 1 ano, nada de sal. Depois, uma pitadinha no máximo. Use ervas e alho para dar sabor.",
  },
  {
    emoji: "😮",
    titulo: "Gag não é engasgo",
    texto:
      "Ânsia, tosse, cara vermelha e barulho: é o reflexo de gag, normal e protetor. Engasgo é silencioso, sem tosse, com lábios roxos. Aí sim, socorra.",
  },
];
