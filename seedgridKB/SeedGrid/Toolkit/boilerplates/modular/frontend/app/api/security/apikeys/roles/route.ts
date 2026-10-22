import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ApiKeyRoleOption } from "@/lib/seedgrid-app-api";

// Perfis com que o usuario pode gerar chave na empresa corrente (GET /apikeys/roles, exige
// APIKEY_CREATE): os perfis de integracao da propria empresa + os globais de integracao sem
// permissao de plataforma. E' a UNICA fonte certa para o combo da tela de nova chave — a listagem
// de perfis (`/me/security/roles`) traz tambem os perfis de usuario, que o backend recusa aqui.
export async function GET() {
  try {
    const roles = await apiFetchSecurity<ApiKeyRoleOption[]>("/apikeys/roles");
    return NextResponse.json(roles);
  } catch (error) {
    return problemResponse(error);
  }
}
