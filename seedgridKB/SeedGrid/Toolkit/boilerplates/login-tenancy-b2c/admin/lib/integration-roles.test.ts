import assert from "node:assert/strict";
import { test } from "node:test";

import {
  PERMISSION_NOT_FOR_INTEGRATION_MESSAGE,
  assignableToUsers,
  isNotForIntegrationBody,
  notForIntegrationMessage,
  notReleasedCount,
  pruneToSelectable,
  releasedForIntegration,
  selectablePermissions,
} from "./integration-roles.ts";

const PERMS = [
  { publicId: "p1", name: "REPORT_READ", description: "ler", forIntegration: true },
  { publicId: "p2", name: "USER_CREATE", description: "criar usuario", forIntegration: false },
  { publicId: "p3", name: "REPORT_RUN", description: "executar" },
  { publicId: "p4", name: "AGENT_SYNC", description: "sincronizar", forIntegration: true },
];

test("so as permissoes liberadas servem a perfil de integracao", () => {
  assert.deepEqual(releasedForIntegration(PERMS).map((p) => p.publicId), ["p1", "p4"]);
  assert.equal(notReleasedCount(PERMS), 2);
});

test("perfil de integracao enxerga so as liberadas; perfil comum enxerga todas", () => {
  assert.deepEqual(selectablePermissions(PERMS, true).map((p) => p.publicId), ["p1", "p4"]);
  assert.equal(selectablePermissions(PERMS, false).length, 4);
  assert.deepEqual(selectablePermissions([], true), []);
});

test("flag ausente ou nulo conta como nao liberado (fail closed)", () => {
  assert.deepEqual(releasedForIntegration([{ forIntegration: null }, {}]), []);
});

test("marcar integracao tira da selecao o que nao foi liberado", () => {
  const selectable = selectablePermissions(PERMS, true);
  assert.deepEqual(pruneToSelectable(["p1", "p2", "p3", "p4", "zz"], selectable), ["p1", "p4"]);
  assert.deepEqual(pruneToSelectable([], selectable), []);
});

test("perfil de integracao nunca e oferecido para pessoa", () => {
  const roles = [
    { name: "ADMIN", forIntegration: false },
    { name: "AGENTE_REPORT", forIntegration: true },
    { name: "SEM_FLAG" },
  ];
  assert.deepEqual(assignableToUsers(roles).map((r) => r.name), ["ADMIN", "SEM_FLAG"]);
});

test("reconhece PERMISSION_NOT_FOR_INTEGRATION no corpo problem+json", () => {
  assert.equal(isNotForIntegrationBody({ status: 422, code: "PERMISSION_NOT_FOR_INTEGRATION" }), true);
  assert.equal(isNotForIntegrationBody('{"code":"PERMISSION_NOT_FOR_INTEGRATION"}'), true);
  assert.equal(isNotForIntegrationBody({ code: "OUTRO" }), false);
  assert.equal(isNotForIntegrationBody("texto"), false);
  assert.equal(isNotForIntegrationBody(null), false);
});

test("mensagem amigavel so para esse codigo, vindo do ApiClientError ou do corpo", () => {
  const apiError = { status: 422, responseBody: { code: "PERMISSION_NOT_FOR_INTEGRATION", detail: "x" } };
  assert.equal(notForIntegrationMessage(apiError), PERMISSION_NOT_FOR_INTEGRATION_MESSAGE);
  assert.equal(notForIntegrationMessage({ code: "PERMISSION_NOT_FOR_INTEGRATION" }), PERMISSION_NOT_FOR_INTEGRATION_MESSAGE);
  assert.equal(notForIntegrationMessage({ responseBody: { code: "LAST_ADMIN_PROTECTED" } }), null);
  assert.equal(notForIntegrationMessage(new Error("boom")), null);
  assert.equal(notForIntegrationMessage(undefined), null);
});
