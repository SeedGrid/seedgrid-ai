import { NextResponse } from "next/server";

import { bffProblemResponse } from "@/lib/bff-problem";
import { EXPORT_BFF_TIMEOUT_MS } from "@/lib/bff-timeout";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ExportJob } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

// Status/progresso de um job (GET /exports/{jobId}).
export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  try {
    const job = await apiFetchSecurity<ExportJob>(`/exports/${encodeURIComponent(jobId)}`, { timeoutMs: EXPORT_BFF_TIMEOUT_MS });
    return NextResponse.json(job);
  } catch (error) {
    return bffProblemResponse(error);
  }
}

// Cancela (se rodando) ou exclui (se concluido) um job (DELETE /exports/{jobId}).
export async function DELETE(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  try {
    await apiFetchSecurity<null>(`/exports/${encodeURIComponent(jobId)}`, { timeoutMs: EXPORT_BFF_TIMEOUT_MS, method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return bffProblemResponse(error);
  }
}
