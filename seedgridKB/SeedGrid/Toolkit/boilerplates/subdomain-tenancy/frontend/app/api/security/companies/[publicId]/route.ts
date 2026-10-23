import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import {
  apiFetchSecurity,
  fetchWithAdminSession,
  passthroughResponse,
} from "@/lib/seedgrid-app-api-server";
import {
  toActivePatch,
  toCompanyBody,
  toCompanyEntry,
  type CompanyForm,
  type SecurityCompany,
} from "@/lib/companies";
import { SecurityPaths } from "@/lib/security-paths";

type RouteContext = {
  params: Promise<{ publicId: string }>;
};

// Identificacao por publicId. Sem DELETE de proposito (a empresa so' e' inativada: plano 4.18).

export async function GET(_request: Request, context: RouteContext) {
  const { publicId } = await context.params;
  try {
    const company = await apiFetchSecurity<SecurityCompany>(SecurityPaths.companies.byPublicId(publicId));
    return NextResponse.json(toCompanyEntry(company));
  } catch (error) {
    return problemResponse(error);
  }
}

// Edicao dos dados. `active` fica fora: inativar/reativar tem rota propria (PATCH abaixo), com os
// erros LAST_ADMIN_PROTECTED e COMPANY_QUOTA_EXCEEDED.
export async function PUT(request: Request, context: RouteContext) {
  const { publicId } = await context.params;
  const form = (await request.json()) as CompanyForm;
  const { active: _active, ...body } = toCompanyBody(form);
  const response = await fetchWithAdminSession(SecurityPaths.companies.byPublicId(publicId), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  return NextResponse.json(toCompanyEntry((await response.json()) as SecurityCompany));
}

// Inativar/Reativar: corpo `{ active: boolean }` -> PATCH existente do backend, so' com `active`.
export async function PATCH(request: Request, context: RouteContext) {
  const { publicId } = await context.params;
  const payload = (await request.json()) as { active?: unknown };
  if (typeof payload.active !== "boolean") {
    return NextResponse.json(
      { status: 400, title: "Bad Request", detail: "Informe active (true/false)." },
      { status: 400, headers: { "Content-Type": "application/problem+json" } },
    );
  }
  const response = await fetchWithAdminSession(SecurityPaths.companies.byPublicId(publicId), {
    method: "PATCH",
    body: JSON.stringify(toActivePatch(payload.active)),
  });
  if (!response.ok) {
    return passthroughResponse(response);
  }
  return NextResponse.json(toCompanyEntry((await response.json()) as SecurityCompany));
}
