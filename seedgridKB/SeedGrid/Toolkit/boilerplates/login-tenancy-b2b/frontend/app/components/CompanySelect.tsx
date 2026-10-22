"use client";

// Seletor de empresa do login (T7.2): o login devolveu `companySelectionRequired` (usuario com mais
// de uma empresa e nenhuma escolhida). Lista as empresas de `GET /api/me/companies`, trava as
// DESATIVADAS (com a explicacao), deixa escolher as ATIVAS e as SOMENTE LEITURA (estas com aviso) e
// chama `POST /api/me/select-company`, que re-emite o token escopado. Quem decide para onde ir depois
// e' a pagina (`onSelected`). A troca de empresa com a sessao aberta e' a `CompanyAccessBar`.

import { SgButton } from "@seedgrid/fe-components";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  DISABLED_COMPANY_HINT,
  READ_ONLY_COMPANY_HINT,
  accessModeBadge,
  canSelectCompany,
  defaultCompanySelection,
  personTypeLabel,
  requestSelectCompany,
  sortCompaniesForSelection,
} from "@/lib/company-selection";
import { parseMyCompanies, type MyCompany } from "@/lib/my-companies";

type Props = {
  /** Empresa escolhida e token re-emitido; `changePasswordRequired` decide o proximo passo do login. */
  onSelected: (result: { changePasswordRequired: boolean }) => void;
  /** "Voltar ao login". */
  onCancel: () => void;
  /** 401 ao listar/escolher: a sessao nao serve mais. */
  onSessionLost?: () => void;
};

const BADGE_CLASS = {
  success: "bg-emerald-50 text-emerald-800 border-emerald-200",
  warning: "bg-amber-50 text-amber-900 border-amber-300",
  error: "bg-red-50 text-red-800 border-red-200",
} as const;

const LOAD_ERROR = "Não foi possível carregar suas empresas. Tente novamente.";

export function CompanySelect({ onSelected, onCancel, onSessionLost }: Props) {
  const [companies, setCompanies] = useState<MyCompany[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (signal?: AbortSignal) => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/me/companies", { cache: "no-store", signal });
        if (response.status === 401) {
          onSessionLost?.();
          return;
        }
        if (!response.ok) {
          setError(LOAD_ERROR);
          return;
        }
        const list = sortCompaniesForSelection(parseMyCompanies(await response.json().catch(() => null)));
        setCompanies(list);
        setSelected(defaultCompanySelection(list));
        if (list.length === 0) {
          setError("Nenhuma empresa disponível para esta conta.");
        }
      } catch {
        if (!signal?.aborted) setError(LOAD_ERROR);
      } finally {
        if (!signal?.aborted) setLoading(false);
      }
    },
    [onSessionLost],
  );

  useEffect(() => {
    const controller = new AbortController();
    void load(controller.signal);
    return () => controller.abort();
  }, [load]);

  const selectedCompany = useMemo(
    () => companies.find((company) => company.publicId === selected) ?? null,
    [companies, selected],
  );
  const canConfirm = !loading && !busy && selectedCompany !== null && canSelectCompany(selectedCompany);

  async function confirm() {
    if (!selectedCompany || !canSelectCompany(selectedCompany)) return;
    setBusy(true);
    setError(null);
    const result = await requestSelectCompany(selectedCompany.publicId);
    if (result.ok) {
      onSelected({ changePasswordRequired: result.changePasswordRequired });
      return;
    }
    setBusy(false);
    if (result.sessionLost) {
      onSessionLost?.();
      return;
    }
    if (result.companyDisabled) {
      // Lista velha: a empresa foi desativada depois de carregada. Trava a opcao na tela.
      setCompanies((current) =>
        current.map((company) =>
          company.publicId === selectedCompany.publicId ? { ...company, accessMode: "DISABLED" } : company,
        ),
      );
      setSelected(null);
    }
    setError(result.message);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        Sua conta tem acesso a mais de uma empresa. Escolha com qual deseja entrar.
      </p>

      {loading ? (
        <p role="status" className="text-sm">
          Carregando empresas...
        </p>
      ) : null}

      {!loading && companies.length > 0 ? (
        <ul role="radiogroup" aria-label="Empresas" className="flex flex-col gap-2">
          {companies.map((company) => {
            const selectable = canSelectCompany(company);
            const badge = accessModeBadge(company.accessMode);
            const type = personTypeLabel(company.personType);
            const hintId = `company-hint-${company.publicId}`;
            const hint =
              company.accessMode === "DISABLED"
                ? DISABLED_COMPANY_HINT
                : company.accessMode === "READ_ONLY"
                  ? READ_ONLY_COMPANY_HINT
                  : null;
            return (
              <li key={company.publicId}>
                <label
                  className={`flex items-start gap-3 rounded-md border border-sg-border px-3 py-2 ${
                    selectable ? "cursor-pointer" : "cursor-not-allowed opacity-60"
                  } ${selected === company.publicId ? "ring-2 ring-sg-primary-500" : ""}`}
                >
                  <input
                    type="radio"
                    name="company"
                    className="mt-1"
                    value={company.publicId}
                    checked={selected === company.publicId}
                    disabled={!selectable || busy}
                    aria-describedby={hint ? hintId : undefined}
                    onChange={() => setSelected(company.publicId)}
                  />
                  <span className="flex min-w-0 flex-1 flex-col gap-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{company.name}</span>
                      {type ? <span className="text-xs text-muted-foreground">{type}</span> : null}
                      {company.accessMode !== "ACTIVE" ? (
                        <span className={`rounded-full border px-2 py-0.5 text-xs ${BADGE_CLASS[badge.tone]}`}>
                          {badge.label}
                        </span>
                      ) : null}
                    </span>
                    {hint ? (
                      <span id={hintId} className="text-xs text-muted-foreground">
                        {hint}
                      </span>
                    ) : null}
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      ) : null}

      {error ? (
        <div className="login-error" role="alert">
          {error}
        </div>
      ) : null}

      <SgButton label={busy ? "Entrando..." : "Entrar"} disabled={!canConfirm} onClick={() => void confirm()} />
      {!loading && companies.length === 0 && error ? (
        <SgButton
          appearance="ghost"
          label="Tentar novamente"
          severity="secondary"
          type="button"
          onClick={() => void load()}
        />
      ) : null}
      <SgButton
        appearance="ghost"
        label="Voltar para o login"
        severity="secondary"
        type="button"
        disabled={busy}
        onClick={onCancel}
      />
    </div>
  );
}
