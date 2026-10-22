import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import {
  toSecurityUserPatch,
  toUserEntry,
  type SecurityUser,
  type UserForm,
} from "@/lib/security-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const user = await apiFetchSecurity<SecurityUser>(`/users/${id}`);
    return NextResponse.json(toUserEntry(user));
  } catch (error) {
    // Repassa o problem+json íntegro (responseBody+status) do app-api; falha de
    // conexão vira 502 legível. O client extrai a mensagem com extractApiErrorMessage.
    return problemResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const form = (await request.json()) as UserForm;
  const response = await fetchWithAdminSession(`/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify(toSecurityUserPatch(form)),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  return NextResponse.json(toUserEntry((await response.json()) as SecurityUser));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(`/users/${id}`, {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
