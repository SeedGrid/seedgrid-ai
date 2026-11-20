import { NextResponse } from "next/server";

import { fetchWithAdminSession } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ jobId: string }>;
};

// Baixa o ZIP do export (GET /exports/{jobId}/download). Repassa o corpo (stream) e os headers
// de download (Content-Disposition/Content-Type) do report-api para o navegador.
export async function GET(_request: Request, context: RouteContext) {
  const { jobId } = await context.params;
  const upstream = await fetchWithAdminSession(
    `/exports/${encodeURIComponent(jobId)}/download`,
    { method: "GET" },
  );

  if (!upstream.ok) {
    const text = await upstream.text();
    return new NextResponse(text || "Falha ao baixar o export.", { status: upstream.status });
  }

  const headers = new Headers();
  headers.set("Content-Type", upstream.headers.get("Content-Type") ?? "application/zip");
  const disposition = upstream.headers.get("Content-Disposition");
  headers.set("Content-Disposition", disposition ?? `attachment; filename="export-${jobId}.zip"`);

  return new NextResponse(upstream.body, { status: 200, headers });
}
