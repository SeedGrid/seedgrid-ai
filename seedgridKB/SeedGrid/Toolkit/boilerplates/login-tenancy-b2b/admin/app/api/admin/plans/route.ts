import { NextResponse } from "next/server";

import {
  apiFetchServer,
  ApiRequestError,
  fetchWithAdminSession,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, PlanEntry } from "@/lib/seedgrid-app-api";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = new URLSearchParams(url.searchParams);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  try {
    const plans = await apiFetchServer<PaginatedResult<PlanEntry>>(
      `/admin/plans${suffix}`,
    );
    return NextResponse.json(plans);
  } catch (error) {
    if (
      error instanceof ApiRequestError &&
      isInvalidAdminSessionResponse(error.status, error.body)
    ) {
      return NextResponse.json({
        items: [],
        totalRecords: 0,
        page: Number.parseInt(params.get("page") ?? "0", 10),
        size: Number.parseInt(params.get("size") ?? "10", 10),
        sortField: params.get("sortField") ?? "name",
        sortOrder: params.get("sortOrder") === "desc" ? "desc" : "asc",
        query: params.get("q") ?? "",
      } satisfies PaginatedResult<PlanEntry>);
    }
    if (isApiConnectionError(error)) {
      return NextResponse.json({
        items: [],
        totalRecords: 0,
        page: Number.parseInt(params.get("page") ?? "0", 10),
        size: Number.parseInt(params.get("size") ?? "10", 10),
        sortField: params.get("sortField") ?? "name",
        sortOrder: params.get("sortOrder") === "desc" ? "desc" : "asc",
        query: params.get("q") ?? "",
      } satisfies PaginatedResult<PlanEntry>);
    }
    throw error;
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession("/admin/plans", {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
