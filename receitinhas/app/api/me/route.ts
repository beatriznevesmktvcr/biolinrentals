import { NextResponse } from "next/server";
import { lerSessao, loginConfigurado } from "@/lib/siwc";
import { cors } from "@/lib/cors";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors() });
}

/** Diz ao front quem está logado e quais caminhos de IA estão disponíveis. */
export async function GET() {
  const s = await lerSessao();
  return NextResponse.json(
    {
      loginDisponivel: loginConfigurado(),
      geradorDoSite: Boolean(process.env.OPENAI_API_KEY),
      usuario: s ? { nome: s.nome ?? s.email ?? "Conta ChatGPT", foto: s.foto ?? null, usaPlano: s.usaPlano } : null,
    },
    { headers: { ...cors(), "Cache-Control": "no-store" } },
  );
}
