"use client";

import {
  SgButton,
  SgCard,
  SgConfirmationDialog,
  SgDatatable,
  SgDialog,
  SgInputText,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { extractErrorMessage } from "@/lib/api-error";
import type { CurrencyDetail } from "@/lib/seedgrid-app-api";

const EMPTY_CURRENCY_FORM = {
  code: "",
  name: "",
  sourceUrl: "",
  fetchCron: "0 0 7 * * ?",
  timeZone: "America/Sao_Paulo",
  retryOffsetsHours: "4,5,3",
  rateJsonPath: "",
  quotedAtJsonPath: "",
  active: true,
};

export default function CurrenciesPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.currencyView);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.currencyCreate);
  const canUpdate = hasPermission(ADMIN_PERMISSIONS.currencyUpdate);
  const canDelete = hasPermission(ADMIN_PERMISSIONS.currencyDelete);

  const [currencies, setCurrencies] = useState<CurrencyDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_CURRENCY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<CurrencyDetail | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadCurrencies() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/currencies", { cache: "no-store" });
      setCurrencies((await response.json()) as CurrencyDetail[]);
    } catch {
      toast.error("Falha ao carregar moedas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessLoading || !canView) return;
    void loadCurrencies();
  }, [accessLoading, canView]);

  function openNew() {
    setEditingId(null);
    setForm(EMPTY_CURRENCY_FORM);
    setDialogOpen(true);
  }

  function openEdit(currency: CurrencyDetail) {
    setEditingId(currency.id);
    setForm({
      code: currency.code,
      name: currency.name,
      sourceUrl: currency.sourceUrl,
      fetchCron: currency.fetchCron,
      timeZone: currency.timeZone,
      retryOffsetsHours: currency.retryOffsetsHours ?? "",
      rateJsonPath: currency.rateJsonPath ?? "",
      quotedAtJsonPath: currency.quotedAtJsonPath ?? "",
      active: currency.active,
    });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.code.trim() || !form.name.trim() || !form.sourceUrl.trim() || !form.fetchCron.trim()) {
      toast.error("Preencha codigo, nome, URL e cron.");
      return;
    }
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/currencies/${editingId}` : "/api/admin/currencies";
      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!response.ok) {
        toast.error(await extractErrorMessage(response, "Falha ao salvar."));
        return;
      }
      toast.success(editingId ? "Moeda atualizada." : "Moeda cadastrada.");
      setDialogOpen(false);
      await loadCurrencies();
    } catch {
      toast.error("Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/currencies/${toDelete.id}`, { method: "DELETE" });
      if (!response.ok) {
        toast.error(await extractErrorMessage(response, "Falha ao excluir."));
        return;
      }
      toast.success("Moeda excluida.");
      await loadCurrencies();
    } catch {
      toast.error("Falha ao excluir.");
    } finally {
      setDeleting(false);
      setToDelete(null);
    }
  }

  const columns: SgDatatableColumn<CurrencyDetail>[] = [
    { field: "code", header: "Codigo", sortable: true },
    { field: "name", header: "Nome", sortable: true },
    { field: "sourceUrl", header: "URL de origem" },
    { field: "fetchCron", header: "Cron" },
    { field: "retryOffsetsHours", header: "Retry (h)" },
    { field: "timeZone", header: "Fuso" },
    {
      field: "active",
      header: "Status",
      body: (row) => <StatusBadge severity={row.active ? "success" : "secondary"} value={row.active ? "ATIVA" : "INATIVA"} />,
    },
    {
      columnId: "actions",
      header: "Acoes",
      reorderable: false,
      hideable: false,
      body: (row) =>
        canUpdate || canDelete ? (
          <SgStack direction="row" gap={4}>
            {canUpdate ? (
              <SgButton
                appearance="ghost"
                aria-label={`Editar ${row.code}`}
                title="Editar"
                iconOnly
                leftIcon={<Edit3 size={16} />}
                onClick={() => openEdit(row)}
                severity="secondary"
              />
            ) : null}
            {canDelete ? (
              <SgButton
                appearance="ghost"
                aria-label={`Excluir ${row.code}`}
                title="Excluir"
                iconOnly
                leftIcon={<Trash2 size={16} />}
                onClick={() => setToDelete(row)}
                severity="danger"
              />
            ) : null}
          </SgStack>
        ) : null,
    },
  ];

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Configuracao" title="Moedas" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para visualizar moedas." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Configuracao"
      title="Moedas"
      description="Config do robo de cotacao por moeda — adicionar uma nova aqui ja agenda o job na hora, sem precisar reiniciar a app."
    >
      <SgCard cardStyle="outlined" title="Moedas cadastradas">
        <SgStack gap={16}>
          {canCreate ? (
            <div>
              <SgButton appearance="outline" label="Nova moeda" leftIcon={<Plus size={16} />} onClick={openNew} severity="secondary" />
            </div>
          ) : null}
          {loading ? null : (
            <SgDatatable
              columns={columns}
              dataKey="id"
              emptyMessage="Nenhuma moeda cadastrada."
              id="currencies-table"
              showGridlines
              stripedRows
              value={currencies}
            />
          )}
        </SgStack>
      </SgCard>

      <SgDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        size="md"
        title={editingId ? `Editar moeda — ${form.code}` : "Nova moeda"}
      >
        <SgStack gap={12}>
          <SgInputText
            id="currency-code"
            label="Codigo"
            hintText="Ex.: USD-BRL — usado como chave, nao pode repetir."
            inputProps={{ value: form.code }}
            onChange={(value) => setForm((current) => ({ ...current, code: value }))}
          />
          <SgInputText
            id="currency-name"
            label="Nome"
            inputProps={{ value: form.name }}
            onChange={(value) => setForm((current) => ({ ...current, name: value }))}
          />
          <SgInputText
            id="currency-source-url"
            label="URL de origem"
            hintText='Endpoint JSON da cotacao. Aceita marcadores de data: "{date:MM-dd-yyyy}" (hoje) e "{date-10d:MM-dd-yyyy}" (10 dias atras), resolvidos no fuso da moeda — o PTAX precisa disso porque leva o intervalo na URL.'
            inputProps={{ value: form.sourceUrl }}
            onChange={(value) => setForm((current) => ({ ...current, sourceUrl: value }))}
          />
          <SgInputText
            id="currency-cron"
            label="Cron (Quartz)"
            hintText='Ex.: "0 0 7 * * ?" = todo dia as 7h.'
            inputProps={{ value: form.fetchCron }}
            onChange={(value) => setForm((current) => ({ ...current, fetchCron: value }))}
          />
          <SgInputText
            id="currency-timezone"
            label="Fuso horario"
            inputProps={{ value: form.timeZone }}
            onChange={(value) => setForm((current) => ({ ...current, timeZone: value }))}
          />
          <SgInputText
            id="currency-rate-path"
            label="Caminho do valor no JSON"
            hintText='Onde esta a cotacao na resposta. Ex.: "value[0].cotacaoVenda" (PTAX). Vazio = formato AwesomeAPI (bid).'
            inputProps={{ value: form.rateJsonPath }}
            onChange={(value) => setForm((current) => ({ ...current, rateJsonPath: value }))}
          />
          <SgInputText
            id="currency-quoted-at-path"
            label="Caminho da data no JSON"
            hintText='Ex.: "value[0].dataHoraCotacao" (PTAX). Opcional — so registra o horario informado pela fonte.'
            inputProps={{ value: form.quotedAtJsonPath }}
            onChange={(value) => setForm((current) => ({ ...current, quotedAtJsonPath: value }))}
          />
          <SgInputText
            id="currency-retry-offsets"
            label="Retentar apos falha (horas)"
            hintText='Intervalos entre tentativas, separados por virgula. Ex.: "4,5,3" com o cron das 6h tenta de novo as 10h, 15h e 18h. Vazio desliga o retry.'
            inputProps={{ value: form.retryOffsetsHours }}
            onChange={(value) => setForm((current) => ({ ...current, retryOffsetsHours: value }))}
          />
          <SgToggleSwitch
            id="currency-active"
            label="Ativa"
            checked={form.active}
            onChange={(checked) => setForm((current) => ({ ...current, active: checked }))}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
            <SgButton appearance="outline" label="Cancelar" onClick={() => setDialogOpen(false)} severity="secondary" />
            <SgButton
              label={saving ? "Salvando..." : "Salvar"}
              disabled={saving}
              onClick={() => void save()}
              severity="primary"
            />
          </div>
        </SgStack>
      </SgDialog>

      <SgConfirmationDialog
        open={toDelete !== null}
        severity="danger"
        title="Excluir moeda"
        message={
          toDelete
            ? `Tem certeza que deseja excluir "${toDelete.code}"? So' e' possivel se ela nunca teve cotacao registrada.`
            : ""
        }
        confirmButton={{ label: deleting ? "Excluindo..." : "Excluir", severity: "danger", disabled: deleting }}
        cancelButton={{ label: "Cancelar", disabled: deleting }}
        closeOnConfirm={false}
        onConfirm={() => void confirmDelete()}
        onCancel={() => setToDelete(null)}
      />
    </Shell>
  );
}
