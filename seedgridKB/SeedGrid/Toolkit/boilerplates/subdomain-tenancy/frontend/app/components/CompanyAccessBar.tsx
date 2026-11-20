"use client";

// Faixa de estado da empresa (T5.6, plano 4.12): "somente leitura - fazer upgrade" quando a empresa
// corrente esta em READ_ONLY. Nao renderiza nada quando nao ha o que mostrar. Os botoes de escrita das
// telas somem sozinhos: `useAdminAccess().hasPermission` nega as permissoes de escrita em READ_ONLY.
// A troca de empresa saiu daqui (P180.F2.T7, decisao do dono)
// (nao ha troca de empresa pela faixa: o select vem no proprio fluxo).

import { SgButton } from "@seedgrid/fe-components";
import { useRouter } from "next/navigation";

import { READ_ONLY_BANNER_TEXT } from "@/lib/company-access";

import { useAdminAccess } from "./AdminAccessProvider";

export function CompanyAccessBar() {
  const router = useRouter();
  const { me, readOnly, sessionExpired } = useAdminAccess();

  if (me === null || sessionExpired || !readOnly) {
    return null;
  }

  return (
    <div
      className="flex flex-wrap items-center gap-3 border-b border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900"
      role="status"
    >
      <span className="font-medium">Somente leitura</span>
      <span className="flex-1">{READ_ONLY_BANNER_TEXT}</span>
      <SgButton appearance="solid" severity="primary" size="sm" onClick={() => router.push("/assinatura")}>
        Fazer upgrade
      </SgButton>
    </div>
  );
}
