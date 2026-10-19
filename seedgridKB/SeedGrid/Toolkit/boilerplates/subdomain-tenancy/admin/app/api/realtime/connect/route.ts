import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";

type RealtimeConnectResponse = {
  enabled: boolean;
  token?: string;
  expiresAt?: number;
  connectUrl?: string;
  channels?: string[];
};

// Token de conexao do SeedGrid Pulse para o usuario DA SESSAO (ext seedgrid-realtime:
// POST /realtime/connect). Quem chama e o SgRealtimeProvider do layout; o token so serve para
// conectar no Pulse e fica em memoria no navegador. A chave do projeto nunca sai do backend.
export async function POST() {
  try {
    const token = await apiFetchSecurity<RealtimeConnectResponse>("/realtime/connect", { method: "POST" });
    return NextResponse.json(token);
  } catch (error) {
    return problemResponse(error);
  }
}
