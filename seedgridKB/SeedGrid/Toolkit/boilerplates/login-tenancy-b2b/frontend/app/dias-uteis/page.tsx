"use client";

import {
  SgButton,
  SgCard,
  SgCombobox,
  SgConfirmationDialog,
  SgDialog,
  SgInputText,
  SgRadioGroup,
  SgSkeleton,
  SgStack,
  SgToggleSwitch,
  toast,
  type SgComboboxSource,
} from "@seedgrid/fe-components";
import { CalendarDays, Save, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";

import { useRouter } from "next/navigation";

import { Shell } from "../components/Shell";
import { StatusBadge } from "../components/StatusBadge";
import { useAdminAccess } from "../components/AdminAccessProvider";
import { ListLoadError } from "@/components/ui/list-load-error";
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions";
import {
  MONTH_LABELS,
  WEEKDAY_LABELS,
  buildMovablePayload,
  buildWorkOverridePayload,
  canEditMovable,
  canInheritMovable,
  formatIsoDate,
  holidaySourceLabel,
  mapDayResponse,
  movableOriginLabel,
  weightLabel,
  type CalendarDay,
  type CalendarMonthResponse,
  type HolidayEntry,
  type MovableHoliday,
  type WeekProfile,
  type WorkOverride,
} from "@/lib/business-days";
import {
  DAY_STATES,
  SUNDAY_FIRST_INITIALS,
  WEEK_ORDER,
  buildHolidayFromDay,
  dayActions,
  dayReason,
  dayVisual,
  findOverride,
  findRegisteredHoliday,
  formatBusinessDays,
  monthBusinessDays,
  monthCells,
  selectableYears,
  weekProfilePayload,
  weekdayName,
  weightsFromProfile,
  yearBusinessDays,
  type DayActions,
  type DayVisual,
} from "@/lib/company-calendar";
import { requestSelectCompany } from "@/lib/company-selection";
import { adminProxyClient, extractApiErrorMessage } from "@/lib/core";
import { parseMyCompanies, shouldShowCompanySelector, toCompanyOptions, type MyCompany } from "@/lib/my-companies";

const BASE = "/api/business-days";
const CURRENT_YEAR = new Date().getFullYear();
const YEARS: SgComboboxSource = selectableYears(CURRENT_YEAR).map((year) => ({
  id: String(year),
  label: String(year),
}));
const STATE_SOURCE = DAY_STATES.map((state) => ({ label: state.label, value: state.value }));

// Fundos translucidos: leem bem nos temas claro e escuro sem depender de tokens do tema.
const BORDER = "1px solid var(--sg-border, rgba(148, 163, 184, 0.35))";
const VISUAL_STYLE: Record<DayVisual, CSSProperties> = {
  open: { background: "transparent" },
  half: { background: "rgba(245, 158, 11, 0.20)" },
  closed: { background: "rgba(148, 163, 184, 0.22)", opacity: 0.8 },
  holiday: { background: "rgba(239, 68, 68, 0.18)", border: "1px solid rgba(239, 68, 68, 0.55)" },
  movable: { background: "rgba(239, 68, 68, 0.08)", border: "1px dashed rgba(239, 68, 68, 0.55)" },
  "worked-holiday": { background: "rgba(139, 92, 246, 0.22)", border: "1px solid rgba(139, 92, 246, 0.55)" },
};

export default function CompanyCalendarPage() {
  const router = useRouter();
  const { hasPermission, loading: accessLoading, currentCompany, refresh } = useAdminAccess();
  const canView = hasPermission(ADMIN_PERMISSIONS.businessDaysView);
  const canCreate = hasPermission(ADMIN_PERMISSIONS.businessDaysCreate);
  const canEdit = hasPermission(ADMIN_PERMISSIONS.businessDaysEdit);
  const canDelete = hasPermission(ADMIN_PERMISSIONS.businessDaysDelete);

  const [year, setYear] = useState(CURRENT_YEAR);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [months, setMonths] = useState<CalendarDay[][]>([]);
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [overrides, setOverrides] = useState<WorkOverride[]>([]);
  const [profile, setProfile] = useState<WeekProfile | null>(null);
  const [weights, setWeights] = useState<Record<number, string>>({});
  const [movables, setMovables] = useState<MovableHoliday[]>([]);
  const [showMovables, setShowMovables] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [selected, setSelected] = useState<CalendarDay | null>(null);
  const loadSeq = useRef(0);
  const [companies, setCompanies] = useState<MyCompany[]>([]);
  const [switching, setSwitching] = useState(false);

  // O seletor só' existe com mais de uma empresa; trocar usa a mesma troca de sessao do CompanyAccessBar.
  useEffect(() => {
    if (accessLoading) return;
    const controller = new AbortController();
    void (async () => {
      try {
        const response = await fetch("/api/me/companies", { cache: "no-store", signal: controller.signal });
        if (response.ok) setCompanies(parseMyCompanies(await response.json()));
      } catch {
        // sem a lista, a tela segue só' com a empresa corrente
      }
    })();
    return () => controller.abort();
  }, [accessLoading, currentCompany?.publicId]);

  async function selectCompany(companyPublicId: string) {
    if (switching || !companyPublicId || companyPublicId === currentCompany?.publicId) return;
    setSwitching(true);
    try {
      const result = await requestSelectCompany(companyPublicId);
      if (result.ok) {
        refresh();
        router.refresh();
        window.location.reload();
        return;
      }
      if (result.sessionLost) {
        router.replace("/login?expired=1");
        return;
      }
      toast.error(result.message);
    } finally {
      setSwitching(false);
    }
  }

  const load = useCallback(async () => {
    const seq = ++loadSeq.current;
    setLoading(true);
    setLoadError(null);
    try {
      const [monthResults, holidayList, overrideList, weekProfile, movableList] = await Promise.all([
        Promise.all(
          Array.from({ length: 12 }, (_, index) =>
            adminProxyClient.get<CalendarMonthResponse>(`${BASE}/calendar?year=${year}&month=${index + 1}`),
          ),
        ),
        adminProxyClient.get<HolidayEntry[]>(`${BASE}/holidays?year=${year}`),
        adminProxyClient.get<WorkOverride[]>(`${BASE}/work-overrides?year=${year}`),
        adminProxyClient.get<WeekProfile>(`${BASE}/week-profile`),
        adminProxyClient.get<MovableHoliday[]>(`${BASE}/movable-holidays`),
      ]);
      if (seq !== loadSeq.current) return; // chegou depois de trocar o ano
      setMonths(monthResults.map((month) => month.days.map(mapDayResponse)));
      setHolidays(holidayList);
      setOverrides(overrideList);
      setProfile(weekProfile);
      setWeights(weightsFromProfile(weekProfile.days));
      setMovables(movableList);
    } catch (error) {
      if (seq === loadSeq.current) setLoadError(error);
    } finally {
      if (seq === loadSeq.current) setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    if (accessLoading || !canView) return;
    void load();
  }, [accessLoading, canView, load]);

  const savedWeights = useMemo(() => (profile ? weightsFromProfile(profile.days) : {}), [profile]);
  const weekChanged = useMemo(
    () => WEEK_ORDER.some((day) => (weights[day] ?? "0") !== (savedWeights[day] ?? "0")),
    [weights, savedWeights],
  );
  const permissions = useMemo(() => ({ create: canCreate, update: canEdit, delete: canDelete }), [canCreate, canEdit, canDelete]);
  const canOpenDay = useCallback(
    (day: CalendarDay) =>
      dayActions(day, findRegisteredHoliday(day, holidays), findOverride(day, overrides), permissions).any,
    [holidays, overrides, permissions],
  );
  const total = useMemo(() => yearBusinessDays(months), [months]);

  async function saveWeek() {
    setSaving(true);
    try {
      await adminProxyClient.put(`${BASE}/week-profile`, { body: weekProfilePayload(weights) });
      toast.success("Semana da empresa salva.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Não foi possível salvar a semana da empresa.");
    } finally {
      // Sempre recarrega: se algo falhou no meio, a tela mostra o que de fato ficou gravado.
      setSaving(false);
      await load();
    }
  }

  async function resetWeek() {
    try {
      await adminProxyClient.delete(`${BASE}/week-profile`);
      toast.success("Semana padrão restaurada.");
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Não foi possível restaurar a semana padrão.");
    } finally {
      setResetting(false);
      await load();
    }
  }

  async function setMovable(movable: MovableHoliday, enabled: boolean | null) {
    try {
      const updated = await adminProxyClient.put<MovableHoliday[]>(`${BASE}/movable-holidays`, {
        body: buildMovablePayload(movable.code, enabled),
      });
      setMovables(updated);
      await load();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Não foi possível alterar o feriado móvel.");
    }
  }

  const companyPicker = shouldShowCompanySelector(companies) ? (
    <SgCombobox
      id="calendar-company"
      label="Empresa"
      width={280}
      source={toCompanyOptions(companies)}
      value={currentCompany?.publicId ?? null}
      onValueChange={(value) => void selectCompany(value ? String(value) : "")}
    />
  ) : (
    <SgStack gap={4}>
      <span style={{ fontSize: 12, opacity: 0.7 }}>Empresa</span>
      <strong>{currentCompany?.name ?? "Empresa selecionada"}</strong>
    </SgStack>
  );

  if (!accessLoading && !canView) {
    return (
      <Shell eyebrow="Dias úteis" title="Calendário da empresa" description="Acesso controlado por permissão.">
        <SgStack gap={16}>
          {shouldShowCompanySelector(companies) ? <SgCard cardStyle="outlined">{companyPicker}</SgCard> : null}
          <SgCard cardStyle="outlined" title="Sem permissão">
            <StatusBadge severity="warning" value="Você não possui permissão para visualizar o calendário desta empresa." />
          </SgCard>
        </SgStack>
      </Shell>
    );
  }

  const sourceText =
    profile?.source === "COMPANY"
      ? "Semana definida para esta empresa."
      : profile?.source === "GLOBAL"
        ? "Semana herdada da conta. Salvar cria a semana própria desta empresa."
        : "Semana padrão (segunda a sexta). Salvar cria a semana própria desta empresa.";
  const dialogActions = selected
    ? dayActions(selected, findRegisteredHoliday(selected, holidays), findOverride(selected, overrides), permissions)
    : null;

  return (
    <Shell
      eyebrow="Dias úteis"
      title="Calendário da empresa"
      description="Os dias que a empresa trabalha: a semana, os feriados e as exceções do ano, num lugar só."
    >
      <SgStack gap={16}>
        <SgCard cardStyle="outlined">
          <SgStack align="end" direction="row" gap={12} justify="between" wrap>
            {companyPicker}
            <SgStack align="end" direction="row" gap={12} wrap>
              <SgCombobox
                id="calendar-year"
                label="Ano"
                width={120}
                source={YEARS}
                value={String(year)}
                onValueChange={(value) => setYear(Number(value) || CURRENT_YEAR)}
              />
              {canEdit ? (
                <SgButton
                  appearance="outline"
                  enabled={weekChanged && !saving && !loading}
                  label={saving ? "Salvando..." : "Salvar"}
                  leftIcon={<Save size={16} />}
                  onClick={() => void saveWeek()}
                  severity="secondary"
                  size="md"
                  style={{ height: 44 }}
                />
              ) : null}
            </SgStack>
          </SgStack>
          {!canEdit ? (
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Você tem acesso apenas para consulta: o calendário não pode ser alterado.
            </p>
          ) : null}
        </SgCard>

        <ListLoadError error={loadError} onRetry={() => void load()} />

        {loadError ? null : (
          <>
            <SgCard
              cardStyle="outlined"
              title="A semana da empresa"
              description="Meio período vale metade de um dia útil: uma semana com sábado até o meio-dia vale 5,5, e não 6."
            >
              <SgStack gap={12}>
                {profile ? <p style={{ fontSize: 13, opacity: 0.8, overflowWrap: "anywhere" }}>{sourceText}</p> : null}
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(230px, 1fr))" }}>
                  {WEEK_ORDER.map((dayOfWeek) => (
                    <div
                      key={dayOfWeek}
                      style={{ border: BORDER, borderRadius: 8, padding: 8, display: "flex", flexDirection: "column", gap: 4 }}
                    >
                      <span style={{ fontSize: 13, fontWeight: 600 }}>{WEEKDAY_LABELS[dayOfWeek]}</span>
                      <SgRadioGroup
                        id={`week-day-${dayOfWeek}`}
                        source={STATE_SOURCE}
                        orientation="horizontal"
                        value={weights[dayOfWeek] ?? "0"}
                        enabled={canEdit && !saving && !loading}
                        onChange={(value) => {
                          if (value == null) return;
                          setWeights((current) => ({ ...current, [dayOfWeek]: String(value) }));
                        }}
                      />
                    </div>
                  ))}
                </div>
                {canEdit && profile?.source === "COMPANY" ? (
                  <div>
                    <SgButton
                      appearance="ghost"
                      label="Voltar à semana padrão"
                      onClick={() => setResetting(true)}
                      severity="secondary"
                    />
                  </div>
                ) : null}
              </SgStack>
            </SgCard>

            <SgStack align="center" direction="row" gap={16} wrap style={{ fontSize: 12 }}>
              <Legend visual="holiday" label="Feriado do cadastro" />
              <Legend visual="movable" label="Feriado móvel (calculado)" />
              <Legend visual="worked-holiday" label="Feriado em que a empresa abre" />
              <Legend visual="half" label="Meio período" />
              <Legend visual="closed" label="A empresa não abre" />
              <span style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 600 }}>
                <CalendarDays aria-hidden size={14} />
                {formatBusinessDays(total)} dias úteis em {year}
              </span>
            </SgStack>

            {loading && months.length === 0 ? (
              <SgSkeleton borderRadius={16} height={420} shape="rectangle" />
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {months.map((days, index) => (
                  <MonthCard key={MONTH_LABELS[index]} days={days} label={MONTH_LABELS[index]} canOpen={canOpenDay} onPick={setSelected} />
                ))}
              </div>
            )}

            <SgCard cardStyle="outlined" title="Feriados móveis desta empresa">
              <SgStack gap={12}>
                <div>
                  <SgButton
                    appearance="ghost"
                    label={showMovables ? "Ocultar" : "Ver e alterar"}
                    onClick={() => setShowMovables((current) => !current)}
                    severity="secondary"
                  />
                </div>
                {showMovables ? (
                  <SgStack gap={8}>
                    <p style={{ fontSize: 12, opacity: 0.7 }}>
                      Carnaval, Sexta-feira Santa e Corpus Christi são feriado por padrão. Desmarque para a empresa
                      trabalhar nesses dias, todo ano, até voltar a herdar.
                    </p>
                    {movables.map((movable) => (
                      <SgStack key={movable.code} align="center" direction="row" gap={12} wrap>
                        <SgToggleSwitch
                          id={`movable-${movable.code}`}
                          label={movable.name}
                          checked={movable.enabled}
                          enabled={canEditMovable(canEdit)}
                          onChange={(checked) => void setMovable(movable, checked)}
                        />
                        <span style={{ fontSize: 12, opacity: 0.7 }}>{movableOriginLabel(movable.origin)}</span>
                        {canEditMovable(canEdit) && canInheritMovable(movable) ? (
                          <SgButton
                            appearance="ghost"
                            label="Voltar a herdar"
                            onClick={() => void setMovable(movable, null)}
                            severity="secondary"
                            size="sm"
                          />
                        ) : null}
                      </SgStack>
                    ))}
                  </SgStack>
                ) : null}
              </SgStack>
            </SgCard>
          </>
        )}
      </SgStack>

      <DayDialog
        key={selected?.date ?? "none"}
        day={selected}
        holiday={selected ? findRegisteredHoliday(selected, holidays) : null}
        override={selected ? findOverride(selected, overrides) : null}
        actions={dialogActions}
        onClose={() => setSelected(null)}
        onChanged={async () => {
          setSelected(null);
          await load();
        }}
      />

      <SgConfirmationDialog
        open={resetting}
        severity="danger"
        title="Voltar à semana padrão"
        message="A empresa volta a usar a semana da conta (ou segunda a sexta). Os feriados e as exceções do ano não mudam."
        confirmButton={{ label: "Restaurar", severity: "danger" }}
        cancelButton={{ label: "Cancelar" }}
        onConfirm={() => void resetWeek()}
        onCancel={() => setResetting(false)}
      />
    </Shell>
  );
}

