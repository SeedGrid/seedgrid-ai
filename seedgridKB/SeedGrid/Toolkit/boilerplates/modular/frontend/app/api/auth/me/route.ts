import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import {
  COMPANY_DISABLED_CODE,
  SESSION_REVOKED_CODE,
  isCompanyDisabledBody,
  isSessionRevokedBody,
} from "@/lib/api-error";

import {
  ADMIN_CURRENT_COMPANY_COOKIE,
  parseCurrentCompany,
  resolveAccessModeFallback,
} from "@/lib/company-access";
import { parseMyCompanies } from "@/lib/my-companies";
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
    // Empresa corrente (estado de acesso, T5.6): vem do login/refresh/select-company, guardada no
    // cookie da sessao. Sem ela (backend antigo) a casca assume ACTIVE.
    const cookieStore = await cookies();
    let currentCompany = parseCurrentCompany(cookieStore.get(ADMIN_CURRENT_COMPANY_COOKIE)?.value);
    // Login/refresh sem `currentCompany.accessMode` (backend antigo): o estado vem de /me/companies.
    if (currentCompany?.accessModeKnown === false) {
      try {
        const mine = await apiFetchServer<unknown>(SecurityPaths.me.companies);
        currentCompany = resolveAccessModeFallback(currentCompany, parseMyCompanies(mine));
      } catch {
        // Sem a lista, segue ACTIVE: o 403 COMPANY_READ_ONLY continua sendo a garantia.
      }
    }
    return NextResponse.json({ ...permissions, currentCompany });
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
      return NextResponse.json(
        isSessionRevokedBody(error.body)
          ? { message: "Sessao invalida", code: SESSION_REVOKED_CODE }
          : { message: "Sessao invalida" },
        { status: 401 },
      );
    }
    // Empresa desligada (403 COMPANY_DISABLED): o `fetchWithAdminSession` ja limpou a sessao; devolve
    // 401 com o codigo para o provider levar ao login com a mensagem de empresa desativada.
    if (error instanceof ApiRequestError && isCompanyDisabledBody(error.body)) {
      return NextResponse.json(
        { message: "Sessao invalida", code: COMPANY_DISABLED_CODE },
        { status: 401 },
      );
    }
    throw error;
  }
}
