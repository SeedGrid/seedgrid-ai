import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type AuditLogUserRef = { userName: string | null };

// Upstream: `/audit-logs/users`. Alimenta o combo de "Usuario" dos filtros da auditoria.
// Erro NAO vira lista vazia — mesma razao da rota de entidades.
export async function GET() {
  try {
    const users = await apiFetchSecurity<AuditLogUserRef[]>("/audit-logs/users");
    const names = users
      .map((item) => item.userName)
      .filter((value): value is string => Boolean(value));
    return NextResponse.json(names);
  } catch (error) {
    return problemResponse(error);
  }
}
