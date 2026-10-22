import { NextRequest, NextResponse } from "next/server";

import { buildBackendLoginUrl, isValidProviderId, resolvePublicBase } from "@/app/auth/socialLogin";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";

// GET /api/auth/social/{provider}/start: redireciona o navegador ao backend (`/public/auth/social/{provider}/login`),
// que conversa com o provedor (Google, Facebook...) e volta a `/auth/social/callback` com `ticket` ou `status`.
// O front nao fala com o provedor nem guarda segredo: o OIDC (codigo + PKCE + state/nonce) e' todo do backend.
//
// `returnTo` sai de `SOCIAL_RETURN_BASE_URL` (recomendado em producao) ou do host da requisicao; o backend ainda
// confere `seedgrid.security.social.allowed-return-hosts`, entao um host forjado aqui nao vira open redirect.
export async function GET(request: NextRequest, context: { params: Promise<{ provider: string }> }) {
  const { provider } = await context.params;
  if (!isValidProviderId(provider)) {
    return NextResponse.json({ message: "Provedor de login invalido." }, { status: 400 });
  }

  const returnBase = resolvePublicBase({
    envBase: process.env.SOCIAL_RETURN_BASE_URL,
    forwardedHost: request.headers.get("x-forwarded-host"),
    forwardedProto: request.headers.get("x-forwarded-proto"),
    origin: request.nextUrl.origin,
  });

  const search = request.nextUrl.searchParams;
  const target = buildBackendLoginUrl(apiBaseUrl, provider, returnBase, {
    acceptedTerms: search.get("acceptedTerms") === "true",
    termsVersion: search.get("termsVersion"),
  });

  return NextResponse.redirect(target, 302);
}
