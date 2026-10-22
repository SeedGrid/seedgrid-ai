import { NextRequest, NextResponse } from "next/server";

import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import type { AdminResend2FAResponse } from "@/lib/admin-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SecurityPaths.twoFactor.resend}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = (await response.json().catch(() => null)) as
    | AdminResend2FAResponse
    | null;

  if (!data) {
    return NextResponse.json(
      { message: "Resposta invalida do servidor de autenticacao." },
      { status: 502 },
    );
  }

  return NextResponse.json(data, { status: response.status });
}
