import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

// Comando Rust `start_checkout` -> POST /me/billing/checkout.
// `userPublicIdsToDeactivate` vai no MESMO POST da assinatura: o servidor valida antes de
// criar a sessao no provedor, entao assinar e escolher quem perde acesso sao uma acao so.
export async function POST(request: Request) {
  const body = await request.text();
  try {
    const data = await apiFetchSecurity<unknown>("/me/billing/checkout", {
      method: "POST",
      body: body || "{}",
    });
    return NextResponse.json(data ?? { status: "OK" });
  } catch (error) {
    return problemResponse(error);
  }
}
