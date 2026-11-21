// BFF de exports (P192.F2.T1): toda chamada ao backend pede 30 s e o erro sai por bffProblemResponse (timeout 504,
// conexao 502, corpo 4xx do backend preservado). O download em stream NAO leva limite (cortaria o arquivo).
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const read = (rel: string) => readFileSync(new URL(`../app/api/backup/exports/${rel}`, import.meta.url), "utf8");

describe("BFF de exports: tempo limite e erro", () => {
  for (const rel of ["route.ts", "[jobId]/route.ts"]) {
    it(`${rel}: cada apiFetchSecurity pede EXPORT_BFF_TIMEOUT_MS e o erro vai por bffProblemResponse`, () => {
      const source = read(rel);
      const calls = source.match(/apiFetchSecurity</g)?.length ?? 0;
      const timed = source.match(/timeoutMs: EXPORT_BFF_TIMEOUT_MS/g)?.length ?? 0;
      expect(calls > 0 && timed === calls, `${rel}: ${timed}/${calls} chamadas com limite`).toBe(true);
      expect(!/\bproblemResponse\(/.test(source.replace(/bffProblemResponse\(/g, "")), "sem problemResponse direto").toBe(true);
      expect(/return bffProblemResponse\(error\)/.test(source), "usa bffProblemResponse").toBe(true);
    });
  }

  it("o download em stream nao leva limite de tempo", () => {
    expect(!/timeoutMs/.test(read("[jobId]/download/route.ts")), "download sem timeoutMs").toBe(true);
  });
});
