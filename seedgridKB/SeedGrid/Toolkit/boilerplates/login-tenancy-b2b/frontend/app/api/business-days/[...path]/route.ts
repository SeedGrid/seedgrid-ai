import { problemResponse } from "@/lib/core/problem-response";
import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Proxy server-side do calendario de dias uteis (`seedgrid-business-days`): repassa
// `/api/business-days/<caminho>` para `/business-days/<caminho>` do backend, com a sessao do usuario.
// A empresa corrente e as permissoes (BUSINESS_DAY_*) sao resolvidas pelo backend a partir do token —
// aqui nao ha regra de negocio, so' o repasse e o tratamento de falha de conexao.

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

async function forward(request: Request, context: RouteContext, method: "GET" | "POST" | "PUT" | "DELETE") {
  const { path } = await context.params;

  // `.` e `..` poderiam sair de `/business-days/` depois da normalizacao da URL.
  if (path.some((segment) => segment === "." || segment === "..")) {
    return Response.json({ title: "Caminho invalido", status: 400 }, { status: 400 });
  }

  const target = `/business-days/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`;

  try {
    const body = method === "POST" || method === "PUT" ? await request.text() : undefined;
    const response = await fetchWithAdminSession(target, { method, body });
    return passthroughResponse(response);
  } catch (error) {
    return problemResponse(error);
  }
}

export function GET(request: Request, context: RouteContext) {
  return forward(request, context, "GET");
}

export function POST(request: Request, context: RouteContext) {
  return forward(request, context, "POST");
}

export function PUT(request: Request, context: RouteContext) {
  return forward(request, context, "PUT");
}

export function DELETE(request: Request, context: RouteContext) {
  return forward(request, context, "DELETE");
}
