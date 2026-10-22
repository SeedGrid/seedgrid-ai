import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

const UPSTREAM = "/me/billing/downgrade-company-selection";

// GET /me/billing/downgrade-company-selection (plano 4.14): empresas elegiveis (com o estado atual),
// protegidas (plataforma e responsavel) e quantas ficam ativas / em somente leitura no novo plano.
// No downgrade, a escolha inicial segue no `companySelection` do POST /me/billing/change-plan.
export async function GET() {
  try {
    const data = await apiFetchSecurity<unknown>(UPSTREAM);
    return NextResponse.json(data);
  } catch (error) {
    return problemResponse(error);
  }
}

// PUT /me/billing/downgrade-company-selection (T5.13): reedita a escolha {keepActive, readOnly,
// disable} de um downgrade agendado enquanto o ciclo nao fecha. Resposta `{ status: "SELECTION_SAVED" }`;
// erros do servidor (INVALID_COMPANY_SELECTION, COMPANY_SELECTION_NOT_REQUIRED) passam como problem+json.
export async function PUT(request: Request) {
  const body = await request.text();
  try {
    const data = await apiFetchSecurity<unknown>(UPSTREAM, {
      method: "PUT",
      body: body || "{}",
    });
    return NextResponse.json(data ?? { status: "SELECTION_SAVED" });
  } catch (error) {
    return problemResponse(error);
  }
}
