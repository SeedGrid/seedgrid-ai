// seedgrid:managed

// Converte o erro lançado por um `createApiClient` (server-side) na resposta que o
// route handler do Next devolve ao client. Quando é um `ApiClientError`, repassa o
// `responseBody` (o problem+json original do report-api) com o `status` upstream,
// como `application/problem+json` — assim o `extractApiErrorMessage` do lado client
// recupera a mensagem íntegra (detail/violations), sem virar 500/texto genérico.

import { NextResponse } from "next/server";

import { ApiClientError } from "@seedgrid/fe-core";

/**
 * Resposta de erro a partir de um erro de chamada à API.
 *
 * - `ApiClientError`: serializa `responseBody`. Se o corpo já for objeto/array,
 *   manda como `problem+json`; se for string, repassa como veio (já é o corpo cru
 *   do upstream); ausente -> objeto `{ status }` mínimo.
 * - Qualquer outro erro (ex.: falha de rede/conexão): 502 com `detail` legível.
 */
export function problemResponse(error: unknown): NextResponse {
  if (error instanceof ApiClientError) {
    const { responseBody, status } = error;

    if (typeof responseBody === "string") {
      return new NextResponse(responseBody, {
        status,
        headers: { "Content-Type": "application/problem+json" },
      });
    }

    if (responseBody != null) {
      return NextResponse.json(responseBody, {
        status,
        headers: { "Content-Type": "application/problem+json" },
      });
    }

    return NextResponse.json(
      { status, title: error.message },
      { status, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  const detail =
    error instanceof Error
      ? error.message
      : "Nao foi possivel conectar a API administrativa.";

  return NextResponse.json(
    { status: 502, title: "Bad Gateway", detail },
    { status: 502, headers: { "Content-Type": "application/problem+json" } },
  );
}
