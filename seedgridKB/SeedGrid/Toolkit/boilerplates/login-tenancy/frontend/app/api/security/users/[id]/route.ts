import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import { LoginTenancyPaths } from "@/lib/login-tenancy-paths";
import type { UserEntry } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const user = await apiFetchSecurity<UserEntry>(LoginTenancyPaths.users.byPublicId(id));
    return NextResponse.json(user);
  } catch (error) {
    // Repassa o problem+json íntegro (responseBody+status) do report-api; falha de
    // conexão vira 502 legível. O client extrai a mensagem com extractApiErrorMessage.
    return problemResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(LoginTenancyPaths.users.byPublicId(id), {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(LoginTenancyPaths.users.byPublicId(id), {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
