// Regra por tras da tela unica "Calendário da empresa" (`app/dias-uteis/page.tsx`).
//
// Só o jeito da tela vem do calendário do seedgrid-report-client; o dado vem da extension
// `seedgrid-business-days` (/business-days/*), pelo proxy `/api/business-days/*`. Aqui ficam as
// funções puras (grade do mes, contagem, achar o cadastro que explica um dia, montar corpos de
// POST/PUT), para testar sem a tela. Mesmo arquivo em `login-tenancy/frontend`,
// `subdomain-tenancy/frontend` e no display.

import {
  ISO_DAY_BY_NAME,
  type CalendarDay,
  type HolidayEntry,
  type HolidayPayload,
  type WeekDayEntry,
  type WorkOverride,
} from "./business-days";

/** Os tres estados de um dia da semana (e de um dia avulso). Valor = peso enviado a API. */
export const DAY_STATES = [
  { value: "1", label: "Dia todo" },
  { value: "0.5", label: "Meio período" },
  { value: "0", label: "Fechado" },
] as const;

/** Domingo primeiro, como o calendário brasileiro e o do report-client. */
export const SUNDAY_FIRST_INITIALS = ["D", "S", "T", "Q", "Q", "S", "S"] as const;

/** Ordem dos cartões da semana: segunda a domingo (dayOfWeek ISO 1..7). */
export const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 7] as const;

/** Anos oferecidos no seletor: dois para tras e oito para frente do corrente. */
export function selectableYears(current: number): number[] {
  return Array.from({ length: 11 }, (_, index) => current - 2 + index);
}

/** Pesos por dia da semana (chave = dayOfWeek ISO) a partir do perfil devolvido pela API. */
export function weightsFromProfile(days: readonly WeekDayEntry[]): Record<number, string> {
  const weights: Record<number, string> = {};
  for (const day of days) {
    weights[day.dayOfWeek] = String(day.weight);
  }
  return weights;
}

/** Corpo do `PUT /week-profile`: exatamente 7 entradas. Peso ausente conta como fechado. */
export function weekProfilePayload(weights: Record<number, string>): { days: WeekDayEntry[] } {
  return {
    days: WEEK_ORDER.map((dayOfWeek) => ({ dayOfWeek, weight: Number(weights[dayOfWeek] ?? "0") })),
  };
}

function isoParts(iso: string): { year: number; month: number; day: number } {
  return { year: Number(iso.slice(0, 4)), month: Number(iso.slice(5, 7)), day: Number(iso.slice(8, 10)) };
}

/** Dia da semana ISO (1 = segunda ... 7 = domingo) de uma data yyyy-MM-dd, sem fuso. */
export function isoWeekday(iso: string): number {
  const { year, month, day } = isoParts(iso);
  const js = new Date(Date.UTC(year, month - 1, day)).getUTCDay(); // 0 = domingo
  return js === 0 ? 7 : js;
}

/**
 * Células do mini-mes (domingo primeiro): brancos antes do dia 1 e depois o mes inteiro.
 * `null` = buraco. Não completa a última semana (a grade CSS fecha sozinha).
 */
export function monthCells(days: readonly CalendarDay[]): Array<CalendarDay | null> {
  if (days.length === 0) return [];
  const leading = isoWeekday(days[0].date) % 7; // domingo (7) -> 0 buracos
  return [...Array.from({ length: leading }, () => null), ...days];
}

/** Dias úteis do mes, contando meio período como 0,5 (uma semana com sábado até o meio-dia vale 5,5). */
export function monthBusinessDays(days: readonly CalendarDay[]): number {
  return days.reduce((total, day) => total + (day.businessDay ? day.weight : 0), 0);
}

export function yearBusinessDays(months: ReadonlyArray<readonly CalendarDay[]>): number {
  return months.reduce((total, days) => total + monthBusinessDays(days), 0);
}

/** "21", "5,5" (pt-BR, até uma casa). */
export function formatBusinessDays(value: number): string {
  return value.toLocaleString("pt-BR", { maximumFractionDigits: 1 });
}

export type DayVisual = "worked-holiday" | "holiday" | "movable" | "half" | "closed" | "open";

