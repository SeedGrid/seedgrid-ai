import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import {
  toRoleEntry,
  toSecurityRoleBody,
  type RoleForm,
  type SecurityRole,
} from "@/lib/security-admin";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const role = await apiFetchSecurity<SecurityRole>(`/roles/${id}`);
    return NextResponse.json(toRoleEntry(role));
  } catch (error) {
    // Repassa o problem+json íntegro (responseBody+status) do app-api; falha de
    // conexão vira 502 legível. O client extrai a mensagem com extractApiErrorMessage.
    return problemResponse(error);
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const form = (await request.json()) as RoleForm;
  // "Perfil de integracao" so' se define na criacao (perfis de integracao nao sao editaveis).
  const { forIntegration: _ignored, ...patch } = toSecurityRoleBody(form);
  const response = await fetchWithAdminSession(`/roles/${id}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  return NextResponse.json(toRoleEntry((await response.json()) as SecurityRole));
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(`/roles/${id}`, {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
