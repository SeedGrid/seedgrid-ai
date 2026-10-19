import { NextResponse } from "next/server";

import { SecurityPaths } from "@/lib/security-paths";
import {
  ApiRequestError,
  apiFetchServer,
  isApiConnectionError,
  isInvalidAdminSessionResponse,
} from "@/lib/seedgrid-app-api-server";
import type { AdminMePermissions } from "@/lib/seedgrid-app-api";

export async function GET() {
  try {
    // DIVERGENCIA do report-admin: la' este handler chama `/admin/me/permissions`, que responde
    // pelas roles efetivas na EMPRESA-PLATAFORMA (o comentario original explicava por que o
    // `/me/permissions` do ext-security nao servia para o admin: ele le' so' as roles GLOBAIS e
    // ignorava a membership por conta da empresa-plataforma).
    //
    // Aqui e' o app do CLIENTE: o token ja' nasce escopado na company do usuario, e as roles que
    // valem sao as daquela company. O endpoint certo e' o `/me/permissions` do ext-security — o
    // mesmo que o report-client consome. Chamar `/admin/me/permissions` daria 403 para todo
    // usuario de empresa e o menu sairia vazio.
    const permissions = await apiFetchServer<AdminMePermissions>(
      SecurityPaths.me.permissions,
    );
    return NextResponse.json(permissions);
  } catch (error) {
    if (isApiConnectionError(error)) {
      return NextResponse.json(
        { message: "API indisponivel" },
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
