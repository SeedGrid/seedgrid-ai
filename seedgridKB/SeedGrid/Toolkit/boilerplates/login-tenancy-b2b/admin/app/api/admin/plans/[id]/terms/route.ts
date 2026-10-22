import { NextResponse } from "next/server";

import { apiFetchServer, fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, PlanTermEntry } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const params = new URLSearchParams(new URL(request.url).searchParams);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const terms = await apiFetchServer<PaginatedResult<PlanTermEntry>>(
    `/admin/plans/${id}/terms${suffix}`,
  );
  return NextResponse.json(terms);
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();
  const response = await fetchWithAdminSession(`/admin/plans/${id}/terms`, {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
