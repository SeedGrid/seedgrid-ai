import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const run = promisify(execFile);
// build-test/tests/x.test.js -> raiz do repositório (dois níveis acima de build-test)
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const comp = path.join(root, 'seedgridKB', 'SeedGrid', 'SeedGrid-components');
const GRUPOS_FLUTTER = ['inputs-texto', 'inputs-selecao', 'datatable', 'editor', 'buttons', 'feedback-e-exibicao', 'layout', 'navegacao-e-overlay', 'gadgets', 'digits', 'providers', 'fundamentos'];

test('Indice e Catalogo dos componentes estão em dia com as notas (--check) e dizem a plataforma', async () => {
  for (const only of ['components', 'catalogo']) {
    const r = await run(process.execPath, [path.join(root, 'scripts', 'kb-catalogs.mjs'), '--only', only, '--check'], { cwd: root });
    assert.match(r.stdout, /^ok /m);
  }
  const indice = await readFile(path.join(comp, 'Indice.md'), 'utf8');
  assert.match(indice, /Índice dos componentes SeedGrid \(React e Flutter\)/);
  assert.match(indice, /## Resumo — React/);
  assert.match(indice, /## Resumo — Flutter/);
  assert.match(indice, /SeedGrid\/SeedGrid-components\/Plataformas\|Plataformas: React × Flutter/);
  const catalogo = await readFile(path.join(comp, 'Catalogo.md'), 'utf8');
  assert.match(catalogo, /— React\r?\n/);
  assert.match(catalogo, /— Flutter\r?\n/);
});

test('cada grupo Flutter tem Visao-geral, API e Exemplos, e as notas dizem a plataforma', async () => {
  await access(path.join(comp, 'Plataformas.md'));
  for (const g of GRUPOS_FLUTTER) {
    for (const f of ['Visao-geral', 'API', 'Exemplos']) {
      const texto = await readFile(path.join(comp, 'flutter', g, `${f}.md`), 'utf8');
      assert.match(texto, /^plataforma: flutter$/m, `${g}/${f}: falta plataforma: flutter no frontmatter`);
      assert.match(texto, /Flutter/, `${g}/${f}: não diz Flutter`);
      const react = await readFile(path.join(comp, g, `${f}.md`), 'utf8');
      assert.match(react, /^plataforma: react$/m, `${g}/${f} (React): falta plataforma: react no frontmatter`);
      assert.match(react, /^# .*React/m, `${g}/${f} (React): o título não diz React`);
    }
  }
});
