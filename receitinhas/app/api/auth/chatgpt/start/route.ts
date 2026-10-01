import { NextResponse } from "next/server";
import {
  CLIENT_ID,
  COOKIE_TX,
  RESOURCE,
  SCOPES,
  aleatorio,
  cookieOpts,
  desafioPkce,
  destinoSeguro,
  endpoints,
  loginConfigurado,
  redirectUri,
  selarTransacao,
} from "@/lib/siwc";

export const runtime = "nodejs";

/** Começa o login: gera state, nonce e PKCE, guarda num cookie curto e manda para a OpenAI. */
export async function GET(req: Request) {
  const voltar = destinoSeguro(new URL(req.url).searchParams.get("voltar"));

  if (!loginConfigurado()) {
    const u = new URL(voltar);
    u.searchParams.set("login", "nao-configurado");
    return NextResponse.redirect(u);
  }

  const state = aleatorio(16);
  const nonce = aleatorio(16);
  const verifier = aleatorio(48);
  const { authorization_endpoint } = await endpoints();

  const url = new URL(authorization_endpoint);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", CLIENT_ID);
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("scope", SCOPES);
  url.searchParams.set("state", state);
  url.searchParams.set("nonce", nonce);
  url.searchParams.set("code_challenge", desafioPkce(verifier));
  url.searchParams.set("code_challenge_method", "S256");
  url.searchParams.set("resource", RESOURCE);

  const res = NextResponse.redirect(url);
  res.cookies.set(COOKIE_TX, await selarTransacao({ state, nonce, verifier, voltar }), cookieOpts(600));
  return res;
}
