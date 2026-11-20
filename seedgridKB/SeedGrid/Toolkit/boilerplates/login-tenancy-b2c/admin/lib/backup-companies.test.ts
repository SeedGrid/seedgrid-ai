import assert from "node:assert/strict";
import { test } from "node:test";

import {
  backupCompanyHeader,
  backupCompanyPayload,
  parseBackupCompanies,
  shouldShowBackupCompanySelector,
} from "./backup-companies.ts";

const A = { publicId: "a", name: "Filial A" };
const B = { publicId: "b", name: "Filial B" };

test("parseBackupCompanies: nome fantasia, razão social, id; descarta sem publicId e desativada", () => {
  assert.deepEqual(
    parseBackupCompanies([
      { publicId: "a", tradeName: "Filial A" },
      { publicId: "b", corporateName: "B Ltda" },
      { publicId: "c" },
      { tradeName: "sem id" },
      { publicId: "d", tradeName: "Fora", accessMode: "DISABLED" },
      { publicId: "e", tradeName: "Leitura", accessMode: "READ_ONLY" },
      null,
    ]),
    [
      { publicId: "a", name: "Filial A" },
      { publicId: "b", name: "B Ltda" },
      { publicId: "c", name: "c" },
      { publicId: "e", name: "Leitura" },
    ],
  );
  assert.deepEqual(parseBackupCompanies(null), []);
  assert.deepEqual(parseBackupCompanies({}), []);
});

test("seletor de filiais só aparece com mais de uma empresa (FE-38)", () => {
  assert.equal(shouldShowBackupCompanySelector([]), false);
  assert.equal(shouldShowBackupCompanySelector([A]), false);
  assert.equal(shouldShowBackupCompanySelector([A, B]), true);
});

test("backupCompanyPayload: Todas não manda companyPublicIds; com uma empresa só não há escolha", () => {
  assert.deepEqual(backupCompanyPayload("ALL", ["a"], [A, B]), {});
  assert.deepEqual(backupCompanyPayload("SOME", [], [A]), {});
});

test("backupCompanyPayload: Algumas manda as marcadas, sem repetir e sem ids alheios; nenhuma é erro", () => {
  assert.deepEqual(backupCompanyPayload("SOME", ["b", "b", "x"], [A, B]), { companyPublicIds: ["b"] });
  assert.deepEqual(backupCompanyPayload("SOME", ["a", "b"], [A, B]), { companyPublicIds: ["a", "b"] });
  assert.deepEqual(backupCompanyPayload("SOME", [], [A, B]), {
    error: "Escolha ao menos uma filial ou volte para Todas.",
  });
});

test("backupCompanyHeader: corrente, depois a primeira escolhida, depois a primeira do usuário", () => {
  assert.equal(backupCompanyHeader("a", ["b"], [A, B]), "a");
  assert.equal(backupCompanyHeader(null, ["b"], [A, B]), "b");
  assert.equal(backupCompanyHeader(undefined, undefined, [A, B]), "a");
  assert.equal(backupCompanyHeader("", [], []), null);
});
