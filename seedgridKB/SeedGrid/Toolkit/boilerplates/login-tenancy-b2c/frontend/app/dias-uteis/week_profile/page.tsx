"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgConfirmationDialog,
  SgSkeleton,
  SgStack,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { RotateCcw, Save } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Shell } from "../../components/Shell";
import { StatusBadge } from "../../components/StatusBadge";
import { useAdminAccess } from "../../components/AdminAccessProvider";
import { ListLoadError } from "@/components/ui/list-load-error";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  WEEKDAY_LABELS,
  WEIGHT_OPTIONS,
  weightLabel,
  type WeekProfile,
  type WeekProfileSource,
} from "@/lib/business-days";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

const SOURCE_TEXT: Record<WeekProfileSource, { severity: "success" | "info" | "neutral"; text: string }> = {
  COMPANY: { severity: "success", text: "Semana definida por voce." },
  GLOBAL: { severity: "info", text: "Semana herdada do padrao da instalacao. Salve para definir a sua." },
  DEFAULT: { severity: "neutral", text: "Semana padrao: segunda a sexta. Salve para definir a sua." },
};

/** Opcoes de um dia: as tres padrao e, se a API trouxer um peso fora delas, esse peso tambem. */
function sourceFor(weight: string): SgComboboxSource {
  const base: { id: string; label: string }[] = WEIGHT_OPTIONS.map((option) => ({ ...option }));
  if (weight !== "" && !base.some((option) => option.id === weight)) {
    base.push({ id: weight, label: weightLabel(Number(weight)) });
  }
  return base;
}

export default function WeekProfilePage() {
  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.businessDaysView);
  const canSave = hasPermission(ADMIN_PERMISSIONS.businessDaysEdit);

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [saving, setSaving] = useState(false);
  const [source, setSource] = useState<WeekProfileSource>("DEFAULT");
  // Peso de cada dia da semana (indice = dayOfWeek ISO, 1..7), como texto: "1", "0.5", "0".
  const [weights, setWeights] = useState<Record<number, string>>({});
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);

  const apply = useCallback((profile: WeekProfile) => {
    setSource(profile.source);
    setWeights(Object.fromEntries(profile.days.map((day) => [day.dayOfWeek, String(day.weight)])));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      apply(await adminProxyClient.get<WeekProfile>("/api/business-days/week-profile"));
    } catch (error) {
      setLoadError(error ?? new Error("Falha ao carregar a semana de trabalho."));
    } finally {
      setLoading(false);
    }
  }, [apply]);

  useEffect(() => {
    if (accessLoading || !canView) {
      return;
    }
    void load();
  }, [accessLoading, canView, load]);

  async function save() {
    setSaving(true);
    try {
      const days = Array.from({ length: 7 }, (_, index) => ({
        dayOfWeek: index + 1,
        weight: Number(weights[index + 1] ?? "0"),
      }));
      apply(await adminProxyClient.put<WeekProfile>("/api/business-days/week-profile", { body: { days } }));
      toast.success("Semana de trabalho salva.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Nao foi possivel salvar a semana de trabalho.");
    } finally {
      setSaving(false);
    }
  }

  async function reset() {
    setResetting(true);
    try {
      apply(await adminProxyClient.delete<WeekProfile>("/api/business-days/week-profile"));
      toast.success("Semana de trabalho restaurada.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Nao foi possivel restaurar a semana de trabalho.");
    } finally {
      setResetting(false);
      setConfirmReset(false);
    }
  }

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Dias uteis" title="Semana de trabalho" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge severity="warning" value="Voce nao possui permissao para ver a semana de trabalho." />
        </SgCard>
      </Shell>
    );
  }

  const sourceInfo = SOURCE_TEXT[source];

  return (
    <Shell
      eyebrow="Dias uteis"
      title="Semana de trabalho"
      description="Defina quais dias da semana voce trabalha: dia inteiro, meio periodo ou fechado."
    >
      <SgCard
        cardStyle="outlined"
        title="Expediente da semana"
        description="Meio periodo conta como dia util, mas vale metade nos calculos de capacidade."
      >
        <SgStack gap={16}>
          <ListLoadError error={loadError} onRetry={() => void load()} />

          {loadError ? null : loading ? (
            <SgSkeleton borderRadius={16} height={420} shape="rectangle" />
          ) : (
            <SgStack gap={16}>
              <StatusBadge severity={sourceInfo.severity} value={sourceInfo.text} />

              {Array.from({ length: 7 }, (_, index) => index + 1).map((dayOfWeek) => (
                <SgCombobox
                  key={dayOfWeek}
                  id={`week-day-${dayOfWeek}`}
                  label={WEEKDAY_LABELS[dayOfWeek]}
                  inputProps={{ disabled: !canSave }}
                  source={sourceFor(weights[dayOfWeek] ?? "")}
                  value={weights[dayOfWeek] ?? null}
                  onValueChange={(value) =>
                    setWeights((current) => ({ ...current, [dayOfWeek]: value ? String(value) : "0" }))
                  }
                />
              ))}

              {canSave ? (
                <SgStack direction="row" gap={12} wrap>
                  <SgButton
                    appearance="outline"
                    disabled={saving}
                    label={saving ? "Salvando..." : "Salvar"}
                    leftIcon={<Save size={16} />}
                    onClick={() => void save()}
                    severity="secondary"
                  />
                  {source === "COMPANY" ? (
                    <SgButton
                      appearance="ghost"
                      label="Restaurar padrao"
                      leftIcon={<RotateCcw size={16} />}
                      onClick={() => setConfirmReset(true)}
                      severity="secondary"
                    />
                  ) : null}
                </SgStack>
              ) : null}
            </SgStack>
          )}
        </SgStack>
      </SgCard>

      <SgConfirmationDialog
        open={confirmReset}
        severity="warning"
        title="Restaurar semana padrao"
        message="A sua semana sera descartada e voltara a valer o padrao da instalacao (ou segunda a sexta). Deseja continuar?"
        confirmButton={{ label: resetting ? "Restaurando..." : "Restaurar", disabled: resetting }}
        cancelButton={{ label: "Cancelar", disabled: resetting }}
        closeOnConfirm={false}
        onConfirm={() => void reset()}
        onCancel={() => setConfirmReset(false)}
      />
    </Shell>
  );
}
