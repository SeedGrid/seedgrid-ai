import { NextResponse } from "next/server";

import {
  apiFetchServer,
  ApiRequestError,
  fetchWithAdminSession,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, UserEntry } from "@/lib/seedgrid-app-api";
import {
  searchParamsFor,
  toPaginatedResult,
  toSecurityUserCreate,
  toUserEntry,
  type SecurityPage,
  type SecurityUser,
  type UserForm,
} from "@/lib/security-admin";

function emptyPage(params: URLSearchParams): PaginatedResult<UserEntry> {
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

// Operadores da plataforma: /users do seedgrid-security, so' os membros da empresa-plataforma.
export async function GET(request: Request) {
  const params = new URLSearchParams(new URL(request.url).searchParams);

  try {
    const page = await apiFetchServer<SecurityPage<SecurityUser>>(
      `/users?${searchParamsFor(params, {})}`,
    );
    return NextResponse.json(toPaginatedResult(page, (user) => toUserEntry(user), params));
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
  const form = (await request.json()) as UserForm;
  const response = await fetchWithAdminSession("/users", {
    method: "POST",
    body: JSON.stringify(toSecurityUserCreate(form)),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  const created = (await response.json()) as SecurityUser;
  return NextResponse.json(toUserEntry(created), { status: 201 });
}
