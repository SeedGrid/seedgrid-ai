import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ApiKeyRoleOption } from "@/lib/seedgrid-app-api";

// Perfis de integracao que o usuario pode usar para criar uma chave na empresa corrente
// (ext seedgrid-apikeys: GET /apikeys/roles, exige APIKEY_CREATE). So' perfis com
// forIntegration=true — usar a lista geral de perfis aqui oferecia perfis de usuario, que o
// backend recusa na criacao da chave.
export async function GET() {
  try {
    const roles = await apiFetchSecurity<ApiKeyRoleOption[]>("/apikeys/roles");
    return NextResponse.json(roles);
  } catch (error) {
    return problemResponse(error);
  }
}
