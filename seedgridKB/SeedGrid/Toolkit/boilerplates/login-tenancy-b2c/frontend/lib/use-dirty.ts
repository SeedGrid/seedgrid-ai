"use client";

import { useEffect, useState } from "react";

/**
 * Salvar so habilita na edicao depois de alterar (P194.T2). `ready` vira true quando o formulario terminou de
 * carregar: o valor desse instante e' a base; `dirty` compara o valor atual com ela. Nao interfere no envio:
 * o SgButton continua cuidando do loading quando o onClick devolve a Promise (FE-46).
 */
export function useDirty(value: unknown, ready: boolean): boolean {
  const serialized = JSON.stringify(value);
  const [baseline, setBaseline] = useState<string | null>(null);
  useEffect(() => {
    if (ready && baseline === null) setBaseline(serialized);
    if (!ready && baseline !== null) setBaseline(null); // fechou/recarregando: a proxima abertura define a base de novo
  }, [ready, baseline, serialized]);
  return baseline !== null && baseline !== serialized;
}
