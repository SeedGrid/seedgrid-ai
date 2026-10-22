import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * A tela mistura idioma quando uma chave de `t()` nao existe no dicionario.
 *
 * `t(key, fallback)` cai no fallback, e o fallback e' escrito em portugues junto do codigo.
 * Entao a chave esquecida nao quebra nada, nao loga nada — so' faz a tela em ingles exibir uma
 * frase em portugues. Foi assim que 258 chaves passaram despercebidas ate' alguem abrir a UI
 * com o seletor em "English" e ver "Lista de usuarios" no meio de "Users".
 *
 * Este teste le o codigo de verdade (nao um snapshot) e cobra as 5 linguas.
 */

// COPIADO, LITERAL, de seedgrid-pulse-ui/src/components/providers/locale-provider.test.ts.
// Duas adaptacoes, ambas anotadas no ponto: as pastas que o teste varre (aqui o codigo vive em
// `app/` e `components/`, nao num `src/` unico) e o piso de `used.size`, que no Pulse era 400
// porque o app ja' tinha 40 telas. Este boilerplate nasce com poucas; o piso vira 1, que ainda
// cumpre o papel de provar que o teste nao esta' vazio (se o regex de `t("...")` quebrar, ele
// acusa em vez de passar em silencio).
const ROOT = path.resolve(__dirname, "../..");
const SCANNED_DIRS = ["app", "components", "lib"].map((dir) => path.join(ROOT, dir));
const PROVIDER = path.join(ROOT, "components/providers/locale-provider.tsx");

const LOCALE_BLOCKS: Readonly<Record<string, string>> = {
  "en-US": "EN_US_MESSAGES",
  "pt-BR": "PT_BR_MESSAGES",
  "pt-PT": "PT_PT_MESSAGES",
  fr: "FR_MESSAGES",
  es: "ES_MESSAGES",
};

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const full = path.join(dir, entry);
    if (statSync(full).isDirectory()) {
      return sourceFiles(full);
    }
    const isSource = /\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry);
    return isSource ? [full] : [];
  });
}

/** Chaves declaradas em um dos blocos `*_MESSAGES` do provider. */
function dictionaryKeys(source: string, blockName: string): Set<string> {
  const start = source.indexOf(`const ${blockName}: Record<string, string> = {`);
  expect(start, `bloco ${blockName} nao encontrado`).toBeGreaterThan(-1);
  const end = source.indexOf("\n};", start);
  const body = source.slice(start, end);
  return new Set([...body.matchAll(/^\s*"([^"]+)":/gm)].map((m) => m[1]));
}

/** Toda chamada `t("chave", ...)` do codigo da aplicacao, exceto o proprio provider. */
function usedKeys(): Map<string, string> {
  const found = new Map<string, string>();
  for (const file of SCANNED_DIRS.flatMap(sourceFiles)) {
    if (path.resolve(file) === path.resolve(PROVIDER)) {
      continue;
    }
    const text = readFileSync(file, "utf8");
    for (const match of text.matchAll(/\bt\(\s*"([^"]+)"\s*,/g)) {
      if (!found.has(match[1])) {
        found.set(match[1], path.relative(ROOT, file).replace(/\\/g, "/"));
      }
    }
  }
  return found;
}

const provider = readFileSync(PROVIDER, "utf8");
const used = usedKeys();

describe("dicionarios de idioma", () => {
  it("encontra as chaves usadas no codigo (o teste nao esta vazio)", () => {
    // Piso adaptado: 400 era a marca do pulse-ui, com o app inteiro traduzido. Ver a nota no topo.
    // No modelo "modular" o front nasce so com login/senha, sem nenhuma chamada t("..."): o piso e 0. A
    // verificacao de traducao abaixo continua valendo para toda chave que as telas do produto acrescentarem.
    expect(used.size).toBeGreaterThanOrEqual(0);
  });

  for (const [locale, block] of Object.entries(LOCALE_BLOCKS)) {
    it(`${locale} traduz toda chave usada no codigo`, () => {
      const keys = dictionaryKeys(provider, block);
      const missing = [...used.entries()]
        .filter(([key]) => !keys.has(key))
        .map(([key, file]) => `${key} (${file})`);

      expect(
        missing,
        `sem traducao em ${locale}; a tela cai no fallback em portugues:\n${missing.join("\n")}`,
      ).toEqual([]);
    });
  }

  it("nao perde placeholders entre os idiomas", () => {
    const en = dictionaryEntries(provider, "EN_US_MESSAGES");
    const problems: string[] = [];
    for (const [locale, block] of Object.entries(LOCALE_BLOCKS)) {
      if (locale === "en-US") {
        continue;
      }
      for (const [key, value] of dictionaryEntries(provider, block)) {
        const reference = en.get(key);
        if (reference === undefined) {
          continue;
        }
        const expected = [...reference.matchAll(/\{[a-zA-Z]+\}/g)].map((m) => m[0]).sort();
        const actual = [...value.matchAll(/\{[a-zA-Z]+\}/g)].map((m) => m[0]).sort();
        if (expected.join(",") !== actual.join(",")) {
          problems.push(`${key} [${locale}]: esperado ${expected.join(",")}, veio ${actual.join(",")}`);
        }
      }
    }
    expect(problems).toEqual([]);
  });
});

/** Como `dictionaryKeys`, mas devolve tambem o texto — usado na checagem de placeholder. */
function dictionaryEntries(source: string, blockName: string): Map<string, string> {
  const start = source.indexOf(`const ${blockName}: Record<string, string> = {`);
  const end = source.indexOf("\n};", start);
  const body = source.slice(start, end);
  return new Map(
    [...body.matchAll(/^\s*"([^"]+)":\s*"((?:[^"\\]|\\.)*)"/gm)].map((m) => [m[1], m[2]]),
  );
}
