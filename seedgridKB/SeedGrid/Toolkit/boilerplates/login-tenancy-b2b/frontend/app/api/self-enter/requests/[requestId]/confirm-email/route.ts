import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

type RouteContext = { params: Promise<{ requestId: string }> };

// Proxy PUBLICO (sem auth): confirma o e-mail do cadastro publico com o codigo de 6 digitos.
// POST {api}/public/self-enter/requests/{id}/confirm-email com { code }. Confirmado, o pedido vai
// para PENDING_APPROVAL e espera um aprovador da empresa.
export async function POST(request: Request, context: RouteContext) {
  const { requestId } = await context.params;
  const body = await request.json().catch(() => ({}));

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SecurityPaths.selfEnter.confirmEmail(requestId)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: response.status });
}
