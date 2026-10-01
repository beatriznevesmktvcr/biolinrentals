/** Cabeçalhos para o receitinhas.html (em outro site) poder chamar as rotas da API. */
export function cors(): Record<string, string> {
  const origem = process.env.ALLOWED_ORIGIN ?? "*";
  const h: Record<string, string> = {
    "Access-Control-Allow-Origin": origem,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    Vary: "Origin",
  };
  if (origem !== "*") h["Access-Control-Allow-Credentials"] = "true";
  return h;
}
