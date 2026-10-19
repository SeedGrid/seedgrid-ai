import { NextResponse } from "next/server";

import { problemResponse } from "@/lib/core/problem-response";
import { apiFetchSecurity } from "@/lib/seedgrid-app-api-server";
import type { ExportCreateRequest, ExportJob } from "@/lib/seedgrid-app-api";

// Lista os jobs de export do tenant (ext seedgrid-backup: GET /exports?page=&size=). O backend
// devolve um array simples (sem total), entao pedimos um lote grande e paginamos no cliente.
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const page = params.get("page") ?? "0";
    const size = params.get("size") ?? "100";
    const jobs = await apiFetchSecurity<ExportJob[]>(
      `/exports?page=${encodeURIComponent(page)}&size=${encodeURIComponent(size)}`,
    );
    return NextResponse.json(jobs);
  } catch (error) {
    return problemResponse(error);
  }
}

// Cria um job de export assincrono (POST /exports).
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as ExportCreateRequest;
    const created = await apiFetchSecurity<ExportJob>("/exports", {
      method: "POST",
      body: JSON.stringify(body),
    });
    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    return problemResponse(error);
  }
}
