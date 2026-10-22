import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import type { RoleEntry } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const role = await apiFetchSecurity<RoleEntry>(LoginTenancyPaths.roles.byPublicId(id));
    return NextResponse.json(role);
  } catch (error) {
    // Repassa o problem+json íntegro (responseBody+status) do report-api; falha de
    // conexão vira 502 legível. O client extrai a mensagem com extractApiErrorMessage.
    return problemResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(LoginTenancyPaths.roles.byPublicId(id), {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(LoginTenancyPaths.roles.byPublicId(id), {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
