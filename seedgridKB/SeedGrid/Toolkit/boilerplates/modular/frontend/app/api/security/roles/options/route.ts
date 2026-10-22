import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import { asList } from "@/lib/list";
import type { RoleEntry, RoleSummary } from "@/lib/seedgrid-app-api";

// Opcoes de perfil para atribuir a PESSOAS: o combo do cadastro de usuario e o do convite externo.
//
// DIVERGENCIA: o report-admin chama `/admin/security/roles/options`, que aceita
// `?audience=platform`. Esse endpoint e' da visao de PLATAFORMA e nao existe do lado do cliente — o
// `LoginTenancyRoleController` expoe uma unica listagem, `/me/security/roles`, ja' restrita as roles
// da empresa corrente + as globais de sistema. O filtro por audience nao faz falta aqui.
//
// Perfis de INTEGRACAO (`forIntegration`) ficam de fora: eles so' servem para API key, e o backend
// recusa atribuir um deles a usuario (inclusive no convite). Quem precisa deles e' a tela de nova
// API key, que usa `/api/security/apikeys/roles`.
export async function GET() {
  try {
    const payload = await apiFetchSecurity<unknown>(LoginTenancyPaths.roles.base);
    const roles = asList<RoleEntry>(payload)
      .filter((role) => role.forIntegration !== true)
      .map<RoleSummary>((role) => ({
        publicId: role.publicId,
        name: role.name,
        description: role.description,
      }));
    return NextResponse.json(roles);
  } catch (error) {
    return problemResponse(error);
  }
}
