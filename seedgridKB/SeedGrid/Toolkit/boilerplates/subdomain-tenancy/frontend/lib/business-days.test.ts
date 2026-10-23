import { describe, expect, it } from "vitest";

import {
  buildMovablePayload,
  buildWorkOverridePayload,
  canEditMovable,
  canEditWorkOverride,
  canInheritMovable,
  dayKind,
  dayLabel,
  dayTooltip,
  groupReferenceByMonth,
  holidaySourceLabel,
  isReferenceRowDimmed,
  mapDayResponse,
  movableOriginLabel,
  sortReferenceHolidays,
  type ReferenceHoliday,
} from "./business-days";

const ref = (date: string, name: string, extra: Partial<ReferenceHoliday> = {}): ReferenceHoliday => ({
  code: name,
  name,
  date,
  source: "NATIONAL",
  legalBasis: null,
  enabled: true,
  uf: null,
  ...extra,
});

describe("rotulos de origem", () => {
  it("traduz cada origem de feriado", () => {
    expect(holidaySourceLabel("COMPANY")).toBe("Empresa");
    expect(holidaySourceLabel("TENANT")).toBe("Conta");
    expect(holidaySourceLabel("STATE")).toBe("Estadual");
    expect(holidaySourceLabel("NATIONAL")).toBe("Nacional");
    expect(holidaySourceLabel("MOVABLE")).toBe("Movel");
  });

  it("ausente vira null e desconhecida volta como veio", () => {
    expect(holidaySourceLabel(null)).toBeNull();
    expect(holidaySourceLabel(undefined)).toBeNull();
    expect(holidaySourceLabel("OUTRA")).toBe("OUTRA");
  });

  it("traduz a origem do valor do movel; ausente = Padrao", () => {
    expect(movableOriginLabel("COMPANY")).toBe("Empresa");
    expect(movableOriginLabel("TENANT")).toBe("Conta (tenant)");
    expect(movableOriginLabel("DEFAULT")).toBe("Padrao");
    expect(movableOriginLabel(undefined)).toBe("Padrao");
  });
});

describe("decisao de editavel", () => {
  it("movel: so' com permissao de UPDATE", () => {
    expect(canEditMovable(true)).toBe(true);
    expect(canEditMovable(false)).toBe(false);
  });

  it("voltar a herdar so' quando o valor veio de empresa ou tenant", () => {
    expect(canInheritMovable({ origin: "COMPANY" })).toBe(true);
    expect(canInheritMovable({ origin: "TENANT" })).toBe(true);
    expect(canInheritMovable({ origin: "DEFAULT" })).toBe(false);
  });

  it("vai trabalhar: precisa de permissao E de editable", () => {
    expect(canEditWorkOverride({ editable: true }, true)).toBe(true);
    expect(canEditWorkOverride({ editable: false }, true)).toBe(false);
    expect(canEditWorkOverride({ editable: true }, false)).toBe(false);
  });
});

describe("payload do PUT de movel", () => {
  it("mantem enabled: null (voltar a herdar) na serializacao", () => {
    expect(JSON.stringify(buildMovablePayload("CARNIVAL", null))).toBe('{"code":"CARNIVAL","enabled":null}');
  });

  it("envia true/false como estao", () => {
    expect(buildMovablePayload("GOOD_FRIDAY", false)).toEqual({ code: "GOOD_FRIDAY", enabled: false });
    expect(buildMovablePayload("CORPUS_CHRISTI", true)).toEqual({ code: "CORPUS_CHRISTI", enabled: true });
  });
});

describe("lista de referencia", () => {
  it("ordena por data e depois por nome", () => {
    const sorted = sortReferenceHolidays([
      ref("2026-12-25", "Natal"),
      ref("2026-01-01", "B"),
      ref("2026-01-01", "A"),
    ]);
    expect(sorted.map((h) => h.name)).toEqual(["A", "B", "Natal"]);
  });

  it("nao altera a lista original", () => {
    const original = [ref("2026-12-25", "Natal"), ref("2026-01-01", "Ano Novo")];
    sortReferenceHolidays(original);
    expect(original[0].name).toBe("Natal");
  });

  it("agrupa por mes, em ordem, sem meses vazios", () => {
    const groups = groupReferenceByMonth([
      ref("2026-12-25", "Natal"),
      ref("2026-02-17", "Carnaval", { source: "MOVABLE" }),
      ref("2026-01-01", "Ano Novo"),
      ref("2026-02-16", "Segunda de Carnaval"),
    ]);
    expect(groups.map((g) => [g.month, g.label, g.items.length])).toEqual([
      [1, "Janeiro", 1],
      [2, "Fevereiro", 2],
      [12, "Dezembro", 1],
    ]);
    expect(groups[1].items.map((h) => h.date)).toEqual(["2026-02-16", "2026-02-17"]);
  });

  it("esmaece apenas linha com enabled=false", () => {
    expect(isReferenceRowDimmed({ enabled: false })).toBe(true);
    expect(isReferenceRowDimmed({ enabled: true })).toBe(false);
  });
});

