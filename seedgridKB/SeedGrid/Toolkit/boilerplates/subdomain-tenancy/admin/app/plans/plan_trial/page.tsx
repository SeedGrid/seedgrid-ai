"use client";

import {
  SgButton,
  SgCard,
  SgInputNumber,
  SgSkeleton,
  SgStack,
  toast,
} from "@seedgrid/fe-components";
import { Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { MeterQuotaEditor, useUsageMeters } from "../../components/MeterQuotaEditor";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import type { TrialConfig } from "@/lib/seedgrid-app-api";
import { toMeterPayload, toMeterRows, type MeterQuotaRow } from "@/lib/usage-meters";

export default function PlanTrialPage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.planTermsView);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.planTermsEdit);
  const { meters: declaredMeters, loading: metersLoading } = useUsageMeters(!accessLoading && canView);

  const [trial, setTrial] = useState<TrialConfig | null>(null);
  const [meterRows, setMeterRows] = useState<MeterQuotaRow[]>([]);
  const [trialDays, setTrialDays] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const loadConfig = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/plans/trial", { cache: "no-store" });
      if (!response.ok) {
        setStatusMessage("Falha ao carregar a configuracao do trial.");
        return;
      }
      const data = (await response.json()) as TrialConfig;
      setTrial(data);
      setTrialDays(String(data.trialDays));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (accessLoading || !canView) {
      return;
    }
    void loadConfig();
  }, [accessLoading, canView, loadConfig]);

  // Uma linha por contador declarado, preenchida com a cota que o trial ja tem.
  useEffect(() => {
    if (trial && !metersLoading) {
      setMeterRows(toMeterRows(declaredMeters, trial.meters));
    }
  }, [trial, declaredMeters, metersLoading]);

  async function submit() {
    // O trial nao tem excedente: o preco nem aparece no editor e vai sempre 0.
    const { meters, error } = toMeterPayload(meterRows, false);
    if (error) {
      toast.error(error);
      return;
    }

    // Zero e' VALIDO aqui, e e' como se desliga a expiracao por data -- por isso `< 0` e nao `<= 0`.
    const days = Number.parseInt(trialDays, 10);
    if (!Number.isFinite(days) || days < 0) {
      toast.error("Informe os dias de trial (0 para nao expirar por data).");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/plans/trial", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        // `meters` presente substitui a lista inteira: contador desligado sai do trial.
        body: JSON.stringify({ meters, trialDays: days }),
      });
      if (!response.ok) {
        const text = await response.text();
        toast.error(text || "Falha ao salvar a configuracao do trial.");
        return;
      }
      toast.success("Configuracao do trial salva.");
      await loadConfig();
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canView) {
    return (
      <Shell
        eyebrow="Comercial"
        title="Trial"
        description="Acesso controlado por permissao."
      >
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value="Voce nao possui permissao para visualizar a configuracao do trial."
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Comercial"
      title="Trial"
      description="Avaliacao gratuita concedida a novas contas, limitada pela cota de cada contador de uso."
    >
      <SgCard
        cardStyle="outlined"
        title="Configuracao do trial"
        description="O que uma nova conta recebe ao confirmar o cadastro, sem contratar plano algum. O trial termina quando a cota de um contador esgota OU quando os dias acabam, o que vier primeiro."
      >
        {loading || metersLoading ? (
          <SgSkeleton borderRadius={16} height={160} shape="rectangle" />
        ) : (
          <SgStack gap={16} style={{ maxWidth: 420 }}>
            <MeterQuotaEditor
              idPrefix="trial-meter"
              rows={meterRows}
              onChange={setMeterRows}
              allowOverage={false}
              enabled={canEdit}
            />

            <SgInputNumber
              id="trial-days"
              label="Dias de trial"
              enabled={canEdit}
              decimals={0}
              minValue={0}
              inputProps={{ value: trialDays }}
              onChange={setTrialDays}
            />

            <p style={{ fontSize: 13, lineHeight: 1.5, margin: 0, opacity: 0.75 }}>
              Contador desligado fica <strong>fora do trial</strong>: consumir dele mostra ao cliente
              &quot;seu plano nao inclui&quot;. O trial <strong>nao tem excedente</strong>: esgotou a
              cota, bloqueia.
              <br />
              <strong>0 dias = nao expira por data</strong> — o trial acaba so&apos; pela cota. Com um
              valor maior que zero, a avaliacao vence tantos dias apos a assinatura, mesmo que sobre cota.
              <br />
              As configuracoes valem para <strong>assinaturas novas</strong>: quem ja esta em trial guarda o
              que recebeu ao entrar.
            </p>

            {statusMessage ? (
              <StatusBadge severity="danger" value={statusMessage} />
            ) : null}

            {canEdit ? (
              <SgButton
                appearance="outline"
                label={submitting ? "Salvando..." : "Salvar"}
                leftIcon={<Save size={16} />}
                onClick={() => void submit()}
                severity="secondary"
              />
            ) : null}
          </SgStack>
        )}
      </SgCard>
    </Shell>
  );
}
