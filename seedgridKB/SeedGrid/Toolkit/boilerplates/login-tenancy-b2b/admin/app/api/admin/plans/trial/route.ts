import { NextResponse } from "next/server";

import { apiFetchServer, fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import type { TrialConfig } from "@/lib/seedgrid-app-api";

// Proxy da configuracao do trial. Rota estatica "/trial" tem prioridade sobre a
// dinamica "/[id]" no App Router, entao nao colide com GET /admin/plans/{id}.

export async function GET() {
  const config = await apiFetchServer<TrialConfig>("/admin/plans/trial");
  return NextResponse.json(config);
}

export async function PATCH(request: Request) {
  const body = await request.text();
  const response = await fetchWithAdminSession("/admin/plans/trial", {
    method: "PATCH",
    body,
  });
  return passthroughResponse(response);
}
