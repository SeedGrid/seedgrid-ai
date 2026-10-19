import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// GET /me/usage (seedgrid-billing): saldo de cada contador de uso no ciclo e, por contador, se 1 unidade
// passaria agora (com o mesmo `code` do 402 que o consumo daria).
export async function GET() {
  try {
    const data = await apiFetchSecurity<unknown>("/me/usage");
    return NextResponse.json(data);
  } catch (error) {
    return problemResponse(error);
  }
}
