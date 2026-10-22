import assert from "node:assert/strict";
import { test } from "node:test";

import {
  EMPTY_COMMERCIAL_FIELDS,
  formatCompaniesSummary,
  formatCompanyLimit,
  formatPastDueDays,
  formatPastDueSummary,
  parseOptionalNonNegativeInt,
  toCommercialFields,
  toCommercialPayload,
} from "./plan-commercial.ts";

test("vazio vira nulo; zero continua zero", () => {
  assert.equal(parseOptionalNonNegativeInt(""), null);
  assert.equal(parseOptionalNonNegativeInt("  "), null);
  assert.equal(parseOptionalNonNegativeInt(undefined), null);
  assert.equal(parseOptionalNonNegativeInt("0"), 0);
  assert.equal(parseOptionalNonNegativeInt(" 12 "), 12);
});

test("negativo, decimal e lixo sao invalidos", () => {
  for (const bad of ["-1", "1.5", "1,5", "abc", "1e3", "+2", "99999999999999999999"]) {
    assert.ok(Number.isNaN(parseOptionalNonNegativeInt(bad)), bad);
  }
});

test("payload: tudo vazio gera quatro nulos", () => {
  const result = toCommercialPayload(EMPTY_COMMERCIAL_FIELDS);
  assert.equal(result.error, null);
  assert.deepEqual(result.payload, {
    maxCompanies: null,
    maxReadOnlyCompanies: null,
    pastDueReadOnlyAfterDays: null,
    pastDueDisableAfterDays: null,
  });
});

test("payload: valores validos mantem 0 e nulo distintos", () => {
  const result = toCommercialPayload({
    maxCompanies: "5",
    maxReadOnlyCompanies: "0",
    pastDueReadOnlyAfterDays: "7",
    pastDueDisableAfterDays: "",
  });
  assert.deepEqual(result.payload, {
    maxCompanies: 5,
    maxReadOnlyCompanies: 0,
    pastDueReadOnlyAfterDays: 7,
    pastDueDisableAfterDays: null,
  });
});

test("payload: campo invalido devolve erro com o rotulo e sem payload", () => {
  const result = toCommercialPayload({ ...EMPTY_COMMERCIAL_FIELDS, pastDueDisableAfterDays: "-3" });
  assert.equal(result.payload, null);
  assert.match(result.error ?? "", /Dias de atraso para desativar/);
  const other = toCommercialPayload({ ...EMPTY_COMMERCIAL_FIELDS, maxCompanies: "2.5" });
  assert.match(other.error ?? "", /^Empresas:/);
});

test("mapeamento da resposta para o formulario", () => {
  assert.deepEqual(toCommercialFields(null), EMPTY_COMMERCIAL_FIELDS);
  assert.deepEqual(
    toCommercialFields({
      maxCompanies: 3,
      maxReadOnlyCompanies: null,
      pastDueReadOnlyAfterDays: 0,
      pastDueDisableAfterDays: 30,
    }),
    { maxCompanies: "3", maxReadOnlyCompanies: "", pastDueReadOnlyAfterDays: "0", pastDueDisableAfterDays: "30" },
  );
});

test("ida e volta: o que a API devolve regrava igual", () => {
  const term = {
    maxCompanies: 4,
    maxReadOnlyCompanies: 0,
    pastDueReadOnlyAfterDays: null,
    pastDueDisableAfterDays: 0,
  };
  assert.deepEqual(toCommercialPayload(toCommercialFields(term)).payload, term);
});

test("listagem: rotulos de limite e de inadimplencia", () => {
  assert.equal(formatCompanyLimit(null), "Sem limite");
  assert.equal(formatCompanyLimit(0), "Sem limite");
  assert.equal(formatCompanyLimit(5), "5");
  assert.equal(formatPastDueDays(null), "Padrão");
  assert.equal(formatPastDueDays(0), "Não aplica");
  assert.equal(formatPastDueDays(7), "7 d");
  assert.equal(formatCompaniesSummary({ maxCompanies: 5 }), "Ativas: 5 · Somente leitura: Sem limite");
  assert.equal(
    formatPastDueSummary({ pastDueReadOnlyAfterDays: 7, pastDueDisableAfterDays: 0 }),
    "Somente leitura: 7 d · Desativar: Não aplica",
  );
});
