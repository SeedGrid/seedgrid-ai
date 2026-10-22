import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { SelfEnterPublicLink } from "@/lib/self-enter";

// Link publico de cadastro (GET /self-enter/public-link, exige SELFENTER_INVITE ou
// SELFENTER_APPROVE).
//
// O formulario publico mora no APP DO CLIENTE (`frontend`, /auth/self-enter), nao aqui: o
// `seedgrid.security.frontend.base-url` e' um so' e aponta para ele. Por isso o origin deste admin
// NAO serve para montar o link. Se a env opcional `SEEDGRID_CLIENT_APP_BASE_URL` estiver definida
// (ex.: http://localhost:3000), ela vai junto como `clientAppBaseUrl`; sem ela, a tela mostra so' o
// caminho.
export async function GET() {
  try {
    const link = await apiFetchSecurity<SelfEnterPublicLink>(SecurityPaths.selfEnter.publicLink);
    const clientAppBaseUrl = process.env.SEEDGRID_CLIENT_APP_BASE_URL?.trim() || null;
    return NextResponse.json({ ...link, clientAppBaseUrl });
  } catch (error) {
    return problemResponse(error);
  }
}
