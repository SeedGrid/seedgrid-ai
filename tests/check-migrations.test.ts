import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// build-test/tests/check-migrations.test.js -> raiz do repositorio
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'seedgridKB', 'SeedGrid', 'Toolkit', 'skills', 'sg-validate-change', 'scripts', 'check-migrations.mjs');

function withMigrations(files: Record<string, string>, fn: (dir: string) => void): void {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-migrations-'));
  try {
    for (const [name, content] of Object.entries(files)) {
      fs.writeFileSync(path.join(dir, name), content, 'utf8');
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

test('migration que so acrescenta passa', () => {
  withMigrations(
    {
      'V1__base.sql': 'CREATE TABLE a (id BIGINT PRIMARY KEY, nome VARCHAR(50) NOT NULL);',
      'V2__coluna.sql': 'ALTER TABLE a ADD COLUMN ativo BOOLEAN NOT NULL DEFAULT TRUE;\nCREATE INDEX idx_a_ativo ON a (ativo);',
    },
    (dir) => {
      const r = run(dir);
      assert.equal(r.code, 0, r.out);
    },
  );
});

const proibidas: Record<string, [string, string]> = {
  DROP: ['V3__drop.sql', 'ALTER TABLE a DROP COLUMN nome;'],
  RENAME: ['V3__rename.sql', 'ALTER TABLE a RENAME COLUMN nome TO titulo;'],
  'ALTER TYPE': ['V3__tipo.sql', 'ALTER TABLE a ALTER COLUMN nome TYPE TEXT;'],
  'NOT NULL sem DEFAULT': ['V3__nn.sql', 'ALTER TABLE a ADD COLUMN cpf VARCHAR(11) NOT NULL;'],
  'SET NOT NULL': ['V3__setnn.sql', 'ALTER TABLE a ALTER COLUMN nome SET NOT NULL;'],
};

for (const [regra, [arquivo, sql]] of Object.entries(proibidas)) {
  test(`reprova ${regra} sem a marca e passa com a marca "contrair"`, () => {
    withMigrations({ 'V1__base.sql': 'CREATE TABLE a (id BIGINT);', [arquivo]: sql }, (dir) => {
      const r = run(dir);
      assert.equal(r.code, 1, r.out);
      assert.match(r.out, new RegExp(arquivo));
      assert.match(r.out, new RegExp(regra));
    });
    withMigrations(
      { 'V1__base.sql': 'CREATE TABLE a (id BIGINT);', [arquivo]: `-- sg:contrair o release anterior ja nao usa\n${sql}` },
      (dir) => {
        const r = run(dir);
        assert.equal(r.code, 0, r.out);
      },
    );
  });
}

test('a marca "contrair" sem motivo nao libera', () => {
  withMigrations({ 'V2__drop.sql': '-- sg:contrair\nALTER TABLE a DROP COLUMN nome;' }, (dir) => {
    assert.equal(run(dir).code, 1);
  });
});

test('comentario com palavra proibida nao reprova; arquivo que nao e V*__*.sql e ignorado', () => {
  withMigrations(
    { 'V1__ok.sql': '-- DROP TABLE antiga\nCREATE TABLE a (id INT);', 'notas.sql': 'DROP TABLE x;' },
    (dir) => {
      assert.equal(run(dir).code, 0);
    },
  );
});

test('--new-since confere so o que entrou depois da referencia', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-migrations-git-'));
  const git = (...a: string[]) => spawnSync('git', a, { cwd: dir, encoding: 'utf8' });
  try {
    git('init', '-q');
    git('config', 'user.email', 't@t.t');
    git('config', 'user.name', 't');
    fs.mkdirSync(path.join(dir, 'db'));
    fs.writeFileSync(path.join(dir, 'db', 'V1__antiga.sql'), 'DROP TABLE velha;', 'utf8');
    git('add', '.');
    git('commit', '-q', '-m', 'base');
    const base = git('rev-parse', 'HEAD').stdout.trim();
    fs.writeFileSync(path.join(dir, 'db', 'V2__nova.sql'), 'CREATE TABLE a (id INT);', 'utf8');
    git('add', '.');
    git('commit', '-q', '-m', 'nova');

    const so = spawnSync(process.execPath, [SCRIPT, 'db', '--new-since', base], { cwd: dir, encoding: 'utf8' });
    assert.equal(so.status, 0, `${so.stdout}${so.stderr}`);
    const tudo = spawnSync(process.execPath, [SCRIPT, 'db'], { cwd: dir, encoding: 'utf8' });
    assert.equal(tudo.status, 1);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});
