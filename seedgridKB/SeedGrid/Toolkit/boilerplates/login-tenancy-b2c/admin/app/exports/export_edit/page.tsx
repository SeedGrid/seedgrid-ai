"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { ArrowLeft, DatabaseBackup } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
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

  async function handleCreate() {
    setSubmitting(true);
    try {
      await adminProxyClient.post<ExportJob>("/api/admin/exports", {
        body: { format, scope, includeAttachments },
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
              disabled={submitting}
              onClick={() => void handleCreate()}
              severity="primary"
            />
          </SgStack>
        </SgStack>
      </SgCard>
    </Shell>
  );
}
