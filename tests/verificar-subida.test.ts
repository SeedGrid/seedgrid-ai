import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SKILL = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
type Passo = { id: string; estado: string; detalhe: string; log?: string[] };
const { verificar, errosDoLog, lerEnv } = (await import(pathToFileURL(join(SKILL, 'scripts/verificar-subida.mjs')).href)) as {
  verificar: (o: { destino: string; timeout?: number; front?: boolean }) => Promise<{ ok: boolean; passos: Passo[] }>;
  errosDoLog: (t: string) => string[];
  lerEnv: (f: string) => Record<string, string>;
};

const dirs: string[] = [];
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

function portaLivre(): Promise<number> {
  return new Promise((ok) => { const s = createServer().listen(0, '127.0.0.1', () => { const p = (s.address() as { port: number }).port; s.close(() => ok(p)); }); });
}

/** Produto minimo: sem compose, backend falso (node) que imita a security: health, login e rota protegida. */
async function produtoFalso({ comErro = false, loginOk = true } = {}) {
  const d = mkdtempSync(join(tmpdir(), 'sg-subida-teste-')); dirs.push(d);
  const porta = await portaLivre();
  writeFileSync(join(d, 'produto.json'), JSON.stringify({ slug: 'falso', servicos: [{ nome: 'backend', tipo: 'backend', porta }] }));
  mkdirSync(join(d, 'backend'));
  writeFileSync(join(d, 'backend/dev.env'), 'SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL=admin@falso.test\nSEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD=SenhaDeTeste#1\n');
  writeFileSync(join(d, 'backend/servidor.mjs'), `
import http from 'node:http';
${comErro ? "console.log('2026-10-22 ERROR [io.quarkus] falhou ao iniciar');" : ''}
http.createServer((q, r) => {
  let corpo = ''; q.on('data', (c) => (corpo += c)); q.on('end', () => {
    if (q.url === '/q/health/ready') { r.writeHead(200); return r.end('{"status":"UP"}'); }
    if (q.url === '/public/auth/login' && q.method === 'POST') {
      const ok = ${loginOk} && JSON.parse(corpo).login === 'admin@falso.test' && JSON.parse(corpo).password === 'SenhaDeTeste#1';
      r.writeHead(ok ? 200 : 401, { 'content-type': 'application/json' }); return r.end(ok ? '{"accessToken":"t0k3n"}' : '{}');
    }
    if (q.url === '/me/profile') { r.writeHead(q.headers.authorization === 'Bearer t0k3n' ? 200 : 401); return r.end('{}'); }
    r.writeHead(404); r.end();
  });
}).listen(${porta}, '127.0.0.1');
`);
  writeFileSync(join(d, 'backend/run.sh'), '#!/bin/bash\nexec node servidor.mjs\n');
  return d;
}

test('verificar-subida: backend que sobe, loga e protege a rota passa em todos os passos aplicaveis', async () => {
  const d = await produtoFalso();
  const r = await verificar({ destino: d, timeout: 30, front: false });
  assert.equal(r.ok, true, JSON.stringify(r.passos));
  const por = Object.fromEntries(r.passos.map((p) => [p.id, p.estado]));
  assert.equal(por.backend, 'ok');
  assert.equal(por.login, 'ok');
});

test('verificar-subida: ERROR no log do boot reprova o passo backend e mostra o trecho', async () => {
  const d = await produtoFalso({ comErro: true });
  const r = await verificar({ destino: d, timeout: 30, front: false });
  assert.equal(r.ok, false);
  const back = r.passos.find((p) => p.id === 'backend')!;
  assert.equal(back.estado, 'falha');
  assert.match(back.log!.join('\n'), /ERROR/);
});

test('verificar-subida: login que falha reprova o passo login (e a senha nunca aparece no relato)', async () => {
  const d = await produtoFalso({ loginOk: false });
  const r = await verificar({ destino: d, timeout: 30, front: false });
  assert.equal(r.ok, false);
  assert.equal(r.passos.find((p) => p.id === 'login')!.estado, 'falha');
  assert.ok(!JSON.stringify(r).includes('SenhaDeTeste'), 'o relato vazou a senha');
});

test('verificar-subida: pasta sem produto.json falha no primeiro passo; helpers de log e env', async () => {
  const d = mkdtempSync(join(tmpdir(), 'sg-subida-vazio-')); dirs.push(d);
  const r = await verificar({ destino: d, timeout: 5, front: false });
  assert.equal(r.ok, false);
  assert.equal(r.passos[0]!.id, 'produto');
  assert.deepEqual(errosDoLog('INFO a\n2026 ERROR b\nWARN c'), ['2026 ERROR b']);
  assert.deepEqual(lerEnv(join(d, 'nao-existe.env')), {});
});

test('errosDoLog: aviso de unidade de persistencia so conta para classe de verdade, nao para as bases do Panache e listeners do commons', () => {
  const aviso = (classes: string[]) => `INFO a\n[WARNING] [io.quarkus.hibernate.orm.deployment.HibernateOrmProcessor] Could not find a suitable persistence unit for model classes:\n${classes.map((c) => `\t- ${c}`).join('\n')}\n[INFO] fim`;
  const bases = ['br.com.seedgrid.commons.persistence.BaseEntityAuditListener', 'br.com.seedgrid.commons.persistence.BaseEntityPanache', 'br.com.seedgrid.commons.persistence.BaseEntityPanacheAuditListener', 'io.quarkus.hibernate.orm.panache.PanacheEntityBase'];
  assert.deepEqual(errosDoLog(aviso(bases)), []);
  const r = errosDoLog(aviso([...bases, 'br.com.seedgrid.cities.embeddables.Address']));
  assert.equal(r.length, 1);
  assert.match(r[0]!, /cities\.embeddables\.Address/);
  assert.doesNotMatch(r[0]!, /PanacheEntityBase/);
});
