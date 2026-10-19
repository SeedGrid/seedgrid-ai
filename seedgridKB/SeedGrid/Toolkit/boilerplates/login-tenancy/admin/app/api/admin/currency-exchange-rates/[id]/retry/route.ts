import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, context: RouteContext) {
  const { id } = await context.params;
  const startedAt = Date.now();
  const response = await fetchWithAdminSession(`/admin/currency-exchange-rates/${id}/retry`, {
    method: "POST",
  });
  const text = await response.text();

  // O retry e' o botao que alguem clica JUSTAMENTE porque a busca automatica ja falhou — quando ele
  // tambem falha, o admin so' mostra o toast e a mensagem se perde. Logar aqui separa "a API
  // recusou" de "a API respondeu que a FONTE recusou" (429 da AwesomeAPI), que na tela viram o
  // mesmo toast vermelho e mandam investigar o lado errado.
  const elapsedMs = Date.now() - startedAt;
  if (!response.ok) {
    console.error(
      `[currency-retry] cotacao ${id}: report-api devolveu HTTP ${response.status} em ${elapsedMs}ms — ${text.slice(0, 500)}`,
    );
  } else {
    console.info(`[currency-retry] cotacao ${id}: refeita com sucesso em ${elapsedMs}ms.`);
  }

  return passthroughResponse(response, text);
}
