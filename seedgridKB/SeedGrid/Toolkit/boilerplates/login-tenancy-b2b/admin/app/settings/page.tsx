"use client";

import {
  SgButton,
  SgCard,
  SgInputNumber,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
} from "@seedgrid/fe-components";
import { RefreshCw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Shell } from "../components/Shell";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminAccess } from "../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";

type PricingConfig = { enabled: boolean; sourceUrl: string };

// Cron (Quartz) "0 {min} {hora} * * ?" <-> hora/minuto. O backend continua cron-based.
function cronFromTime(hour: string, minute: string): string {
  const h = Math.max(0, Math.min(23, Number(hour) || 0));
  const m = Math.max(0, Math.min(59, Number(minute) || 0));
  return `0 ${m} ${h} * * ?`;
}

function timeFromCron(cron: string | null | undefined): { hour: string; minute: string } {
  const match = cron?.match(/^\s*\S+\s+(\d{1,2})\s+(\d{1,2})\s+/);
  return match ? { minute: match[1], hour: match[2] } : { hour: "6", minute: "0" };
}

export default function SettingsPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canConfig = hasPermission(ADMIN_PERMISSIONS.aiPriceApprove);

  const [config, setConfig] = useState<PricingConfig>({ enabled: false, sourceUrl: "" });
  const [hour, setHour] = useState("6");
  const [minute, setMinute] = useState("0");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [checking, setChecking] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const response = await fetch("/api/admin/ai/price-approvals/config", { cache: "no-store" });
    if (response.ok) {
      const cfg = (await response.json()) as { enabled: boolean; cron: string; sourceUrl: string | null };
      setConfig({ enabled: cfg.enabled, sourceUrl: cfg.sourceUrl ?? "" });
      const t = timeFromCron(cfg.cron);
      setHour(t.hour);
      setMinute(t.minute);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!accessLoading && canConfig) {
      void load();
    } else if (!accessLoading) {
      setLoading(false);
    }
  }, [accessLoading, canConfig, load]);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/ai/price-approvals/config", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: config.enabled,
          cron: cronFromTime(hour, minute),
          sourceUrl: config.sourceUrl,
        }),
      });
      if (!response.ok) {
        toast.error((await response.text()) || "Falha ao salvar a configuracao.");
        return;
      }
      toast.success("Configuracao salva. O agendamento foi atualizado.");
    } finally {
      setSaving(false);
    }
  }

  async function checkNow() {
    setChecking(true);
    try {
      const response = await fetch("/api/admin/ai/price-approvals/check", { method: "POST" });
      if (!response.ok) {
        toast.error((await response.text()) || "Falha ao verificar.");
        return;
      }
      const result = (await response.json()) as { status?: string; message?: string };
      toast.info(
        result.message ??
          (result.status === "NO_CHANGE"
            ? "Verificacao concluida: nenhuma mudanca de preco detectada."
            : "Verificacao concluida: ha mudancas pendentes. Veja em Precos IA (aprovacao)."),
      );
    } finally {
      setChecking(false);
    }
  }

  return (
    <Shell
      eyebrow="Plataforma"
      title="Configuracao"
      description="Ajustes operacionais do sistema."
    >
      <SgCard
        cardStyle="outlined"
        title="Robo de precos de IA"
        description="Checa a tabela de precos do provedor no horario definido, compara com o catalogo e pede aprovacao. Avisa o admin por WhatsApp quando muda ou nao consegue ler."
      >
        {accessLoading || loading ? (
          <SgSkeleton borderRadius={16} height={280} shape="rectangle" />
        ) : !canConfig ? (
          <StatusBadge severity="danger" value="Voce nao tem permissao para esta configuracao." />
        ) : (
          <SgStack gap={12}>
            <SgToggleSwitch
              id="pricing-enabled"
              checked={config.enabled}
              label="Robo ativo (checagem automatica)"
              onChange={(enabled) => setConfig((c) => ({ ...c, enabled }))}
            />
            <SgStack align="end" direction="row" gap={12} wrap>
              <div style={{ width: 140 }}>
                <SgInputNumber
                  id="pricing-hour"
                  label="Hora"
                  hintText="0 a 23 (horario de Brasilia)."
                  decimals={0}
                  minValue={0}
                  maxValue={23}
                  inputProps={{ value: hour }}
                  onChange={setHour}
                />
              </div>
              <div style={{ width: 140 }}>
                <SgInputNumber
                  id="pricing-minute"
                  label="Minuto"
                  decimals={0}
                  minValue={0}
                  maxValue={59}
                  inputProps={{ value: minute }}
                  onChange={setMinute}
                />
              </div>
            </SgStack>
            <SgInputText
              id="pricing-source"
              label="URL da pagina de precos"
              inputProps={{ value: config.sourceUrl }}
              onChange={(sourceUrl) => setConfig((c) => ({ ...c, sourceUrl }))}
            />
            <SgStack align="center" direction="row" gap={12} wrap>
              <SgButton
                appearance="outline"
                label={saving ? "Salvando..." : "Salvar configuracao"}
                leftIcon={<Save size={16} />}
                loading={saving}
                onClick={() => void save()}
                severity="secondary"
              />
              <SgButton
                appearance="outline"
                label="Verificar agora"
                leftIcon={<RefreshCw size={16} />}
                loading={checking}
                onClick={() => void checkNow()}
                severity="primary"
              />
            </SgStack>
          </SgStack>
        )}
      </SgCard>
    </Shell>
  );
}
