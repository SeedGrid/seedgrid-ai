import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type RouteContext = { params: Promise<{ requestId: string }> };

// Body OPCIONAL `{ roles: [rolePublicId, ...] }`: perfis do aprovado. Obrigatorio na pratica para
// pedido PUBLICO (nao traz perfil e a default-role deste deploy e' a sentinela NO_DEFAULT_ROLE ->
// 422). Pedido de CONVITE ja' carrega os perfis escolhidos no convite: a tela manda sem body.
export async function POST(request: Request, context: RouteContext) {
  try {
    const { requestId } = await context.params;
    const body = (await request.text()).trim();
    const result = await apiFetchSecurity<{ message: string }>(
      SecurityPaths.selfEnter.approve(requestId),
      body
        ? { method: "POST", body, headers: { "Content-Type": "application/json" } }
        : { method: "POST" },
    );
    return NextResponse.json(result);
  } catch (error) {
    return problemResponse(error);
  }
}
