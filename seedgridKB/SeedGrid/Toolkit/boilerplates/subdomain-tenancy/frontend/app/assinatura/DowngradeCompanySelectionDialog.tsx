"use client";

// Escolha de quais EMPRESAS ficam ativas, ficam em somente leitura ou sao desligadas quando o limite
// de empresas do plano passa a valer (T5.5, plano 4.12). No molde do `DowngradeUserSelectionDialog`:
// mesmo Dialog, mesma carga por GET, mesmo botao so' habilitado com a escolha completa.
//
// Diferencas deliberadas:
//   - nao grava sozinho: devolve a escolha em `onConfirm` e quem chamou a manda junto no
//     `POST /me/billing/change-plan` (`companySelection`), como o downgrade e' uma acao atomica;
//   - tres destinos por empresa (manter ativa / somente leitura / desligar), nao um checklist;
//   - empresas PROTEGIDAS (a da plataforma e a do responsavel) aparecem travadas e fora da conta;
//   - so' confirma com as contagens EXATAS do plano (regra em `lib/downgrade-company-selection`).

import { useCallback, useEffect, useMemo, useState } from "react";

import { SgButton, SgDialog, SgRadioGroup } from "@seedgrid/fe-components";

import { Carregando } from "@/components/ported/Carregando";
import { extractProblemCode } from "@/lib/api-error";
import { companyOptionLabel } from "@/lib/company-access";
import { readError } from "@/lib/ported/clientError";
import {
  INVALID_COMPANY_SELECTION_CODE,
  choicesMatch,
  countChoices,
  initialChoices,
  mismatchMessage,
  requiredCounts,
  toCompanySelection,
  type CompanyChoice,
  type CompanyChoices,
  type CompanySelection,
  type DowngradeCompanySelectionState,
} from "@/lib/downgrade-company-selection";
import { getDowngradeCompanySelection } from "@/lib/ported/portedApi";

interface DowngradeCompanySelectionDialogProps {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  /**
   * Chamado com a escolha completa (empresas protegidas ja' em `keepActive`). Pode ser assincrono
   * (reedicao via PUT): o dialogo espera, so' fecha se der certo e mostra o erro se rejeitar.
   */
  readonly onConfirm: (selection: CompanySelection) => void | Promise<void>;
  /** Texto do botao de confirmar (padrao: "Confirmar escolha"; na reedicao: "Salvar escolha"). */
  readonly confirmLabel?: string;
  /**
   * Estado ja' conhecido (ex.: vindo da previa da troca de plano). Sem ele, o dialogo busca em
   * `GET /me/billing/downgrade-company-selection`.
   */
  readonly initialState?: DowngradeCompanySelectionState | null;
  /** Escolha anterior do usuario nesta mesma troca (reabrir o dialogo nao zera). */
  readonly previousSelection?: CompanySelection | null;
}

const CHOICE_OPTIONS = [
  { label: "Manter ativa", value: "KEEP_ACTIVE" },
  { label: "Somente leitura", value: "READ_ONLY" },
  { label: "Desligar", value: "DISABLE" },
];

const PROTECTED_HINT: Record<string, string> = {
  PLATFORM: "empresa da plataforma, sempre ativa",
  OWNER: "empresa do responsável, sempre ativa",
};