describe("DayResponse do calendario", () => {
  const base = { date: "2026-04-03", dayOfWeek: "FRIDAY", weight: 1, businessDay: false, holiday: true };

  it("preenche padroes quando o backend nao traz os campos novos", () => {
    const day = mapDayResponse(base);
    expect(day.holidaySource).toBeNull();
    expect(day.worksOnHoliday).toBe(false);
    expect(day.legalBasis).toBeNull();
    expect(day.holidayName).toBeNull();
  });

  it("copia origem, base legal e feriado trabalhado", () => {
    const day = mapDayResponse({
      ...base,
      holidayName: "Sexta-feira Santa",
      holidaySource: "MOVABLE",
      worksOnHoliday: true,
      legalBasis: "Lei 9.093/1995",
    });
    expect(day).toMatchObject({ holidaySource: "MOVABLE", worksOnHoliday: true, legalBasis: "Lei 9.093/1995" });
  });

  it("classifica o dia: feriado trabalhado difere de feriado fechado e de dia util", () => {
    const closed = mapDayResponse({ ...base, holidayName: "Sexta-feira Santa" });
    const worked = mapDayResponse({
      ...base,
      businessDay: true,
      worksOnHoliday: true,
      holidayName: "Sexta-feira Santa",
    });
    const plain = mapDayResponse({ ...base, holiday: false, businessDay: true });
    expect(dayKind(closed)).toBe("holiday");
    expect(dayKind(worked)).toBe("worked-holiday");
    expect(dayKind(plain)).toBe("business");
    expect(dayLabel(closed)).toBe("Sexta-feira Santa");
    expect(dayLabel(worked)).toBe("Feriado trabalhado");
    expect(dayLabel(plain)).toBe("Dia util");
  });

  it("tooltip traz origem e base legal so' para feriado", () => {
    const holiday = mapDayResponse({
      ...base,
      holidayName: "Sexta-feira Santa",
      holidaySource: "TENANT",
      legalBasis: "Lei X",
    });
    expect(dayTooltip(holiday)).toBe("03/04/2026 - Sexta-feira Santa\nOrigem: Conta\nBase legal: Lei X");
    const plain = mapDayResponse({ ...base, holiday: false, businessDay: true, legalBasis: "Lei X" });
    expect(dayTooltip(plain)).toBe("03/04/2026 - Dia util");
  });
});

describe("payload do vai trabalhar", () => {
  it("peso vazio ou 'default' vira null", () => {
    for (const weight of ["", "default"]) {
      expect(buildWorkOverridePayload({ date: "2026-04-03", weight, reason: " x ", active: true })).toEqual({
        payload: { date: "2026-04-03", weight: null, reason: "x", active: true },
      });
    }
  });

  it("converte peso numerico", () => {
    expect(buildWorkOverridePayload({ date: "2026-04-03", weight: "0.5", reason: "", active: false })).toEqual({
      payload: { date: "2026-04-03", weight: 0.5, reason: "", active: false },
    });
  });

  it("rejeita data ausente/invalida e peso fora de 0..1", () => {
    const form = { date: "2026-04-03", weight: "", reason: "", active: true };
    expect(buildWorkOverridePayload({ ...form, date: "" })).toHaveProperty("error");
    expect(buildWorkOverridePayload({ ...form, date: "03/04/2026" })).toHaveProperty("error");
    expect(buildWorkOverridePayload({ ...form, weight: "2" })).toHaveProperty("error");
    expect(buildWorkOverridePayload({ ...form, weight: "abc" })).toHaveProperty("error");
  });
});
