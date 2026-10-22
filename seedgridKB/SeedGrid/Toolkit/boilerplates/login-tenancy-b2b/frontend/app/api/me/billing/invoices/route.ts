import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `list_invoices` -> GET /me/billing/invoices?limit=
export async function GET(request: Request) {{
  const limit = new URL(request.url).searchParams.get("limit") ?? "12";
  try {{
    const data = await apiFetchSecurity<unknown>(`/me/billing/invoices?limit=${encodeURIComponent(limit)}`);
    return NextResponse.json(data);
  }} catch (error) {{
    return problemResponse(error);
  }}
}}