/** Como a célula do dia e' desenhada; o feriado de cadastro (empresa, conta, nacional, estadual) e o móvel diferem. */
export function dayVisual(day: CalendarDay): DayVisual {
  if (day.worksOnHoliday) return "worked-holiday";
  if (day.holiday) return day.holidaySource === "MOVABLE" ? "movable" : "holiday";
  if (!day.businessDay) return "closed";
  return day.weight < 1 ? "half" : "open";
}

/** O que a tela mostra no tooltip e no diálogo: por que o dia esta como esta. */
export function dayReason(day: CalendarDay): string {
  switch (dayVisual(day)) {
    case "worked-holiday":
      return `${day.holidayName ?? "Feriado"} - a empresa abre neste dia`;
    case "holiday":
    case "movable":
      return day.holidayName ?? "Feriado";
    case "closed":
      return "A empresa não abre neste dia";
    case "half":
      return "Meio período";
    default:
      return "Dia todo";
  }
}

/** Feriado cadastrado (empresa ou conta) que cai no dia; o da empresa vence o da conta. */
export function findRegisteredHoliday(day: CalendarDay, holidays: readonly HolidayEntry[]): HolidayEntry | null {
  const { year, month, day: dom } = isoParts(day.date);
  const matches = holidays.filter(
    (holiday) =>
      holiday.active && holiday.month === month && holiday.day === dom && (holiday.year == null || holiday.year === year),
  );
  return matches.find((holiday) => !holiday.global) ?? matches[0] ?? null;
}

/** Exceção "vai trabalhar" (ou peso proprio) do dia. */
export function findOverride(day: CalendarDay, overrides: readonly WorkOverride[]): WorkOverride | null {
  return overrides.find((override) => override.active && override.date === day.date) ?? null;
}

/** Valida e monta o corpo do `POST/PUT /holidays` a partir do dia clicado. */
export function buildHolidayFromDay(form: {
  date: string;
  name: string;
  recurring: boolean;
}): { payload: HolidayPayload } | { error: string } {
  const name = form.name.trim();
  if (!name) return { error: "Informe o nome do feriado." };
  if (name.length > 120) return { error: "O nome do feriado aceita até 120 caracteres." };
  const { year, month, day } = isoParts(form.date);
  return { payload: { name, month, day, year: form.recurring ? null : year, active: true } };
}

/** Nome do dia da semana (pt-BR) de uma data, para o titulo do dialogo. */
export function weekdayName(iso: string, labels: readonly string[]): string {
  return labels[isoWeekday(iso)] ?? "";
}

/** `dayOfWeek` da API (MONDAY...) como número ISO; 0 se desconhecido. */
export function isoDayOfName(name: string): number {
  return ISO_DAY_BY_NAME[name] ?? 0;
}

export type DayPermissions = { create: boolean; update: boolean; delete: boolean };

export type DayActions = {
  /** Editar nome/recorrencia do feriado cadastrado (só UPDATE). */
  saveHoliday: boolean;
  /** Excluir o feriado cadastrado (só DELETE). */
  deleteHoliday: boolean;
  /** Cadastrar feriado num dia comum (só CREATE). */
  addHoliday: boolean;
  /** Abrir, fechar ou meio período só neste dia (só CREATE). */
  applyOverride: boolean;
  /** Remover a exceção do dia (só DELETE). */
  removeOverride: boolean;
  /** Há alguma ação possível? Sem nenhuma, o dia não abre dialogo. */
  any: boolean;
};

/** O que o perfil pode fazer num dia: cada ação depende de UMA permissão (feriado/excecao global ou da conta e' só leitura). */
export function dayActions(
  day: CalendarDay,
  holiday: HolidayEntry | null,
  override: WorkOverride | null,
  permissions: DayPermissions,
): DayActions {
  const holidayWritable = holiday !== null && holiday.editable;
  const saveHoliday = holidayWritable && permissions.update;
  const deleteHoliday = holidayWritable && permissions.delete;
  const addHoliday = holiday === null && !day.holiday && override === null && permissions.create;
  const applyOverride = override === null && permissions.create;
  const removeOverride = override !== null && override.editable && permissions.delete;
  return {
    saveHoliday,
    deleteHoliday,
    addHoliday,
    applyOverride,
    removeOverride,
    any: saveHoliday || deleteHoliday || addHoliday || applyOverride || removeOverride,
  };
}
