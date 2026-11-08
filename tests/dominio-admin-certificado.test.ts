import assert from 'node:assert/strict';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SKILL = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
type Matriz = { perguntas: unknown[] };
const lib = (await import(pathToFileURL(join(SKILL, 'scripts/matriz.mjs')).href)) as {
  carregar: () => { matriz: Matriz; catalogo: unknown };
  resolver: (m: Matriz, c: unknown, r: Record<string, unknown>) => { erros: string[] };
  umNivelAbaixo: (host: string, wildcard: string) => boolean;
};
const { matriz, catalogo } = lib.carregar();

const BASE = {
  nome: 'Portal Chaves', slug: 'portal-chaves', pacote: 'br.com.acme.portal', modelo: 'login-tenancy-b2b', extensoes: [],
  apikeysUso: 'Integracoes internas', selfEnter: 'nao', provedorWhatsapp: 'evolution', auditoria: 'postgres', armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'filesystem',
  billingProvider: 'stripe', trialDias: 14, planos: 'Basico,Pro', diferencaPlanos: 'Pro libera mais usuarios',
  emailRemetente: 'noreply@acme.com.br', emailAdmin: 'dono@acme.com.br', dominioFront: 'app.acme.com.br',
};
const erros = (r: Record<string, unknown>) => lib.resolver(matriz, catalogo, { ...BASE, ...r }).erros;

test('umNivelAbaixo: so um rotulo antes da base do wildcard', () => {
  assert.equal(lib.umNivelAbaixo('admin.acme.com.br', '*.acme.com.br'), true);
  assert.equal(lib.umNivelAbaixo('admin.app.acme.com.br', '*.acme.com.br'), false);
  assert.equal(lib.umNivelAbaixo('acme.com.br', '*.acme.com.br'), false);
  assert.equal(lib.umNivelAbaixo('admin.outra.com.br', '*.acme.com.br'), false);
  assert.equal(lib.umNivelAbaixo('admin.acme.com.br', 'acme.com.br'), false);
});

test('wildcard de um nivel gera dominioAdmin valido', () => {
  assert.deepEqual(erros({ certificadoWildcard: '*.acme.com.br', dominioAdmin: 'admin.acme.com.br' }), []);
  assert.deepEqual(erros({ certificadoWildcard: '*.acme.com.br', dominioAdmin: 'display-admin.acme.com.br' }), []);
});

test('admin de dois niveis ou fora do wildcard e rejeitado, com a regra na mensagem', () => {
  const dois = erros({ certificadoWildcard: '*.acme.com.br', dominioAdmin: 'admin.app.acme.com.br' });
  assert.ok(dois.some((e) => /UM nivel abaixo do certificado \*\.acme\.com\.br/.test(e)), dois.join('\n'));
  const fora = erros({ certificadoWildcard: '*.acme.com.br', dominioAdmin: 'admin.outra.com.br' });
  assert.ok(fora.some((e) => /dominioAdmin/.test(e) && /UM nivel/.test(e)), fora.join('\n'));
  const raiz = erros({ certificadoWildcard: '*.acme.com.br', dominioAdmin: 'acme.com.br' });
  assert.ok(raiz.some((e) => /dominioAdmin/.test(e)), raiz.join('\n'));
});

test('wildcard ausente ou malformado e rejeitado', () => {
  assert.ok(erros({ dominioAdmin: 'admin.acme.com.br' }).some((e) => /certificadoWildcard/.test(e)));
  assert.ok(erros({ certificadoWildcard: 'acme.com.br', dominioAdmin: 'admin.acme.com.br' }).some((e) => /certificadoWildcard/.test(e)));
  assert.ok(erros({ certificadoWildcard: '*.*.acme.com.br', dominioAdmin: 'admin.acme.com.br' }).some((e) => /certificadoWildcard/.test(e)));
});

test('dominioAdmin padrao: <slug>-admin.<base do wildcard>, e o padrao passa na validacao de um nivel', () => {
  const r = lib.resolver(matriz, catalogo, { ...BASE, slug: 'report', certificadoWildcard: '*.seedgrid.com.br' }) as { erros: string[]; respostas?: Record<string, string> };
  assert.deepEqual(r.erros, []);
  assert.equal(r.respostas?.dominioAdmin, 'report-admin.seedgrid.com.br');
  assert.deepEqual(erros({ certificadoWildcard: '*.seedgrid.com.br', dominioAdmin: 'report-admin.seedgrid.com.br' }), []);
});

const SUB = { ...BASE, modelo: 'subdomain-tenancy', certificadoWildcard: '*.seedgrid.com.br', dominioAdmin: 'display-admin.seedgrid.com.br' };
const errosSub = (r: Record<string, unknown>) => lib.resolver(matriz, catalogo, { ...SUB, ...r }).erros;

test('subdomain-tenancy: front igual a base nao precisa do segundo wildcard', () => {
  assert.deepEqual(errosSub({ dominioFront: 'seedgrid.com.br' }), []);
});

test('subdomain-tenancy: front mais fundo que a base exige *.<dominioFront>; sem ele e rejeitado', () => {
  const sem = errosSub({ dominioFront: 'display.seedgrid.com.br' });
  assert.ok(sem.some((e) => /certificadoWildcardTenants/.test(e) && /\*\.display\.seedgrid\.com\.br/.test(e)), sem.join(' | '));
  assert.deepEqual(errosSub({ dominioFront: 'display.seedgrid.com.br', certificadoWildcardTenants: '*.display.seedgrid.com.br' }), []);
  const errado = errosSub({ dominioFront: 'display.seedgrid.com.br', certificadoWildcardTenants: '*.outro.seedgrid.com.br' });
  assert.ok(errado.some((e) => /certificadoWildcardTenants/.test(e)), errado.join(' | '));
});

test('login-tenancy: dominioFront nao e validado contra o wildcard e o segundo wildcard nao se aplica', () => {
  assert.deepEqual(erros({ certificadoWildcard: '*.acme.com.br', dominioAdmin: 'admin.acme.com.br', dominioFront: 'app.x.outra.com.br' }), []);
  // o segundo wildcard so entra no efeito do subdomain-tenancy (nos demais, como dominioAdmin no modular, a chave e aceita e ignorada)
  const r = lib.resolver(matriz, catalogo, { ...BASE, certificadoWildcard: '*.acme.com.br', dominioAdmin: 'admin.acme.com.br', certificadoWildcardTenants: '*.app.acme.com.br' }) as unknown as { efeitos: { origem: string }[] };
  assert.ok(!r.efeitos.some((x) => /certificadoWildcardTenants/.test(x.origem)));
});
