import { describe, expect, it } from "vitest";

import type { CalendarDay, HolidayEntry, WorkOverride } from "./business-days";
import {
  buildHolidayFromDay,
  dayActions,
  type DayPermissions,
  dayVisual,
  formatBusinessDays,
  isoWeekday,
  monthBusinessDays,
  monthCells,
  weekProfilePayload,
  weightsFromProfile,
} from "./company-calendar";

const day = (date: string, extra: Partial<CalendarDay> = {}): CalendarDay => ({
  date,
  dayOfWeek: "MONDAY",
  weight: 1,
  businessDay: true,
  holiday: false,
  holidayName: null,
  holidaySource: null,
  worksOnHoliday: false,
  legalBasis: null,
  ...extra,
});

describe("grade do mes", () => {
  it("acha o dia da semana sem fuso", () => {
    expect(isoWeekday("2026-11-18")).toBe(3); // quarta
    expect(isoWeekday("2026-11-15")).toBe(7); // domingo
  });
  it("abre buracos até o dia 1 (domingo primeiro)", () => {
    const cells = monthCells([day("2026-11-01"), day("2026-11-02")]); // 1/nov/2026 e' domingo
    expect(cells.filter((c) => c === null)).toHaveLength(0);
    expect(monthCells([day("2026-11-03")]).filter((c) => c === null)).toHaveLength(2); // terca
  });
  it("soma meio período como 0,5 e ignora dia fechado", () => {
    const total = monthBusinessDays([day("2026-11-02"), day("2026-11-03", { weight: 0.5 }), day("2026-11-04", { businessDay: false, weight: 0 })]);
    expect(total).toBe(1.5);
    expect(formatBusinessDays(5.5)).toBe("5,5");
  });
});

describe("visual do dia", () => {
  it("distingue feriado, móvel, trabalhado, meio período e fechado", () => {
    expect(dayVisual(day("2026-12-25", { holiday: true, businessDay: false, holidaySource: "NATIONAL" }))).toBe("holiday");
    expect(dayVisual(day("2026-02-17", { holiday: true, businessDay: false, holidaySource: "MOVABLE" }))).toBe("movable");
    expect(dayVisual(day("2026-12-25", { holiday: true, worksOnHoliday: true }))).toBe("worked-holiday");
    expect(dayVisual(day("2026-11-07", { weight: 0.5 }))).toBe("half");
    expect(dayVisual(day("2026-11-08", { businessDay: false, weight: 0 }))).toBe("closed");
    expect(dayVisual(day("2026-11-09"))).toBe("open");
  });
});

describe("semana e feriado", () => {
  it("monta 7 dias e completa o que faltar como fechado", () => {
    const payload = weekProfilePayload({ 1: "1", 6: "0.5" });
    expect(payload.days).toHaveLength(7);
    expect(payload.days[5]).toEqual({ dayOfWeek: 6, weight: 0.5 });
    expect(payload.days[6]).toEqual({ dayOfWeek: 7, weight: 0 });
    expect(weightsFromProfile(payload.days)[6]).toBe("0.5");
  });
  it("valida nome e recorrência do feriado", () => {
    expect(buildHolidayFromDay({ date: "2026-11-20", name: " ", recurring: true })).toEqual({ error: "Informe o nome do feriado." });
    expect(buildHolidayFromDay({ date: "2026-11-20", name: "Consciencia Negra", recurring: false })).toEqual({
      payload: { name: "Consciencia Negra", month: 11, day: 20, year: 2026, active: true },
    });
  });
});

const holiday = (extra: Partial<HolidayEntry> = {}): HolidayEntry =>
  ({ id: "h1", name: "Aniversario", month: 11, day: 20, year: null, recurring: true, active: true, global: false, editable: true, createdAt: null, updatedAt: null, ...extra });
const override = (extra: Partial<WorkOverride> = {}): WorkOverride =>
  ({ id: "o1", date: "2026-11-20", weight: 1, reason: null, global: false, editable: true, active: true, ...extra });
const P = (create: boolean, update: boolean, del: boolean): DayPermissions => ({ create, update, delete: del });
const plain = day("2026-11-10");
const holidayDay = day("2026-11-20", { holiday: true, businessDay: false, holidaySource: "COMPANY" });

describe("o que cada permissão libera num dia", () => {
  it("só READ: nada e o dia não abre", () => {
    expect(dayActions(plain, null, null, P(false, false, false)).any).toBe(false);
    expect(dayActions(holidayDay, holiday(), null, P(false, false, false)).any).toBe(false);
  });
  it("só DELETE: exclui o feriado (sem UPDATE) e a exceção; dia comum não abre", () => {
    const a = dayActions(holidayDay, holiday(), null, P(false, false, true));
    expect(a).toMatchObject({ deleteHoliday: true, saveHoliday: false, any: true });
    expect(dayActions(plain, null, override({ date: "2026-11-10" }), P(false, false, true)).removeOverride).toBe(true);
    expect(dayActions(plain, null, null, P(false, false, true)).any).toBe(false);
  });
  it("só UPDATE: edita feriado cadastrado, mas não exclui; dia comum não abre", () => {
    const a = dayActions(holidayDay, holiday(), null, P(false, true, false));
    expect(a).toMatchObject({ saveHoliday: true, deleteHoliday: false });
    expect(dayActions(plain, null, null, P(false, true, false)).any).toBe(false);
  });
  it("só CREATE: cadastra feriado e abre/fecha o dia; não mexe no que existe", () => {
    expect(dayActions(plain, null, null, P(true, false, false))).toMatchObject({ addHoliday: true, applyOverride: true });
    expect(dayActions(holidayDay, holiday(), null, P(true, false, false))).toMatchObject({
      addHoliday: false,
      saveHoliday: false,
      deleteHoliday: false,
    });
  });
  it("feriado de móvel/nacional (sem cadastro) só aceita abrir o dia", () => {
    const national = day("2026-12-25", { holiday: true, businessDay: false, holidaySource: "NATIONAL" });
    const a = dayActions(national, null, null, P(true, true, true));
    expect(a).toMatchObject({ addHoliday: false, applyOverride: true, saveHoliday: false });
  });
  it("feriado da conta (global, não editável) e' só leitura mesmo com tudo", () => {
    const a = dayActions(holidayDay, holiday({ global: true, editable: false }), null, P(true, true, true));
    expect(a).toMatchObject({ saveHoliday: false, deleteHoliday: false, addHoliday: false });
  });
  it("com exceção no dia: remove (DELETE), não oferece nova exceção", () => {
    const a = dayActions(plain, null, override({ date: "2026-11-10" }), P(true, true, true));
    expect(a).toMatchObject({ removeOverride: true, applyOverride: false, addHoliday: false });
  });
  it("tudo: dia comum abre cadastro e exceção", () => {
    expect(dayActions(plain, null, null, P(true, true, true))).toMatchObject({ addHoliday: true, applyOverride: true, any: true });
  });
});
