"use client";

import { SgButton, SgStack, toast } from "@seedgrid/fe-components";
import { Copy } from "lucide-react";

import { shortPublicId } from "@/lib/format";

async function copyPublicId(publicId: string) {
  try {
    await navigator.clipboard.writeText(publicId);
    toast.success("ID copiado.");
  } catch {
    toast.error("Nao foi possivel copiar o ID.");
  }
}

/**
 * Coluna ID padrao das tabelas de cadastro (FE-36): os 5 ULTIMOS caracteres do publicId (UUID v7: o
 * comeco e' timestamp e quase nao muda entre registros criados juntos), reticencias antes
 * (`…385e8`), tooltip com o valor inteiro e botao que copia o publicId COMPLETO. Nunca o id numerico.
 * `nowrap`: as reticencias, os 5 caracteres e o icone nao podem quebrar em duas linhas.
 */
export function PublicIdCell({ publicId }: Readonly<{ publicId: string }>) {
  return (
    <SgStack align="center" direction="row" gap={4} style={{ whiteSpace: "nowrap" }}>
      <span tabIndex={0} title={publicId} aria-label={`ID ${publicId}`}>
        {shortPublicId(publicId)}
      </span>
      <SgButton
        appearance="ghost"
        aria-label="Copiar ID"
        title="Copiar ID completo"
        iconOnly
        leftIcon={<Copy size={14} />}
        onClick={() => void copyPublicId(publicId)}
        severity="secondary"
      />
    </SgStack>
  );
}
