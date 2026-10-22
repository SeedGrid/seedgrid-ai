import { NextRequest, NextResponse } from "next/server";

import type { AdminLoginResponse } from "@/lib/admin-auth";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { SocialPaths } from "@/lib/social-paths";
import { sessionResponseFor } from "@/lib/social-session";

// POST /api/auth/social/exchange {ticket}: troca o ticket de uso unico (que o backend devolveu na volta do
// provedor) pelo MESMO AuthResponse do login por senha e grava os mesmos cookies de sessao. O 2FA segue valendo:
// `2F_REQUIRED` devolve o `tempToken` para a pagina de verificacao, igual ao `/api/auth/login`.
export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as { ticket?: unknown } | null;
  const ticket = typeof body?.ticket === "string" ? body.ticket.trim() : "";
  if (!ticket) {
    return NextResponse.json({ message: "Ticket de login nao informado." }, { status: 400 });
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SocialPaths.exchange}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticket }),
      cache: "no-store",
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = (await response.json().catch(() => null)) as AdminLoginResponse | null;
  if (!data) {
    return NextResponse.json({ message: "Resposta invalida do servidor de autenticacao." }, { status: 502 });
  }
  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }
  return sessionResponseFor(data);
}
