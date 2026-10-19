import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";

import { SubdomainTenancyPaths } from "@/lib/subdomain-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Comando Rust `resend_signup_email` -> POST /public/signup/resend-email.
// Rota PUBLICA (sem sessao) — mesmo padrao das rotas copiadas de `app/api/auth/**`. NAO usa
// `fetchWithAdminSession`: rota publica nunca dispara refresh (PLAN.md §6.3).
export async function POST(request: Request) {
  const { subdomain } = await request.json();
  const query = new URLSearchParams({ subdomain: String(subdomain ?? "") });

  let response: Response;
  try {
    response = await backendFetch(`${apiBaseUrl}${SubdomainTenancyPaths.signup.resendEmail}?${query}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  return passthroughResponse(response);
}
