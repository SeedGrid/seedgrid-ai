import { NextResponse } from "next/server";

import { apiFetchServer } from "@/lib/seedgrid-app-api-server";
import type { ExchangeRate } from "@/lib/seedgrid-app-api";

// Cotacao USD-BRL persistida pelo report-api (ExchangeRateScheduler busca 1x/dia na AwesomeAPI
// e guarda no banco — ver /admin/exchange-rate). Antes este route batia direto na AwesomeAPI a
// cada carga (com cache de 1h); agora so' repassa o valor ja centralizado no backend, que serve
// qualquer tela (Lucro por cliente, Templates de relatorio) sem cada uma buscar por conta propria.
export async function GET() {
  try {
    const rate = await apiFetchServer<ExchangeRate>("/admin/exchange-rate");
    return NextResponse.json(rate);
  } catch {
    return NextResponse.json({ rate: null, source: "AwesomeAPI" } satisfies ExchangeRate);
  }
}
