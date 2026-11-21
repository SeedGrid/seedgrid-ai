"use client";

import {
  SgButton,
  SgCard,
  SgCheckboxGroup,
  SgCombobox,
  SgRadioGroup,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { ArrowLeft, DatabaseBackup } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import {
  backupCompanyPayload,
  parseBackupCompanies,
  shouldShowBackupCompanySelector,
  type BackupCompany,
  type BackupCompanyMode,
} from "@/lib/backup-companies";
import type { BackupFormat, ExportJob, ExportScope } from "@/lib/seedgrid-app-api";

const FORMAT_OPTIONS: SgComboboxSource = [
  { id: "CSV_ZIP", label: "CSV (portabilidade)", value: "CSV_ZIP" },
  { id: "SQL_DUMP_ZIP", label: "SQL dump (restauracao tecnica)", value: "SQL_DUMP_ZIP" },
];

// CUSTOM fica para v2 (precisa de selecao de modulos).
const SCOPE_OPTIONS: SgComboboxSource = [
  { id: "DOMAIN", label: "Dados de negocio (recomendado)", value: "DOMAIN" },
  { id: "RAW", label: "Tabelas brutas (avancado)", value: "RAW" },
];

export default function ExportEditPage() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreate = hasPermission(ADMIN_PERMISSIONS.backupCreate);

  const [format, setFormat] = useState<BackupFormat>("CSV_ZIP");
  const [scope, setScope] = useState<ExportScope>("DOMAIN");
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [companies, setCompanies] = useState<BackupCompany[]>([]);
  const [companyMode, setCompanyMode] = useState<BackupCompanyMode>("ALL");
  const [selectedCompanies, setSelectedCompanies] = useState<string[]>([]);
  const showCompanies = shouldShowBackupCompanySelector(companies);
  const companyOptions = useMemo(
    () => companies.map((company) => ({ label: company.name, value: company.publicId })),
    [companies],
  );

  // Filiais do usuário (GET /me/companies). O seletor só existe com mais de uma (FE-38).
  useEffect(() => {
    if (accessLoading) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/me/companies", { cache: "no-store", signal: controller.signal });
        if (response.ok) setCompanies(parseBackupCompanies(await response.json()));
      } catch {
        // sem a lista, o pedido segue sem escolha (todas as filiais do usuário)
      }
    })();
    return () => controller.abort();
  }, [accessLoading]);

  async function handleCreate() {
    const companyPart = backupCompanyPayload(companyMode, selectedCompanies, companies);
    if ("error" in companyPart) {
      toast.error(companyPart.error);
      return;
    }
    setSubmitting(true);
    try {
      await adminProxyClient.post<ExportJob>("/api/admin/exports", {
        body: { format, scope, includeAttachments, ...companyPart },
      });
      router.push("/exports/export_list?saved=created");
    } catch (err) {
      toast.error(extractApiErrorMessage(err) ?? "Falha ao solicitar o export.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canCreate) {
    return (
      <Shell eyebrow="Plataforma" title="Novo export" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para criar exports." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Plataforma"
      title="Novo export"
      description="Solicite uma exportacao dos dados do tenant. O processamento e assincrono."
    >
      <SgCard cardStyle="outlined" title="Parametros do export" description="Formato, escopo e anexos.">
        <SgStack gap={16}>
          <SgCombobox
            id="export-format"
            label="Formato"
            source={FORMAT_OPTIONS}
            value={format}
            onValueChange={(value) => setFormat((value ? String(value) : "CSV_ZIP") as BackupFormat)}
          />
          <SgCombobox
            id="export-scope"
            label="Escopo"
            source={SCOPE_OPTIONS}
            value={scope}
            onValueChange={(value) => setScope((value ? String(value) : "DOMAIN") as ExportScope)}
          />
          {showCompanies ? (
            <SgStack gap={8}>
              <SgRadioGroup
                id="export-company-mode"
                title="Filiais"
                orientation="horizontal"
                source={[
                  { label: "Todas", value: "ALL" },
                  { label: "Escolher filiais", value: "SOME" },
                ]}
                value={companyMode}
                onChange={(value) => setCompanyMode(value === "SOME" ? "SOME" : "ALL")}
              />
              {companyMode === "SOME" ? (
                <SgCheckboxGroup
                  id="export-companies"
                  title="Filiais do export"
                  source={companyOptions}
                  value={selectedCompanies}
                  onChange={(value) => setSelectedCompanies(value.map(String))}
                />
              ) : null}
            </SgStack>
          ) : null}
          <SgToggleSwitch
            id="export-attachments"
            label="Incluir anexos (imagens/arquivos)"
            checked={includeAttachments}
            onChange={setIncludeAttachments}
          />
          <SgStack direction="row" gap={12} wrap>
            <SgButton
              appearance="outline"
              label="Voltar"
              leftIcon={<ArrowLeft size={16} />}
              onClick={() => router.push("/exports/export_list")}
              severity="secondary"
            />
            <SgButton
              appearance="solid"
              label={submitting ? "Solicitando..." : "Solicitar export"}
              leftIcon={<DatabaseBackup size={16} />}
              enabled={!submitting}
              onClick={() => handleCreate()}
              severity="primary"
            />
          </SgStack>
        </SgStack>
      </SgCard>
    </Shell>
  );
}
