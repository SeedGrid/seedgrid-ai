import { NextRequest } from "next/server";

import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";
import { SocialPaths } from "@/lib/social-paths";

// DELETE /api/me/identities/{publicId}: desvincula um metodo de entrada. O backend recusa o ultimo metodo
// com 409 `LAST_LOGIN_METHOD`; o status e o corpo (problem+json) voltam como estao para a tela mostrar.
export async function DELETE(_request: NextRequest, context: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await context.params;
  const response = await fetchWithAdminSession(SocialPaths.identity(publicId), { method: "DELETE" });
  return passthroughResponse(response);
}
