# 🥣 Receitinhas

Plataforma lúdica para ajudar mães e pais a terem ideias de receitas para bebês e crianças:
**sem açúcar, sal opcional e separadas por alergia**.

## O que tem

| Página | O que faz |
| --- | --- |
| `/` | Início com atalhos, categorias e regrinhas de ouro |
| `/receitas` | Biblioteca de receitas com filtros: sem ovo, sem trigo (farinha de aveia), sem leite (APLV), sem banana, refeição, idade e busca por ingrediente |
| `/receitas/[slug]` | Receita completa com ingredientes, preparo, dicas, trocas e botão de imprimir |
| `/gerar` | Gerador com IA: a família escreve o que tem em casa e recebe **7 cafés da manhã, 7 almoços/jantares e 7 lanches**, respeitando idade e restrições. Pode entrar com a conta do ChatGPT para gerar com o próprio plano |

## Como a IA é paga

O gerador tem dois caminhos, e o site escolhe automaticamente:

1. **Login com ChatGPT** (botão "Entrar com ChatGPT"): a pessoa entra com a conta dela. Se o plano for
   Plus ou Pro e ela aceitar a permissão, as receitas são geradas com o plano dela, sem custo para o site.
2. **IA do site** (`OPENAI_API_KEY`): usada quando ninguém está logado ou o plano da pessoa não libera uso
   em outros apps. Custa para quem cuida do site.

Se nenhum dos dois estiver configurado, o botão de gerar mostra um aviso explicando.

### Ativando o login com ChatGPT

O "Sign in with ChatGPT" para sites é liberado pela OpenAI por cadastro (hoje em teste limitado com
parceiros). Peça acesso em https://developers.openai.com/siwc e registre:

- **Redirect URI**: `https://SEU-APP.vercel.app/api/auth/chatgpt/callback`
- **Escopos**: `openid profile email offline_access resource.invoke chatgpt.tokens.use.direct`

Depois preencha na Vercel `SIWC_CLIENT_ID`, `APP_URL` e `SESSION_SECRET` (veja `.env.example`).
O fluxo é OAuth 2.0 Authorization Code com PKCE e OpenID Connect; os endpoints são descobertos em
`https://auth.openai.com/.well-known/openid-configuration`, com os valores documentados como reserva.

## Rodando no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo.

```bash
cd receitinhas
npm install
cp .env.example .env.local   # e coloque sua chave da Anthropic
npm run dev
```

Abra http://localhost:3000.

Sem chave e sem login configurado, o site inteiro funciona; só o gerador com IA mostra um aviso.

## Colocando no ar (Vercel, grátis)

1. Crie uma conta em https://vercel.com e importe este repositório.
2. Em **Root Directory**, escolha `receitinhas`.
3. Em **Environment Variables**, adicione `OPENAI_API_KEY` (IA do site) e/ou as variáveis do login com ChatGPT.
4. Clique em **Deploy**. Pronto, você ganha um link `*.vercel.app` para compartilhar.

## Versão em um arquivo só (`receitinhas.html`)

O arquivo `receitinhas.html` tem a plataforma inteira (receitas, filtros e gerador)
em um único HTML, para abrir direto no navegador ou colar em um bloco "HTML personalizado" do WordPress.

- As receitas e os filtros funcionam sem nenhum servidor.
- Para o gerador com IA funcionar, publique a pasta `receitinhas` na Vercel (passos acima) e troque a
  linha `const API_URL = "https://SEU-APP.vercel.app/api/gerar"` no início do arquivo pelo endereço do
  seu app. Para o botão "Entrar com ChatGPT" funcionar a partir do seu site, defina também
  `ALLOWED_ORIGIN` na Vercel com o domínio dele (ex.: `https://meusite.com.br`).
- Depois de mudar receitas em `data/`, gere o arquivo de novo com `npm run build:html`.

## Adicionando receitas

Todas as receitas ficam em `data/receitas.ts`. Copie um bloco, mude os campos e marque as flags
`semOvo`, `semTrigo`, `semLeite`, `semBanana` como `true` quando a receita funciona para aquela restrição
(contando as trocas sugeridas).

## Tecnologia

Next.js (App Router) · React · Tailwind CSS v4 · SDK oficial da OpenAI (Responses API com saída estruturada via Zod) · Sign in with ChatGPT (OAuth 2.0 + PKCE + OIDC, cookies criptografados com jose).
