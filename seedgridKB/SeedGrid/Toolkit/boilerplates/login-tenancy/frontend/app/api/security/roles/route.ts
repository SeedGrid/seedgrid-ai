import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, RoleEntry } from "@/lib/seedgrid-app-api";

// Upstream: LoginTenancyRoleController (`/me/security/roles`) — perfis DA EMPRESA CORRENTE.
// Mesma divergencia da rota de usuarios: erro NAO vira pagina vazia com 200 (ver o comentario
// longo em `app/api/security/users/route.ts`).

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);
  const suffix = params.toString() ? `?${params.toString()}` : "";

  try {
    const roles = await apiFetchSecurity<PaginatedResult<RoleEntry>>(
      `${LoginTenancyPaths.roles.base}${suffix}`,
    );
    return NextResponse.json(roles);
  } catch (error) {
    return problemResponse(error);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession(LoginTenancyPaths.roles.base, {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
