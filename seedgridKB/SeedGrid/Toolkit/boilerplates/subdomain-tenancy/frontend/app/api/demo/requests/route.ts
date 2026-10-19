import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

// POST /api/demo/requests do backend: consome 1 unidade do contador `requests` (@ConsumesUsage).
// Passthrough do status: o 402 do billing (com `code`) chega intacto para a tela explicar o bloqueio.
export async function POST() {
  const response = await fetchWithAdminSession("/api/demo/requests", { method: "POST", body: "{}" });
  return passthroughResponse(response);
}
