import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import { SecurityPaths } from "@/lib/security-paths";

// Ja existe empresa com este CNPJ/CPF? (P180.F2.T16) Repassa ao security (GET /companies/document-exists) e devolve so
// o booleano `{ exists }`. `excludePublicId` tira a propria empresa na edicao. Documento em branco = false (o backend decide).
export async function GET(request: Request) {
  const params = new URL(request.url).searchParams;
  const query = new URLSearchParams();
  query.set("document", params.get("document") ?? "");
  const exclude = params.get("excludePublicId");
  if (exclude) {
    query.set("excludePublicId", exclude);
  }
  try {
    const result = await apiFetchSecurity<{ exists?: boolean }>(
      `${SecurityPaths.companies.documentExists}?${query.toString()}`,
    );
    return NextResponse.json({ exists: result?.exists === true });
  } catch (error) {
    return problemResponse(error);
  }
}
