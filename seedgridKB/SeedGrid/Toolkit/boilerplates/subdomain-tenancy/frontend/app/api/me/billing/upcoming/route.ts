import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `get_upcoming_invoice` -> GET /me/billing/upcoming
export async function GET() {{
  try {{
    const data = await apiFetchSecurity<unknown>("/me/billing/upcoming");
    return NextResponse.json(data);
  }} catch (error) {{
    return problemResponse(error);
  }}
}}
