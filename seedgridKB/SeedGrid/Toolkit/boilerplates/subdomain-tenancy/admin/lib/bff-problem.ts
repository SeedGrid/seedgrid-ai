// Resposta de erro dos BFFs que chamam o backend por `apiFetchSecurity` (P192.F2.T1): o `ApiClientError` do backend segue
// como problem+json integro (ex.: 410 do download expirado, 409 do excluir); estouro de tempo vira 504 com texto
// legivel; falha de conexao, 502. `upstreamProblemResponse` sozinho perderia o corpo dos erros 4xx do backend, e
// `problemResponse` sozinho trataria o timeout como 502 generico.
import { NextResponse } from "next/server";

import { ApiClientError } from "@/lib/core";
import { problemResponse } from "@/lib/core/problem-response";
import { upstreamProblemResponse } from "@/lib/seedgrid-app-api-server";
import { REQUEST_TIMEOUT_CODE, UpstreamTimeoutError } from "@/lib/bff-timeout";

export function bffProblemResponse(error: unknown): NextResponse {
  if (error instanceof UpstreamTimeoutError) {
    return NextResponse.json(
      { status: 504, title: "Gateway Timeout", code: REQUEST_TIMEOUT_CODE, detail: error.message },
      { status: 504, headers: { "Content-Type": "application/problem+json" } },
    );
  }
  return error instanceof ApiClientError ? problemResponse(error) : upstreamProblemResponse(error);
}
