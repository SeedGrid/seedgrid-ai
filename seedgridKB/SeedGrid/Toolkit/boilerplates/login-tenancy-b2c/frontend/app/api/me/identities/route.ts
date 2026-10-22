import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import { SocialPaths } from "@/lib/social-paths";

// GET /api/me/identities: metodos de entrada vinculados ao usuario logado (Google, Facebook...).
// Rota autenticada (fora do matcher do proxy): a sessao e o refresh ficam em `fetchWithAdminSession`.
export async function GET() {
  const response = await fetchWithAdminSession(SocialPaths.identities);
  return passthroughResponse(response);
}
