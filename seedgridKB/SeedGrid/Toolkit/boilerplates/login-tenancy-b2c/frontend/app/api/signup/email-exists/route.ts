import { NextResponse } from "next/server";

import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Comando Rust `check_email_exists` (comandos/auth.rs) -> GET /public/signup/email-exists?email=
// Rota PUBLICA, rate-limited no backend.
export async function GET(request: Request) {
  const email = new URL(request.url).searchParams.get("email") ?? "";

  let response: Response;
  try {
    response = await fetch(
      `${apiBaseUrl}${LoginTenancyPaths.signup.emailExists}?email=${encodeURIComponent(email)}`,
      { cache: "no-store" },
    );
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  return passthroughResponse(response);
}
