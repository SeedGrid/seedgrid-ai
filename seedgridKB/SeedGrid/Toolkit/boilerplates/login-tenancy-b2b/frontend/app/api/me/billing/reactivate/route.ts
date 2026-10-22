import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `reactivate_subscription` -> POST /me/billing/reactivate
export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await apiFetchSecurity<unknown>("/me/billing/reactivate", {
      method: "POST",
      body: body || "{}",
    });
    return NextResponse.json(data ?? { status: "OK" });
  } catch (error) {
    return problemResponse(error);
  }
}
