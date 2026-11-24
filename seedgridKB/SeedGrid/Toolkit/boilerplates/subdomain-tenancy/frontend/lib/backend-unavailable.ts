import { NextResponse } from "next/server";

import { TenantHostError } from "./tenant-host";

/**
 * Resposta do BFF quando a chamada ao backend nem saiu: host de acesso invalido e' 400 com mensagem clara
 * (antes tudo virava 503 "Nao foi possivel conectar", e um dominio com hifen parecia servidor fora do ar);
 * o resto continua 503.
 */
export function backendUnavailableResponse(error: unknown): NextResponse {
  if (error instanceof TenantHostError) {
    return NextResponse.json({ message: "Domínio de acesso inválido. Confira o endereço da sua empresa." }, { status: 400 });
  }
  return NextResponse.json({ message: "Nao foi possivel conectar ao servidor. Tente novamente." }, { status: 503 });
}
