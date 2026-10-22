"use client";

// Faixa de estado da empresa (T5.6, plano 4.12):
//  - "somente leitura - fazer upgrade" quando a empresa corrente esta em READ_ONLY;
//  - seletor de empresa (so' com mais de uma), marcando o estado de cada uma.
// Nao renderiza nada quando nao ha o que mostrar. Os botoes de escrita das telas somem sozinhos:
// `useAdminAccess().hasPermission` nega as permissoes de escrita em READ_ONLY.

import { SgButton, SgCombobox, toast } from "@seedgrid/fe-components";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { READ_ONLY_BANNER_TEXT } from "@/lib/company-access";
import { requestSelectCompany } from "@/lib/company-selection";
import {
  parseMyCompanies,
  shouldShowCompanySelector,
  toCompanyOptions,
  type MyCompany,
} from "@/lib/my-companies";

import { useAdminAccess } from "./AdminAccessProvider";

export function CompanyAccessBar() {
  const router = useRouter();
  const { me, readOnly, currentCompany, sessionExpired, refresh } = useAdminAccess();
  const [companies, setCompanies] = useState<MyCompany[]>([]);
  const [switching, setSwitching] = useState(false);
  const signedIn = me !== null && !sessionExpired;

  useEffect(() => {
    if (!signedIn) {
      setCompanies([]);
      return;
    }
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/me/companies", { cache: "no-store", signal: controller.signal });
        if (response.ok) {
          setCompanies(parseMyCompanies(await response.json()));
        }
      } catch {
        // Seletor e' conveniencia: sem a lista (API fora, backend sem o endpoint) a faixa segue.
      }
    })();
    return () => controller.abort();
    // O estado da empresa corrente muda apos refresh/relogin: a lista (que marca o estado de cada
    // empresa no seletor) acompanha.
  }, [signedIn, currentCompany?.publicId, currentCompany?.accessMode]);

  const options = useMemo(() => toCompanyOptions(companies), [companies]);
  const showSelector = shouldShowCompanySelector(companies);

  async function selectCompany(companyPublicId: string) {
    if (switching || !companyPublicId || companyPublicId === currentCompany?.publicId) {
      return;
    }
    setSwitching(true);
    try {
      const result = await requestSelectCompany(companyPublicId);
      if (result.ok) {
        // Token novo e estado da nova empresa: recarrega a tela e o `me`.
        refresh();
        router.refresh();
        window.location.reload();
        return;
      }
      if (result.sessionLost) {
        router.replace("/login?expired=1");
        return;
      }
      // Falha tratada (ex.: empresa desativada, COMPANY_DISABLED): a sessao e a empresa atual seguem.
      toast.error(result.message);
    } finally {
      setSwitching(false);
    }
  }

  if (!signedIn || (!readOnly && !showSelector)) {
    return null;
  }

  return (
    <div
      className={
        readOnly
          ? "flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
          : "flex flex-wrap items-center gap-3 border-b border-sg-border px-4 py-2 text-sm"
      }
      role={readOnly ? "status" : undefined}
    >
      {readOnly ? (
        <>
          <span className="font-medium">Somente leitura</span>
          <span className="flex-1">{READ_ONLY_BANNER_TEXT}</span>
        </>
      ) : null}
      {showSelector ? (
        <div className="min-w-[14rem]">
          <SgCombobox
            id="company-selector"
            label="Empresa"
            source={options}
            value={currentCompany?.publicId ?? null}
            onValueChange={(value) => void selectCompany(value ? String(value) : "")}
          />
        </div>
      ) : null}
    </div>
  );
}
