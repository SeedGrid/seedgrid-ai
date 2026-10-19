import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// build-test/tests/check-secrets.test.js -> raiz do repositorio
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-secrets.mjs');

// Valores gerados em tempo de teste: nenhum segredo (nem de aparencia real) fica no codigo-fonte.
const randomBlob = () => randomBytes(36).toString('base64url');
const randomHex = () => '9f3b' + randomBytes(16).toString('hex');
const pemMarker = () => ['-----BEGIN', 'PRIVATE', 'KEY-----'].join(' ');

function withTree(files: Record<string, string>, fn: (dir: string) => void): void {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-secrets-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      const file = path.join(dir, name);
      fs.mkdirSync(path.dirname(file), { recursive: true });
      fs.writeFileSync(file, content, 'utf8');
    }
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function run(...args: string[]): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

const violations: Record<string, Record<string, string>> = {
  'arquivo _dev.env': { 'backend/_dev.env': 'PORT=8080\n' },
  'arquivo dev.env.bak': { 'backend/dev.env.bak': 'PORT=8080\n' },
  'chave aleatoria longa em .txt': { 'notas.txt': `valor=${randomBlob()}\n` },
  'apiKey literal em .ts': { 'src/config.ts': `export const apiKey = "${randomHex()}";\n` },
  'chave privada': { 'chave.txt': `${pemMarker()}\n${randomBlob()}\n` },
};

for (const [nome, files] of Object.entries(violations)) {
  test(`falha com: ${nome}`, () => {
    withTree({ 'README.md': '# ok\n', ...files }, (dir) => {
      const r = run('--dir', dir);
      assert.equal(r.code, 1, r.out);
      assert.match(r.out, /achado/);
    });
  });
}

test('passa em arvore limpa, inclusive dev.env.example com marcador', () => {
  withTree(
    {
      'backend/dev.env.example': 'JWT_SECRET=change-me\nDB_PASSWORD=change-me\nAPI_KEY=${API_KEY}\n',
      'frontend/.env.example': 'VITE_API_URL=http://localhost:8080\n',
      'src/ok.ts': 'export const apiKey = process.env.API_KEY;\n',
      'README.md': '# Produto\n',
    },
    (dir) => {
      const r = run('--dir', dir);
      assert.equal(r.code, 0, r.out);
    },
  );
});

test('pasta inexistente passa com aviso', () => {
  const r = run('--dir', path.join(os.tmpdir(), `nao-existe-${randomBytes(4).toString('hex')}`));
  assert.equal(r.code, 0, r.out);
  assert.match(r.out, /aviso/);
});

test('--kb-dir: nota .md pode citar apiKey e nome de variavel, mas --dir continua estrito', () => {
  const nota = { 'nota.md': 'Use `apiKey: "sgk_exemplo123"` e SECRET=abcdef123456 no cliente.\n' };
  withTree(nota, (dir) => {
    assert.equal(run('--kb-dir', dir).code, 0);
    assert.equal(run('--dir', dir).code, 1);
  });
});

test('--kb-dir: nota .md com token real, chave colada ou nome proibido ainda falha', () => {
  withTree({ 'nota.md': `stripe: sk_test_${randomBytes(12).toString('hex')}\n` }, (dir) => assert.equal(run('--kb-dir', dir).code, 1));
  withTree({ 'nota.md': `${pemMarker()}\n${randomBlob()}\n` }, (dir) => assert.equal(run('--kb-dir', dir).code, 1));
  withTree({ 'nota.md.bak': 'texto\n' }, (dir) => assert.equal(run('--kb-dir', dir).code, 1));
  withTree({ 'nota.md': `Cite o marcador \`${pemMarker()}\` na prosa.\n` }, (dir) => assert.equal(run('--kb-dir', dir).code, 0));
});

test('--kb-dir nao relaxa .env, .txt, .ts nem .json', () => {
  const casos: Array<[string, string]> = [
    ['a.txt', `valor=${randomBlob()}\n`],
    ['a.ts', `export const apiKey = "${randomHex()}";\n`],
    ['a.json', `{ "password": "${randomHex()}" }\n`],
    ['conf/a.properties', `db.password=${randomHex()}\n`],
    ['_dev.env', 'X=1\n'],
  ];
  for (const [name, content] of casos) {
    withTree({ [name]: content }, (dir) => assert.equal(run('--kb-dir', dir).code, 1, name));
  }
});

test('a KB atual do pacote passa (nome e conteudo)', () => {
  const r = run('--dir', path.join(ROOT, 'seedgridKB', 'SeedGrid', 'Toolkit', 'boilerplates'), '--kb-dir', path.join(ROOT, 'seedgridKB'));
  assert.equal(r.code, 0, r.out);
});
