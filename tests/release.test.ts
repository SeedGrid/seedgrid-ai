import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-release/scripts/release.mjs');
const mod = (await import(pathToFileURL(SCRIPT).href)) as {
  proximaVersao: (tags: string[], hoje: Date) => string;
  trocarNoPom: (xml: string, v: string) => string;
  versaoDoPom: (xml: string) => { valor: string } | null;
  trocarNoPackageJson: (t: string, v: string) => string;
  atualizarChangelog: (t: string | null, v: string, d: string) => string;
  segredosVersionados: (a: string[], ler: (f: string) => string) => string[];
};

const dirs: string[] = [];
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });
const git = (cwd: string, ...a: string[]) => execFileSync('git', ['-C', cwd, ...a], { encoding: 'utf8' }).trim();

const POM = '<?xml version="1.0"?>\n<project>\n  <modelVersion>4.0.0</modelVersion>\n  <parent><groupId>g</groupId><artifactId>p</artifactId><version>9.9.9</version></parent>\n  <groupId>br.com.acme</groupId>\n  <artifactId>api</artifactId>\n  <version>0.1.0-SNAPSHOT</version>\n</project>\n';
const PKG = (v: string) => `{\n  "name": "x",\n  "version": "${v}",\n  "scripts": {}\n}\n`;

function produto(opts: { remoto?: boolean; versaoAdmin?: string } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'sg-release-'));
  dirs.push(d);
  for (const s of ['backend', 'frontend', 'admin']) mkdirSync(join(d, s));
  writeFileSync(join(d, 'produto.json'), JSON.stringify({ schema: 1, servicos: [{ nome: 'backend', tipo: 'backend' }, { nome: 'frontend', tipo: 'frontend' }, { nome: 'admin', tipo: 'admin' }] }));
  writeFileSync(join(d, 'backend/pom.xml'), POM);
  writeFileSync(join(d, 'frontend/package.json'), PKG('0.1.0'));
  writeFileSync(join(d, 'admin/package.json'), PKG(opts.versaoAdmin ?? '0.1.0'));
  writeFileSync(join(d, 'CHANGELOG.md'), '# Changelog\n\n## [Nao publicado]\n\n- algo novo\n');
  git(d, 'init', '-q', '-b', 'main');
  git(d, 'config', 'user.email', 't@t.t');
  git(d, 'config', 'user.name', 't');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'inicio');
  git(d, 'branch', 'develop');
  git(d, 'switch', '-q', 'develop');
  if (opts.remoto) {
    const r = mkdtempSync(join(tmpdir(), 'sg-release-origin-'));
    dirs.push(r);
    execFileSync('git', ['init', '-q', '--bare', r]);
    git(d, 'remote', 'add', 'origin', r);
    git(d, 'push', '-q', 'origin', 'develop', 'main');
    return { d, origin: r };
  }
  return { d, origin: null as string | null };
}
const roda = (d: string, ...a: string[]) => spawnSync(process.execPath, [SCRIPT, '--destino', d, '--sem-testes', ...a], { encoding: 'utf8', env: { ...process.env, SG_RELEASE_HOJE: '2026-10-29' } });

test('proxima versao: mes corrente + 1 sobre o maior N ja tagueado', () => {
  const hoje = new Date('2026-10-29T12:00:00');
  assert.equal(mod.proximaVersao([], hoje), '2026.10.1');
  assert.equal(mod.proximaVersao(['v2026.10.1', 'v2026.10.3', 'v2026.9.9', 'x'], hoje), '2026.10.4');
});

test('pom: troca so a versao do projeto, nao a do parent', () => {
  const novo = mod.trocarNoPom(POM, '2026.10.1');
  assert.match(novo, /<artifactId>api<\/artifactId>\n {2}<version>2026\.10\.1<\/version>/);
  assert.match(novo, /<version>9\.9\.9<\/version>/);
  assert.equal(mod.versaoDoPom(POM)!.valor, '0.1.0-SNAPSHOT');
});

