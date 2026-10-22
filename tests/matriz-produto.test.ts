import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SKILL = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
type Matriz = { perguntas: { id: string; numero: string; ordem: number; tipo: string; opcoes?: { id: string; disponivel?: boolean; efeito: object }[]; campos?: { id: string; efeito: object }[]; efeito?: object }[] };
const lib = (await import(pathToFileURL(join(SKILL, 'scripts/matriz.mjs')).href)) as {
  carregar: () => { matriz: Matriz; catalogo: { extensions: Record<string, unknown> } };
  validarMatriz: (m: Matriz, c: unknown, f?: unknown) => string[];
  resolver: (m: Matriz, c: unknown, r: Record<string, unknown>) => { erros: string[]; extensoes: string[]; adicionadas: string[]; efeitos: { origem: string }[] };
};
const { matriz, catalogo } = lib.carregar();

const BASE = { nome: 'Portal Chaves', slug: 'portal-chaves', pacote: 'br.com.acme.portal' };
const DADOS = { dominioFront: 'app.acme.com.br', dominioAdmin: 'admin.acme.com.br', emailRemetente: 'noreply@acme.com.br', emailAdmin: 'dono@acme.com.br' };
const B2B = { ...BASE, ...DADOS, modelo: 'login-tenancy-b2b', extensoes: [], selfEnter: 'nao', auditoria: 'postgres', armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'filesystem', apikeysUso: 'Integracoes internas', billingProvider: 'stripe', trialDias: 14, planos: 'Basico,Pro' };

test('a matriz e o catalogo sao consistentes (sem problemas)', () => {
  assert.deepEqual(lib.validarMatriz(matriz, catalogo), []);
});

test('ordem estavel: ordens crescentes, numeros e ids unicos, mesma ordem em duas leituras', () => {
  const ordens = matriz.perguntas.map((p) => p.ordem);
  assert.deepEqual(ordens, [...ordens].sort((a, b) => a - b));
  assert.equal(new Set(matriz.perguntas.map((p) => p.numero)).size, matriz.perguntas.length);
  assert.deepEqual(matriz.perguntas.map((p) => p.numero), ['1', '2', '3', '3b', '4', '5', '5b', '6', '7', '7a', '8', '9', '9b', '9c', '10']);
  const h = (m: Matriz) => createHash('sha256').update(JSON.stringify(m)).digest('hex');
  assert.equal(h(lib.carregar().matriz), h(matriz));
});

test('completude: toda opcao e todo campo tem efeito declarado', () => {
  for (const p of matriz.perguntas) {
    for (const o of p.opcoes ?? []) assert.ok(Object.keys(o.efeito).length > 0, `${p.id}.${o.id}`);
    for (const c of p.campos ?? []) assert.ok(Object.keys(c.efeito).length > 0, `${p.id}.${c.id}`);
    if (p.tipo === 'texto') assert.ok(Object.keys(p.efeito ?? {}).length > 0, p.id);
  }
});

test('validarMatriz acusa opcao sem efeito, extension fora do catalogo e opcional que o modelo ja traz', () => {
  const copia = JSON.parse(JSON.stringify(matriz)) as Matriz;
  const p3 = copia.perguntas.find((p) => p.id === 'extensoes-opcionais')!;
  p3.opcoes![0]!.efeito = {};
  p3.opcoes!.push({ id: 'apikeys', efeito: { extensions: ['apikeys'] } });
  p3.opcoes!.push({ id: 'inexistente', efeito: { extensions: ['inexistente'] } });
  const erros = lib.validarMatriz(copia, catalogo);
  assert.ok(erros.some((e) => /sem efeito declarado/.test(e)), erros.join('\n'));
  assert.ok(erros.some((e) => /ja vem em login-tenancy/.test(e)));
  assert.ok(erros.some((e) => /fora do catalogo: inexistente/.test(e)));
});

test('B2C aparece desligada e e recusada', () => {
  const modelo = matriz.perguntas.find((p) => p.id === 'modelo')!;
  const b2c = modelo.opcoes!.find((o) => o.id === 'login-tenancy-b2c')!;
  assert.equal(b2c.disponivel, false);
  const r = lib.resolver(matriz, catalogo, { ...B2B, modelo: 'login-tenancy-b2c' });
  assert.ok(r.erros.some((e) => /indisponivel/.test(e)), r.erros.join('\n'));
});

test('login-tenancy B2B valido: perguntas condicionais e extensions que o modelo traz', () => {
  const r = lib.resolver(matriz, catalogo, B2B);
  assert.deepEqual(r.erros, []);
  assert.ok(r.extensoes.includes('apikeys') && r.extensoes.includes('billing'));
  assert.ok(!r.efeitos.some((e) => e.origem.startsWith('self-enter-modo')), 'self-enter desligado nao pergunta o modo');
});

test('resposta a pergunta que nao se aplica e recusada (nada fora da matriz)', () => {
  const r = lib.resolver(matriz, catalogo, { ...B2B, selfEnterModo: 'convite' });
  assert.ok(r.erros.some((e) => /selfEnterModo/.test(e)), r.erros.join('\n'));
  const r2 = lib.resolver(matriz, catalogo, { ...B2B, coisa: 1 });
  assert.ok(r2.erros.some((e) => /coisa/.test(e)));
});

test('modelo modular: security + audit sao a base; apikeys e opcional; sem opcionais e valido; perguntas de tenancy nao se aplicam', () => {
  const { dominioAdmin: _admin, ...dados } = DADOS as Record<string, unknown>;
  const outro = { ...BASE, ...dados, modelo: 'modular' };
  const a = lib.resolver(matriz, catalogo, { ...outro, extensoes: ['apikeys'], apikeysUso: 'x' });
  assert.deepEqual(a.erros, []);
  assert.deepEqual([...a.extensoes].sort(), ['apikeys', 'audit', 'security']);
  const s = lib.resolver(matriz, catalogo, { ...outro, extensoes: [] });
  assert.deepEqual(s.erros, []);
  assert.deepEqual([...s.extensoes].sort(), ['audit', 'security']);
  const ruim = lib.resolver(matriz, catalogo, { ...outro, extensoes: [], selfEnter: 'nao' });
  assert.ok(ruim.erros.some((e) => /selfEnter/.test(e)), ruim.erros.join('\n'));
});

test('validacoes de campo: slug, pacote, e-mail e dias de trial', () => {
  const ruim = lib.resolver(matriz, catalogo, { ...B2B, slug: 'Portal Chaves', pacote: 'Portal', emailAdmin: 'x', trialDias: -1 });
  for (const campo of ['slug', 'pacote', 'emailAdmin', 'trialDias']) assert.ok(ruim.erros.some((e) => e.includes(`"${campo}"`)), `${campo}: ${ruim.erros.join(' | ')}`);
});

test('determinismo da resolucao: mesmas respostas, mesmos efeitos e extensions', () => {
  const a = lib.resolver(matriz, catalogo, { ...B2B, extensoes: ['exchange', 'ai-pricing'] });
  const b = lib.resolver(matriz, catalogo, { ...B2B, extensoes: ['ai-pricing', 'exchange'] });
  assert.deepEqual(a, b);
  assert.ok(readFileSync(join(SKILL, 'data/matriz-produto.json'), 'utf8').length > 0);
});

test('toda receita citada pela matriz existe em data/modulos-front.json (validacao completa com o catalogo de receitas)', () => {
  const { modulosFront } = lib.carregar() as unknown as { modulosFront: unknown };
  assert.deepEqual(lib.validarMatriz(matriz, catalogo, modulosFront), []);
});
