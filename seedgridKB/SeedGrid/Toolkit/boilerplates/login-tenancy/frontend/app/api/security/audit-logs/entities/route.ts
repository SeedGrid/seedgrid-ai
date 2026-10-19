import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type AuditLogEntityRef = { entity: string | null };

// Upstream: `/audit-logs/entities`. Alimenta o combo de "Entidade" dos filtros da auditoria.
// Erro NAO vira lista vazia (ver `app/api/security/audit-logs/route.ts`): combo vazio por falha
// de leitura e' indistinguivel de "nao ha entidade auditada", e some com a propria evidencia.
export async function GET() {
  try {
    const entities = await apiFetchSecurity<AuditLogEntityRef[]>("/audit-logs/entities");
    const names = entities
      .map((item) => item.entity)
      .filter((value): value is string => Boolean(value));
    return NextResponse.json(names);
  } catch (error) {
    return problemResponse(error);
  }
}
