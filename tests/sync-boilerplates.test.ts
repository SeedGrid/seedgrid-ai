import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'scripts/sync-boilerplates.mjs');
const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 1, 2, 3]);
const dirs: string[] = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'sg-sync-')); dirs.push(d); return d; };
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });
const g = (cwd: string, ...a: string[]) => { const r = spawnSync('git', a, { cwd, encoding: 'utf8' }); assert.equal(r.status, 0, r.stderr); return r.stdout.trim(); };

// "Repositorio boilerplate" falso, com um modelo, um binario, dotfiles e uma pasta de build que nao pode ser copiada.
function repoFalso() {
  const repo = tmp();
  g(repo, 'init', '-q', '-b', 'main');
  g(repo, 'config', 'user.email', 't@t'); g(repo, 'config', 'user.name', 't');
  const w = (rel: string, c: string | Buffer) => { mkdirSync(join(repo, rel, '..'), { recursive: true }); writeFileSync(join(repo, rel), c); };
  w('modelo/backend/pom.xml', '<project/>\n');
  w('modelo/backend/dev.env.example', 'A=change-me\n');
  w('modelo/frontend/public/logo.png', PNG);
  w('modelo/.gitignore', 'dev.env\n');
  w('modelo/frontend/node_modules/x/index.js', 'nao copiar\n');
  g(repo, 'add', '-A'); g(repo, 'commit', '-q', '-m', 'v1');
  g(repo, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  return { repo, w };
}

// O script grava em seedgridKB/.../boilerplates da raiz do projeto que o contem: roda numa copia minima do projeto.
function projetoFalso() {
  const p = tmp();
  mkdirSync(join(p, 'scripts'), { recursive: true });
  cpSync(SCRIPT, join(p, 'scripts/sync-boilerplates.mjs'));
  cpSync(resolve(process.cwd(), 'scripts/check-secrets.mjs'), join(p, 'scripts/check-secrets.mjs'));
  mkdirSync(join(p, 'seedgridKB/SeedGrid/Toolkit/boilerplates/modelo'), { recursive: true });
  return p;
}
const rodar = (p: string, ...a: string[]) => spawnSync(process.execPath, [join(p, 'scripts/sync-boilerplates.mjs'), ...a], { encoding: 'utf8' });
const DEST = (p: string) => join(p, 'seedgridKB/SeedGrid/Toolkit/boilerplates/modelo');

test('sync copia so o versionado, converte binario e dotfile e depois o check passa', () => {
  const { repo } = repoFalso();
  const p = projetoFalso();
  const r = rodar(p, '--repo', repo);
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.ok(existsSync(join(DEST(p), 'backend/pom.xml')));
  assert.ok(existsSync(join(DEST(p), 'backend/dev.env.example')));
  assert.ok(existsSync(join(DEST(p), '.gitignore.template')));
  assert.ok(!existsSync(join(DEST(p), '.gitignore')));
  assert.ok(!existsSync(join(DEST(p), 'frontend/node_modules')));
  assert.deepEqual(Buffer.from(readFileSync(join(DEST(p), 'frontend/public/logo.png.b64'), 'utf8'), 'base64'), PNG);
  assert.ok(existsSync(join(p, 'scripts/boilerplates-origem.json')));
  const c = rodar(p, '--repo', repo, '--check');
  assert.equal(c.status, 0, c.stdout + c.stderr);
});

test('check acusa copia desatualizada (arquivo alterado, novo e removido) e o sync conserta', () => {
  const { repo, w } = repoFalso();
  const p = projetoFalso();
  assert.equal(rodar(p, '--repo', repo).status, 0);
  w('modelo/backend/pom.xml', '<project>novo</project>\n');
  w('modelo/backend/novo.txt', 'x\n');
  rmSync(join(repo, 'modelo/backend/dev.env.example'));
  g(repo, 'add', '-A'); g(repo, 'commit', '-q', '-m', 'v2'); g(repo, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  const c = rodar(p, '--repo', repo, '--check');
  assert.equal(c.status, 1);
  assert.match(c.stderr, /1 novo\(s\), 1 alterado\(s\), 1 removido\(s\)/);
  assert.equal(rodar(p, '--repo', repo).status, 0);
  assert.ok(!existsSync(join(DEST(p), 'backend/dev.env.example')));
  assert.equal(readFileSync(join(DEST(p), 'backend/pom.xml'), 'utf8'), '<project>novo</project>\n');
  assert.equal(rodar(p, '--repo', repo, '--check').status, 0);
});

test('dry-run nao altera nada; trava de credenciais barra arquivo de ambiente no boilerplate', () => {
  const { repo, w } = repoFalso();
  const p = projetoFalso();
  const seco = rodar(p, '--repo', repo, '--dry-run');
  assert.equal(seco.status, 0);
  assert.ok(!existsSync(join(DEST(p), 'backend/pom.xml')));
  w('modelo/backend/dev.env', 'SECRET_KEY=abcdefghijklmnop123456\n');
  g(repo, 'add', '-f', '-A'); g(repo, 'commit', '-q', '-m', 'v3'); g(repo, 'update-ref', 'refs/remotes/origin/main', 'HEAD');
  const r = rodar(p, '--repo', repo);
  assert.notEqual(r.status, 0);
  assert.match(r.stderr + r.stdout, /check-secrets reprovou|achado/);
});

test('repositorio inacessivel: sem --soft falha; com --soft so avisa (prepack nao quebra offline)', () => {
  const p = projetoFalso();
  const inexistente = join(tmp(), 'nao-existe');
  const duro = rodar(p, '--repo', inexistente, '--check');
  assert.equal(duro.status, 1);
  const suave = rodar(p, '--repo', inexistente, '--check', '--soft');
  assert.equal(suave.status, 0);
  assert.match(suave.stderr, /AVISO/);
});

test('o pacote publicado nao carrega o sync nem o Makefile; o prepack confere os boilerplates', () => {
  const pkg = JSON.parse(readFileSync(resolve(process.cwd(), 'package.json'), 'utf8')) as { files: string[]; scripts: Record<string, string> };
  assert.ok(!pkg.files.some((f) => f.startsWith('scripts') || f === 'Makefile'));
  assert.match(pkg.scripts.prepack!, /check-boilerplates/);
  assert.match(pkg.scripts['check-boilerplates']!, /--check/);
  assert.ok(existsSync(resolve(process.cwd(), 'Makefile')));
});
