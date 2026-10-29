import { problemResponse } from "@/lib/core/problem-response";
import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

// Proxy server-side da consulta de cidades (`seedgrid-cities`): repassa `/api/cities/<caminho>` para
// `/cities-api/<caminho>` do backend, com a sessao do usuario. A permissao (CITY_READ) e' resolvida pelo
// backend; aqui so' ha repasse (somente leitura: nao existe POST/PUT/DELETE) e o tratamento de falha.

type RouteContext = {
  params: Promise<{ path: string[] }>;
};

export async function GET(request: Request, context: RouteContext) {
  const { path } = await context.params;

  // `.` e `..` poderiam sair de `/cities-api/` depois da normalizacao da URL.
  if (path.some((segment) => segment === "." || segment === "..")) {
    return Response.json({ title: "Caminho invalido", status: 400 }, { status: 400 });
  }

  const target = `/cities-api/${path.map(encodeURIComponent).join("/")}${new URL(request.url).search}`;

  try {
    return passthroughResponse(await fetchWithAdminSession(target, { method: "GET" }));
  } catch (error) {
    return problemResponse(error);
  }
}
