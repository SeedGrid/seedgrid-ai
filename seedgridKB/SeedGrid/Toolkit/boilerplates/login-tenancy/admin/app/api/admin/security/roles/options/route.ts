import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import { toRoleSummary, type SecurityRole } from "@/lib/security-admin";

export async function GET(request: Request) {
  try {
    // Perfis globais (sem conta dona). Com ?audience=platform (convite externo): so' os que nao
    // tem permissao de outra audience, mais os de sistema (ex.: ADMIN).
    const audience = new URL(request.url).searchParams.get("audience");
    const params = new URLSearchParams({ global: "true" });
    if (audience) params.set("assignableAudience", audience);
    const roles = await apiFetchSecurity<SecurityRole[]>(`/roles?${params.toString()}`);
    // Perfis de INTEGRACAO ficam de fora: os dois consumidores (cadastro de usuario e convite/
    // aprovacao do auto-cadastro) atribuem perfil a PESSOA, e o backend recusa perfil de integracao.
    return NextResponse.json(
      roles.filter((role) => role.forIntegration !== true).map(toRoleSummary),
    );
  } catch (error) {
    return problemResponse(error);
  }
}
