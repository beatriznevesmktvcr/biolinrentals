# 🥣 Receitinhas

Portal de receitas para bebês e crianças, **sem açúcar e com sal opcional**, separadas por alergia
(sem ovo, sem trigo, sem leite/APLV, sem banana). Acesso vitalício: a pessoa faz o Pix, você cria o
login e a senha dela no painel e manda por WhatsApp.

## O que tem

| Página | Quem vê | O que faz |
| --- | --- | --- |
| `/` | todo mundo | Vitrine: o que tem dentro, como comprar (valor, Pix, WhatsApp) e botão de entrar |
| `/entrar` | todo mundo | Login com e-mail e senha |
| `/receitas` | membros | Biblioteca com filtros por alergia, refeição, idade e busca por ingrediente |
| `/receitas/[slug]` | membros | Receita completa com ingredientes, preparo, dicas, trocas e impressão |
| `/conta` | membros | Trocar a própria senha |
| `/admin` | você | Criar logins (senha gerada e mensagem pronta para o WhatsApp), nova senha, desativar, excluir; editar os textos da vitrine |

## Como as receitas entram

As receitas ficam no arquivo `data/receitas.ts`. Você me manda a receita (nome, ingredientes, modo de
preparo, dicas e para quais restrições ela serve) e eu coloco no portal. Fotos vão em `public/fotos` e
são ligadas pelo campo `foto` da receita. Não precisa de painel para isso.

## Colocando no ar (Vercel, grátis)

1. Em https://vercel.com, importe este repositório e escolha `receitinhas` como **Root Directory**.
2. Na aba **Storage**, crie um banco **Neon (Postgres)** e conecte ao projeto. Isso cria a variável
   `DATABASE_URL` sozinha. As tabelas são criadas automaticamente na primeira visita.
3. Em **Environment Variables**, adicione:
   - `SESSION_SECRET`: um texto longo e aleatório (ex.: saída de `openssl rand -base64 48`)
   - `ADMIN_EMAIL`, `ADMIN_SENHA`, `ADMIN_NOME`: sua conta de administradora, criada na primeira visita
4. Clique em **Deploy**. Entre em `/entrar` com a sua conta e vá para `/admin`.

Depois do primeiro acesso você pode trocar a senha em `/conta`; as variáveis `ADMIN_*` deixam de ser
usadas (a conta já existe).

## Rodando no seu computador

Precisa do [Node.js](https://nodejs.org) 20 ou mais novo. Sem `DATABASE_URL`, o app usa um Postgres
embutido (PGlite) salvo na pasta `dados/`, sem instalar nada.

```bash
cd receitinhas
npm install
cp .env.example .env.local   # preencha ADMIN_EMAIL, ADMIN_SENHA e SESSION_SECRET
npm run dev
```

Abra http://localhost:3000.

## Segurança

- Senhas guardadas com bcrypt; sessão em cookie criptografado (90 dias), somente HTTP e seguro em produção.
- Seis tentativas erradas de login bloqueiam o e-mail por 15 minutos.
- Páginas de membros e painel são protegidas no servidor; o conteúdo das receitas não é enviado para quem
  não está logado.

## Tecnologia

Next.js (App Router, Server Actions) · React · Tailwind CSS v4 · Postgres (Neon) ou PGlite local · bcryptjs · jose.
