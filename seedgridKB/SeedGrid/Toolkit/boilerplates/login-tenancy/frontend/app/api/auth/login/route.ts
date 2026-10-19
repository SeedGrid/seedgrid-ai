import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  isAdminLoginSuccess,
  type AdminLoginResponse,
} from "@/lib/admin-auth";
import { SecurityPaths } from "@/lib/security-paths";

import { applyAdminSessionCookies } from "@/lib/admin-session-cookies";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";

export async function POST(request: NextRequest) {
  const body = await request.json();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SecurityPaths.auth.login}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Sem `scope`: este e' o app do CLIENTE e ele entra pelo lado da EMPRESA. Quem manda
      // `scope: "platform"` e' o admin-web. O report-client (comandos/auth.rs, `sign_in`) posta
      // so' `{login, password}` — a API resolve a company pelo vinculo do usuario. Ver a nota em
      // `lib/admin-auth.ts` (`CLIENT_SCOPE_IS_IMPLICIT`).
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

  if (data.status === "2F_REQUIRED") {
    return NextResponse.json(data, { status: 200 });
  }

  if (!isAdminLoginSuccess(data)) {
    return NextResponse.json(
      {
        status: data.status,
        message: "Resposta de autenticacao nao suportada.",
      },
      { status: 400 },
    );
  }

  await applyAdminSessionCookies(data);

  return NextResponse.json({
    status: "OK",
    changePasswordRequired: data.changePasswordRequired ?? false,
    twoFactorEnabled: data.twoFactorEnabled ?? false,
    publicId: data.publicId ?? null,
  });
}
