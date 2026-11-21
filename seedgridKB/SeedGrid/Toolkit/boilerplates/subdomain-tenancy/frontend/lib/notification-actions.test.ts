// Acoes do sino por tipo de notificacao (P186.F3.T1 / P180.F2.T15): backup.finished baixa pelo BFF, backup.failed leva
// a tela; id so [A-Za-z0-9_-] (nunca URL do payload); resposta conferida antes de baixar; erro legivel (410, HTML).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

import {
  BACKUP_NOTIFICATION_CONFIG as config,
  browserNotificationDeps,
  downloadExport,
  exportDownloadUrl,
  filenameFromDisposition,
  registerBackupNotificationActions,
} from "./notification-actions";

const shell = readFileSync(new URL("../app/components/Shell.tsx", import.meta.url), "utf8");

type Reg = Record<string, { label?: string; run: (n: { type: string; payload?: Record<string, unknown> | null }) => unknown }>;

function harness(response: Response | (() => Promise<Response>)) {
  const registered: Reg = {};
  const calls = { fetched: [] as string[], saved: [] as string[], navigated: [] as string[], undone: 0 };
  const deps = {
    fetchFn: async (url: string) => {
      calls.fetched.push(url);
      return typeof response === "function" ? response() : response;
    },
    saveBlob: (_blob: Blob, filename: string) => calls.saved.push(filename),
    navigate: (path: string) => calls.navigated.push(path),
  };
  const undo = registerBackupNotificationActions(
    (type, action) => {
      registered[type] = action;
      return () => {
        calls.undone += 1;
      };
    },
    config,
    deps,
  );
  return { registered, calls, undo };
}

const finished = (id: unknown) => ({ type: "backup.finished", payload: { exportPublicId: id } });

describe("acoes do sino: backup", () => {
  it("registra so backup.finished e backup.failed (o sino nao conhece tipo; report.ready fica fora)", () => {
    const { registered } = harness(new Response("x"));
    expect(Object.keys(registered).sort()).toEqual(["backup.failed", "backup.finished"]);
  });

  it("a URL vem so do id seguro do payload, pela rota do BFF deste app", () => {
    expect(exportDownloadUrl(config, finished('abc-123_X'))).toEqual(`${config.downloadBase}/abc-123_X/download`);
    for (const bad of ["../x", "a/b", "http://evil", "a b", "", "x".repeat(81), 7, null]) {
      expect(exportDownloadUrl(config, finished(bad))).toEqual(null);
    }
    expect(exportDownloadUrl(config, { type: 'backup.finished', payload: { url: 'http://evil', path: '/x' } })).toEqual(null);
  });

  it("backup.finished baixa o arquivo com o nome do servidor e so depois de conferir a resposta", async () => {
    const response = new Response("zip", {
      status: 200,
      headers: { "Content-Type": "application/zip", "Content-Disposition": 'attachment; filename="meu-backup.zip"' },
    });
    const { registered, calls } = harness(response);
    await registered["backup.finished"].run(finished("job1"));
    expect(calls.fetched).toEqual([`${config.downloadBase}/job1/download`]);
    expect(calls.saved).toEqual(["meu-backup.zip"]);
  });

  it("410 (export expirado), 403 e HTML de login viram mensagem legivel e nada e salvo", async () => {
    const cases: Array<[Response, RegExp]> = [
      [new Response("gone", { status: 410 }), /expirou/],
      [new Response("no", { status: 403 }), /permissão/],
      [new Response("<html>login</html>", { status: 200, headers: { "Content-Type": "text/html" } }), /sessão expirou/],
      [new Response(JSON.stringify({ detail: "Falha X" }), { status: 500, headers: { "Content-Type": "application/problem+json" } }), /Falha X/],
    ];
    for (const [response, message] of cases) {
      const { registered, calls } = harness(response);
      await expect(registered["backup.finished"].run(finished("job1"))).rejects.toThrow(message);
      expect(calls.saved).toEqual([]);
    }
  });

  it("payload sem id valido: lanca mensagem legivel e nao chama o BFF", async () => {
    const { registered, calls } = harness(new Response("x"));
    await expect(registered["backup.finished"].run(finished("../etc"))).rejects.toThrow(/não tem um backup/);
    expect(calls.fetched).toEqual([]);
  });

  it("backup.failed leva a tela de backup; o cleanup desfaz os dois registros", () => {
    const { registered, calls, undo } = harness(new Response("x"));
    registered["backup.failed"].run({ type: "backup.failed", payload: {} });
    expect(calls.navigated).toEqual([config.listPath]);
    undo();
    expect(calls.undone).toEqual(2);
  });

  it("nome de arquivo do cabecalho e saneado", () => {
    expect(filenameFromDisposition('attachment; filename="a/../b.zip"', "f.zip")).toEqual("a_.._b.zip");
    expect(filenameFromDisposition(null, "f.zip")).toEqual("f.zip");
    expect(typeof browserNotificationDeps === "function", "deps do navegador").toBe(true);
  });

  it("a Shell registra as acoes num useEffect, com cleanup, sem a prop actions", () => {
    expect(/registerNotificationAction/.test(shell), "importa o registro").toBe(true);
    expect(/useEffect\(\s*\(\) =>\s*registerBackupNotificationActions\(/.test(shell), "registra no useEffect e devolve o cleanup").toBe(true);
    expect(!/<SgNotificationBell[^>]*actions=/.test(shell), "sem prop actions").toBe(true);
  });
});
