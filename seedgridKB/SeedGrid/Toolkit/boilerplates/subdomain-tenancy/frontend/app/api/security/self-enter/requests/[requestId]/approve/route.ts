import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type RouteContext = { params: Promise<{ requestId: string }> };

// Corpo OPCIONAL `{ roles: [rolePublicId, ...] }`: usado na aprovacao de cadastro PUBLICO (que chega
// sem perfil) e vence os perfis do convite e a default-role. Sem perfis, segue sem corpo (convite).
export async function POST(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    const body = (await request.json().catch(() => null)) as { roles?: unknown } | null;
    const roles = Array.isArray(body?.roles)
      ? body.roles.filter((role): role is string => typeof role === "string" && role !== "")
      : [];
    const result = await apiFetchSecurity<{ message: string }>(
      `/self-enter/requests/${requestId}/approve`,
      roles.length > 0
        ? { method: "POST", body: JSON.stringify({ roles }) }
        : { method: "POST" },
    );
    return NextResponse.json(result);
  } catch (error) {
    return problemResponse(error);
  }
}
