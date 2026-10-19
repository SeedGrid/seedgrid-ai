import { NextResponse } from "next/server";

import {
  ApiRequestError,
  apiFetchServer,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
} from "@/lib/seedgrid-app-api-server";
import type { AdminMePermissions } from "@/lib/seedgrid-app-api";

export async function GET() {
  try {
    // Permissoes EFETIVAS do operador, do seedgrid-security: resolvidas pela mesma regra do backend
    // (perfis da empresa do token - membership sobrepoe as globais - e filtro de audience).
    const permissions = await apiFetchServer<AdminMePermissions>(
      "/me/permissions",
    );
    return NextResponse.json(permissions);
  } catch (error) {
    if (isApiConnectionError(error)) {
      return NextResponse.json(
        { message: "API administrativa indisponivel" },
        { status: 503 },
      );
    }
    if (
      error instanceof ApiRequestError &&
      isInvalidAdminSessionResponse(error.status, error.body)
    ) {
      return NextResponse.json({ message: "Sessao invalida" }, { status: 401 });
    }
    throw error;
  }
}
