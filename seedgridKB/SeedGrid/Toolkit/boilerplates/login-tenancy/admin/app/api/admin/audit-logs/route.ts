import { NextResponse } from "next/server";

import { apiFetchServer, upstreamProblemResponse } from "@/lib/seedgrid-app-api-server";
import type { AuditLogEntry, PaginatedResult } from "@/lib/seedgrid-app-api";

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
 * Normalizamos para o PaginatedResult padrao do admin-web.
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

  const rawPage = Number.parseInt(incoming.get("page") ?? "0", 10);
  const rawSize = Number.parseInt(incoming.get("size") ?? "8", 10);
  const page = Number.isFinite(rawPage) ? Math.max(0, rawPage) : 0;
  const size = Number.isFinite(rawSize) ? Math.min(200, Math.max(1, rawSize)) : 8;

  // Repassamos apenas os filtros preenchidos (em branco = todos).
  const params = new URLSearchParams();
  for (const key of AUDIT_FILTER_KEYS) {
    const value = incoming.get(key);
    if (value !== null && value.trim() !== "") {
      params.set(key, value.trim());
    }
  }
  params.set("page", String(page));
  params.set("size", String(size));
  const suffix = params.toString() ? `?${params.toString()}` : "";

  try {
    const payload = await apiFetchServer<unknown>(`/audit-logs${suffix}`);
    return NextResponse.json(normalize(payload, page, size));
  } catch (error) {
    return upstreamProblemResponse(error);
  }
}
