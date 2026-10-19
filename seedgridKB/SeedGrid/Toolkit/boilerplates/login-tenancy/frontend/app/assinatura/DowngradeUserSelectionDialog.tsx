"use client";

// PORTADO do `seedgrid-report-client`: src/views/subscription/DowngradeUserSelectionDialog.tsx
//
// A tela veio LITERAL — JSX, estado, validacao, mensagens e ordem das chamadas sao os mesmos.
// Trocou-se APENAS o transporte:
//   - `invoke("comando_rust")` -> `fetch` para `/api/me/**`, pelo `lib/ported/portedApi.ts`
//
// "use client" no topo porque no Next isto e' componente de cliente (o original ja' era).

import { useCallback, useEffect, useState } from "react";

import { SgButton, SgDialog } from "@seedgrid/fe-components";

import {
  getDowngradeUserSelection,
  saveDowngradeUserSelection,
} from "@/lib/ported/portedApi";
import { UserSelectionChecklist } from "@/components/ported/UserSelectionChecklist";
import type { DowngradeUserSelectionState } from "@/lib/ported/billingTypes";
import { Carregando } from "@/components/ported/Carregando";

interface DowngradeUserSelectionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /** Chamado apos salvar a selecao com sucesso (o pai atualiza a assinatura/mensagem). */
  readonly onSaved?: () => void;
  /**
   * Abriu logo apos o app detectar a ATIVACAO de uma assinatura (checkout, trial -> pago) num
   * plano com menos vagas do que os usuarios ativos hoje — caso em que nao da' pra pedir a
   * escolha ANTES de confirmar (o checkout roda no navegador, fora do app). Aqui a escolha e'
   * OBRIGATORIA: sem X, sem fechar clicando fora/ESC, sem botao "Fechar", ate' completar. False
   * (padrao) nos demais casos — reedicao de um downgrade ja agendado ("Editar selecao") ou do
   * banner de overage atual, onde ja existe uma escolha salva ou o cliente pode voltar depois.
   */
  readonly mandatory?: boolean;
}

/**
 * Escolha (ou REEDICAO) de quais usuarios ATIVOS perdem o acesso quando o limite de usuarios do
 * plano passa a valer — cobre o downgrade agendado entre planos pagos (escolha inicial feita
 * junto com a confirmacao da troca, ver SubscriptionPlansView.tsx) e a assinatura ativada
 * (checkout) direto num plano com menos vagas (ver MeBillingResource#getDowngradeUserSelection).
 */
export function DowngradeUserSelectionDialog({
  open,
  onOpenChange,
  onSaved,
  mandatory = false,
}: DowngradeUserSelectionDialogProps) {
  const [state, setState] = useState<DowngradeUserSelectionState | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // `selected` guarda quem FICA ativo (framing aditivo — mais intuitivo, e o admin ja aparece
  // marcado/travado). O backend guarda o inverso (quem perde acesso), entao inverte na carga e
  // ao salvar.
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getDowngradeUserSelection();
      setState(result);
      const eligibleIds = (result.eligibleUsers ?? []).map((u) => u.publicId);
      const deactivateIds = new Set(result.selectedUserPublicIds ?? []);
      setSelected(eligibleIds.filter((id) => !deactivateIds.has(id)));
    } catch (err) {
      setError(typeof err === "string" ? err : "Falha ao carregar a selecao de usuarios.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const eligibleCount = state?.eligibleUsers?.length ?? 0;
  // requiredCount aditivo = quantos NAO-root cabem no plano = elegiveis - quantos precisam sair
  // (requiredCount que o backend devolve, subtrativo).
  const requiredCount = Math.max(0, eligibleCount - (state?.requiredCount ?? 0));
  const countMatches = requiredCount === 0 || selected.length === requiredCount;
  // So' trava de verdade quando HA algo pendente de fato pra escolher (ou ainda nao sabemos —
  // trava durante o carregamento tambem, pra nao dar brecha de fechar antes de descobrir). Se
  // nao precisa de selecao (ou nem existe mais), nao ha motivo pra prender o usuario.
  const blocking = mandatory && (loading || state?.requiresUserSelection === true);

  async function handleSave() {
    if (!countMatches) return;
    setSaving(true);
    setError(null);
    try {
      const stayingSet = new Set(selected);
      const deactivateIds = (state?.eligibleUsers ?? [])
        .map((u) => u.publicId)
        .filter((id) => !stayingSet.has(id));
      await saveDowngradeUserSelection(deactivateIds);
      onOpenChange(false);
      onSaved?.();
    } catch (err) {
      setError(typeof err === "string" ? err : "Falha ao salvar a selecao.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <SgDialog
      open={open}
      onOpenChange={(next) => {
        // Bloqueado: ignora qualquer tentativa de fechar que nao seja o botao "Salvar selecao"
        // (X, clique fora, ESC) — nao ha como abandonar sem completar a escolha obrigatoria.
        if (blocking && !next) return;
        onOpenChange(next);
      }}
      size="md"
      closeable={!blocking}
      closeOnOverlayClick={!blocking}
      closeOnEsc={!blocking}
    >
      <div className="flex flex-col gap-4 p-1">
        <h3 className="text-base font-semibold text-sg-text">Escolher usuários ativos</h3>

        {mandatory && blocking ? (
          <p className="text-xs text-sg-muted">
            Sua assinatura foi ativada, mas o plano tem menos vagas do que os usuarios ativos hoje.
            Complete esta escolha antes de continuar — voce pode reeditar depois, a qualquer
            momento, antes do fim do ciclo.
          </p>
        ) : null}

        {loading ? (
          <Carregando className="justify-center py-8" />
        ) : state?.status === "NO_PENDING_CHANGE" ? (
          <p className="text-sm text-sg-muted">Nao ha nenhuma selecao pendente no momento.</p>
        ) : !state?.requiresUserSelection ? (
          <p className="text-sm text-sg-muted">
            Nao e' preciso selecionar ninguem: o plano atual comporta todos os usuarios ativos hoje.
          </p>
        ) : requiredCount === 0 ? (
          <p className="text-sm text-sg-muted">
            Este plano só permite que o administrador fique ativo. Os demais {eligibleCount}{" "}
            usuário(s) perderão o acesso ao fim do ciclo.
          </p>
        ) : (
          <>
            <p className="text-sm text-sg-muted">
              Este plano permite que você tenha{" "}
              <span className="font-medium text-sg-text">{state.maxUsers}</span> usuário(s)
              ativo(s). Selecione mais{" "}
              <span className="font-medium text-sg-text">{requiredCount}</span> usuário(s) para
              compor o seu plano. Você pode reeditar essa escolha a qualquer momento antes do fim
              do ciclo.
            </p>

            <UserSelectionChecklist
              id="downgrade-user-selection"
              users={state.eligibleUsers ?? []}
              lockedUsers={state.alwaysActiveUsers ?? []}
              requiredCount={requiredCount}
              selected={selected}
              onChange={setSelected}
              countLabel="Ficam ativos"
              mismatchMessage={`Selecione exatamente ${requiredCount} usuário(s) para salvar.`}
            />
          </>
        )}

        {error ? (
          <div className="rounded-sg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          {!blocking ? (
            <SgButton appearance="outline" severity="secondary" onClick={() => onOpenChange(false)}>
              Fechar
            </SgButton>
          ) : null}
          {state?.requiresUserSelection ? (
            <SgButton
              appearance="solid"
              severity="primary"
              loading={saving}
              disabled={!countMatches}
              onClick={() => void handleSave()}
            >
              Salvar selecao
            </SgButton>
          ) : null}
        </div>
      </div>
    </SgDialog>
  );
}
