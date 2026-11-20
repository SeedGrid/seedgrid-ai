import { describe, expect, it } from "vitest";

import {
  buildMovablePayload,
  buildWorkOverridePayload,
  canEditMovable,
  canInheritMovable,
  holidaySourceLabel,
  mapDayResponse,
  movableOriginLabel,
} from "./business-days";

describe("rotulos de origem", () => {
  it("traduz cada origem de feriado", () => {
    expect(holidaySourceLabel("COMPANY")).toBe("Empresa");
    expect(holidaySourceLabel("TENANT")).toBe("Conta");
    expect(holidaySourceLabel("STATE")).toBe("Estadual");
    expect(holidaySourceLabel("NATIONAL")).toBe("Nacional");
    expect(holidaySourceLabel("MOVABLE")).toBe("Móvel");
  });

  it("ausente vira null e desconhecida volta como veio", () => {
    expect(holidaySourceLabel(null)).toBeNull();
    expect(holidaySourceLabel(undefined)).toBeNull();
    expect(holidaySourceLabel("OUTRA")).toBe("OUTRA");
  });

  it("traduz a origem do valor do móvel; ausente = Padrão", () => {
    expect(movableOriginLabel("COMPANY")).toBe("Empresa");
    expect(movableOriginLabel("TENANT")).toBe("Conta (tenant)");
    expect(movableOriginLabel("DEFAULT")).toBe("Padrão");
    expect(movableOriginLabel(undefined)).toBe("Padrão");
  });
});

describe("payload do PUT de móvel", () => {
  it("mantem enabled: null (voltar a herdar) na serializacao", () => {
    expect(JSON.stringify(buildMovablePayload("CARNIVAL", null))).toBe('{"code":"CARNIVAL","enabled":null}');
  });

  it("envia true/false como estao", () => {
    expect(buildMovablePayload("GOOD_FRIDAY", false)).toEqual({ code: "GOOD_FRIDAY", enabled: false });
    expect(buildMovablePayload("CORPUS_CHRISTI", true)).toEqual({ code: "CORPUS_CHRISTI", enabled: true });
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