function Legend({ visual, label }: Readonly<{ visual: DayVisual; label: string }>) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
      <span
        aria-hidden
        style={{ width: 14, height: 14, borderRadius: 4, border: BORDER, ...VISUAL_STYLE[visual] }}
      />
      {label}
    </span>
  );
}

function MonthCard({
  days,
  label,
  canOpen,
  onPick,
}: Readonly<{ days: CalendarDay[]; label: string; canOpen: (day: CalendarDay) => boolean; onPick: (day: CalendarDay) => void }>) {
  const cells = monthCells(days);
  const holidaysOfMonth = days.filter((day) => day.holiday && day.holidayName);
  return (
    <div style={{ border: BORDER, borderRadius: 8, padding: 12, display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <strong style={{ fontSize: 14 }}>{label}</strong>
        <span style={{ fontSize: 11, opacity: 0.6 }}>{formatBusinessDays(monthBusinessDays(days))} dias úteis</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, textAlign: "center", fontSize: 11, opacity: 0.6 }}>
        {SUNDAY_FIRST_INITIALS.map((initial, position) => (
          <span key={`${initial}-${position}`}>{initial}</span>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, marginTop: 3 }}>
        {cells.map((day, position) =>
          day ? (
            // <button> cru: não há componente SeedGrid de célula de calendário (SgButton traz padding,
            // altura e borda de botao, o que desmancharia a grade de 7 colunas).
            <button
              key={day.date}
              type="button"
              aria-label={`${Number(day.date.slice(8, 10))} de ${label}: ${dayReason(day)}`}
              title={`${formatIsoDate(day.date)} - ${dayReason(day)}`}
              onClick={canOpen(day) ? () => onPick(day) : undefined}
              style={{
                height: 32,
                borderRadius: 6,
                border: BORDER,
                cursor: canOpen(day) ? "pointer" : "default",
                fontSize: 12,
                color: "inherit",
                ...VISUAL_STYLE[dayVisual(day)],
              }}
            >
              {Number(day.date.slice(8, 10))}
            </button>
          ) : (
            <span key={`blank-${position}`} style={{ height: 32 }} />
          ),
        )}
      </div>
      {holidaysOfMonth.length > 0 ? (
        <ul style={{ marginTop: 8, borderTop: BORDER, paddingTop: 8, fontSize: 11, lineHeight: 1.6, listStyle: "none" }}>
          {holidaysOfMonth.map((day) => (
            <li
              key={day.date}
              style={{ display: "flex", gap: 4, fontStyle: day.holidaySource === "MOVABLE" ? "italic" : "normal" }}
            >
              <span style={{ fontWeight: 600 }}>{Number(day.date.slice(8, 10))}</span>
              <span style={{ opacity: 0.5 }}>-</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{day.holidayName}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type DayDialogProps = {
  day: CalendarDay | null;
  holiday: HolidayEntry | null;
  override: WorkOverride | null;
  actions: DayActions | null;
  onClose: () => void;
  onChanged: () => Promise<void>;
};

/** Tudo o que se faz num dia: cadastrar/editar/excluir feriado e abrir, fechar ou meio período só naquele dia. */
function DayDialog({ day, holiday, override, actions, onClose, onChanged }: Readonly<DayDialogProps>) {
  const [name, setName] = useState(holiday?.name ?? "");
  const [recurring, setRecurring] = useState(holiday ? holiday.recurring : true);
  const [state, setState] = useState(day ? String(day.weight) : "1");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<"holiday" | "override" | null>(null);

  if (!day || !actions) {
    return null;
  }

  const isHolidayDay = day.holiday;

  async function run(action: () => Promise<unknown>, okMessage: string) {
    setBusy(true);
    try {
      await action();
      toast.success(okMessage);
      await onChanged();
    } catch (error) {
      toast.error(extractApiErrorMessage(error) ?? "Não foi possível concluir a alteração.");
    } finally {
      setBusy(false);
      setConfirmDelete(null);
    }
  }

  function saveHoliday() {
    const built = buildHolidayFromDay({ date: day!.date, name, recurring });
    if ("error" in built) {
      toast.error(built.error);
      return;
    }
    void run(
      () =>
        holiday
          ? adminProxyClient.put(`${BASE}/holidays/${holiday.id}`, { body: built.payload })
          : adminProxyClient.post(`${BASE}/holidays`, { body: built.payload }),
      holiday ? "Feriado atualizado." : "Feriado cadastrado.",
    );
  }

  function applyOverride() {
    const built = buildWorkOverridePayload({ date: day!.date, weight: state, reason, active: true });
    if ("error" in built) {
      toast.error(built.error);
      return;
    }
    void run(() => adminProxyClient.post(`${BASE}/work-overrides`, { body: built.payload }), "Exceção registrada.");
  }

  const stateOptions = isHolidayDay ? STATE_SOURCE.filter((option) => option.value !== "0") : STATE_SOURCE;
  const sameAsToday = !isHolidayDay && Number(state) === day.weight;
  const source = day.holiday ? holidaySourceLabel(day.holidaySource) : null;

  return (
    <>
      <SgDialog
        open
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        size="md"
        title={`${weekdayName(day.date, WEEKDAY_LABELS)}, ${formatIsoDate(day.date)}`}
      >
        <SgStack gap={16}>
          <StatusBadge severity={day.holiday && !day.worksOnHoliday ? "warning" : "info"} value={dayReason(day)} />
          {source ? (
            <p style={{ fontSize: 12, opacity: 0.75 }}>
              Origem: {source}
              {day.legalBasis ? ` - ${day.legalBasis}` : ""}
            </p>
          ) : null}

          {holiday ? (
            <SgStack gap={8}>
              <strong style={{ fontSize: 13 }}>Feriado cadastrado</strong>
              {actions.saveHoliday ? (
                <>
                  <SgInputText
                    id="holiday-name"
                    label="Nome do feriado"
                    maxLength={120}
                    inputProps={{ value: name }}
                    onChange={setName}
                  />
                  <SgToggleSwitch id="holiday-recurring" label="Repete todo ano" checked={recurring} onChange={setRecurring} />
                  <SgStack align="center" direction="row" gap={8}>
                    <SgButton
                      appearance="outline"
                      enabled={!busy}
                      label="Salvar feriado"
                      leftIcon={<Save size={16} />}
                      onClick={saveHoliday}
                      severity="secondary"
                    />
                  </SgStack>
                </>
              ) : (
                <p style={{ fontSize: 12, opacity: 0.75 }}>
                  {holiday.global ? "Feriado da conta: vale para todas as empresas e só se altera na conta." : holiday.name}
                </p>
              )}
              {actions.deleteHoliday ? (
                <div>
                  <SgButton
                    appearance="ghost"
                    aria-label={`Excluir ${holiday.name}`}
                    title={`Excluir ${holiday.name}`}
                    enabled={!busy}
                    iconOnly
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => setConfirmDelete("holiday")}
                    severity="danger"
                  />
                </div>
              ) : null}
            </SgStack>
          ) : actions.addHoliday ? (
            <SgStack gap={8}>
              <strong style={{ fontSize: 13 }}>Cadastrar feriado neste dia</strong>
              <SgInputText
                id="holiday-name"
                label="Nome do feriado"
                maxLength={120}
                inputProps={{ value: name }}
                onChange={setName}
              />
              <SgToggleSwitch id="holiday-recurring" label="Repete todo ano" checked={recurring} onChange={setRecurring} />
              <div>
                <SgButton
                  appearance="outline"
                  enabled={!busy}
                  label="Adicionar feriado"
                  onClick={saveHoliday}
                  severity="secondary"
                />
              </div>
            </SgStack>
          ) : null}

          {override ? (
            <SgStack gap={8}>
              <strong style={{ fontSize: 13 }}>Exceção neste dia</strong>
              <p style={{ fontSize: 12, opacity: 0.75 }}>
                {override.weight == null ? "Peso do dia da semana" : weightLabel(override.weight)}
                {override.reason ? ` - ${override.reason}` : ""}
              </p>
              {actions.removeOverride ? (
                <div>
                  <SgButton
                    appearance="outline"
                    enabled={!busy}
                    label="Remover exceção"
                    leftIcon={<Trash2 size={16} />}
                    onClick={() => setConfirmDelete("override")}
                    severity="danger"
                  />
                </div>
              ) : null}
            </SgStack>
          ) : actions.applyOverride ? (
            <SgStack gap={8}>
              <strong style={{ fontSize: 13 }}>{isHolidayDay ? "A empresa abre neste dia" : "Somente neste dia"}</strong>
              <SgRadioGroup
                id="day-state"
                source={stateOptions}
                orientation="horizontal"
                value={state}
                onChange={(value) => value != null && setState(String(value))}
              />
              <SgInputText id="day-reason" label="Motivo (opcional)" maxLength={200} inputProps={{ value: reason }} onChange={setReason} />
              <div>
                <SgButton
                  appearance="outline"
                  enabled={!busy && !sameAsToday}
                  label="Aplicar neste dia"
                  onClick={applyOverride}
                  severity="secondary"
                />
              </div>
            </SgStack>
          ) : null}
        </SgStack>
      </SgDialog>

      <SgConfirmationDialog
        open={confirmDelete !== null}
        severity="danger"
        title={confirmDelete === "holiday" ? "Excluir feriado" : "Remover exceção"}
        message={
          confirmDelete === "holiday"
            ? `Tem certeza que deseja excluir o feriado "${holiday?.name ?? ""}"? Esta ação não pode ser desfeita.`
            : "O dia volta a seguir a semana e os feriados. Esta ação não pode ser desfeita."
        }
        confirmButton={{ label: busy ? "Excluindo..." : "Excluir", severity: "danger", enabled: !busy }}
        cancelButton={{ label: "Cancelar", enabled: !busy }}
        closeOnConfirm={false}
        onConfirm={() =>
          void run(
            () =>
              confirmDelete === "holiday"
                ? adminProxyClient.delete(`${BASE}/holidays/${holiday!.id}`)
                : adminProxyClient.delete(`${BASE}/work-overrides/${override!.id}`),
            confirmDelete === "holiday" ? "Feriado excluído." : "Exceção removida.",
          )
        }
        onCancel={() => setConfirmDelete(null)}
      />
    </>
  );
}
