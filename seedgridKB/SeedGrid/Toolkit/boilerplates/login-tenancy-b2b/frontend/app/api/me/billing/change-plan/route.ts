import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `change_plan` -> POST /me/billing/change-plan (upgrade com rateio na hora,
// downgrade agendado para o fim do ciclo). Acao atomica com a selecao de usuarios.
export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await apiFetchSecurity<unknown>("/me/billing/change-plan", {
      method: "POST",
      body: body || "{}",
    });
    return NextResponse.json(data ?? { status: "OK" });
  } catch (error) {
    return problemResponse(error);
  }
}
