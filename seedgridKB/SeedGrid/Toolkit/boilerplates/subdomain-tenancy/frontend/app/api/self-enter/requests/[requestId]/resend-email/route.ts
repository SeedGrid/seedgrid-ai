import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

type RouteContext = { params: Promise<{ requestId: string }> };

// Proxy PUBLICO (sem auth): reenvia o codigo de confirmacao do cadastro publico.
// POST {api}/public/self-enter/requests/{id}/resend-email
export async function POST(_: Request, context: RouteContext) {
  const { requestId } = await context.params;

  let response: Response;
  try {
    response = await backendFetch(
      `${apiBaseUrl}${SecurityPaths.selfEnter.resendEmail(requestId)}`,
      { method: "POST" },
    );
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: response.status });
}
