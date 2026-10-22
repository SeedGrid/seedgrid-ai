"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgDatatable,
  SgDialog,
  SgGrid,
  SgInputNumber,
  SgInputText,
  SgSkeleton,
  SgStack,
  toast,
  type SgComboboxSource,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { HandCoins } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Shell } from "../components/Shell";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency } from "@/lib/format";
import type { AdminAccount } from "@/lib/seedgrid-app-api";
import { formatCycleMeters } from "@/lib/usage-meters";

const ALL_PLANS_FILTER = "__ALL_PLANS__";

export default function AccountsPage() {
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<AdminAccount | null>(null);
  // Concessao e' de UM contador por vez (o billing guarda o saldo por contador).
  const [grantMeter, setGrantMeter] = useState<string | null>(null);
  const [grantUnits, setGrantUnits] = useState("100");
  const [grantTrialDays, setGrantTrialDays] = useState("0");
  const [grantNote, setGrantNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [planFilter, setPlanFilter] = useState<string | null>(null);

  // Planos derivados das proprias contas (so aparecem planos que alguma conta realmente tem).
  const planFilterSource = useMemo<SgComboboxSource>(() => {
    const seen = new Map<string, string>();
    for (const account of accounts) {
      if (account.planCode && !seen.has(account.planCode)) {
        seen.set(account.planCode, account.planName ?? account.planCode);
      }
    }
    const options = Array.from(seen.entries())
      .map(([id, label]) => ({ id, label }))
      .sort((a, b) => a.label.localeCompare(b.label, "pt-BR"));
    return [{ id: ALL_PLANS_FILTER, label: "Todos" }, ...options];
  }, [accounts]);

  const filteredAccounts = useMemo(
    () =>
      accounts.filter((account) => {
        if (planFilter && account.planCode !== planFilter) {
          return false;
        }
        return true;
      }),
    [accounts, planFilter],
  );

  // Quantidade de assinaturas e valor total por plano, sobre o filtro atual (respeita
  // o plano selecionado) - e' o que da pra conferir contra o faturamento esperado.
  const planSummary = useMemo(() => {
    const groups = new Map<string, { label: string; count: number; total: number }>();
    for (const account of filteredAccounts) {
      const key = account.planCode ?? "__NONE__";
      const label = account.planName ?? "Sem plano";
      const group = groups.get(key) ?? { label, count: 0, total: 0 };
      group.count += 1;
      group.total += account.planValue ?? 0;
      groups.set(key, group);
    }
    return Array.from(groups.values()).sort((a, b) => b.total - a.total);
  }, [filteredAccounts]);

  useEffect(() => {
    void loadAccounts();
  }, []);

  async function loadAccounts() {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/accounts", { cache: "no-store" });
      const data = (await response.json()) as { items: AdminAccount[] };
      setAccounts(data.items);
    } finally {
      setLoading(false);
    }
  }

  function openGrantDialog(account: AdminAccount) {
    setSelectedAccount(account);
    setGrantMeter(account.usage[0]?.meter ?? null);
    setGrantUnits("100");
    setGrantNote("");
    setStatusMessage(null);
    setDialogOpen(true);
  }

  async function submitGrant() {
    if (!selectedAccount) {
      return;
    }
    // Os dois campos sao opcionais, mas conceder NADA nao e' uma acao: exige ao menos um.
    const units = Number.parseInt(grantUnits, 10) || 0;
    const days = Number.parseInt(grantTrialDays, 10) || 0;
    if (units <= 0 && days <= 0) {
      setStatusMessage("Informe unidades de um contador, dias de trial, ou os dois.");
      return;
    }
    if (units > 0 && !grantMeter) {
      setStatusMessage("Escolha o contador que recebe as unidades.");
      return;
    }
    if (days > 0 && !selectedAccount.endsAt) {
      setStatusMessage("Esta assinatura nao expira por data, entao nao ha prazo a estender.");
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const note = grantNote.trim() || null;

      if (units > 0) {
        const response = await fetch(
          `/api/admin/accounts/${encodeURIComponent(selectedAccount.publicId)}/grant-units`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // As unidades vao para o saldo do contador escolhido, no ciclo vigente.
            body: JSON.stringify({ meter: grantMeter, units, note }),
          },
        );
        if (!response.ok) {
          const text = await response.text();
          setStatusMessage(text || "Falha ao conceder unidades.");
          return;
        }
      }

      // Chamada separada de proposito: sao duas concessoes, cada uma com o proprio registro na
      // auditoria. Se a de franquia passou e esta falhar, o que ja foi concedido FICA -- e a
      // mensagem diz isso, para ninguem reenviar o formulario e conceder franquia duas vezes.
      if (days > 0) {
        const response = await fetch(
          `/api/admin/accounts/${encodeURIComponent(selectedAccount.publicId)}/grant-trial-days`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ days, note }),
          },
        );
        if (!response.ok) {
          const text = await response.text();
          setStatusMessage(
            (text || "Falha ao estender o trial.") +
              (units > 0 ? " As unidades JA foram concedidas -- nao reenvie o formulario." : ""),
          );
          await loadAccounts();
          return;
        }
      }

      toast.success("Concessao aplicada a conta selecionada.");
      setDialogOpen(false);
      await loadAccounts();
    } finally {
      setSubmitting(false);
    }
  }

  const columns: SgDatatableColumn<AdminAccount>[] = [
    {
      field: "tradeName",
      header: "Conta",
      body: (row) => row.tradeName || row.legalName,
      sortable: true,
      filter: true,
    },
    { field: "cpfCnpj", header: "Documento", sortable: true, filter: true },
    {
      field: "status",
      header: "Status",
      body: (row) => <StatusBadge value={row.status} />,
      sortable: true,
    },
    {
      field: "planName",
      header: "Plano",
      body: (row) => row.planName ?? "-",
      sortable: true,
    },
    {
      field: "planValue",
      header: "Valor",
      align: "right",
      body: (row) => (row.planValue == null ? "-" : formatCurrency(row.planValue)),
      sortable: true,
    },
    {
      field: "subscriptionStatus",
      header: "Assinatura",
      body: (row) => <StatusBadge value={row.subscriptionStatus} />,
      sortable: true,
    },
    {
      field: "endsAt",
      header: "Vence em",
      sortable: true,
      // `null` nao e' "sem dado": e' "nao expira por data". Escrever isso evita a leitura errada de
      // que faltou preencher alguma coisa.
      body: (row) =>
        row.endsAt
          ? new Date(row.endsAt).toLocaleDateString("pt-BR")
          : "nao expira",
    },
    {
      field: "usage",
      header: "Consumo do ciclo (por contador)",
      body: (row) => formatCycleMeters(row.usage),
    },
    {
      field: "publicId",
      header: "Acao",
      body: (row) => (
        <SgStack direction="row" gap={8} wrap>
          <SgButton
            appearance="ghost"
            aria-label="Conceder unidades"
            title="Conceder unidades"
            iconOnly
            leftIcon={<HandCoins size={16} />}
            onClick={() => openGrantDialog(row)}
            severity="secondary"
          />
        </SgStack>
      ),
    },
  ];

  return (
    <Shell
      eyebrow="Operacao"
      title="Contas e clientes"
      description="Consulta real das contas da plataforma, com status, plano e consumo atual de solicitacoes."
    >
      {loading ? (
        <SgSkeleton height={120} />
      ) : (
        <SgGrid columns={{ base: 1, sm: 2, xl: 4 }} gap={16}>
          {planSummary.map((group) => (
            <SgCard
              cardStyle="elevated"
              description={`${group.count} assinatura${group.count === 1 ? "" : "s"}`}
              key={group.label}
              title={group.label}
            >
              <strong className="stat-value">{formatCurrency(group.total)}</strong>
            </SgCard>
          ))}
        </SgGrid>
      )}

      <SgCard
        cardStyle="outlined"
        description="Dados carregados da API administrativa"
        title="Contas monitoradas"
      >
        <SgStack direction="row" gap={16} wrap>
          <SgCombobox
            id="accounts-filter-plan"
            label="Plano"
            placeholder="Todos os planos"
            source={planFilterSource}
            value={planFilter ?? ALL_PLANS_FILTER}
            onValueChange={(value) => {
              const next = value ? String(value) : ALL_PLANS_FILTER;
              setPlanFilter(next === ALL_PLANS_FILTER ? null : next);
            }}
          />
        </SgStack>

        {loading ? (
          <SgSkeleton height={240} />
        ) : (
          <SgDatatable
            columns={columns}
            dataKey="publicId"
            emptyMessage="Nenhuma conta encontrada."
            id="accounts-table"
            paginator
            rows={8}
            showGlobalFilter
            showGridlines
            stripedRows
            value={filteredAccounts}
          />
        )}
      </SgCard>

      <SgDialog
        closeOnEsc
        closeOnOverlayClick
        onOpenChange={setDialogOpen}
        open={dialogOpen}
        title={selectedAccount ? `Conceder para ${selectedAccount.tradeName || selectedAccount.legalName}` : "Conceder"}
      >
        {selectedAccount ? (
          <SgStack gap={16}>
            <div className="text-sm text-sg-muted">
              Documento {selectedAccount.cpfCnpj ?? "não informado"} · consumo atual {formatCycleMeters(selectedAccount.usage)}
            </div>

            {/* So' os contadores que o plano da conta inclui: unidades de um contador fora do plano nao
                poderiam ser consumidas (o billing recusa com METER_NOT_IN_PLAN). */}
            <SgCombobox
              id="account-grant-meter"
              label="Contador"
              placeholder="Escolha o contador"
              source={selectedAccount.usage.map((meter) => ({ id: meter.meter, label: meter.label }))}
              value={grantMeter ?? undefined}
              onValueChange={(value) => setGrantMeter(value ? String(value) : null)}
            />

            <SgInputNumber
              id="account-grant-units"
              label="Unidades a conceder"
              decimals={0}
              minValue={1}
              inputProps={{ value: grantUnits }}
              onChange={setGrantUnits}
            />

            <SgInputNumber
              id="account-grant-trial-days"
              label="Dias de trial a conceder"
              enabled={Boolean(selectedAccount.endsAt)}
              decimals={0}
              minValue={0}
              hintText={
                selectedAccount.endsAt
                  ? `Vence hoje em ${new Date(selectedAccount.endsAt).toLocaleDateString("pt-BR")}. Trial ja vencido conta a partir de hoje, nao da data vencida.`
                  : "Esta assinatura nao expira por data, entao nao ha prazo a estender."
              }
              inputProps={{ value: grantTrialDays }}
              onChange={setGrantTrialDays}
            />

            <SgInputText
              id="account-grant-note"
              label="Observacao"
              hintText="Opcional. Fica registrada na auditoria."
              inputProps={{ value: grantNote }}
              onChange={setGrantNote}
            />

            {statusMessage ? <StatusBadge severity="danger" value={statusMessage} /> : null}

            <SgStack align="center" direction="row" gap={12} justify="end">
              <SgButton
                appearance="outline"
                label="Cancelar"
                onClick={() => setDialogOpen(false)}
                severity="secondary"
              />
              <SgButton
                appearance="outline"
                label={submitting ? "Concedendo..." : "Conceder"}
                onClick={() => void submitGrant()}
                severity="secondary"
              />
            </SgStack>
          </SgStack>
        ) : null}
      </SgDialog>

    </Shell>
  );
}
