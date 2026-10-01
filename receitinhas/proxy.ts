import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "receitinhas_sessao";

/**
 * Sem cookie de sessão, manda para o login guardando a página pedida.
 * A validação de verdade (cookie válido, usuário ativo) acontece nos layouts.
 */
export function proxy(req: NextRequest) {
  if (req.cookies.get(COOKIE)?.value) return NextResponse.next();
  const url = req.nextUrl.clone();
  const voltar = url.pathname + url.search;
  url.pathname = "/";
  url.search = `?voltar=${encodeURIComponent(voltar)}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/receitas/:path*", "/conta", "/admin/:path*"],
};
