"use client";

import {
  SgCard,
  SgDatatable,
  SgGrid,
  SgSkeleton,
  SgStack,
  type SgDatatableColumn,
} from "@seedgrid/fe-components";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Shell, firstVisibleHref } from "./components/Shell";
import { DatatableSkeleton } from "./components/DatatableSkeleton";
import { StatusBadge } from "./components/StatusBadge";
import { useAdminAccess } from "./components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { formatCurrency, formatDateTime } from "@/lib/format";
import type {
  AuditLogEntry,
  AdminDashboardOverview,
  ExchangeRate,
} from "@/lib/seedgrid-app-api";

type DunningItem = AdminDashboardOverview["dunning"]["items"][number];

const MONTHS = [
  "janeiro",
  "fevereiro",
  "marco",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

function money(value: number | null): string {
  return value == null ? "—" : formatCurrency(value, "BRL");
}

export default function Home() {
  const router = useRouter();
  const { hasPermission, hasRole, loading: accessLoading } = useAdminAccess();
  // A visao geral e' uma tela como as outras: o backend exige ADMIN_HEALTH_READ nos dois endpoints
  // dela. Sem este gate, quem nao tem a permissao recebia 403 em tudo e via os cards desenhados
  // com 0 e "—", como se a plataforma estivesse zerada.
  const canViewOverview = hasPermission(ADMIN_PERMISSIONS.dashboardView);
  const canReadAudit = hasPermission("LOG_READ");

  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const [overview, setOverview] = useState<AdminDashboardOverview | null>(null);
  const [rate, setRate] = useState<number | null>(null);
  const [rateInfo, setRateInfo] = useState<ExchangeRate | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(true);

  const [auditEntries, setAuditEntries] = useState<AuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(true);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [metricsError, setMetricsError] = useState<string | null>(null);

  useEffect(() => {
    if (accessLoading || canViewOverview) {
      return;
    }
    const target = firstVisibleHref(hasPermission, hasRole);
    if (target && target !== "/") {
      router.replace(target);
    }
  }, [accessLoading, canViewOverview, hasPermission, hasRole, router]);

  useEffect(() => {
    async function loadMetrics() {
      setMetricsLoading(true);
      setMetricsError(null);
      try {
        const [overviewRes, rateRes] = await Promise.all([
          fetch("/api/admin/dashboard/overview", { cache: "no-store" }),
          fetch("/api/exchange/usd-brl", { cache: "no-store" }),
        ]);

        if (!overviewRes.ok) throw new Error(`Nao foi possivel carregar os indicadores (HTTP ${overviewRes.status}).`);
        if (overviewRes.ok) {
          setOverview((await overviewRes.json()) as AdminDashboardOverview);
        }
        if (rateRes.ok) {
          const data = (await rateRes.json()) as ExchangeRate;
          setRate(data.rate);
          setRateInfo(data);
        }
      } catch (error) {
        setMetricsError(error instanceof Error ? error.message : "Nao foi possivel carregar os indicadores.");
      } finally {
        setMetricsLoading(false);
      }
    }

    if (canViewOverview) {
      void loadMetrics();
    }
  }, [canViewOverview]);

  useEffect(() => {
    async function loadAudit() {
      setAuditLoading(true);
      setAuditError(null);
      try {
        const response = await fetch("/api/admin/audit-logs?page=0&size=8", {
          cache: "no-store",
        });
        if (!response.ok) throw new Error(`Nao foi possivel carregar a auditoria (HTTP ${response.status}).`);
        const result = (await response.json()) as { items: AuditLogEntry[] };
        setAuditEntries(result.items);
      } catch (error) {
        setAuditError(error instanceof Error ? error.message : "Nao foi possivel carregar a auditoria.");
      } finally {
        setAuditLoading(false);
      }
    }
    if (canViewOverview && canReadAudit) {
      void loadAudit();
    }
  }, [canViewOverview, canReadAudit]);

  // Financeiro do mes (vem pronto do overview): receita em BRL.
  const finance = overview?.finance;
  const revenueBrl = finance ? Number(finance.revenueBrl) : null;
  const needsRate = rate == null;

  const monthLabel = `${MONTHS[month - 1]}/${year}`;

  const auditColumns: SgDatatableColumn<AuditLogEntry>[] = useMemo(() => [
    {
      field: "operation",
      header: "Acao",
      body: (row) => <StatusBadge severity="info" value={row.operation} />,
    },
    { field: "description", header: "Resumo" },
    { field: "userName", header: "Ator" },
    {
      field: "operationDateTime",
      header: "Quando",
      body: (row) => formatDateTime(row.operationDateTime),
    },
  ], []);

  const commercial = overview?.commercial;
  const counters = overview?.counters;
  const readiness = overview?.readiness;
  const dunning = overview?.dunning;

  const dunningColumns: SgDatatableColumn<DunningItem>[] = useMemo(() => [
    { columnId: "d-client", field: "client", header: "Cliente" },
    { columnId: "d-plan", field: "plan", header: "Plano" },
    {
      columnId: "d-since",
      header: "Desde",
      body: (row) => formatDateTime(row.since),
    },
  ], []);

  if (!accessLoading && !canViewOverview) {
    const target = firstVisibleHref(hasPermission, hasRole);
    return (
      <Shell
        eyebrow="SeedGrid App"
        title="Visao geral"
        description="Indicadores da plataforma."
      >
        <SgCard>
          <SgStack gap={8}>
            <strong>Voce nao tem acesso a visao geral.</strong>
            <span>
              {target
                ? "Abrindo a primeira area liberada para o seu perfil. Use o menu ao lado para navegar."
                : "Nenhuma area esta liberada para o seu perfil. Fale com quem administra a plataforma."}
            </span>
          </SgStack>
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="SeedGrid App"
      title="Visao geral"
      description="Indicadores reais da plataforma: negocio, cobranca e saude."
    >
      <SgStack direction="row" gap={8} wrap>
        <StatusBadge
          severity={needsRate ? "warning" : "info"}
          value={
            needsRate
              ? "Cotacao USD-BRL indisponivel"
              : `Cotacao USD-BRL: ${formatCurrency(rate as number, "BRL")}${
                  rateInfo?.source ? ` (${rateInfo.source})` : ""
                }`
          }
        />
        <StatusBadge severity="secondary" value={`Mes de referencia: ${monthLabel}`} />
      </SgStack>

      {/* KPIs de negocio */}
      <SgGrid columns={{ base: 1, md: 3 }} gap={16}>
        <KpiCard
          title="Contas ativas"
          description="Total de contas/empresas cadastradas"
          loading={metricsLoading}
          value={counters ? String(counters.accounts) : "0"}
        />
        <KpiCard
          title="Assinaturas ativas"
          description="Assinaturas pagas ativas (nao conta trial)"
          loading={metricsLoading}
          value={counters ? String(counters.activeSubscriptions) : "0"}
          badge={{
            severity: "secondary",
            value: `${counters?.trialSubscriptions ?? 0} em trial`,
          }}
        />
        <KpiCard
          title="Receita do mes"
          description={`Valor dos planos em ${monthLabel}`}
          loading={metricsLoading}
          value={money(revenueBrl)}
          badge={{ severity: "info", value: "planos ativos" }}
        />
      </SgGrid>

      {/* Movimento comercial do mes */}
      <SgCard
        cardStyle="outlined"
        description={`Assinaturas pagas em ${monthLabel} (nao conta trial nem trocas internas)`}
        title="Movimento comercial do mes"
      >
        {metricsLoading ? (
          <SgSkeleton height={90} />
        ) : (
          <SgStack direction="row" gap={24} wrap>
            <Metric label="Novas assinaturas" value={String(commercial?.newSubscriptions ?? 0)} />
            <Metric label="Cancelamentos" value={String(commercial?.canceled ?? 0)} />
            <Metric label="Upgrades" value={String(commercial?.upgrades ?? 0)} />
            <Metric label="Downgrades" value={String(commercial?.downgrades ?? 0)} />
          </SgStack>
        )}
      </SgCard>

      {/* Assinaturas em dunning (cobranca falhada / PAST_DUE) */}
      <SgCard
        cardStyle="outlined"
        description="Assinaturas com cobranca falhada (cartao expirado/bloqueado): consumo bloqueado ate regularizar."
        title="Assinaturas em cobranca pendente (dunning)"
      >
        {metricsLoading ? (
          <SgSkeleton height={120} />
        ) : (dunning?.count ?? 0) === 0 ? (
          <StatusBadge severity="success" value="Nenhuma assinatura com cobranca pendente." />
        ) : (
          <SgStack gap={12}>
            <StatusBadge
              severity="danger"
              value={`${dunning?.count} assinatura(s) com cobranca pendente`}
            />
            <SgDatatable
              columns={dunningColumns}
              dataKey="client"
              emptyMessage="Nenhuma."
              id="dunning-table"
              rows={10}
              stripedRows
              value={dunning?.items ?? []}
            />
          </SgStack>
        )}
      </SgCard>

      {/* Saude da plataforma (readiness) */}
      <SgCard
        cardStyle="outlined"
        description="Prontidao do backoffice"
        title="Saude da plataforma"
      >
        {metricsLoading ? (
          <SgSkeleton height={90} />
        ) : (
          <SgStack direction="row" gap={8} wrap>
            <StatusBadge
              severity={readiness?.status === "READY" ? "success" : "warning"}
              value={`Readiness: ${readiness?.status ?? "—"}`}
            />
          </SgStack>
        )}
      </SgCard>

      {metricsError ? <div role="alert"><StatusBadge severity="danger" value={metricsError} /></div> : null}

      {/* Auditoria da extensao, com o mesmo escopo da tela de consulta. */}
      {canReadAudit ? (
      <SgCard
        cardStyle="outlined"
        description="Eventos recentes de auditoria"
        title="Auditoria recente"
      >
        {auditLoading ? (
          <DatatableSkeleton columns={auditColumns.length} rows={8} />
        ) : auditError ? (
          <div role="alert"><StatusBadge severity="danger" value={auditError} /></div>
        ) : (
          <SgDatatable
            columns={auditColumns}
            dataKey="id"
            emptyMessage="Nenhum evento de auditoria registrado."
            id="audit-table"
            rows={8}
            stripedRows
            value={auditEntries}
          />
        )}
      </SgCard>
      ) : null}
    </Shell>
  );
}

function KpiCard({
  title,
  description,
  value,
  loading,
  badge,
}: Readonly<{
  title: string;
  description: string;
  value: string;
  loading: boolean;
  badge?: { severity: "success" | "danger" | "warning" | "info" | "secondary"; value: string };
}>) {
  return (
    <SgCard cardStyle="elevated" description={description} title={title}>
      {loading ? (
        <SgSkeleton height={80} />
      ) : (
        <SgStack gap={10}>
          <strong className="stat-value">{value}</strong>
          {badge ? <StatusBadge severity={badge.severity} value={badge.value} /> : null}
        </SgStack>
      )}
    </SgCard>
  );
}

function Metric({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <div style={{ minWidth: 140 }}>
      <p style={{ margin: 0, fontSize: 12, opacity: 0.7 }}>{label}</p>
      <p style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>{value}</p>
    </div>
  );
}
