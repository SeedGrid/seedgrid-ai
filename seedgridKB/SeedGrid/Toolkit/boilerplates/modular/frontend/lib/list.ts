/**
 * Normaliza uma resposta de lista para um array, tolerando os dois formatos que a API usa:
 * um array direto OU um PaginatedResult/*Page ({ items, totalRecords, ... }).
 *
 * Motivo: varios endpoints paginados devolvem { items } enquanto as telas esperavam um array
 * cru (`as X[]`). Sem normalizar, o SgDatatable e operacoes de array (reduce/filter/slice/find)
 * quebram com "value.filter is not a function" ao receberem o objeto-pagina.
 */
export function asList<T>(data: unknown): T[] {
  if (Array.isArray(data)) {
    return data as T[];
  }
  if (data && typeof data === "object") {
    const items = (data as { items?: unknown }).items;
    if (Array.isArray(items)) {
      return items as T[];
    }
  }
  return [];
}
