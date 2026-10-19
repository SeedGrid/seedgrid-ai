import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import {
  ADMIN_REFRESH_TOKEN_COOKIE,
  ADMIN_TOKEN_COOKIE,
  isAdminLoginSuccess,
  isPlatformAudienceAllowed,
  PLATFORM_SCOPE,
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
      // O escopo e injetado no server-side, nunca vindo do browser: o admin-web sempre entra pelo
      // lado da plataforma. A API valida o vinculo e devolve 403 se o usuario nao for da plataforma.
      body: JSON.stringify({ ...body, scope: PLATFORM_SCOPE }),
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

  if (!isPlatformAudienceAllowed(data.token)) {
    return NextResponse.json(
      {
        message:
          "Este acesso e exclusivo da plataforma. Use o aplicativo do cliente.",
      },
      { status: 403 },
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
