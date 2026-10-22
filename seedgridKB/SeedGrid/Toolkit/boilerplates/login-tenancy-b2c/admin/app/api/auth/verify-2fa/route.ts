import { NextRequest, NextResponse } from "next/server";

import {
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
    response = await fetch(`${apiBaseUrl}${SecurityPaths.twoFactor.verify}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      // Com 2FA o token so nasce aqui, entao o escopo de plataforma precisa ser reenviado no verify
      // (a sessao de 2FA nao o guarda). Injetado no server-side, igual a rota de login.
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
