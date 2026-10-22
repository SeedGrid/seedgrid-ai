import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `get_checkout_preview` -> GET /me/billing/checkout/preview?planId=
export async function GET(request: Request) {{
  const planId = new URL(request.url).searchParams.get("planId") ?? "";
  try {{
    const data = await apiFetchSecurity<unknown>(`/me/billing/checkout/preview?planId=${encodeURIComponent(planId)}`);
    return NextResponse.json(data);
  }} catch (error) {{
    return problemResponse(error);
  }}
}}
