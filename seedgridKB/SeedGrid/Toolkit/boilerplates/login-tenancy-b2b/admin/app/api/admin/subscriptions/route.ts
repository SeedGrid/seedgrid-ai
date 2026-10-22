import { NextResponse } from "next/server";

import { apiFetchServer, fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import type { PaginatedResult, SubscriptionEntry } from "@/lib/seedgrid-app-api";

export async function GET(request: Request) {
  const params = new URLSearchParams(new URL(request.url).searchParams);
  const suffix = params.toString() ? `?${params.toString()}` : "";
  const subscriptions = await apiFetchServer<PaginatedResult<SubscriptionEntry>>(
    `/admin/subscriptions${suffix}`,
  );
  return NextResponse.json(subscriptions);
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession("/admin/subscriptions", {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
