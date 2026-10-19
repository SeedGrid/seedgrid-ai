"use client";

import {
  SgButton,
  SgCard,
  SgSkeleton,
  SgStack,
  toast,
} from "@seedgrid/fe-components";
import { Check, RefreshCw, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import { formatDateTime } from "@/lib/format";

type PriceApproval = {
  id: string;
  checkedAt: string | null;
  sourceUrl: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  detectedChangesJson: string | null;
  errorMessage: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
};

type ProposedPrice = {
  model: string;
  inputPricePerMillion: number | null;
  cachedInputPricePerMillion: number | null;
  outputPricePerMillion: number | null;
};

const STATUS_META: Record<PriceApproval["status"], { label: string; severity: "warning" | "success" | "danger" }> = {
  PENDING: { label: "Pendente", severity: "warning" },
  APPROVED: { label: "Aprovado", severity: "success" },
  REJECTED: { label: "Recusado", severity: "danger" },
};

function parseChanges(json: string | null): ProposedPrice[] {
  if (!json) return [];
  try {
    const parsed = JSON.parse(json) as unknown;
    return Array.isArray(parsed) ? (parsed as ProposedPrice[]) : [];
  } catch {
    return [];
  }
}

export default function AiPriceApprovalsPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canApprove = hasPermission(ADMIN_PERMISSIONS.aiPriceApprove);

  const [items, setItems] = useState<PriceApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/ai/price-approvals", { cache: "no-store" });
    if (response.ok) {
      const result = (await response.json()) as { items: PriceApproval[] };
      setItems(result.items ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!accessLoading && canApprove) {
      void load();
    } else if (!accessLoading) {
      setLoading(false);
    }
  }, [accessLoading, canApprove, load]);

  async function act(id: string, action: "approve" | "reject") {
    setActing(id);
    try {
      const response = await fetch(`/api/admin/ai/price-approvals/${id}/${action}`, { method: "POST" });
      if (!response.ok) {
        toast.error((await response.text()) || "Falha na operacao.");
        return;
      }
      await load();
    } finally {
      setActing(null);
    }
  }

  async function checkNow() {
    setActing("check");
    try {
      const response = await fetch("/api/admin/ai/price-approvals/check", { method: "POST" });
      if (!response.ok) {
        toast.error((await response.text()) || "Falha ao verificar.");
        return;
      }
      const result = (await response.json()) as { status?: string; message?: string };
      if (result.message) {
        toast.info(result.message);
      } else if (result.status === "NO_CHANGE") {
        toast.info("Verificacao concluida: nenhuma mudanca de preco detectada.");
      }
      await load();
    } finally {
      setActing(null);
    }
  }

  return (
    <Shell
      eyebrow="Inteligencia Artificial"
      title="Aprovacao de precos"
      description="Mudancas de preco dos modelos detectadas pelo robo. Aprovar cria o preco vigente; recusar descarta."
    >
      <SgCard cardStyle="outlined" title="Mudancas detectadas">
        <SgStack gap={12}>
          <SgStack align="center" direction="row" gap={12} wrap>
            <SgButton
              appearance="outline"
              label="Verificar agora"
              leftIcon={<RefreshCw size={16} />}
              loading={acting === "check"}
              onClick={() => void checkNow()}
              severity="secondary"
            />
          </SgStack>

          {accessLoading || loading ? (
            <SgSkeleton borderRadius={16} height={240} shape="rectangle" />
          ) : !canApprove ? (
            <StatusBadge severity="danger" value="Voce nao tem permissao para aprovar precos de IA." />
          ) : items.length === 0 ? (
            <StatusBadge severity="info" value="Nenhuma mudanca registrada." />
          ) : (
            <SgStack gap={12}>
              {items.map((item) => {
                const changes = parseChanges(item.detectedChangesJson);
                const meta = STATUS_META[item.status];
                return (
                  <div
                    key={item.id}
                    style={{
                      border: "1px solid var(--sg-border, #e5e7eb)",
                      borderRadius: 12,
                      padding: 16,
                    }}
                  >
                    <SgStack gap={8}>
                      <SgStack align="center" direction="row" gap={12} wrap>
                        <StatusBadge severity={meta.severity} value={meta.label} />
                        <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>
                          {formatDateTime(item.checkedAt)} · {item.sourceUrl}
                        </span>
                      </SgStack>

                      {item.errorMessage ? (
                        <StatusBadge severity="danger" value={item.errorMessage} />
                      ) : changes.length > 0 ? (
                        <div style={{ overflowX: "auto" }}>
                          <table style={{ width: "100%", fontSize: "0.85rem", borderCollapse: "collapse" }}>
                            <thead>
                              <tr style={{ textAlign: "left", color: "#6b7280" }}>
                                <th style={{ padding: "4px 8px" }}>Modelo</th>
                                <th style={{ padding: "4px 8px", textAlign: "right" }}>Entrada /1M</th>
                                <th style={{ padding: "4px 8px", textAlign: "right" }}>Cache /1M</th>
                                <th style={{ padding: "4px 8px", textAlign: "right" }}>Saida /1M</th>
                              </tr>
                            </thead>
                            <tbody>
                              {changes.map((c) => (
                                <tr key={c.model}>
                                  <td style={{ padding: "4px 8px" }}>{c.model}</td>
                                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                    {c.inputPricePerMillion ?? "-"}
                                  </td>
                                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                    {c.cachedInputPricePerMillion ?? "-"}
                                  </td>
                                  <td style={{ padding: "4px 8px", textAlign: "right" }}>
                                    {c.outputPricePerMillion ?? "-"}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : null}

                      {item.status === "PENDING" ? (
                        <SgStack direction="row" gap={8} wrap>
                          {!item.errorMessage ? (
                            <SgButton
                              appearance="solid"
                              label="Aprovar"
                              leftIcon={<Check size={16} />}
                              loading={acting === item.id}
                              onClick={() => void act(item.id, "approve")}
                              severity="success"
                            />
                          ) : null}
                          <SgButton
                            appearance="outline"
                            label={item.errorMessage ? "Dispensar" : "Recusar"}
                            leftIcon={<X size={16} />}
                            loading={acting === item.id}
                            onClick={() => void act(item.id, "reject")}
                            severity="danger"
                          />
                        </SgStack>
                      ) : (
                        <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                          {meta.label}
                          {item.reviewedBy ? ` por ${item.reviewedBy}` : ""}
                          {item.reviewedAt ? ` em ${formatDateTime(item.reviewedAt)}` : ""}
                        </span>
                      )}
                    </SgStack>
                  </div>
                );
              })}
            </SgStack>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}
