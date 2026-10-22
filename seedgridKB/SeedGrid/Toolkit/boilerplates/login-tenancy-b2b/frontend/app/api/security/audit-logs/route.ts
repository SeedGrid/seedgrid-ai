import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { AuditLogEntry, PaginatedResult } from "@/lib/seedgrid-app-api";

// Upstream: `/audit-logs` do `seedgrid-audit` — o MESMO endpoint que o report-client consome
// (comandos/security.rs, `list_audit_logs`). A leitura ja' vem escopada na company do token
// (AllowedCompaniesResolver): sem contexto e' DENY, nunca "ve tudo".

/** Query params aceitos pelo GET /audit-logs da API. */
const AUDIT_FILTER_KEYS = [
  "idFrom",
  "idTo",
  "entity",
  "operation",
  "description",
  "operationDateFrom",
  "operationDateTo",
  "userName",
  "page",
  "size",
] as const;

/**
 * A API de audit-logs responde como PageResult ({ items, total, page, size })
 * quando page/size sao informados, ou como array puro caso contrario.
 * Normalizamos para o PaginatedResult padrao.
 */
function normalize(
  payload: unknown,
  page: number,
  size: number,
): PaginatedResult<AuditLogEntry> {
  if (Array.isArray(payload)) {
    return {
      items: payload as AuditLogEntry[],
      totalRecords: payload.length,
      page,
      size,
      sortField: "id",
      sortOrder: "desc",
      query: "",
    };
  }

  const record = (payload ?? {}) as Record<string, unknown>;
  const items = (record.items ?? []) as AuditLogEntry[];
  const totalRecords = Number(record.total ?? items.length);

  return {
    items,
    totalRecords: Number.isFinite(totalRecords) ? totalRecords : items.length,
    page,
    size,
    sortField: "id",
    sortOrder: "desc",
    query: "",
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const incoming = url.searchParams;

  const page = Number.parseInt(incoming.get("page") ?? "0", 10);
  const size = Number.parseInt(incoming.get("size") ?? "8", 10);

  // Repassamos apenas os filtros preenchidos (em branco = todos).
  const params = new URLSearchParams();
  for (const key of AUDIT_FILTER_KEYS) {
    const value = incoming.get(key);
    if (value !== null && value.trim() !== "") {
      params.set(key, value.trim());
    }
  }
  const suffix = params.toString() ? `?${params.toString()}` : "";

  try {
    const payload = await apiFetchSecurity<unknown>(`/audit-logs${suffix}`);
    return NextResponse.json(normalize(payload, page, size));
  } catch (error) {
    // DIVERGENCIA DELIBERADA do report-admin: la', sessao invalida ou API fora do ar viravam uma
    // pagina VAZIA com HTTP 200 (`emptyResult`). Auditoria sem registro nenhum e' plausivel — e
    // era esse o problema: a tela nao tinha como distinguir "nada aconteceu" de "nao consegui
    // ler". PLAN.md §6.6. Agora o erro sobe intacto e a tela mostra o <ListLoadError>.
    return problemResponse(error);
  }
}
