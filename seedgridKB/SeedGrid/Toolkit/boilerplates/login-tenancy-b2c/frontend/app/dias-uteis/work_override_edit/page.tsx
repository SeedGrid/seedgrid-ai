"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgInputDate,
  SgInputText,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { ArrowLeft, Save } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  WORK_OVERRIDE_DEFAULT_WEIGHT,
  WORK_OVERRIDE_WEIGHT_OPTIONS,
  buildWorkOverridePayload,
  workOverrideWeightLabel,
  type WorkOverride,
} from "@/lib/business-days";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

type OverrideForm = {
  date: string;
  /** "default" = vazio (peso do dia da semana). */
  weight: string;
  reason: string;
  active: boolean;
};

const EMPTY_FORM: OverrideForm = { date: "", weight: WORK_OVERRIDE_DEFAULT_WEIGHT, reason: "", active: true };

/** Opcoes de peso e, se a API trouxer um peso fora delas, esse peso tambem. */
function weightSource(weight: string): SgComboboxSource {
  const base: { id: string; label: string }[] = WORK_OVERRIDE_WEIGHT_OPTIONS.map((option) => ({ ...option }));
  if (weight !== "" && !base.some((option) => option.id === weight)) {
    base.push({ id: weight, label: workOverrideWeightLabel(Number(weight)) });
  }
  return base;
}

export default function WorkOverrideEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <WorkOverrideEditPageContent />
    </Suspense>
  );
}

function WorkOverrideEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const overrideId = searchParams.get("publicId");
  const isEditing = Boolean(overrideId);

  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreate = hasPermission(ADMIN_PERMISSIONS.businessDaysCreate);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.businessDaysEdit);
  const canAccessPage = isEditing ? canEdit : canCreate;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [form, setForm] = useState<OverrideForm>(EMPTY_FORM);

  useEffect(() => {
    if (!overrideId || accessLoading || !canAccessPage) {
      return;
    }

    let cancelled = false;
    async function loadOverride() {
      setLoading(true);
      try {
        const override = await adminProxyClient.get<WorkOverride>(`/api/business-days/work-overrides/${overrideId}`);
        if (cancelled) {
          return;
        }
        setReadOnly(!override.editable);
        setForm({
          date: override.date,
          weight: override.weight == null ? WORK_OVERRIDE_DEFAULT_WEIGHT : String(override.weight),
          reason: override.reason ?? "",
          active: override.active,
        });
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(extractApiErrorMessage(error) ?? "Nao foi possivel carregar a excecao.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadOverride();
    return () => {
      cancelled = true;
    };
  }, [accessLoading, canAccessPage, overrideId]);

  async function submitOverride() {
    const built = buildWorkOverridePayload(form);
    if ("error" in built) {
      toast.error(built.error);
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      if (overrideId) {
        await adminProxyClient.put(`/api/business-days/work-overrides/${overrideId}`, { body: built.payload });
      } else {
        await adminProxyClient.post("/api/business-days/work-overrides", { body: built.payload });
      }
      router.push(`/dias-uteis/work_override_list?saved=${isEditing ? "updated" : "created"}`);
      router.refresh();
    } catch (error) {
      const message = extractApiErrorMessage(error) ?? "Nao foi possivel salvar a excecao.";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canAccessPage) {
    return (
      <Shell eyebrow="Dias uteis" title="Vai trabalhar" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value={`Voce nao possui permissao para ${isEditing ? "editar" : "criar"} datas de trabalho.`}
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Dias uteis"
      title={isEditing ? "Editar data de trabalho" : "Nova data de trabalho"}
      description={
        isEditing
          ? "Ajuste o peso ou o motivo da data."
          : "Informe a data em que voce vai trabalhar, mesmo sendo feriado."
      }
    >
      <SgCard
        cardStyle="outlined"
        title="Dados da data"
        description="Vale para a data concreta informada (nao se repete todo ano)."
      >
        <SgStack gap={12}>
          <SgButton
            appearance="ghost"
            label="Voltar para lista"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/dias-uteis/work_override_list")}
            severity="secondary"
          />

          {statusMessage ? <StatusBadge severity="danger" value={statusMessage} /> : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={320} shape="rectangle" />
          ) : readOnly ? (
            <StatusBadge
              severity="warning"
              value="Esta excecao vem da conta (tenant) e nao pode ser alterada aqui."
            />
          ) : (
            <SgStack gap={16}>
              <SgInputDate
                id="override-date"
                label="Data"
                inputProps={{ value: form.date }}
                onChange={(date) => setForm((current) => ({ ...current, date }))}
              />
              <SgCombobox
                id="override-weight"
                label="Peso"
                hintText="Vazio = peso do dia da semana (o definido na Semana de trabalho)."
                placeholder="Peso do dia da semana"
                source={weightSource(form.weight)}
                value={form.weight || WORK_OVERRIDE_DEFAULT_WEIGHT}
                onValueChange={(value) =>
                  setForm((current) => ({
                    ...current,
                    weight: value ? String(value) : WORK_OVERRIDE_DEFAULT_WEIGHT,
                  }))
                }
              />
              <SgInputText
                id="override-reason"
                label="Motivo"
                maxLength={200}
                inputProps={{ value: form.reason }}
                onChange={(reason) => setForm((current) => ({ ...current, reason }))}
              />
              <SgToggleSwitch
                id="override-active"
                checked={form.active}
                label="Ativa"
                onChange={(active) => setForm((current) => ({ ...current, active }))}
              />
              <SgButton
                appearance="outline"
                disabled={submitting}
                label={submitting ? "Salvando..." : "Salvar"}
                leftIcon={<Save size={16} />}
                onClick={() => void submitOverride()}
                severity="secondary"
              />
            </SgStack>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}
