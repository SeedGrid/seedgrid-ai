import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

// build-test/tests/check-boilerplate-versions.test.js -> raiz do repositorio
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const SCRIPT = path.join(ROOT, 'scripts', 'check-boilerplate-versions.mjs');

const POM = (loginTenancy: string) => `<project>
  <properties>
    <seedgrid.login-tenancy.version>${loginTenancy}</seedgrid.login-tenancy.version>
    <seedgrid.whatsapp.version>2026.11.0</seedgrid.whatsapp.version>
  </properties>
  <dependencyManagement><dependencies><dependency>
    <groupId>br.com.seedgrid</groupId>
    <artifactId>seedgrid-login-tenancy-parent</artifactId>
    <version>\${seedgrid.login-tenancy.version}</version>
    <type>pom</type>
    <scope>import</scope>
  </dependency></dependencies></dependencyManagement>
</project>`;

const PKG = (core: string) => JSON.stringify({ dependencies: { '@seedgrid/fe-core': core, react: '19.0.0' } });

const FIXTURE = {
  mvn: { 'seedgrid-login-tenancy': '2026.11.9', 'seedgrid-whatsapp-evolution': '2026.11.0', 'seedgrid-security': '2026.11.12' },
  npm: { '@seedgrid/fe-core': '2026.11.15' },
  bom: { 'seedgrid-login-tenancy-parent@2026.11.9': { security: '2026.11.0' } },
};

function withBoilerplates(pomVersion: string, core: string, fn: (dir: string, fixture: string) => void): void {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'check-boilerplate-versions-'));
  try {
    fs.mkdirSync(path.join(dir, 'b2b', 'backend'), { recursive: true });
    fs.mkdirSync(path.join(dir, 'b2b', 'frontend'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'b2b', 'backend', 'pom.xml'), POM(pomVersion), 'utf8');
    fs.writeFileSync(path.join(dir, 'b2b', 'frontend', 'package.json'), PKG(core), 'utf8');
    const fixture = path.join(dir, 'fixture.json');
    fs.writeFileSync(fixture, JSON.stringify(FIXTURE), 'utf8');
    fn(path.join(dir), fixture);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function run(...args: string[]): { code: number | null; out: string } {
  const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' });
  return { code: r.status, out: `${r.stdout}${r.stderr}` };
}

test('avisa o pacote npm, o do pom e o que vem do BOM, e sai 0', () => {
  withBoilerplates('2026.11.9', '2026.6.7', (dir, fixture) => {
    const r = run('--boilerplates', dir, '--fixture', fixture);
    assert.equal(r.code, 0);
    assert.match(r.out, /ATRAS b2b: @seedgrid\/fe-core fixa 2026\.6\.7 .*2026\.11\.15/);
    assert.match(r.out, /ATRAS b2b: seedgrid-security fixa 2026\.11\.0 \(BOM de seedgrid-login-tenancy-parent@2026\.11\.9\).*2026\.11\.12/);
    assert.doesNotMatch(r.out, /ATRAS b2b: seedgrid-login-tenancy fixa/);
    assert.match(r.out, /2 pacote\(s\) atras/);
  });
});

test('pom que fixa a propria versao vence o BOM; tudo em dia nao avisa nada', () => {
  withBoilerplates('2026.11.9', '2026.11.15', (dir, fixture) => {
    const body = JSON.parse(fs.readFileSync(fixture, 'utf8'));
    body.bom['seedgrid-login-tenancy-parent@2026.11.9'] = { security: '2026.11.12' };
    fs.writeFileSync(fixture, JSON.stringify(body), 'utf8');
    const r = run('--boilerplates', dir, '--fixture', fixture);
    assert.equal(r.code, 0);
    assert.doesNotMatch(r.out, /ATRAS/);
    assert.match(r.out, /0 pacote\(s\) atras/);
  });
});

test('--strict reprova quando algo esta atras; sem --strict nunca reprova', () => {
  withBoilerplates('2026.11.9', '2026.6.7', (dir, fixture) => {
    assert.equal(run('--boilerplates', dir, '--fixture', fixture, '--strict').code, 1);
    assert.equal(run('--boilerplates', dir, '--fixture', fixture).code, 0);
  });
});

test('--json devolve a tabela modelo x pacote x fixada x ultima', () => {
  withBoilerplates('2026.11.9', '2026.6.7', (dir, fixture) => {
    const j = JSON.parse(run('--boilerplates', dir, '--fixture', fixture, '--json').out);
    const core = j.linhas.find((l: { pacote: string }) => l.pacote === '@seedgrid/fe-core');
    assert.deepEqual(
      { modelo: core.modelo, fixada: core.fixada, ultima: core.ultima, situacao: core.situacao },
      { modelo: 'b2b', fixada: '2026.6.7', ultima: '2026.11.15', situacao: 'atras' },
    );
  });
});

test('pasta de boilerplates inexistente: avisa e sai 0', () => {
  const r = run('--boilerplates', path.join(os.tmpdir(), 'nao-existe-p175'));
  assert.equal(r.code, 0);
  assert.match(r.out, /nao encontrada/);
});
