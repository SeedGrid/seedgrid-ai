import { NextResponse } from "next/server";

import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// POST /public/signup/personal: cadastro de pessoa fisica (B2C). Rota PUBLICA (sem sessao).
export async function POST(request: Request) {
  const body = await request.text();

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${LoginTenancyPaths.signup.personal}`, {
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