test('changelog: fecha Nao publicado como a versao e abre outra vazia; cria se faltar', () => {
  const a = mod.atualizarChangelog('# C\n\n## [Nao publicado]\n\n- x\n', '2026.10.1', '2026-10-29');
  assert.match(a, /## \[Nao publicado\]\n\n## \[2026\.10\.1\] - 2026-10-29\n\n- x/);
  assert.match(mod.atualizarChangelog(null, '2026.10.1', '2026-10-29'), /## \[2026\.10\.1\] - 2026-10-29/);
});

test('segredos: acha arquivo de segredo e credencial no conteudo; ignora exemplo, teste e md', () => {
  const conteudo: Record<string, string> = { 'a.ts': 'const k = "AKIAABCDEFGHIJKLMNOP";', 'dev.env.example': 'X=change-me', 'a.test.ts': 'AKIAABCDEFGHIJKLMNOP', 'n.md': '-----BEGIN PRIVATE KEY-----', 'ok.txt': 'nada' };
  const r = mod.segredosVersionados(['dev.env', 'dev.env.example', ...Object.keys(conteudo)], (f) => conteudo[f] ?? '');
  assert.deepEqual(r.map((x) => x.split(':')[0]).sort(), ['a.ts', 'dev.env']);
});

test('--dry-run nao altera nada e mostra o plano', () => {
  const { d } = produto();
  const antes = git(d, 'rev-parse', 'HEAD');
  const r = roda(d, '--dry-run');
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.match(r.stdout, /Release 2026\.10\.1 \(dry-run: nada foi alterado\)/);
  assert.match(r.stdout, /backend\/pom\.xml: 0\.1\.0 -> 2026\.10\.1/);
  assert.equal(git(d, 'status', '--porcelain'), '');
  assert.equal(git(d, 'rev-parse', 'HEAD'), antes);
  assert.equal(git(d, 'branch', '--show-current'), 'develop');
  assert.equal(git(d, 'tag', '--list'), '');
});

test('release real: versoes sobem juntas na branch release/, commit e tag locais, e PARA (nada vai ao origin)', () => {
  const { d, origin } = produto({ remoto: true });
  const r = roda(d);
  assert.equal(r.status, 0, r.stderr + r.stdout);
  assert.equal(git(d, 'branch', '--show-current'), 'release/2026.10.1');
  assert.match(readFileSync(join(d, 'backend/pom.xml'), 'utf8'), /<artifactId>api<\/artifactId>\n {2}<version>2026\.10\.1<\/version>/);
  for (const s of ['frontend', 'admin']) assert.match(readFileSync(join(d, s, 'package.json'), 'utf8'), /"version": "2026\.10\.1"/);
  assert.match(readFileSync(join(d, 'CHANGELOG.md'), 'utf8'), /## \[2026\.10\.1\] - 2026-10-29\n\n- algo novo/);
  assert.equal(git(d, 'log', '-1', '--format=%s'), 'release: 2026.10.1');
  assert.equal(git(d, 'tag', '--list'), 'v2026.10.1');
  assert.match(r.stdout, /PARADO/);
  assert.equal(git(origin!, 'tag', '--list'), '', 'tag nao foi para o origin');
  assert.equal(git(origin!, 'branch', '--list', 'release/*'), '', 'branch release nao foi para o origin');
  assert.equal(git(d, 'rev-parse', 'main'), git(origin!, 'rev-parse', 'main'), 'a main nao foi tocada');
});

test('segunda release do mes sobe o N; tag ja existente e recusada (local ou no origin)', () => {
  const { d } = produto();
  git(d, 'tag', 'v2026.10.1');
  const r = roda(d, '--dry-run');
  assert.match(r.stdout, /Release 2026\.10\.2/);
  const forcado = roda(d, '--dry-run', '--versao', '2026.10.1');
  assert.equal(forcado.status, 1);
  assert.match(forcado.stdout, /FALHA tag v2026\.10\.1 inexistente/);
  const { d: d2, origin } = produto({ remoto: true });
  const outro = mkdtempSync(join(tmpdir(), 'sg-release-clone-'));
  dirs.push(outro);
  execFileSync('git', ['clone', '-q', origin!, outro]);
  git(outro, 'config', 'user.email', 't@t.t');
  git(outro, 'config', 'user.name', 't');
  git(outro, 'tag', 'v2026.10.5');
  git(outro, 'push', '-q', 'origin', 'v2026.10.5');
  assert.match(roda(d2, '--dry-run').stdout, /Release 2026\.10\.6/, 'enxerga tag que so existe no origin');
});

test('recusa e nao altera: versoes incoerentes, fora da develop, arvore suja, segredo versionado', () => {
  const inc = produto({ versaoAdmin: '0.2.0' }).d;
  const r1 = roda(inc);
  assert.equal(r1.status, 1);
  assert.match(r1.stdout, /FALHA versoes coerentes entre os servicos/);
  assert.equal(git(inc, 'branch', '--show-current'), 'develop');
  assert.equal(git(inc, 'tag', '--list'), '');

  const { d } = produto();
  git(d, 'switch', '-q', 'main');
  assert.match(roda(d).stdout, /FALHA na branch develop/);
  git(d, 'switch', '-q', 'develop');
  writeFileSync(join(d, 'sujo.txt'), 'x');
  assert.match(roda(d).stdout, /FALHA arvore de trabalho limpa/);
  rmSync(join(d, 'sujo.txt'));
  writeFileSync(join(d, 'backend/dev.env'), 'SENHA=abc\n');
  git(d, 'add', '-A');
  git(d, 'commit', '-q', '-m', 'oops');
  const r4 = roda(d);
  assert.equal(r4.status, 1);
  assert.match(r4.stdout, /FALHA nenhum segredo versionado[^\n]*dev\.env/);
  assert.equal(git(d, 'tag', '--list'), '');
});

test('sem produto.json: erro claro e saida 2', () => {
  const d = mkdtempSync(join(tmpdir(), 'sg-release-'));
  dirs.push(d);
  const r = spawnSync(process.execPath, [SCRIPT, '--destino', d], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /produto\.json/);
});
