"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgInputNumber,
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
import { MONTH_LABELS, type HolidayEntry } from "@/lib/business-days";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";

type HolidayForm = {
  name: string;
  month: string;
  day: string;
  year: string;
  active: boolean;
};

const EMPTY_FORM: HolidayForm = { name: "", month: "", day: "", year: "", active: true };

const monthSource: SgComboboxSource = MONTH_LABELS.map((label, index) => ({
  id: String(index + 1),
  label,
}));

export default function HolidayEditPage() {
  return (
    <Suspense fallback={<SgSkeleton borderRadius={16} height={420} shape="rectangle" />}>
      <HolidayEditPageContent />
    </Suspense>
  );
}

function HolidayEditPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const holidayId = searchParams.get("publicId");
  const isEditing = Boolean(holidayId);

  const { hasPermission, loading: accessLoading } = useAdminAccess();
  const canCreate = hasPermission(ADMIN_PERMISSIONS.businessDaysCreate);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.businessDaysEdit);
  const canAccessPage = isEditing ? canEdit : canCreate;

  const [loading, setLoading] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [readOnly, setReadOnly] = useState(false);
  const [form, setForm] = useState<HolidayForm>(EMPTY_FORM);

  useEffect(() => {
    if (!holidayId || accessLoading || !canAccessPage) {
      return;
    }

    let cancelled = false;
    async function loadHoliday() {
      setLoading(true);
      try {
        const holiday = await adminProxyClient.get<HolidayEntry>(`/api/business-days/holidays/${holidayId}`);
        if (cancelled) {
          return;
        }
        setReadOnly(!holiday.editable);
        setForm({
          name: holiday.name,
          month: String(holiday.month),
          day: String(holiday.day),
          year: holiday.year == null ? "" : String(holiday.year),
          active: holiday.active,
        });
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(extractApiErrorMessage(error) ?? "Nao foi possivel carregar o feriado.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadHoliday();
    return () => {
      cancelled = true;
    };
  }, [accessLoading, canAccessPage, holidayId]);

  async function submitHoliday() {
    const name = form.name.trim();
    const month = Number.parseInt(form.month, 10);
    const day = Number.parseInt(form.day, 10);
    const year = form.year.trim() === "" ? null : Number.parseInt(form.year, 10);

    if (!name) {
      toast.error("Informe o nome do feriado.");
      return;
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      toast.error("Selecione o mes do feriado.");
      return;
    }
    if (!Number.isInteger(day) || day < 1 || day > 31) {
      toast.error("Informe o dia do feriado (1 a 31).");
      return;
    }
    if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
      toast.error("Informe um ano valido ou deixe o campo vazio para valer todo ano.");
      return;
    }

    setSubmitting(true);
    setStatusMessage(null);
    try {
      const payload = { name, month, day, year, active: form.active };
      if (holidayId) {
        await adminProxyClient.put(`/api/business-days/holidays/${holidayId}`, { body: payload });
      } else {
        await adminProxyClient.post("/api/business-days/holidays", { body: payload });
      }
      router.push(`/dias-uteis/holiday_list?saved=${isEditing ? "updated" : "created"}`);
      router.refresh();
    } catch (error) {
      const message = extractApiErrorMessage(error) ?? "Nao foi possivel salvar o feriado.";
      setStatusMessage(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!accessLoading && !canAccessPage) {
    return (
      <Shell eyebrow="Dias uteis" title="Feriado" description="Acesso controlado por permissao.">
        <SgCard cardStyle="outlined" title="Sem permissao">
          <StatusBadge
            severity="warning"
            value={`Voce nao possui permissao para ${isEditing ? "editar" : "criar"} feriados.`}
          />
        </SgCard>
      </Shell>
    );
  }

  return (
    <Shell
      eyebrow="Dias uteis"
      title={isEditing ? "Editar feriado" : "Novo feriado"}
      description={
        isEditing
          ? "Ajuste a data ou o nome do feriado."
          : "Informe o dia em que a empresa nao tem expediente."
      }
    >
      <SgCard
        cardStyle="outlined"
        title="Dados do feriado"
        description="Deixe o ano vazio para o feriado valer todo ano; informe o ano para uma data especifica (ex.: ponte)."
      >
        <SgStack gap={12}>
          <SgButton
            appearance="ghost"
            label="Voltar para lista"
            leftIcon={<ArrowLeft size={16} />}
            onClick={() => router.push("/dias-uteis/holiday_list")}
            severity="secondary"
          />

          {statusMessage ? <StatusBadge severity="danger" value={statusMessage} /> : null}

          {loading ? (
            <SgSkeleton borderRadius={16} height={320} shape="rectangle" />
          ) : readOnly ? (
            <StatusBadge
              severity="warning"
              value="Este feriado vem do padrao da instalacao e nao pode ser alterado aqui."
            />
          ) : (
            <SgStack gap={16}>
              <SgInputText
                id="holiday-name"
                label="Nome"
                maxLength={120}
                inputProps={{ value: form.name }}
                onChange={(name) => setForm((current) => ({ ...current, name }))}
              />
              <SgCombobox
                id="holiday-month"
                label="Mes"
                placeholder="Selecione o mes"
                source={monthSource}
                value={form.month || null}
                onValueChange={(value) => setForm((current) => ({ ...current, month: value ? String(value) : "" }))}
              />
              <SgInputNumber
                id="holiday-day"
                label="Dia"
                decimals={0}
                minValue={1}
                maxValue={31}
                inputProps={{ value: form.day }}
                onChange={(day) => setForm((current) => ({ ...current, day }))}
              />
              <SgInputNumber
                id="holiday-year"
                label="Ano (vazio = todo ano)"
                decimals={0}
                minValue={1900}
                inputProps={{ value: form.year }}
                onChange={(year) => setForm((current) => ({ ...current, year }))}
              />
              <SgToggleSwitch
                id="holiday-active"
                checked={form.active}
                label="Feriado ativo"
                onChange={(active) => setForm((current) => ({ ...current, active }))}
              />
              <SgButton
                appearance="outline"
                disabled={submitting}
                label={submitting ? "Salvando..." : "Salvar"}
                leftIcon={<Save size={16} />}
                onClick={() => void submitHoliday()}
                severity="secondary"
              />
            </SgStack>
          )}
        </SgStack>
      </SgCard>
    </Shell>
  );
}
