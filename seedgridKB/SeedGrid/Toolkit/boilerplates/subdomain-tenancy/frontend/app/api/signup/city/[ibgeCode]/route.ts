import { NextResponse } from "next/server";

import { apiBaseUrl } from "@/lib/seedgrid-app-api";
import { passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Consulta PUBLICA de cidade pelo codigo IBGE (TCI.13) -> GET /public/cities/by-ibge-code/{codigo} da extension cities
// (`seedgrid.cities.public-rest.enabled=true`). Rota PUBLICA (cadastro sem sessao), SO'-leitura e SO' por codigo: nao
// ha busca nem listagem por aqui, e o backend devolve apenas {id, name, uf, ibgeCode}. O backend nunca e' exposto ao
// navegador; o IP do visitante segue no X-Forwarded-For para o rate limit por IP dele funcionar atras deste BFF.
export async function GET(request: Request, context: { params: Promise<{ ibgeCode: string }> }) {
  const { ibgeCode } = await context.params;
  if (!/^\d{7}$/.test(ibgeCode)) {
    return NextResponse.json({ message: "Codigo IBGE invalido." }, { status: 400 });
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  const visitor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  if (visitor) {
    headers["X-Forwarded-For"] = visitor;
  }

  let response: Response;
  try {
    response = await fetch(`${apiBaseUrl}/public/cities/by-ibge-code/${ibgeCode}`, { headers, cache: "no-store" });
  } catch {
    return NextResponse.json(
      { message: "Nao foi possivel conectar ao servidor. Tente novamente." },
      { status: 503 },
    );
  }

  return passthroughResponse(response);
}
