import { backendUnavailableResponse } from "@/lib/backend-unavailable";
import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

type RouteContext = { params: Promise<{ token: string }> };

// Proxy PUBLICO (sem auth): valida o token do convite e devolve o contexto (nome/email/status/expiracao).
// A pagina publica /auth/self-enter chama esta rota, que repassa para
// GET {api}/public/self-enter/invitations/{token}
export async function GET(_: Request, context: RouteContext) {
  const { token } = await context.params;
  let response: Response;
  try {
    response = await backendFetch(
      `${apiBaseUrl}${SecurityPaths.selfEnter.invitationByToken(token)}`,
      { method: "GET", cache: "no-store" },
    );
  } catch (error) {
    return backendUnavailableResponse(error);
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: response.status });
}
