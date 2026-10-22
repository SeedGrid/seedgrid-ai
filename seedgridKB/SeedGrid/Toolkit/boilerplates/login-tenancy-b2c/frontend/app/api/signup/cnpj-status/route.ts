import { NextResponse } from "next/server";

import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Comando Rust `signup_cnpj_status` (comandos/auth.rs) -> GET /public/signup/document-status?cpfCnpj=
// Rota PUBLICA, rate-limited no backend.
//
// O `console.warn` reproduz o `log::warn!` do Rust: o fallback AVAILABLE (que o cliente aplica em
// `lib/ported/portedApi.ts`) e' indistinguivel de "CNPJ livre" e nao pode ser mudo — foi ele que
// escondeu, por um bom tempo, o client apontando para uma API que nem tinha o endpoint.
export async function GET(request: Request) {
  const cnpj = new URL(request.url).searchParams.get("cnpj") ?? "";
  const path = `${LoginTenancyPaths.signup.documentStatus}?cpfCnpj=${encodeURIComponent(cnpj)}`;

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${path}`, { cache: "no-store" });
  } catch (error) {
    console.warn(`[signup_cnpj_status] ${path} inacessivel`, error);
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  if (!response.ok) {
    console.warn(
      `[signup_cnpj_status] ${path} respondeu HTTP ${response.status}. 404 aqui costuma ser ` +
        "API sem o login-tenancy que expoe o endpoint (ou apontando para outra instancia).",
    );
  }

  return passthroughResponse(response);
}
