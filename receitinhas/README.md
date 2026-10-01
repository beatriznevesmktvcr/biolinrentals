# 🥣 Receitinhas

Plataforma lúdica para ajudar mães e pais a terem ideias de receitas para bebês e crianças:
**sem açúcar, sal opcional e separadas por alergia**.

## O que tem

| Página | O que faz |
| --- | --- |
| `/` | Início com atalhos, categorias e regrinhas de ouro |
| `/receitas` | Biblioteca de receitas com filtros: sem ovo, sem trigo (farinha de aveia), sem leite (APLV), sem banana, refeição, idade e busca por ingrediente |
| `/receitas/[slug]` | Receita completa com ingredientes, preparo, dicas, trocas e botão de imprimir |
| `/gerar` | Gerador com IA: a família escreve o que tem em casa e recebe **7 cafés da manhã, 7 almoços/jantares e 7 lanches**, respeitando idade e restrições, com instrução de como servir com segurança |
| `/cortes` | Guia de cortes seguros de frutas por fase (6–9 m, 9–12 m, 1 ano+) com desenhos, alertas e regras contra engasgo |

As regras de corte também são enviadas para a IA, então cada ideia gerada vem com o campo "como servir".

## Rodando no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
cd receitinhas
npm install
cp .env.example .env.local   # e coloque sua chave da Anthropic
npm run dev
```

Abra http://localhost:3000.

Sem a chave, o site inteiro funciona; só o gerador com IA mostra um aviso de "não configurado".

## Colocando no ar (Vercel, grátis)

1. Crie uma conta em https://vercel.com e importe este repositório.
2. Em **Root Directory**, escolha `receitinhas`.
3. Em **Environment Variables**, adicione `ANTHROPIC_API_KEY` com a chave criada em https://console.anthropic.com.
4. Clique em **Deploy**. Pronto, você ganha um link `*.vercel.app` para compartilhar.

## Versão em um arquivo só (`receitinhas.html`)

O arquivo `receitinhas.html` tem a plataforma inteira (receitas, filtros, cortes seguros e gerador)
em um único HTML, para abrir direto no navegador ou colar em um bloco "HTML personalizado" do WordPress.

- Receitas e cortes funcionam sem nenhum servidor.
- Para o gerador com IA funcionar, publique a pasta `receitinhas` na Vercel (passos acima) e troque a
  linha `const API_URL = "https://SEU-APP.vercel.app/api/gerar"` no início do arquivo pelo endereço do
  seu app. Opcionalmente, defina `ALLOWED_ORIGIN` na Vercel com o domínio do seu site para que só ele
  possa usar a rota.
- Depois de mudar receitas ou cortes em `data/`, gere o arquivo de novo com `npm run build:html`.

## Adicionando receitas

Todas as receitas ficam em `data/receitas.ts`. Copie um bloco, mude os campos e marque as flags
`semOvo`, `semTrigo`, `semLeite`, `semBanana` como `true` quando a receita funciona para aquela restrição
(contando as trocas sugeridas). As frutas e os cortes ficam em `data/cortes.ts`.

## Tecnologia

Next.js (App Router) · React · Tailwind CSS v4 · SDK oficial da Anthropic com saída estruturada (Zod).
