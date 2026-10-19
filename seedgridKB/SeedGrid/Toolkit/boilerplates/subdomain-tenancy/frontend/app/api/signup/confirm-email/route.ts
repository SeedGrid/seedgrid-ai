import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";

import { SubdomainTenancyPaths } from "@/lib/subdomain-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Comando Rust `confirm_signup_email` -> POST /public/signup/confirm-email.
// Rota PUBLICA (sem sessao) — mesmo padrao das rotas copiadas de `app/api/auth/**`. NAO usa
// `fetchWithAdminSession`: rota publica nunca dispara refresh (PLAN.md §6.3).
export async function POST(request: Request) {
  const payload = await request.json();
  const body = JSON.stringify(payload);

  let response: Response;
  try {
    response = await backendFetch(`${apiBaseUrl}${SubdomainTenancyPaths.signup.confirmEmail}`, {
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

  if (!response.ok) return passthroughResponse(response);
  const result = await response.json();
  const loginUrl = new URL(request.url);
  loginUrl.hostname = `${payload.subdomain}.${process.env.SEEDGRID_TENANCY_DOMAIN?.trim() || "localhost"}`;
  loginUrl.pathname = "/login";
  loginUrl.search = "";
  return NextResponse.json({ ...result, loginUrl: loginUrl.toString() });
}
