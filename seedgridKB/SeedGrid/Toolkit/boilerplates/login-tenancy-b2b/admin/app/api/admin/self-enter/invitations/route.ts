import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { CreateEntryInvitation, InvitationEntry } from "@/lib/self-enter";

export async function GET() {
  try {
    const invitations = await apiFetchSecurity<InvitationEntry[]>(
      "/self-enter/invitations",
    );
    return NextResponse.json(invitations);
  } catch (error) {
    return problemResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateEntryInvitation;
    // Regra deste deploy (default-role em branco / invite-only): perfil é obrigatório no convite.
    // Enforce server-side — a UI também valida, mas aqui não dá pra burlar pelo browser.
    if (!Array.isArray(body.roles) || body.roles.length === 0) {
      return NextResponse.json(
        {
          title: "Perfil obrigatorio",
          status: 422,
          detail: "Escolha ao menos um perfil para o convidado.",
        },
        { status: 422, headers: { "Content-Type": "application/problem+json" } },
      );
    }
    const created = await apiFetchSecurity<{ message: string; requestId: string }>(
      "/self-enter/invitations",
      {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      },
    );
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return problemResponse(error);
  }
}
