import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// GET /me/companies (ext-security): as empresas (memberships) do USUARIO corrente, com o estado de
// acesso (`accessMode`). Alimenta o seletor de empresa e a tela de usuario (so' oferece as do chamador).
export async function GET() {
  try {
    const data = await apiFetchSecurity<unknown>(SecurityPaths.me.companies);
    return NextResponse.json(data ?? []);
  } catch (error) {
    return problemResponse(error);
  }
}
