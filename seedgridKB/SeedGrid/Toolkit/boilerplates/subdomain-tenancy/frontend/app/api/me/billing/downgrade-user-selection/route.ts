import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

const UPSTREAM = "/me/billing/downgrade-user-selection";

// Comando Rust `get_downgrade_user_selection` -> GET /me/billing/downgrade-user-selection.
// Estado da escolha de "quem perde acesso" (elegiveis + selecao atual).
export async function GET() {
  try {
    const data = await apiFetchSecurity<unknown>(UPSTREAM);
    return NextResponse.json(data);
  } catch (error) {
    return problemResponse(error);
  }
}

// Comando Rust `save_downgrade_user_selection` -> PUT /me/billing/downgrade-user-selection.
// O corpo e' `{ userPublicIds }` — quem PERDE acesso. A tela guarda o inverso (quem fica ativo,
// framing aditivo) e inverte na hora de salvar; ver DowngradeUserSelectionDialog.
export async function PUT(request: Request) {
  const body = await request.text();
  try {
    const data = await apiFetchSecurity<unknown>(UPSTREAM, {
      method: "PUT",
      body: body || "{}",
    });
    return NextResponse.json(data ?? { status: "OK" });
  } catch (error) {
    return problemResponse(error);
  }
}
