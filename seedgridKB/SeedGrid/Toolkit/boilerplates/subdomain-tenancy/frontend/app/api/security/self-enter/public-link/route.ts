import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { SelfEnterPublicLink } from "@/lib/self-enter";

// Se o cadastro publico (sem convite) esta ligado e qual empresa o link precisa identificar
// (GET /self-enter/public-link, exige SELFENTER_INVITE ou SELFENTER_APPROVE). No tenant por
// subdominio `companyPublicId` vem nulo: o proprio subdominio ja' identifica a empresa.
export async function GET() {
  try {
    const link = await apiFetchSecurity<SelfEnterPublicLink>("/self-enter/public-link");
    return NextResponse.json(link);
  } catch (error) {
    return problemResponse(error);
  }
}
