"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgConfirmationDialog,
  SgDatatable,
  SgDialog,
  SgGrid,
  SgInputDate,
  SgInputText,
  SgSkeleton,
  SgStack,
  toast,
  type SgComboboxSource,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { Edit3, RefreshCw, Search } from "lucide-react";
import { useEffect, useState } from "react";

import { RateChart } from "./RateChart";
import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { extractErrorMessage } from "@/lib/api-error";
import { formatDate, formatDateTime } from "@/lib/format";
import type {
  CurrencyExchangeRateEntry,
  CurrencyExchangeRateSearchResponse,
  CurrencyOption,
} from "@/lib/seedgrid-app-api";

const PAGE_SIZE = 15;

const STATUS_SEVERITY: Record<CurrencyExchangeRateEntry["status"], "success" | "danger" | "info"> = {
  SUCCESS: "success",
  FAILED: "danger",
  MANUAL: "info",
};

export default function CurrencyRatesPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.currencyRatesView);
  const canUpdate = hasPermission(ADMIN_PERMISSIONS.currencyRatesUpdate);

  const [currencies, setCurrencies] = useState<CurrencyOption[]>([]);
  const [currencyCode, setCurrencyCode] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [rows, setRows] = useState<CurrencyExchangeRateEntry[]>([]);
  // Paginacao SERVER-SIDE: a tela pedia 100 registros de uma vez e paginava no navegador, entao o
  // historico parava nos 100 mais recentes — com o import de 5 anos (1257 pregoes) isso escondia
  // quase tudo. O backend ja paginava (page/size, ordenado por data desc); faltava usar.
  const [first, setFirst] = useState(0);
  const [totalRecords, setTotalRecords] = useState(0);
  const [loading, setLoading] = useState(false);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  // Linha que ja tem valor e vai ser reprocessada: confirma antes de sobrescrever.
  const [retryTarget, setRetryTarget] = useState<CurrencyExchangeRateEntry | null>(null);
  const [editTarget, setEditTarget] = useState<CurrencyExchangeRateEntry | null>(null);
  const [editRate, setEditRate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const response = await fetch("/api/admin/currencies", { cache: "no-store" });
        setCurrencies((await response.json()) as CurrencyOption[]);
      } catch {
        // combobox so' fica vazio
      }
    })();
  }, []);

  /** @param startIndex indice do 1o registro da pagina (o `first` do datatable), nao o numero da pagina. */
  async function search(startIndex = 0) {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(Math.floor(startIndex / PAGE_SIZE)),
        size: String(PAGE_SIZE),
      });
      if (currencyCode) params.set("currencyCode", currencyCode);
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const response = await fetch(`/api/admin/currency-exchange-rates?${params.toString()}`, { cache: "no-store" });
      const data = (await response.json()) as CurrencyExchangeRateSearchResponse;
      setRows(data.items ?? []);
      setTotalRecords(data.totalRecords ?? 0);
      setFirst(startIndex);
    } catch {
      toast.error("Falha ao buscar cotacoes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (accessLoading || !canView) return;
    void search();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessLoading, canView]);

  async function retry(row: CurrencyExchangeRateEntry) {
    setRetryTarget(null);
    setRetryingId(row.id);
    try {
      const response = await fetch(`/api/admin/currency-exchange-rates/${row.id}/retry`, { method: "POST" });
      if (!response.ok) {
        toast.error(await extractErrorMessage(response, "Falha ao reprocessar."));
        return;
      }
      const updated = (await response.json()) as CurrencyExchangeRateEntry;
      if (updated.status === "FAILED") {
        toast.error(updated.errorMessage ?? "Tentou de novo e continuou falhando.");
      } else {
        toast.success("Cotacao reprocessada com sucesso.");
      }
      await search(first); // recarrega a MESMA pagina: reprocessar/editar nao pode jogar o usuario pro topo
    } catch {
      toast.error("Falha ao reprocessar.");
    } finally {
      setRetryingId(null);
    }
  }

  function openEdit(row: CurrencyExchangeRateEntry) {
    setEditTarget(row);
    setEditRate(row.rate == null ? "" : String(row.rate));
  }

  async function saveManualRate() {
    if (!editTarget) return;
    const parsed = Number(editRate.replace(",", "."));
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Informe um valor valido.");
      return;
    }
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/currency-exchange-rates/${editTarget.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rate: parsed }),
      });
      if (!response.ok) {
        toast.error(await extractErrorMessage(response, "Falha ao salvar."));
        return;
      }
      toast.success("Cotacao atualizada manualmente.");
      setEditTarget(null);
      await search(first); // recarrega a MESMA pagina: reprocessar/editar nao pode jogar o usuario pro topo
    } catch {
      toast.error("Falha ao salvar.");
    } finally {
      setSaving(false);
    }
  }

  const currencySource: SgComboboxSource = [
    { id: "", label: "Todas" },
    ...currencies.map((currency) => ({ id: currency.code, label: `${currency.code} — ${currency.name}` })),
  ];

  const columns: SgDatatableColumn<CurrencyExchangeRateEntry>[] = [
    // Sem `sortable`: com paginacao server-side, ordenar so' reordenaria a pagina atual (15 linhas)
    // e daria a impressao de ter ordenado o historico inteiro. O backend entrega sempre da data
    // mais recente pra mais antiga; recorte de periodo se faz pelos filtros acima.
    { field: "referenceDate", header: "Data", body: (row) => formatDate(row.referenceDate) },
    { field: "currencyCode", header: "Moeda" },
    {
      field: "rate",
      header: "Cotacao",
      align: "right",
      body: (row) => (row.rate == null ? "—" : row.rate.toLocaleString("pt-BR", { minimumFractionDigits: 4 })),
    },
    {
      field: "status",
      header: "Status",
      body: (row) => <StatusBadge severity={STATUS_SEVERITY[row.status]} value={row.status} />,
    },
    { field: "source", header: "Fonte", body: (row) => row.source ?? "—" },
    { field: "errorMessage", header: "Erro", body: (row) => row.errorMessage ?? "—" },
    {
      field: "fetchedAt",
      header: "Ultima tentativa",
      body: (row) => formatDateTime(row.fetchedAt),
    },
    {
      columnId: "actions",
      header: "Acoes",
      reorderable: false,
      hideable: false,
      body: (row) => (
        <SgStack direction="row" gap={4}>
          {/*
            Disponivel em QUALQUER status (nao so' FAILED): e' o unico jeito de disparar o robo sob
            demanda pra conferir fonte/URL/notificacao sem esperar o cron. Em linha que ja tem valor
            (SUCCESS/MANUAL) passa por confirmacao antes — reprocessar sobrescreve o que esta la, e
            no caso do MANUAL isso descarta um valor que alguem digitou de proposito.
          */}
          {canUpdate ? (
            <SgButton
              appearance="ghost"
              aria-label={`Reprocessar ${row.referenceDate}`}
              title={
                row.status === "FAILED"
                  ? "Tentar buscar de novo"
                  : "Buscar de novo na fonte (sobrescreve o valor atual)"
              }
              iconOnly
              leftIcon={<RefreshCw size={16} />}
              loading={retryingId === row.id}
              onClick={() => (row.status === "FAILED" ? void retry(row) : setRetryTarget(row))}
              severity="secondary"
            />
          ) : null}
          {canUpdate ? (
            <SgButton
              appearance="ghost"
              aria-label={`Editar ${row.referenceDate}`}
              title="Editar valor manualmente"
              iconOnly
              leftIcon={<Edit3 size={16} />}
              onClick={() => openEdit(row)}
              severity="secondary"
            />
          ) : null}
        </SgStack>
      ),
    },
  ];

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Configuracao" title="Cotacao de moedas" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para visualizar cotacoes." />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Configuracao"
      title="Cotacao de moedas"
      description="Historico do robo diario de cotacao — pesquise por moeda e periodo, reprocesse uma cotacao que falhou ou edite o valor manualmente."
    >
      <SgCard cardStyle="outlined" title="Pesquisar">
        <SgGrid columns={{ base: 1, md: 3 }} gap={16}>
          <SgCombobox
            id="currency-filter"
            label="Moeda"
            source={currencySource}
            value={currencyCode}
            onValueChange={(value) => setCurrencyCode(value ? String(value) : "")}
          />
          <SgInputDate id="currency-rates-from" label="De" inputProps={{ value: from }} onChange={setFrom} />
          <SgInputDate id="currency-rates-to" label="Ate" inputProps={{ value: to }} onChange={setTo} />
        </SgGrid>
        <div style={{ marginTop: 16 }}>
          {/* Filtro novo sempre volta pra 1a pagina: manter o offset antigo cairia num "vazio" quando
              o resultado novo for menor que a pagina em que o usuario estava. */}
          <SgButton label="Buscar" leftIcon={<Search size={16} />} onClick={() => void search(0)} severity="primary" />
        </div>
      </SgCard>

      <SgCard cardStyle="outlined" title="Cotacoes" style={{ marginTop: 16 }}>
        {loading ? (
          <SgSkeleton height={260} />
        ) : (
          <SgDatatable
            columns={columns}
            dataKey="id"
            emptyMessage="Nenhuma cotacao encontrada pra esse filtro."
            first={first}
            id="currency-rates-table"
            lazy
            loading={loading}
            onPage={(event) => void search(event.first)}
            paginator
            rows={PAGE_SIZE}
            showGridlines
            stripedRows
            totalRecords={totalRecords}
            value={rows}
          />
        )}
      </SgCard>

      {/*
        Grafico ABAIXO do grid, seguindo a moeda escolhida no filtro: o grid responde "qual foi a
        cotacao de tal dia" e o grafico responde "pra onde isso esta indo" — a segunda pergunta so'
        faz sentido depois de ver a primeira.
      */}
      <RateChart currencyCode={currencyCode} />

      <SgConfirmationDialog
        open={retryTarget !== null}
        severity="warning"
        title="Buscar de novo na fonte"
        message={
          retryTarget
            ? `Reprocessar ${retryTarget.currencyCode} de ${retryTarget.referenceDate}? O robo busca a cotacao daquele dia na fonte e SOBRESCREVE o valor atual (${
                retryTarget.rate == null ? "sem valor" : retryTarget.rate.toLocaleString("pt-BR", { minimumFractionDigits: 4 })
              }).${retryTarget.status === "MANUAL" ? " Este valor foi lancado manualmente e sera descartado." : ""}`
            : ""
        }
        confirmButton={{ label: "Buscar de novo" }}
        cancelButton={{ label: "Cancelar" }}
        onConfirm={() => {
          if (retryTarget) void retry(retryTarget);
        }}
        onCancel={() => setRetryTarget(null)}
      />

      <SgDialog
        open={editTarget !== null}
        onOpenChange={(open) => {
          if (!open) setEditTarget(null);
        }}
        size="sm"
        title={editTarget ? `Editar cotacao — ${editTarget.currencyCode} ${editTarget.referenceDate}` : "Editar cotacao"}
      >
        <SgStack gap={12}>
          <SgInputText
            id="manual-rate"
            label="Valor"
            hintText="Marca a cotacao como MANUAL (nao veio do robo)."
            inputProps={{ value: editRate }}
            onChange={setEditRate}
          />
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, paddingTop: 8 }}>
            <SgButton appearance="outline" label="Cancelar" onClick={() => setEditTarget(null)} severity="secondary" />
            <SgButton
              label={saving ? "Salvando..." : "Salvar"}
              disabled={saving}
              onClick={() => void saveManualRate()}
              severity="primary"
            />
          </div>
        </SgStack>
      </SgDialog>
    </Shell>
  );
}
