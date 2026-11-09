import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SKILL = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
type Matriz = { perguntas: unknown[] };
const lib = (await import(pathToFileURL(join(SKILL, 'scripts/matriz.mjs')).href)) as {
  carregar: () => { matriz: Matriz; catalogo: unknown };
  resolver: (m: Matriz, c: unknown, r: Record<string, unknown>) => { erros: string[]; respostas: Record<string, unknown> };
};
const { matriz, catalogo } = lib.carregar();

const BASE = {
  nome: 'Display', slug: 'display', pacote: 'br.com.acme.display', modelo: 'subdomain-tenancy', extensoes: [], apikeysUso: 'Integracoes internas',
  selfEnter: 'nao', provedorWhatsapp: 'evolution', auditoria: 'postgres', armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'filesystem',
  billingProvider: 'stripe', trialDias: 14, planos: 'Basico,Pro', diferencaPlanos: 'Pro libera mais usuarios',
  emailRemetente: 'noreply@seedgrid.com.br', emailAdmin: 'dono@seedgrid.com.br', dominioFront: 'display.seedgrid.com.br',
};
const resolver = (r: Record<string, unknown>) => lib.resolver(matriz, catalogo, { ...BASE, ...r });

test('dominioAdmin e derivado, sem pergunta: slug display + front display.seedgrid.com.br -> display-admin.seedgrid.com.br', () => {
  const r = resolver({});
  assert.deepEqual(r.erros, []);
  assert.equal(r.respostas.dominioAdmin, 'display-admin.seedgrid.com.br');
});

test('login-tenancy (b2b e b2c) deriva do mesmo jeito', () => {
  for (const modelo of ['login-tenancy-b2b', 'login-tenancy-b2c']) {
    const r = resolver({ modelo, slug: 'report', dominioFront: 'report.seedgrid.com.br' });
    assert.deepEqual(r.erros, [], modelo);
    assert.equal(r.respostas.dominioAdmin, 'report-admin.seedgrid.com.br', modelo);
  }
});

test('o admin e sempre <slug>-admin.<dominioFront sem o primeiro rotulo>, mesmo que o front nao comece pelo slug', () => {
  const r = resolver({ slug: 'portal-chaves', dominioFront: 'app.acme.com.br' });
  assert.deepEqual(r.erros, []);
  assert.equal(r.respostas.dominioAdmin, 'portal-chaves-admin.acme.com.br');
});

test('manifesto antigo com dominioAdmin explicito: o valor antigo e ignorado e o admin e derivado', () => {
  const r = resolver({ dominioAdmin: 'admin.seedgrid.com.br' });
  assert.deepEqual(r.erros, []);
  assert.equal(r.respostas.dominioAdmin, 'display-admin.seedgrid.com.br');
});

test('modular continua sem dominioAdmin', () => {
  const { respostas, erros } = resolver({ modelo: 'modular', extensoes: [], dominioAdmin: 'admin.x.com.br' });
  assert.ok(!erros.some((e) => /dominioAdmin/.test(e)), erros.join(' | '));
  assert.equal(respostas.dominioAdmin, undefined);
});
