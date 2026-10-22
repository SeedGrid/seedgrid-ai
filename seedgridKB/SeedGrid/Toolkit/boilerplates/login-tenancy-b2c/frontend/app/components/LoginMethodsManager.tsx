"use client";

import { SgButton, SgSkeleton, SgStack, toast } from "@seedgrid/fe-components";
import { Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  parseIdentities,
  providerLabel,
  removeIdentityMessage,
  type LoginIdentity,
} from "../auth/socialLogin";

/**
 * Metodos de entrada da propria conta (Google, Facebook...): lista (`GET /api/me/identities`) e desvincula
 * (`DELETE /api/me/identities/{publicId}`). O backend recusa o ultimo metodo com 409 `LAST_LOGIN_METHOD`.
 * Sem o Shell: e' embutido na tela "Meu perfil". Sem identidade vinculada, mostra so' o texto de ajuda.
 */
export function LoginMethodsManager() {
  const [identities, setIdentities] = useState<LoginIdentity[] | null>(null);
  const [removing, setRemoving] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/me/identities", { cache: "no-store" });
      setIdentities(response.ok ? parseIdentities(await response.json().catch(() => null)) : []);
    } catch {
      setIdentities([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function remove(identity: LoginIdentity) {
    setRemoving(identity.publicId);
    try {
      const response = await fetch(`/api/me/identities/${encodeURIComponent(identity.publicId)}`, { method: "DELETE" });
      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as
          | { code?: string; detail?: string; title?: string; message?: string }
          | null;
        toast.error(
          removeIdentityMessage(
            payload?.code,
            payload?.detail ?? payload?.message ?? payload?.title ?? "Falha ao remover o método de entrada.",
          ),
        );
        return;
      }
      toast.success(`${providerLabel(identity.provider)} desvinculado.`);
      await load();
    } catch {
      toast.error("Nao foi possivel conectar ao servidor. Tente novamente.");
    } finally {
      setRemoving(null);
    }
  }

  if (identities === null) {
    return <SgSkeleton />;
  }

  if (identities.length === 0) {
    return <p className="text-sm text-sg-muted">Nenhum login social vinculado. Você entra com e-mail e senha.</p>;
  }

  return (
    <SgStack gap={8}>
      {identities.map((identity) => (
        <div
          key={identity.publicId}
          className="flex items-center justify-between gap-3 rounded-sg border border-sg-border p-3"
        >
          <div className="min-w-0">
            <div className="font-medium text-sg-text">{providerLabel(identity.provider)}</div>
            <div className="truncate text-sm text-sg-muted">
              {identity.displayName ?? identity.email ?? "Conta vinculada"}
            </div>
          </div>
          <SgButton
            appearance="ghost"
            severity="danger"
            type="button"
            iconOnly
            aria-label={`Desvincular ${providerLabel(identity.provider)}`}
            title={`Desvincular ${providerLabel(identity.provider)}`}
            leftIcon={<Trash2 size={16} />}
            disabled={removing === identity.publicId}
            onClick={() => void remove(identity)}
          />
        </div>
      ))}
    </SgStack>
  );
}
