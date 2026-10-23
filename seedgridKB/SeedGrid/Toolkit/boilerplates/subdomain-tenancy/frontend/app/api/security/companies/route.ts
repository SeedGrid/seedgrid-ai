import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import {
  buildCompanyPage,
  parseCompanyListQuery,
  toCompanyBody,
  toCompanyEntry,
  type CompanyForm,
  type SecurityCompany,
} from "@/lib/companies";
import { asList } from "@/lib/list";
import { SecurityPaths } from "@/lib/security-paths";

// Empresas da conta: /companies do seedgrid-security. CRU: nao ha DELETE em nenhuma rota (4.18).
// O backend nao filtra por estado/situacao/busca, entao a lista inteira e' lida aqui e filtrada,
// ordenada e paginada por `buildCompanyPage` (lib/companies.ts, coberto por teste).
export async function GET(request: Request) {
  const query = parseCompanyListQuery(new URL(request.url).searchParams);

  try {
    // Sem page/size o security devolve todas as empresas (array).
    const all = asList<SecurityCompany>(
      await apiFetchSecurity<unknown>(SecurityPaths.companies.base),
    );
    return NextResponse.json(buildCompanyPage(all, query));
  } catch (error) {
    return problemResponse(error);
  }
}

export async function POST(request: Request) {
  const form = (await request.json()) as CompanyForm;
  // `active` nao vai na criacao: a empresa nasce ativa.
  const { active: _active, ...body } = toCompanyBody(form);
  const response = await fetchWithAdminSession(SecurityPaths.companies.base, {
    method: "POST",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  return NextResponse.json(toCompanyEntry((await response.json()) as SecurityCompany), { status: 201 });
}
