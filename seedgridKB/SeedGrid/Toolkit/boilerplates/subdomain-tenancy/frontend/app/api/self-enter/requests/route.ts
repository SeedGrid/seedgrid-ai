import { backendFetch } from "@/lib/backend-fetch";
import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";

// Proxy PUBLICO (sem auth): cadastro pelo link publico (sem convite). O pedido vai para a empresa
// do tenant (subdominio, repassado pelo backendFetch) e fica aguardando confirmacao do e-mail e
// depois aprovacao. `company` e' opcional: no modelo por subdominio o banco do tenant tem uma
// empresa so', mas repassamos o `?company=` do link por paridade com o login-tenancy.
// POST {api}/public/self-enter/requests
export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    name?: string;
    email?: string;
    password?: string;
    company?: string | null;
  };

  let response: Response;
  try {
    response = await backendFetch(`${apiBaseUrl}${SecurityPaths.selfEnter.requests}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: body.name,
        email: body.email,
        password: body.password,
        ...(body.company ? { company: body.company } : {}),
      }),
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
