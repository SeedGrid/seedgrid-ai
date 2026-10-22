import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { SecurityPaths } from "@/lib/security-paths";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { SelfEnterPublicLink } from "@/lib/self-enter";

// Link publico de cadastro (GET /self-enter/public-link, exige SELFENTER_INVITE ou
// SELFENTER_APPROVE): se o cadastro publico esta ligado e o publicId da empresa corrente que o link
// precisa levar (?company=). A URL em si e' montada no browser, com o origin deste app.
export async function GET() {
  try {
    const link = await apiFetchSecurity<SelfEnterPublicLink>(SecurityPaths.selfEnter.publicLink);
    return NextResponse.json(link);
  } catch (error) {
    return problemResponse(error);
  }
}
