import { NextResponse } from "next/server";

import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Comando Rust `confirm_signup_email` -> POST /public/signup/confirm-email.
// Rota PUBLICA (sem sessao) — mesmo padrao das rotas copiadas de `app/api/auth/**`. NAO usa
// `fetchWithAdminSession`: rota publica nunca dispara refresh (PLAN.md §6.3).
export async function POST(request: Request) {
  const body = await request.text();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${LoginTenancyPaths.signup.confirmEmail}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  return passthroughResponse(response);
}
