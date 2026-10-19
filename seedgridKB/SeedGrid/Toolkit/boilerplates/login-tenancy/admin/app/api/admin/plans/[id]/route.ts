import { NextResponse } from "next/server";

import {
  apiFetchServer,
  ApiRequestError,
  fetchWithAdminSession,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { PlanEntry } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const plan = await apiFetchServer<PlanEntry>(`/admin/plans/${id}`);
    return NextResponse.json(plan);
  } catch (error) {
    if (isApiConnectionError(error)) {
      return NextResponse.json(
        { message: "API administrativa indisponivel" },
        { status: 503 },
      );
    }

    if (
      error instanceof ApiRequestError &&
      isInvalidAdminSessionResponse(error.status, error.body)
    ) {
      return NextResponse.json({ message: "Sessao invalida" }, { status: 401 });
    }

    if (error instanceof ApiRequestError) {
      return NextResponse.json(
        { message: error.body || "Falha ao carregar plano." },
        { status: error.status },
      );
    }

    throw error;
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(`/admin/plans/${id}`, {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(`/admin/plans/${id}`, {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
