import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ExportJob } from "@/lib/seedgrid-app-api";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

// Status/progresso de um job (GET /exports/{jobId}).
export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  try {
    const job = await apiFetchSecurity<ExportJob>(`/exports/${encodeURIComponent(jobId)}`);
    return NextResponse.json(job);
  } catch (error) {
    return problemResponse(error);
  }
}

// Cancela (se rodando) ou exclui (se concluido) um job (DELETE /exports/{jobId}).
export async function DELETE(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  try {
    await apiFetchSecurity<null>(`/exports/${encodeURIComponent(jobId)}`, { method: "DELETE" });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return problemResponse(error);
  }
}
