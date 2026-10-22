import { NextResponse } from "next/server";

import { apiFetchServer, fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import type { CurrencyDetail } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const currency = await apiFetchServer<CurrencyDetail>(`/admin/currencies/${id}`);
  return NextResponse.json(currency);
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(`/admin/currencies/${id}`, {
    method: "PUT",
    body,
  });
  return passthroughResponse(response);
}

export async function DELETE(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const response = await fetchWithAdminSession(`/admin/currencies/${id}`, {
    method: "DELETE",
  });
  return passthroughResponse(response);
}
