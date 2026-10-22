import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = new URLSearchParams();
  const currencyCode = searchParams.get("currencyCode");
  if (currencyCode) query.set("currencyCode", currencyCode);
  query.set("days", searchParams.get("days") ?? "30");

  const response = await fetchWithAdminSession(`/admin/currency-exchange-rates/series?${query}`, {
    cache: "no-store",
  });
  const text = await response.text();
  if (!response.ok) {
    // A primeira abertura de uma faixa longa importa a serie da fonte; se ISSO falhar, o log
    // separa "a fonte recusou" de "a tela pediu errado" — na tela os dois viram grafico vazio.
    console.error(`[currency-series] HTTP ${response.status} para ${query} — ${text.slice(0, 300)}`);
  }
  return passthroughResponse(response, text);
}
