"use client";

import { toast } from "@seedgrid/fe-components";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * Mostra o toast de "salvou" que a tela de cadastro pediu via `?saved=created|updated`, UMA vez.
 *
 * Cada lista fazia isso na mao com `useEffect(..., [searchParams])`, e o toast saia duplicado:
 * `searchParams` e um objeto NOVO a cada render, entao o `router.refresh()` que o formulario
 * dispara logo depois do `router.push` ja bastava pra reexecutar o efeito (em dev, o StrictMode
 * remonta os efeitos e duplica de novo). Aqui a dependencia e o VALOR do parametro, um ref garante
 * "so uma vez por valor" mesmo com remontagem, e a URL e limpa em seguida — sem isso, um F5 na
 * lista repetiria a mensagem de uma acao que aconteceu ha meia hora.
 *
 * @param messagesBySavedValue mensagem por valor de `saved` (ex.: `{ created: "Plano criado." }`).
 */
export function useSavedToast(messagesBySavedValue: Readonly<Record<string, string>>): void {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const saved = searchParams.get("saved");

  const shownForRef = useRef<string | null>(null);
  // O chamador passa um objeto literal (identidade nova a cada render); ler por ref mantem o
  // efeito preso so ao valor de `saved`.
  const messagesRef = useRef(messagesBySavedValue);
  messagesRef.current = messagesBySavedValue;

  useEffect(() => {
    if (!saved || shownForRef.current === saved) {
      return;
    }
    shownForRef.current = saved;

    const message = messagesRef.current[saved];
    if (message) {
      toast.success(message);
    }
    // `scroll: false`: a lista fica onde estava; isso e limpeza de URL, nao navegacao.
    router.replace(pathname, { scroll: false });
  }, [saved, pathname, router]);
}
