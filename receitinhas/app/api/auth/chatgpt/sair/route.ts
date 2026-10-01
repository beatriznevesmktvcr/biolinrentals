import { NextResponse } from "next/server";
import { COOKIE_SESSAO, cookieOpts } from "@/lib/siwc";
import { cors } from "@/lib/cors";

export const runtime = "nodejs";

export function OPTIONS() {
  return new Response(null, { status: 204, headers: cors() });
}

/** Encerra a sessão local (apaga o cookie). */
export async function POST() {
  const res = NextResponse.json({ ok: true }, { headers: cors() });
  res.cookies.set(COOKIE_SESSAO, "", cookieOpts(0));
  return res;
}
