import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ApiKeyRoleOption } from "@/lib/seedgrid-app-api";

// Perfis com que o usuario pode gerar chave na empresa corrente (GET /apikeys/roles, exige
// APIKEY_CREATE): so' perfis de INTEGRACAO — os da propria empresa + os globais de integracao. Fonte
// do combo da tela de nova chave; o `/security/roles/options?audience=platform` que ela usava
// trazia tambem perfis de usuario (ADMIN etc.), que nao servem para chave.
export async function GET() {
  try {
    const roles = await apiFetchSecurity<ApiKeyRoleOption[]>("/apikeys/roles");
    return NextResponse.json(roles);
  } catch (error) {
    return problemResponse(error);
  }
}
