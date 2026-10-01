# Landing page do Receitinhas

Uma página só, sem banco e sem login, para apresentar o portal e receber contatos pelo WhatsApp.

## Configurar

Abra `index.html` e, logo no início (bloco `CONFIG`), preencha:

- `WHATSAPP`: seu número com DDD e 55 na frente, só dígitos (ex.: `"5511999999999"`)
- `MENSAGEM`: o texto que já aparece escrito quando a pessoa abre o WhatsApp
- `PORTAL_URL`: o endereço do portal com login, quando ele estiver no ar (vazio esconde o botão)
- `PRECO`: o valor, se quiser mostrar (ex.: `"R$ 47 · pagamento único"`)

## Colocar no ar na Vercel (sem variáveis, sem banco)

1. Em https://vercel.com, **Add New → Project**, importe o repositório `biolinrentals`.
2. Em **Root Directory**, escolha `receitinhas-landing`. Em **Framework Preset**, deixe "Other".
3. Clique em **Deploy**. Pronto: o link `*.vercel.app` já é a landing page.

Também dá para colar o conteúdo do arquivo em um bloco "HTML personalizado" do WordPress.
