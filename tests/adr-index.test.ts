import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-adr/scripts/adr-index.mjs');

const dirs: string[] = [];
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

/** Cria docs/ai/{decisions,plans} num diretório temporário; devolve a raiz. */
function projeto(): { raiz: string; decisions: string } {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-adr-'));
  dirs.push(raiz);
  const decisions = join(raiz, 'docs/ai/decisions');
  mkdirSync(decisions, { recursive: true });
  mkdirSync(join(raiz, 'docs/ai/plans'), { recursive: true });
  return { raiz, decisions };
}

function adr(decisions: string, nome: string, h: { numero?: number; data?: string; titulo?: string; extra?: string }) {
  const linhas = ['---', `titulo: ${h.titulo ?? 'Uma decisão'}`];
  if (h.numero !== undefined) linhas.push(`numero: ${h.numero}`);
  linhas.push(`data: ${h.data ?? '2026-11-01'}`, 'status: aceita', 'decidido-por: dono', 'dominio: [dados]');
  if (h.extra) linhas.push(h.extra);
  linhas.push('---', '', '# Decisão', '');
  writeFileSync(join(decisions, nome), linhas.join('\n'), 'utf8');
}

function rodar(decisions: string, ...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, '--dir', decisions, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout, err: r.stderr };
}

test('nome novo ADR<n>-AAAA-MM-DD-slug.md é aceito e o índice linka o arquivo', () => {
  const { decisions } = projeto();
  adr(decisions, 'ADR1-2026-11-01-primeira.md', { numero: 1, titulo: 'Primeira' });
  adr(decisions, 'ADR2-2026-11-01-segunda.md', { numero: 2, titulo: 'Segunda' });
  const r = rodar(decisions);
  assert.equal(r.status, 0, r.err);
  assert.equal(r.err, '', 'nome novo não gera aviso');
  const indice = readFileSync(join(decisions, 'INDEX.md'), 'utf8');
  assert.match(indice, /\[Primeira\]\(ADR1-2026-11-01-primeira\.md\)/);
  assert.equal(rodar(decisions, '--check').status, 0);
});

test('prefixo que não bate com o numero do cabeçalho é erro', () => {
  const { decisions } = projeto();
  adr(decisions, 'ADR5-2026-11-01-primeira.md', { numero: 1 });
  const r = rodar(decisions);
  assert.equal(r.status, 1);
  assert.match(r.err, /prefixo ADR5- não bate com o numero do cabeçalho \(1\)/);
});

test('data do nome diferente da data do cabeçalho é erro', () => {
  const { decisions } = projeto();
  adr(decisions, 'ADR1-2026-10-30-primeira.md', { numero: 1, data: '2026-11-01' });
  const r = rodar(decisions);
  assert.equal(r.status, 1);
  assert.match(r.err, /data do nome \(2026-10-30\) não bate com a data do cabeçalho/);
});

test('nome fora do padrão é erro', () => {
  const { decisions } = projeto();
  adr(decisions, 'primeira.md', { numero: 1 });
  const r = rodar(decisions);
  assert.equal(r.status, 1);
  assert.match(r.err, /o nome deve ser ADR<n>-AAAA-MM-DD-slug\.md/);
});

test('nome antigo AAAA-MM-DD-slug.md ainda passa, só com aviso (não quebra projeto existente)', () => {
  const { decisions } = projeto();
  adr(decisions, '2026-11-01-primeira.md', { numero: 1 });
  const r = rodar(decisions);
  assert.equal(r.status, 0, r.err);
  assert.match(r.err, /Aviso/);
  assert.match(r.err, /2026-11-01-primeira\.md: nome sem o prefixo ADR<n>-/);
  assert.equal(rodar(decisions, '--check').status, 0, 'o --check de quem já tinha o índice em dia segue passando');
});

test('--renomear põe o prefixo, acerta substitui/substituida-por, refaz o índice e lista quem cita o nome antigo', () => {
  const { raiz, decisions } = projeto();
  adr(decisions, '2026-10-01-antiga.md', { numero: 1, titulo: 'Antiga', data: '2026-10-01', extra: 'substituida-por: [2026-11-01-nova.md]' });
  adr(decisions, '2026-11-01-nova.md', { numero: 2, titulo: 'Nova', extra: 'substitui: [2026-10-01-antiga.md]' });
  writeFileSync(join(raiz, 'docs/ai/plans/P1-2026-11-01-plano.md'), 'Veja ../decisions/2026-11-01-nova.md\n', 'utf8');

  const r = rodar(decisions, '--renomear');
  assert.equal(r.status, 0, r.err);
  assert.deepEqual(readdirSync(decisions).filter((n) => n !== 'INDEX.md').sort(), ['ADR1-2026-10-01-antiga.md', 'ADR2-2026-11-01-nova.md']);
  assert.match(readFileSync(join(decisions, 'ADR2-2026-11-01-nova.md'), 'utf8'), /substitui: \[ADR1-2026-10-01-antiga\.md\]/);
  assert.match(readFileSync(join(decisions, 'ADR1-2026-10-01-antiga.md'), 'utf8'), /substituida-por: \[ADR2-2026-11-01-nova\.md\]/);
  assert.doesNotMatch(readFileSync(join(decisions, 'ADR2-2026-11-01-nova.md'), 'utf8'), /ADR1-ADR/, 'não duplica o prefixo');
  assert.match(readFileSync(join(decisions, 'INDEX.md'), 'utf8'), /\(ADR2-2026-11-01-nova\.md\)/);
  assert.match(r.err, /Atualize a referência/);
  assert.match(r.err, /P1-2026-11-01-plano\.md cita 2026-11-01-nova\.md/);
  assert.equal(r.out.includes('2026-11-01-nova.md -> ADR2-2026-11-01-nova.md'), true);
  assert.equal(rodar(decisions, '--check').status, 0);
});

test('--renomear é idempotente: segunda vez não muda nada', () => {
  const { decisions } = projeto();
  adr(decisions, '2026-11-01-primeira.md', { numero: 1 });
  assert.equal(rodar(decisions, '--renomear').status, 0);
  const antes = readdirSync(decisions).sort();
  const r = rodar(decisions, '--renomear');
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /Nada a renomear/);
  assert.deepEqual(readdirSync(decisions).sort(), antes);
});

test('--renomear recusa ADR sem numero e não renomeia nada', () => {
  const { decisions } = projeto();
  adr(decisions, '2026-11-01-sem-numero.md', {});
  const r = rodar(decisions, '--renomear');
  assert.equal(r.status, 1);
  assert.match(r.err, /sem "numero" no cabeçalho; rode --numerar antes/);
  assert.ok(existsSync(join(decisions, '2026-11-01-sem-numero.md')));
});

test('--numerar --renomear juntos migram ADRs sem numero, numerando por data e nome', () => {
  const { decisions } = projeto();
  adr(decisions, '2026-10-01-a.md', { data: '2026-10-01' });
  adr(decisions, '2026-11-01-b.md', {});
  const r = rodar(decisions, '--numerar', '--renomear');
  assert.equal(r.status, 0, r.err);
  assert.deepEqual(readdirSync(decisions).filter((n) => n !== 'INDEX.md').sort(), ['ADR1-2026-10-01-a.md', 'ADR2-2026-11-01-b.md']);
  assert.equal(rodar(decisions, '--check').status, 0);
});