export function DowngradeCompanySelectionDialog({
  open,
  onOpenChange,
  onConfirm,
  initialState = null,
  previousSelection = null,
  confirmLabel = "Confirmar escolha",
}: DowngradeCompanySelectionDialogProps) {
  const [state, setState] = useState<DowngradeCompanySelectionState | null>(initialState);
  const [choices, setChoices] = useState<CompanyChoices>({});
  const [loading, setLoading] = useState(initialState == null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = initialState ?? (await getDowngradeCompanySelection());
      setState(result);
      setChoices(initialChoices(previousSelection ? { ...result, selection: previousSelection } : result));
    } catch (err) {
      setError(typeof err === "string" ? err : "Falha ao carregar a selecao de empresas.");
    } finally {
      setLoading(false);
    }
  }, [initialState, previousSelection]);

  useEffect(() => {
    if (open) void load();
  }, [open, load]);

  const need = useMemo(() => (state ? requiredCounts(state) : null), [state]);
  const have = useMemo(() => (state ? countChoices(state, choices) : null), [state, choices]);
  const matches = state ? choicesMatch(state, choices) : false;
  const message = state ? mismatchMessage(state, choices) : null;

  async function handleConfirm() {
    if (!state || saving) return;
    const selection = toCompanySelection(state, choices);
    if (!selection) return;
    setSaving(true);
    setError(null);
    try {
      await onConfirm(selection);
      onOpenChange(false);
    } catch (err) {
      setError(readError(err));
      // As empresas mudaram desde que o dialogo abriu: recarrega a lista e zera a escolha.
      if (initialState == null && extractProblemCode(err) === INVALID_COMPANY_SELECTION_CODE) {
        await load();
        setError(readError(err));
      }
    } finally {
      setSaving(false);
    }
  }

  const eligible = state?.eligibleCompanies ?? [];
  const protectedCompanies = state?.protectedCompanies ?? [];

  return (
    <SgDialog open={open} onOpenChange={onOpenChange} size="md">
      <div className="flex flex-col gap-4 p-1">
        <h3 className="text-base font-semibold text-sg-text">Escolher empresas</h3>

        {loading ? (
          <Carregando className="justify-center py-8" />
        ) : state?.status === "NO_PENDING_CHANGE" ? (
          <p className="text-sm text-sg-muted">Nao ha nenhuma selecao pendente no momento.</p>
        ) : !state?.requiresCompanySelection ? (
          <p className="text-sm text-sg-muted">
            Nao e&apos; preciso escolher nada: o plano atual comporta todas as empresas.
          </p>
        ) : (
          <>
            <p className="text-sm text-sg-muted">
              O novo plano comporta{" "}
              <span className="font-medium text-sg-text">
                {state.maxCompanies && state.maxCompanies > 0 ? state.maxCompanies : "qualquer número de"}
              </span>{" "}
              empresa(s) ativa(s)
              {state.maxReadOnlyCompanies && state.maxReadOnlyCompanies > 0 ? (
                <>
                  {" "}e <span className="font-medium text-sg-text">{state.maxReadOnlyCompanies}</span>{" "}
                  em somente leitura
                </>
              ) : null}
              . As demais são desligadas. Em somente leitura a empresa continua acessível para
              consulta, mas não aceita alterações. Você pode reeditar a escolha antes do fim do ciclo.
            </p>

            {protectedCompanies.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {protectedCompanies.map((c) => (
                  <li
                    key={c.publicId}
                    className="flex items-center justify-between rounded-sg border border-sg-border px-3 py-2 text-sm"
                  >
                    <span className="font-medium text-sg-text">{c.name}</span>
                    <span className="text-xs text-sg-muted">
                      {PROTECTED_HINT[c.reason ?? ""] ?? "sempre ativa"}
                    </span>
                  </li>
                ))}
              </ul>
            ) : null}

            <ul className="flex flex-col gap-2">
              {eligible.map((c) => (
                <li
                  key={c.publicId}
                  className="flex flex-col gap-1 rounded-sg border border-sg-border px-3 py-2"
                >
                  <span className="text-sm font-medium text-sg-text">
                    {companyOptionLabel(c.name, c.accessMode ?? "ACTIVE")}
                  </span>
                  <SgRadioGroup
                    id={`downgrade-company-${c.publicId}`}
                    orientation="horizontal"
                    source={CHOICE_OPTIONS}
                    value={choices[c.publicId] ?? undefined}
                    onChange={(value) =>
                      setChoices((current) => ({
                        ...current,
                        [c.publicId]: value == null ? null : (String(value) as CompanyChoice),
                      }))
                    }
                  />
                </li>
              ))}
            </ul>

            {need && have ? (
              <p className="text-xs text-sg-muted">
                Ficam ativas: {have.keepActive}/{need.keepActive}
                {need.readOnly !== null ? ` · Somente leitura: ${have.readOnly}/${need.readOnly}` : ""}
                {need.disable !== null
                  ? ` · Desligadas: ${have.disable}/${need.disable}`
                  : ` · Somente leitura ou desligadas: ${have.readOnly + have.disable}/${need.remaining}`}
              </p>
            ) : null}
            {message ? <p className="text-xs text-amber-700">{message}</p> : null}
          </>
        )}

        {error ? (
          <div className="rounded-sg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        <div className="flex justify-end gap-2 pt-2">
          <SgButton
            appearance="outline"
            severity="secondary"
            disabled={saving}
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </SgButton>
          {state?.requiresCompanySelection ? (
            <SgButton
              appearance="solid"
              severity="primary"
              disabled={!matches || saving}
              loading={saving}
              onClick={() => void handleConfirm()}
            >
              {confirmLabel}
            </SgButton>
          ) : null}
        </div>
      </div>
    </SgDialog>
  );
}
