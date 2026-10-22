import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import { asList } from "@/lib/list";
import type { PermissionOption } from "@/lib/seedgrid-app-api";

// Upstream: LoginTenancyRoleController#listAssignablePermissions (`/me/security/roles/permissions`)
// — so as permissoes de audience `client` (ou curinga). As de plataforma nunca aparecem aqui.
// No report-admin era `/admin/security/roles/permissions`, o catalogo da plataforma.
//
// `asList` porque este endpoint devolve `{items, totalRecords}` e a tela consome um array — o
// mesmo desencontro que deixou o treeview de permissoes do Pulse vazio (PLAN.md §8.2).
export async function GET() {
  try {
    const payload = await apiFetchSecurity<unknown>(LoginTenancyPaths.roles.permissions);
    return NextResponse.json(asList<PermissionOption>(payload));
  } catch (error) {
    return problemResponse(error);
  }
}
