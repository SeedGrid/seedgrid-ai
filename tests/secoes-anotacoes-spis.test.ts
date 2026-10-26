import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { describe, test } from 'node:test';

// Guardião da PL-21: toda extension Java da KB de host tem as seções "Anotações" e "SPIs" na Visão geral
// (a seção pode dizer apenas "Nenhuma."). Crates só em Rust (broker) ficam de fora.
const EXTENSIONS = path.resolve(process.cwd(), 'seedgridKB/SeedGrid/Extensions');
const SOMENTE_RUST = new Set(['broker', 'runtime', 'cities']);

async function visaoGeral(dir: string): Promise<string | null> {
  const file = path.join(EXTENSIONS, dir, 'Visao-geral.md');
  try {
    await stat(file);
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

describe('seções Anotações e SPIs na Visão geral das extensions (PL-21)', () => {
  test('toda extension Java com Visao-geral.md tem as duas seções com conteúdo', async () => {
    const dirs = (await readdir(EXTENSIONS, { withFileTypes: true })).filter((d) => d.isDirectory()).map((d) => d.name);
    const faltando: string[] = [];
    let conferidas = 0;
    for (const dir of dirs) {
      if (SOMENTE_RUST.has(dir)) continue;
      const text = await visaoGeral(dir);
      if (text === null) continue;
      conferidas++;
      for (const titulo of ['Anotações', 'SPIs']) {
        const m = new RegExp(`^#{2,3} ${titulo}[^\\n]*\\n([\\s\\S]*?)(?=^#{1,3} |$(?![\\s\\S]))`, 'm').exec(text);
        if (!m || (m[1] ?? '').trim().length === 0) faltando.push(`${dir}: ${titulo}`);
      }
    }
    assert.ok(conferidas >= 15, `esperava conferir ao menos 15 extensions, conferiu ${conferidas}`);
    assert.deepEqual(faltando, []);
  });
});
