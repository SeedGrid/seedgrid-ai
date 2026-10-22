import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `list_plans` (comandos/billing.rs) -> GET /me/plans. Catalogo de planos
// assinaveis, ja com `current`/`pendingDowngrade` resolvidos pelo backend.
export async function GET() {{
  try {{
    const data = await apiFetchSecurity<unknown>("/me/plans");
    return NextResponse.json(data);
  }} catch (error) {{
    return problemResponse(error);
  }}
}}
