import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type ChangePreviewUpstream = Record<string, unknown> & {
  seatSelection?: Record<string, unknown> | null;
};

// Comando Rust `get_change_preview` -> GET /me/billing/change-preview?planId=
// O seedgrid-billing devolve a escolha de "quem perde acesso" aninhada em `seatSelection` (so' no
// downgrade para um plano com menos vagas); a tela le esses campos no nivel de cima (ChangePreview).
export async function GET(request: Request) {
  const planId = new URL(request.url).searchParams.get("planId") ?? "";
  try {
    const data = await apiFetchSecurity<ChangePreviewUpstream>(
      `/me/billing/change-preview?planId=${encodeURIComponent(planId)}`,
    );
    const { seatSelection, ...preview } = data;
    return NextResponse.json(seatSelection ? { ...preview, ...seatSelection } : preview);
  } catch (error) {
    return problemResponse(error);
  }
}
