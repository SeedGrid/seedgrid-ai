import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

type RouteContext = { params: Promise<{ requestId: string }> };

// Proxy PUBLICO (sem auth): confirma o e-mail do cadastro publico com o codigo de 6 digitos; o
// pedido passa a aguardar aprovacao.
// POST {api}/public/self-enter/requests/{id}/confirm-email
export async function POST(request: Request, context: RouteContext) {
  const { requestId } = await context.params;
  const body = (await request.json().catch(() => ({}))) as { code?: string };

  let response: Response;
  try {
    response = await backendFetch(
      `${apiBaseUrl}${SecurityPaths.selfEnter.confirmEmail(requestId)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: body.code ?? "" }),
      },
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
