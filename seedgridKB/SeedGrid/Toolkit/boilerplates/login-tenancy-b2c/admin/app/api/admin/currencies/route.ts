import { NextResponse } from "next/server";

import { apiFetchServer, fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import type { CurrencyOption } from "@/lib/seedgrid-app-api";

export async function GET() {
  try {
    const currencies = await apiFetchServer<CurrencyOption[]>("/admin/currencies");
    return NextResponse.json(currencies);
  } catch {
    return NextResponse.json([] satisfies CurrencyOption[]);
  }
}

export async function POST(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession("/admin/currencies", {
    method: "POST",
    body,
  });
  return passthroughResponse(response);
}
