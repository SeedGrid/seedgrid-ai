import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

type RouteContext = { params: Promise<{ token: string }> };

// Proxy PUBLICO (sem auth): completa o convite (nome + whatsApp + senha) e move para PENDING_APPROVAL.
// POST {api}/public/self-enter/invitations/{token}/complete
export async function POST(request: Request, context: RouteContext) {
  const { token } = await context.params;
  const body = await request.json().catch(() => ({}));

  let response: Response;
  try {
    response = await fetch(
      `${apiBaseUrl}${SecurityPaths.selfEnter.invitationComplete(token)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
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
