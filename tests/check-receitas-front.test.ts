import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// build-test/tests/check-receitas-front.test.js -> raiz do repositorio
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-receitas-front.mjs');

const RECEITA = { _regra: 'teste', modulos: { audit: { descricao: 'x', escopos: { frontend: { apagar: ['app/audit'], linhas: [{ arquivo: 'app/data.ts', contem: 'href: "/audit"' }] } } } } };

function run(files: Record<string, string>, receita: unknown = RECEITA) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-receitas-front-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const file = path.join(dir, 'bp', name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, 'utf8');
    }
    const rf = path.join(dir, 'receitas.json');
    fs.writeFileSync(rf, JSON.stringify(receita), 'utf8');
    const r = spawnSync(process.execPath, [SCRIPT, '--dir', dir, '--receitas', rf], { cwd: ROOT, encoding: 'utf8' });
    return { code: r.status, out: `${r.stdout}${r.stderr}` };
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

const BASE = {
  'frontend/app/audit/page.tsx': 'export default function P() { return null; }\n',
  'frontend/app/data.ts': 'export const menu = [\n  { href: "/audit" },\n  { href: "/home" },\n];\n',
  'frontend/app/home/page.tsx': 'import { menu } from "@/app/data";\nexport default function H() { return menu.length; }\n',
};

test('receita aplicada sem sobra passa', () => {
  const r = run(BASE);
  assert.equal(r.code, 0, r.out);
});

test('import de arquivo apagado pela receita reprova', () => {
  const r = run({ ...BASE, 'frontend/app/home/page.tsx': 'import P from "@/app/audit/page";\nexport default P;\n' });
  assert.equal(r.code, 1);
  assert.match(r.out, /import quebrado/);
  assert.match(r.out, /@\/app\/audit\/page/);
});

test('trecho `contem` que sumiu do boilerplate reprova (receita velha)', () => {
  const r = run({ ...BASE, 'frontend/app/data.ts': 'export const menu = [\n  { href: "/home" },\n];\n' });
  assert.equal(r.code, 1);
  assert.match(r.out, /receita velha/);
  assert.match(r.out, /href: "\/audit"/);
});

test('modelo sem o modulo (nenhum caminho de apagar existe) nao se aplica', () => {
  const r = run({ 'frontend/app/data.ts': 'export const menu = [];\n' });
  assert.equal(r.code, 0, r.out);
});
