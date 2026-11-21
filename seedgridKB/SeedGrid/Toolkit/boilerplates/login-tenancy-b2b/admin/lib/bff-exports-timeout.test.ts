// BFF de exports (P192.F2.T1): toda chamada ao backend pede 30 s e o erro sai por bffProblemResponse (timeout 504,
// conexao 502, corpo 4xx do backend preservado). O download em stream NAO leva limite (cortaria o arquivo).
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

const read = (rel: string) => readFileSync(new URL(`../app/api/admin/exports/${rel}`, import.meta.url), "utf8");

describe("BFF de exports: tempo limite e erro", () => {
  for (const rel of ["route.ts", "[jobId]/route.ts"]) {
    it(`${rel}: cada apiFetchSecurity pede EXPORT_BFF_TIMEOUT_MS e o erro vai por bffProblemResponse`, () => {
      const source = read(rel);
      const calls = source.match(/apiFetchSecurity</g)?.length ?? 0;
      const timed = source.match(/timeoutMs: EXPORT_BFF_TIMEOUT_MS/g)?.length ?? 0;
      assert.ok(calls > 0 && timed === calls, `${rel}: ${timed}/${calls} chamadas com limite`);
      assert.ok(!/\bproblemResponse\(/.test(source.replace(/bffProblemResponse\(/g, "")), "sem problemResponse direto");
      assert.ok(/return bffProblemResponse\(error\)/.test(source), "usa bffProblemResponse");
    });
  }

  it("o download em stream nao leva limite de tempo", () => {
    assert.ok(!/timeoutMs/.test(read("[jobId]/download/route.ts")), "download sem timeoutMs");
  });
});
