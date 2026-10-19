import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import { toRoleSummary, type SecurityRole } from "@/lib/security-admin";

export async function GET(request: Request) {
  try {
    // Perfis globais (sem conta dona). Com ?audience=platform (convite externo): so' os que nao
    // tem permissao de outra audience, mais os de sistema (ex.: ADMIN).
    const audience = new URL(request.url).searchParams.get("audience");
    const params = new URLSearchParams({});
    if (audience) params.set("assignableAudience", audience);
    const roles = await apiFetchSecurity<SecurityRole[]>(`/roles?${params.toString()}`);
    return NextResponse.json(roles.map(toRoleSummary));
  } catch (error) {
    return problemResponse(error);
  }
}
