import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

// Proxy PUBLICO (sem auth): cria o pedido de cadastro publico (sem convite).
// POST {api}/public/self-enter/requests com { name, email, password, company? }. `company` e' o
// publicId do link (?company=) — com ele o pedido cai na conta cliente e so' os aprovadores dela o
// veem; sem ele, vai para a empresa da plataforma. Empresa invalida volta 422.
// A resposta traz `requestId` (usado na confirmacao do codigo) quando o pedido pode seguir.
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}${SecurityPaths.selfEnter.requests}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  const data = await response.json().catch(() => null);
  return NextResponse.json(data ?? {}, { status: response.status });
}
