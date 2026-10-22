import { NextRequest, NextResponse } from "next/server";

import {
  isAdminLoginSuccess,
  type AdminLoginResponse,
} from "@/lib/admin-auth";
import { buildSessionResponseBody } from "@/lib/company-selection";
import { SecurityPaths } from "@/lib/security-paths";

import { applyAdminSessionCookies } from "@/lib/admin-session-cookies";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SecurityPaths.twoFactor.verify}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Sem `scope`, pelo mesmo motivo da rota de login: app do cliente entra pelo lado da
      // empresa. (No admin-web o escopo de plataforma precisa ser reenviado aqui, porque com 2FA
      // o token so' nasce no verify e a sessao de 2FA nao o guarda.)
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = (await response.json().catch(() => null)) as
    | AdminLoginResponse
    | { error?: string }
    | null;

  if (!data) {
    return NextResponse.json(
      { message: "Resposta invalida do servidor de autenticacao." },
      { status: 502 },
    );
  }

  if (!response.ok) {
    return NextResponse.json(data, { status: response.status });
  }

  if (!("status" in data) || !isAdminLoginSuccess(data)) {
    return NextResponse.json(
      { message: "Resposta inesperada ao verificar o 2FA." },
      { status: 400 },
    );
  }

  await applyAdminSessionCookies(data);

  return NextResponse.json(buildSessionResponseBody(data));
}
