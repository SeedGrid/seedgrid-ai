import { NextResponse } from "next/server";

import {
  apiFetchServer,
  ApiRequestError,
  fetchWithAdminSession,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, RoleEntry } from "@/lib/seedgrid-app-api";
import {
  searchParamsFor,
  toPaginatedResult,
  toRoleEntry,
  toSecurityRoleBody,
  type RoleForm,
  type SecurityPage,
  type SecurityRole,
} from "@/lib/security-admin";

function emptyPage(params: URLSearchParams): PaginatedResult<RoleEntry> {
  return {
    items: [],
    totalRecords: 0,
    page: Number.parseInt(params.get("page") ?? "0", 10),
    size: Number.parseInt(params.get("size") ?? "10", 10),
    sortField: params.get("sortField") ?? "name",
    sortOrder: params.get("sortOrder") === "desc" ? "desc" : "asc",
    query: params.get("q") ?? "",
  };
}

// Perfis da plataforma: /roles do seedgrid-security, so' os globais (os perfis das contas-cliente
// sao geridos por cada conta em /me/security/roles).
export async function GET(request: Request) {
  const params = new URLSearchParams(new URL(request.url).searchParams);

  try {
    const page = await apiFetchServer<SecurityPage<SecurityRole>>(
      `/roles?${searchParamsFor(params, { global: "true" })}`,
    );
    return NextResponse.json(toPaginatedResult(page, toRoleEntry, params));
  } catch (error) {
    if (
      error instanceof ApiRequestError &&
      isInvalidAdminSessionResponse(error.status, error.body)
    ) {
      return NextResponse.json(emptyPage(params));
    }

    if (isApiConnectionError(error)) {
      return NextResponse.json(emptyPage(params));
    }

    throw error;
  }
}

export async function POST(request: Request) {
  const form = (await request.json()) as RoleForm;
  const response = await fetchWithAdminSession("/roles", {
    method: "POST",
    body: JSON.stringify(toSecurityRoleBody(form)),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  return NextResponse.json(toRoleEntry((await response.json()) as SecurityRole), { status: 201 });
}
