import { problemResponse } from "@/lib/core/problem-response";
import { fetchWithAdminSession } from "@/lib/seedgrid-app-api-server";

// BFF do sino de notificacoes (`SgNotificationBell`, default `apiUrl=/api/user-notifications`): repassa
// `/api/user-notifications[/<caminho>]` para `/user-notifications[/<caminho>]` da extension
// `seedgrid-user-notifications` (listar, /unread-count, /{id}/read, /read-all, excluir, limpar), com a
// sessao do usuario. O backend resolve usuario e conta pelo token; aqui nao ha regra de negocio, so' o
// repasse, o tratamento de falha de conexao e a ETag (If-None-Match -> 304 sem corpo, o sino reaproveita
// a pagina que ja tem).

type RouteContext = {
  params: Promise<{ path?: string[] }>;
};

const NULL_BODY_STATUSES = new Set([204, 205, 304]);

async function forward(request: Request, context: RouteContext, method: "GET" | "POST" | "DELETE") {
  const { path = [] } = await context.params;

  // `.` e `..` poderiam sair de `/user-notifications` depois da normalizacao da URL.
  if (path.some((segment) => segment === "." || segment === "..")) {
    return Response.json({ title: "Caminho invalido", status: 400 }, { status: 400 });
  }

  const suffix = path.map(encodeURIComponent).join("/");
  const target = `/user-notifications${suffix ? `/${suffix}` : ""}${new URL(request.url).search}`;

  const headers: Record<string, string> = {};
  const ifNoneMatch = request.headers.get("If-None-Match");
  if (ifNoneMatch) {
    headers["If-None-Match"] = ifNoneMatch;
  }

  try {
    const response = await fetchWithAdminSession(target, { method, headers });
    const out = new Headers();
    for (const name of ["ETag", "Cache-Control", "Vary"]) {
      const value = response.headers.get(name);
      if (value) out.set(name, value);
    }
    if (NULL_BODY_STATUSES.has(response.status)) {
      return new Response(null, { status: response.status, headers: out });
    }
    out.set("Content-Type", response.headers.get("Content-Type") ?? "application/json");
    return new Response(await response.text(), { status: response.status, headers: out });
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

export function DELETE(request: Request, context: RouteContext) {
  return forward(request, context, "DELETE");
}
