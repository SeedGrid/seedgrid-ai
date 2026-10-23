// Constantes do desenho do metodo HTTP QUERY no front (ADR 28). Arquivo sem imports: e' lido pelo
// helper client (`query.ts`) e pelo proxy (`query-proxy.ts`).

/** Prefixo das consultas com corpo: `/api/q/<caminho-do-backend>` vira `<base da API>/<caminho-do-backend>`. */
export const QUERY_PROXY_PREFIX = "/api/q/";

/** Rota do BFF que renova a sessao (rotaciona o refresh token e regrava os cookies). */
export const QUERY_REFRESH_PATH = "/api/auth/refresh";
