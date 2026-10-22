import { NextRequest, NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";
import { SocialPaths } from "@/lib/social-paths";

// POST /api/auth/social/email {pendingToken, email}: provedor que nao devolveu e-mail (o Facebook nem sempre
// devolve). O backend envia a confirmacao e so' cria/vincula a conta depois de confirmada; a resposta e' o
// `SocialLoginResponseDTO` (EMAIL_CONFIRMATION_SENT neutro, ou REJECTED com `code`, ambos 200). Rota publica.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { pendingToken?: unknown; email?: unknown } | null;
  try {
    const response = await fetch(`${apiBaseUrl}${SocialPaths.email}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingToken: body?.pendingToken ?? null, email: body?.email ?? null }),
      cache: "no-store",
    });
    return passthroughResponse(response);
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }
}
