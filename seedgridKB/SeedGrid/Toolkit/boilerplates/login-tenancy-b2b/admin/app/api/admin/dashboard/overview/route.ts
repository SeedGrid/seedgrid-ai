import { NextResponse } from "next/server";

import {
  ApiRequestError,
  apiFetchServer,
  upstreamProblemResponse,
} from "@/lib/seedgrid-app-api-server";
import type { AdminDashboardOverview, AiModelEntry } from "@/lib/seedgrid-app-api";

/** Modelos e preços vêm diretamente do endpoint da extensão AI Pricing. */
type AiModelsResponse = { models: AiModelEntry[] };
type ProductOverview = Pick<AdminDashboardOverview, "models" | "lastAiPriceUpdateAt">;

/** Parte do seedgrid-billing (GET /admin/billing/overview). */
type BillingOverview = {
  year: number;
  month: number;
  counters: {
    accounts: number;
    plans: number;
    planTerms: number;
    activeSubscriptions: number;
    trialSubscriptions: number;
  };
  commercial: AdminDashboardOverview["commercial"];
  currency: string;
  revenue: number | string;
  dunning: AdminDashboardOverview["dunning"];
};

/**
 * O dashboard junta AI Pricing, auditoria e billing
 * (contas, assinaturas, movimento e receita do mes, inadimplentes). A parte do billing exige
 * BILLING_OVERVIEW_READ e o modulo billing ligado; sem isso (403/404), o dashboard segue com os
 * indicadores de billing zerados.
 */
export async function GET() {
  const now = new Date();
  const fallback: AdminDashboardOverview = {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    counters: {
      accounts: 0,
      activeSubscriptions: 0,
      trialSubscriptions: 0,
      auditEntries: null,
    },
    commercial: { newSubscriptions: 0, canceled: 0, upgrades: 0, downgrades: 0 },
    finance: { revenueBrl: 0 },
    models: [],
    dunning: { count: 0, items: [] },
    readiness: {
      status: "ATTENTION",
      plansConfigured: false,
      subscriptionsConfigured: false,
      billingReady: false,
    },
    lastAiPriceUpdateAt: null,
  };

  try {
    const [aiModels, billing, audit] = await Promise.all([
      apiFetchServer<AiModelsResponse>("/admin/ai/models").catch((error: unknown) => {
        if (error instanceof ApiRequestError && (error.status === 403 || error.status === 404)) {
          return { models: [] };
        }
        throw error;
      }),
      apiFetchServer<BillingOverview>("/admin/billing/overview").catch((error: unknown) => {
        // 403: sem BILLING_OVERVIEW_READ; 404: modulo billing desligado (seedgrid.billing.api.enabled=false).
        if (error instanceof ApiRequestError && (error.status === 403 || error.status === 404)) {
          return null;
        }
        throw error;
      }),
      apiFetchServer<{ total: number }>("/audit-logs?page=0&size=1").catch((error: unknown) => {
        // O contador obedece LOG_READ e ao escopo da extensao; sem permissao, fica indisponivel.
        if (error instanceof ApiRequestError && error.status === 403) return null;
        throw error;
      }),
    ]);
    return NextResponse.json(merge(fallback, productOverview(aiModels), billing, audit?.total ?? null));
  } catch (error) {
    return upstreamProblemResponse(error);
  }
}

function productOverview(response: AiModelsResponse): ProductOverview {
  const models = response.models.map((entry) => ({
    model: entry.model,
    provider: entry.provider,
    active: entry.active,
    inputPricePerMillion: entry.inputPricePerMillion,
    outputPricePerMillion: entry.outputPricePerMillion,
    currency: entry.currency,
    priced: entry.inputPricePerMillion != null || entry.outputPricePerMillion != null,
  }));
  models.sort((a, b) => Number(b.active) - Number(a.active) || a.model.localeCompare(b.model));
  const timestamps = response.models
    .map((entry) => entry.currentPriceValidFrom)
    .filter((value): value is string => value != null);
  timestamps.sort((a, b) => b.localeCompare(a));
  return { models, lastAiPriceUpdateAt: timestamps[0] ?? null };
}

function merge(
  fallback: AdminDashboardOverview,
  product: ProductOverview,
  billing: BillingOverview | null,
  auditEntries: number | null,
): AdminDashboardOverview {
  if (billing == null) {
    return {
      ...fallback,
      counters: { ...fallback.counters, auditEntries },
      models: product.models,
      lastAiPriceUpdateAt: product.lastAiPriceUpdateAt,
    };
  }
  const plansConfigured = billing.counters.plans > 0 && billing.counters.planTerms > 0;
  const subscriptionsConfigured =
    billing.counters.activeSubscriptions + billing.counters.trialSubscriptions > 0;
  const billingReady = plansConfigured && subscriptionsConfigured;
  return {
    year: billing.year,
    month: billing.month,
    counters: {
      accounts: billing.counters.accounts,
      activeSubscriptions: billing.counters.activeSubscriptions,
      trialSubscriptions: billing.counters.trialSubscriptions,
      auditEntries,
    },
    commercial: billing.commercial,
    // O billing soma na moeda dele (seedgrid.billing.currency, brl neste produto).
    finance: { revenueBrl: billing.revenue },
    models: product.models,
    dunning: billing.dunning,
    readiness: {
      status: billingReady ? "READY" : "ATTENTION",
      plansConfigured,
      subscriptionsConfigured,
      billingReady,
    },
    lastAiPriceUpdateAt: product.lastAiPriceUpdateAt,
  };
}
