import { NextResponse } from "next/server";

/**
 * Comando Rust `lookup_cnpj` (comandos/auth.rs) -> GET https://publica.cnpj.ws/cnpj/{cnpj}
 *
 * Nao passa pela nossa API: e' consulta publica a Receita, feita no SERVIDOR pelo mesmo motivo que
 * o report-client a fazia no Rust — o browser nao pode chama-la direto (CORS).
 *
 * As tres regras abaixo vieram literais do Rust, e cada uma tem uma cicatriz:
 *
 *  1. CNPJ ALFANUMERICO (Receita Federal, 2026): 12 caracteres alfanumericos + 2 digitos.
 *     Filtrar so' digitos descartava as letras, nunca batia 14, a consulta sempre voltava null e
 *     o SgInputCNPJ tratava isso como "CNPJ invalido".
 *  2. 404 = o CNPJ realmente nao existe. Devolver null faz o componente reprovar o campo — que
 *     aqui e' o certo.
 *  3. QUALQUER OUTRA falha (429 do rate limit da publica.cnpj.ws, 5xx, instabilidade) NAO e'
 *     "CNPJ invalido", e' "nao consegui conferir". A API publica permite 3 consultas por minuto:
 *     bastava testar tres vezes seguidas para todo CNPJ virar invalido e travar o cadastro de uma
 *     empresa correta. Propagar o erro faz a tela cair no `onPublicaCnpjError`, que avisa sem
 *     bloquear.
 */
export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("cnpj") ?? "";
  const cnpj = raw
    .split("")
    .filter((c) => /[0-9a-zA-Z]/.test(c))
    .map((c) => c.toUpperCase())
    .join("");

  if (cnpj.length !== 14) {
    return NextResponse.json(null);
  }

  let response: Response;
  try {
    response = await fetch(`https://publica.cnpj.ws/cnpj/${cnpj}`, { cache: "no-store" });
  } catch {
    return NextResponse.json(
      { detail: "Nao foi possivel consultar o CNPJ na Receita." },
      { status: 502, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  if (response.status === 404) {
    return NextResponse.json(null);
  }

  if (!response.ok) {
    return NextResponse.json(
      { detail: `Nao foi possivel consultar o CNPJ na Receita (HTTP ${response.status}).` },
      { status: 502, headers: { "Content-Type": "application/problem+json" } },
    );
  }

  return NextResponse.json((await response.json()) as unknown);
}
