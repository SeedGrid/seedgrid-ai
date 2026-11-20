// Contrato da API de dias úteis (`seedgrid-business-days`, rotas em `/business-days/*`) como o front
// a consome via `/api/business-days/*`. Mesmo arquivo em `login-tenancy/frontend` e
// `subdomain-tenancy/frontend` (mantenha os dois iguais).

export type HolidayEntry = {
  id: string;
  name: string;
  month: number;
  day: number;
  /** Nulo = recorrente (todo ano nesse dia/mes). */
  year: number | null;
  recurring: boolean;
  /** Feriado sem empresa: vale para todos. */
  global: boolean;
  /** O escopo corrente pode alterar/excluir. Feriado global e' só' leitura para quem tem empresa. */
  editable: boolean;
  active: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

/** Corpo do `POST/PUT /holidays`. `year` nulo = recorrente. */
export type HolidayPayload = {
  name: string;
  month: number;
  day: number;
  year: number | null;
  active: boolean;
};

export type WeekDayEntry = {
  /** 1 = segunda ... 7 = domingo. */
  dayOfWeek: number;
  /** 1 = dia inteiro, 0.5 = meio período, 0 = fechado. */
  weight: number;
};

export type WeekProfileSource = "COMPANY" | "GLOBAL" | "DEFAULT";

export type WeekProfile = {
  source: WeekProfileSource;
  days: WeekDayEntry[];
};

/** Quem decidiu que o dia e' feriado (resolucao: empresa > tenant > estadual/nacional/movel). */
export type HolidaySource = "COMPANY" | "TENANT" | "STATE" | "NATIONAL" | "MOVABLE";

/** Resposta crua de `/calendar` e `/check` (campos novos podem faltar em backend antigo). */
export type DayResponse = {
  date: string;
  dayOfWeek: string;
  weight: number;
  businessDay: boolean;
  holiday: boolean;
  holidayName?: string | null;
  holidaySource?: HolidaySource | null;
  worksOnHoliday?: boolean | null;
  legalBasis?: string | null;
};

export type CalendarDay = {
  /** yyyy-MM-dd */
  date: string;
  dayOfWeek: string;
  weight: number;
  businessDay: boolean;
  holiday: boolean;
  holidayName: string | null;
  holidaySource: HolidaySource | null;
  /** Feriado em que a empresa trabalha ("vai trabalhar"). */
  worksOnHoliday: boolean;
  legalBasis: string | null;
};

/** Resposta crua de `GET /calendar` (use `mapDayResponse` em cada dia). */
export type CalendarMonthResponse = {
  year: number;
  month: number;
  days: DayResponse[];
};

export type CalendarMonth = {
  year: number;
  month: number;
  days: CalendarDay[];
};

export const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

/** Indice = `dayOfWeek` ISO (1 = segunda). A posicao 0 não e' usada. */
export const WEEKDAY_LABELS = [
  "",
  "Segunda-feira",
  "Terca-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado",
  "Domingo",
] as const;

export const WEEKDAY_SHORT_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"] as const;

/** Nome do `java.time.DayOfWeek` (como a API devolve no calendário) -> número ISO. */
export const ISO_DAY_BY_NAME: Record<string, number> = {
  MONDAY: 1,
  TUESDAY: 2,
  WEDNESDAY: 3,
  THURSDAY: 4,
  FRIDAY: 5,
  SATURDAY: 6,
  SUNDAY: 7,
};

export const WEIGHT_OPTIONS = [
  { id: "1", label: "Dia inteiro" },
  { id: "0.5", label: "Meio período" },
  { id: "0", label: "Fechado" },
] as const;

export function weightLabel(weight: number): string {
  if (weight >= 1) return "Dia inteiro";
  if (weight <= 0) return "Fechado";
  if (weight === 0.5) return "Meio período";
  return `${Math.round(weight * 100)}% do dia`;
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

/** "25/12" para feriado recorrente, "16/02/2026" para o de um ano. */
export function formatHolidayDate(holiday: Pick<HolidayEntry, "day" | "month" | "year">): string {
  const base = `${pad2(holiday.day)}/${pad2(holiday.month)}`;
  return holiday.year == null ? base : `${base}/${holiday.year}`;
}

// ---------------------------------------------------------------------------------------------
// Feriados prontos, móveis e "vai trabalhar" (extension business-days, T8.5)
// ---------------------------------------------------------------------------------------------

export const HOLIDAY_SOURCE_LABELS: Record<HolidaySource, string> = {
  COMPANY: "Empresa",
  TENANT: "Conta",
  STATE: "Estadual",
  NATIONAL: "Nacional",
  MOVABLE: "Móvel",
};

/** Rotulo do selo de origem; ausente devolve null (não inventa selo) e desconhecido volta como veio. */
export function holidaySourceLabel(source: string | null | undefined): string | null {
  if (!source) return null;
  return HOLIDAY_SOURCE_LABELS[source as HolidaySource] ?? source;
}

export type MovableHolidayCode = "CARNIVAL" | "GOOD_FRIDAY" | "CORPUS_CHRISTI";
export type MovableOrigin = "COMPANY" | "TENANT" | "DEFAULT";

export const MOVABLE_CODES: readonly MovableHolidayCode[] = ["CARNIVAL", "GOOD_FRIDAY", "CORPUS_CHRISTI"];

export type MovableHoliday = {
  code: MovableHolidayCode;
  name: string;
  enabled: boolean;
  origin: MovableOrigin;
  legalBasis: string | null;
};

/** Item de `GET /holidays/reference` (somente leitura). */
export type ReferenceHoliday = {
  code: string;
  name: string;
  /** yyyy-MM-dd */
  date: string;
  source: "NATIONAL" | "STATE" | "MOVABLE";
  legalBasis: string | null;
  /** `false` só' num móvel desmarcado. */
  enabled: boolean;
  uf: string | null;
};

export type WorkOverride = {
  id: string;
  /** yyyy-MM-dd */
  date: string;
  /** Nulo = peso do dia da semana. */
  weight: number | null;
  reason: string | null;
  global: boolean;
  editable: boolean;
  active: boolean;
};

export type WorkOverridePayload = {
  date: string;
  weight: number | null;
  reason: string;
  active: boolean;
};

export const MOVABLE_ORIGIN_LABELS: Record<MovableOrigin, string> = {
  COMPANY: "Empresa",
  TENANT: "Conta (tenant)",
  DEFAULT: "Padrão",
};

export function movableOriginLabel(origin: string | null | undefined): string {
  if (!origin) return MOVABLE_ORIGIN_LABELS.DEFAULT;
  return MOVABLE_ORIGIN_LABELS[origin as MovableOrigin] ?? origin;
}

/** "Voltar a herdar" só' faz sentido quando o valor foi definido aqui (empresa ou tenant), não no padrão. */
export function canInheritMovable(movable: Pick<MovableHoliday, "origin">): boolean {
  return movable.origin === "COMPANY" || movable.origin === "TENANT";
}

/** Marcador dos móveis: só' com BUSINESS_DAY_UPDATE. */
export function canEditMovable(hasUpdatePermission: boolean): boolean {
  return hasUpdatePermission;
}

/** Corpo do `PUT /movable-holidays`: `enabled: null` = voltar a herdar (a chave NUNCA e' omitida). */
export function buildMovablePayload(
  code: MovableHolidayCode,
  enabled: boolean | null,
): { code: MovableHolidayCode; enabled: boolean | null } {
  return { code, enabled };
}

export function isMovableCode(code: string | null | undefined): code is MovableHolidayCode {
  return MOVABLE_CODES.includes(code as MovableHolidayCode);
}

/** Mapeia o `DayResponse` (calendar/check) para o modelo da tela, com padroes para campos ausentes. */
export function mapDayResponse(day: DayResponse): CalendarDay {
  return {
    date: day.date,
    dayOfWeek: day.dayOfWeek,
    weight: day.weight,
    businessDay: day.businessDay,
    holiday: day.holiday,
    holidayName: day.holidayName ?? null,
    holidaySource: day.holidaySource ?? null,
    worksOnHoliday: day.worksOnHoliday === true,
    legalBasis: day.legalBasis ?? null,
  };
}

/** "yyyy-MM-dd" -> "dd/MM/yyyy" (sem passar por Date: evita deslocamento de fuso). */
export function formatIsoDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return match ? `${match[3]}/${match[2]}/${match[1]}` : iso;
}

export const WORK_OVERRIDE_DEFAULT_WEIGHT = "default";

/** Opcoes de peso do "vai trabalhar"; "default" = vazio (peso do dia da semana). */
export const WORK_OVERRIDE_WEIGHT_OPTIONS = [
  { id: WORK_OVERRIDE_DEFAULT_WEIGHT, label: "Peso do dia da semana" },
  { id: "1", label: "Dia inteiro" },
  { id: "0.5", label: "Meio período" },
] as const;

/** Valida e monta o corpo do POST/PUT de `/work-overrides`. Devolve `error` em pt-BR se invalido. */
export function buildWorkOverridePayload(form: {
  date: string;
  weight: string;
  reason: string;
  active: boolean;
}): { payload: WorkOverridePayload } | { error: string } {
  const date = form.date.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return { error: "Informe a data em que a empresa vai trabalhar." };
  }
  let weight: number | null = null;
  if (form.weight !== "" && form.weight !== WORK_OVERRIDE_DEFAULT_WEIGHT) {
    weight = Number(form.weight);
    if (!Number.isFinite(weight) || weight < 0 || weight > 1) {
      return { error: "O peso deve estar entre 0 e 1 (ou vazio para usar o peso do dia da semana)." };
    }
  }
  return { payload: { date, weight, reason: form.reason.trim(), active: form.active } };
}
