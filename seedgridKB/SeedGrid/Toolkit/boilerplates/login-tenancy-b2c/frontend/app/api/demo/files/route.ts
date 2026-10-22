import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

// POST /api/demo/files do backend: consome o tamanho do arquivo (MB) do contador `storage-mb`, contado
// pelo codigo (UsageService.consume). O corpo multipart vai CRU, com o Content-Type original: e' ele que
// carrega o boundary, e o default do safeFetch (application/json) quebraria o upload.
export async function POST(request: Request) {
  const response = await fetchWithAdminSession("/api/demo/files", {
    method: "POST",
    headers: { "Content-Type": request.headers.get("content-type") ?? "multipart/form-data" },
    body: await request.arrayBuffer(),
  });
  return passthroughResponse(response);
}
