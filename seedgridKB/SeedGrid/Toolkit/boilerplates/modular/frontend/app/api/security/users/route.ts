import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, UserEntry } from "@/lib/seedgrid-app-api";

// Upstream: LoginTenancyUserController (`/me/security/users`) — usuarios DA EMPRESA CORRENTE.
// No report-admin este handler batia em `/admin/security/users`, que e' a visao de PLATAFORMA.
//
// DIVERGENCIA DELIBERADA do report-admin, item 2: o original devolvia uma pagina VAZIA com HTTP
// 200 quando a sessao caia ou a API estava fora do ar. Isso e' exatamente "erro virando lista
// vazia" — a tela dizia "nenhum usuario encontrado" com a mesma confianca com que diria zero de
// verdade (PLAN.md §6.6 e §8.2). Aqui o erro sobe como problem+json com o status real, e a tela
// mostra o <ListLoadError>.

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);
  const suffix = params.toString() ? `?${params.toString()}` : "";

  try {
    const users = await apiFetchSecurity<PaginatedResult<UserEntry>>(
      `${LoginTenancyPaths.users.base}${suffix}`,
    );
    return NextResponse.json(users);
  } catch (error) {
    return problemResponse(error);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession(LoginTenancyPaths.users.base, {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
