# CARROSSÉIS IRRESISTÍVEIS — Gerador de Carrosséis

Ferramenta web que gera carrosséis para Instagram (1080×1350). O cliente
**só sobe as fotos, digita o texto e escolhe o template** — a imagem final
é montada e baixada em PNG, pronta para postar.

## Como usar

1. Abra o arquivo `index.html` em qualquer navegador (duplo clique).
2. Para cada slide: escolha uma foto, escreva o **kicker**, o **título** e o
   **texto de apoio**.
3. Escolha um dos templates (Capa, Cartão, Texto, Split) e a cor de destaque.
4. Use o `+` para adicionar mais slides ao carrossel.
5. Clique em **Baixar carrossel completo** — cada slide sai como PNG
   1080×1350.

Tudo roda no próprio navegador: as fotos **não** são enviadas para nenhum
servidor.

## Características

- Tema preto & branco da marca CARROSSÉIS IRRESISTÍVEIS.
- Renderização em `<canvas>` — sem dependências externas nem build.
- 4 templates iniciais (serão substituídos/ampliados pelos modelos de
  referência do cliente).
- Assinatura de marca opcional por carrossel (`@perfil`).
- Preview ao vivo e miniaturas de cada slide.

## Adicionar / trocar templates

Cada template é uma função pura em `index.html`, dentro do objeto
`TEMPLATES`, com a assinatura `(ctx, s)` onde `s` são os dados do slide
(`img`, `kicker`, `title`, `body`, `textPos`, `accent`). Para criar um novo
template basta adicionar uma função nova e registrá-la em `TEMPLATE_LIST`.

## Próximo passo: virar extensão do Chrome (opcional)

A lógica de geração já está pronta para ser empacotada. Para transformar em
plugin do Chrome, adiciona-se um `manifest.json` (Manifest V3) apontando
este HTML como popup/página. O mesmo código de renderização é reaproveitado.
