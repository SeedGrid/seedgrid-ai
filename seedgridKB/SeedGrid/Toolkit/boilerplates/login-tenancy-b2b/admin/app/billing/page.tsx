"use client";

import {
  SgCard,
  SgDatatable,
  SgGrid,
  SgSkeleton,
  SgStack,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { useEffect, useMemo, useState } from "react";

import { Shell } from "../components/Shell";
import { StatusBadge } from "../components/StatusBadge";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type { PaginatedResult, SubscriptionEntry } from "@/lib/seedgrid-app-api";
import { formatCycleMeters, totalOverageUnits } from "@/lib/usage-meters";

export default function BillingPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBilling() {
      setLoading(true);
      try {
        const subscriptionsResponse = await fetch("/api/admin/subscriptions", { cache: "no-store" });

        // O endpoint responde paginado (items/totalRecords). Esta tela e um panorama
        // comercial: consome a primeira pagina (server-side) via .items.
        const subscriptionsPage = (await subscriptionsResponse.json()) as PaginatedResult<SubscriptionEntry>;
        setSubscriptions(subscriptionsPage.items ?? []);
      } finally {
        setLoading(false);
      }
    }

    void loadBilling();
  }, []);

  const metrics = useMemo(() => {
    const estimatedMrr = subscriptions.reduce((sum, entry) => {
      const raw = entry.planTerm?.monthlyPrice;
      const value = typeof raw === "number" ? raw : Number.parseFloat(String(raw ?? 0));
      return sum + (Number.isFinite(value) ? value : 0);
    }, 0);
    // Excedente sai do proprio ciclo de faturamento da assinatura (saldo de cada contador), que e' o
    // mesmo numero que a coluna "Excedente" da tabela abaixo mostra.
    const tenantsInOverage = subscriptions.filter(
      (entry) => totalOverageUnits(entry.billingCycle?.meters) > 0,
    ).length;
    return {
      estimatedMrr,
      activeSubscriptions: subscriptions.length,
      tenantsInOverage,
    };
  }, [subscriptions]);

  const columns: SgDatatableColumn<SubscriptionEntry>[] = useMemo(() => [
    {
      field: "tenantName",
      header: "Tenant",
      body: (row) => row.tenantName ?? row.tenantId,
      sortable: true,
      filter: true,
    },
    {
      field: "plan",
      header: "Plano",
      body: (row) => row.plan?.name ?? "-",
      sortable: true,
    },
    {
      field: "planTerm",
      header: "Mensalidade",
      align: "right",
      body: (row) => (row.planTerm ? formatCurrency(row.planTerm.monthlyPrice, "BRL") : "-"),
      sortable: true,
    },
    {
      field: "consumed",
      header: "Uso atual (por contador)",
      body: (row) => formatCycleMeters(row.billingCycle?.meters),
    },
    {
      field: "overage",
      header: "Excedente (unidades)",
      align: "right",
      body: (row) => totalOverageUnits(row.billingCycle?.meters),
    },
    {
      field: "status",
      header: "Status",
      body: (row) => <StatusBadge value={row.status} />,
      sortable: true,
    },
    {
      field: "startsAt",
      header: "Inicio",
      body: (row) => formatDateTime(row.startsAt),
      sortable: true,
    },
  ], []);

  return (
    <Shell
      eyebrow="Receita"
      title="Billing comercial"
      description="Visao de assinatura, franquia mensal e excedente do ciclo."
    >
      <SgGrid columns={{ base: 1, md: 2 }} gap={16}>
        <SgCard cardStyle="elevated" description="Soma das mensalidades das assinaturas ativas" title="MRR estimado">
          {loading ? (
            <SgSkeleton height={80} />
          ) : (
            <SgStack gap={10}>
              <strong className="stat-value">{formatCurrency(metrics.estimatedMrr, "BRL")}</strong>
              <StatusBadge severity="info" value={`${metrics.activeSubscriptions} assinaturas ativas`} />
            </SgStack>
          )}
        </SgCard>

        <SgCard cardStyle="elevated" description="Tenants acima da franquia do ciclo atual" title="Com excedente">
          {loading ? (
            <SgSkeleton height={80} />
          ) : (
            <SgStack gap={10}>
              <strong className="stat-value">{metrics.tenantsInOverage}</strong>
              <StatusBadge severity="warning" value="Revisar cobranca marginal" />
            </SgStack>
          )}
        </SgCard>

      </SgGrid>

      <SgCard
        cardStyle="outlined"
        description="Assinaturas ativas com mensalidade, franquia e uso atual"
        title="Base comercial"
      >
        {loading ? (
          <SgSkeleton height={260} />
        ) : (
          <SgDatatable
            columns={columns}
            dataKey="id"
            emptyMessage="Nenhuma assinatura encontrada."
            id="billing-commercial-table"
            paginator
            rows={8}
            showGlobalFilter
            showGridlines
            stripedRows
            value={subscriptions}
          />
        )}
      </SgCard>
    </Shell>
  );
}
