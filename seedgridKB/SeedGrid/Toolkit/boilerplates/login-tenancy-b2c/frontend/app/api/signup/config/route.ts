import { NextResponse } from "next/server";

import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// GET /public/signup/config: tipo de cliente aceito (B2B|B2C|BOTH) e os termos vigentes.
// Rota PUBLICA (sem sessao), como as demais de `/api/signup/**`.
export async function GET() {
  try {
    const response = await fetch(`${apiBaseUrl}${LoginTenancyPaths.signup.config}`, { cache: "no-store" });
    return passthroughResponse(response);
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }
}
