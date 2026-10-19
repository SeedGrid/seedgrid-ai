import { NextResponse } from "next/server";
import { SecurityPaths } from "@/lib/security-paths";

import { fetchWithAdminSession, passthroughResponse } from "@/lib/seedgrid-app-api-server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

// Avatar do usuario: o backend expoe GET (octet-stream) e POST (JSON base64)
// em /users/{publicId}/avatar. Nao usamos apiFetchServer aqui porque ele assume
// JSON; precisamos repassar os bytes da imagem como estao.
export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  const response = await fetchWithAdminSession(SecurityPaths.users.avatar(id), {
    method: "GET",
    headers: { Accept: "application/octet-stream" },
  });

  if (!response.ok) {
    return new NextResponse(null, { status: response.status });
  }

  const buffer = await response.arrayBuffer();
  const contentType =
    response.headers.get("Content-Type") ?? "application/octet-stream";

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;
  const body = await request.text();

  const response = await fetchWithAdminSession(SecurityPaths.users.avatar(id), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body,
  });

  return passthroughResponse(response);
}
