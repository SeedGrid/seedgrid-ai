import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `open_billing_portal` -> POST /me/billing/portal
export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await apiFetchSecurity<unknown>("/me/billing/portal", {
      method: "POST",
      body: body || "{}",
    });
    return NextResponse.json(data ?? { status: "OK" });
  } catch (error) {
    return problemResponse(error);
  }
}
