import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-docs-index/scripts/docs-index.mjs');

const dirs: string[] = [];
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

/** Cria um docs/ai vazio num diretório temporário; devolve a pasta docs/ai. */
function docsAi(): string {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-docs-index-'));
  dirs.push(raiz);
  const ai = join(raiz, 'docs/ai');
  mkdirSync(ai, { recursive: true });
  return ai;
}

function doc(ai: string, rel: string, cabecalho: Record<string, string>, titulo = 'Um documento', corpo = '') {
  const arq = join(ai, rel);
  mkdirSync(dirname(arq), { recursive: true });
  const linhas = ['---', ...Object.entries(cabecalho).map(([k, v]) => `${k}: ${v}`), '---', '', `# ${titulo}`, '', corpo];
  writeFileSync(arq, linhas.join('\n'), 'utf8');
}

function rodar(ai: string, ...args: string[]) {
  const r = spawnSync(process.execPath, [SCRIPT, '--dir', ai, ...args], { encoding: 'utf8' });
  return { status: r.status, out: r.stdout, err: r.stderr };
}

test('lista todos os tipos de documento e linka o arquivo', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-produto.md', { numero: '1', status: 'em-andamento', data: '2026-11-01', aidlc: '0.7.3' }, 'Plano do produto');
  doc(ai, 'adrs/ADR1-2026-11-01-tenancy.md', { numero: '1', status: 'aceita', data: '2026-11-01', aidlc: '0.7.3' }, 'Tenancy por subdomínio');
  doc(ai, 'handoffs/H1-2026-11-01-passagem.md', { status: 'vigente', data: '2026-11-01', aidlc: '0.7.3' }, 'Passagem');
  doc(ai, 'reports/P1.F1.T1-validacao.md', { data: '2026-11-01', aidlc: '0.7.3' }, 'Validação');
  doc(ai, 'analises/P1.F0.T1-inventario.md', { data: '2026-11-01', aidlc: '0.7.3' }, 'Inventário');
  const r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  const indice = readFileSync(join(ai, 'INDEX.md'), 'utf8');
  for (const t of ['## Planos', '## Decisões (ADR)', '## Handoffs', '## Relatórios', '## Análises']) assert.ok(indice.includes(t), t);
  assert.match(indice, /\[Plano do produto\]\(plans\/P1-2026-11-01-produto\.md\)/);
  assert.match(indice, /\| ADR1 \| \[Tenancy por subdomínio\]\(adrs\/ADR1-2026-11-01-tenancy\.md\)/);
});

test('demandas abertas ficam no topo e as respondidas no fim', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-produto.md', { status: 'proposto', aidlc: '0.7.3' }, 'Plano', 'Depende de P1.F1.DEM1 e de P1.F1.DEM2.');
  doc(ai, 'demands/P1.F1.DEM1-2026-11-01-aberta.md', { plano: '1', fase: '1', status: 'aberta', data: '2026-11-01', aidlc: '0.7.3' }, 'Demanda aberta');
  doc(ai, 'demands/P1.F1.DEM2-2026-11-01-feita.md', { plano: '1', fase: '1', status: 'respondida', data: '2026-11-01', aidlc: '0.7.3' }, 'Demanda respondida');
  const r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  const indice = readFileSync(join(ai, 'INDEX.md'), 'utf8');
  const aberta = indice.indexOf('## Demandas abertas');
  const planos = indice.indexOf('## Planos');
  const respondidas = indice.indexOf('## Demandas respondidas');
  assert.ok(aberta >= 0 && aberta < planos && planos < respondidas, 'abertas, planos, respondidas');
  assert.ok(indice.slice(aberta, planos).includes('Demanda aberta'));
  assert.ok(!indice.slice(aberta, planos).includes('Demanda respondida'));
  assert.ok(indice.slice(respondidas).includes('Demanda respondida'));
});

test('status "confirmada" conta como fechada; status desconhecido conta como aberta com aviso', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-produto.md', { aidlc: '0.7.3' }, 'Plano');
  doc(ai, 'demands/P1.F1.DEM1-2026-11-01-a.md', { status: 'confirmada (o painel tem gráfico)', aidlc: '0.7.3' }, 'Confirmada');
  doc(ai, 'demands/P1.F1.DEM2-2026-11-01-b.md', { status: 'talvez', aidlc: '0.7.3' }, 'Estranha');
  const r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  assert.match(r.err, /P1\.F1\.DEM2.*não reconhecido/);
  const indice = readFileSync(join(ai, 'INDEX.md'), 'utf8');
  assert.ok(indice.slice(indice.indexOf('## Demandas abertas'), indice.indexOf('## Planos')).includes('Estranha'));
  assert.ok(indice.slice(indice.indexOf('## Demandas respondidas')).includes('Confirmada'));
});

test('plano que cita demanda sem arquivo e demanda sem plano geram aviso, não erro', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-produto.md', { aidlc: '0.7.3' }, 'Plano', 'Espera a P1.F6.DEM1.');
  doc(ai, 'demands/P7.F1.DEM1-2026-11-01-orfa.md', { status: 'aberta', aidlc: '0.7.3' }, 'Órfã');
  const r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  assert.match(r.err, /cita a demanda P1\.F6\.DEM1/);
  assert.match(r.err, /o plano P7 não existe/);
});

test('id repetido reprova', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-um.md', { aidlc: '0.7.3' }, 'Um');
  doc(ai, 'plans/P1-2026-11-02-outro.md', { aidlc: '0.7.3' }, 'Outro');
  const r = rodar(ai);
  assert.equal(r.status, 1);
  assert.match(r.err, /id repetido \(P1\)/);
});

test('--check reprova índice velho, passa em dia e não grava', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-produto.md', { aidlc: '0.7.3' }, 'Plano');
  assert.equal(rodar(ai, '--check').status, 1, 'sem índice ainda');
  assert.ok(!existsSync(join(ai, 'INDEX.md')), '--check não grava');
  assert.equal(rodar(ai).status, 0);
  assert.equal(rodar(ai, '--check').status, 0, 'em dia');
  doc(ai, 'demands/P1.F1.DEM1-2026-11-01-nova.md', { status: 'aberta', aidlc: '0.7.3' }, 'Nova');
  const velho = rodar(ai, '--check');
  assert.equal(velho.status, 1);
  assert.match(velho.err, /desatualizado/);
});

test('é idempotente e aceita handoff no singular e no plural, com e sem cabeçalho', () => {
  const ai = docsAi();
  doc(ai, 'handoff/H1-2026-11-01-a.md', { aidlc: '0.7.3' }, 'No singular');
  mkdirSync(join(ai, 'handoffs'), { recursive: true });
  writeFileSync(join(ai, 'handoffs/H2-2026-11-01-b.md'), '# Sem cabeçalho nenhum\n', 'utf8');
  assert.equal(rodar(ai).status, 0);
  const a = readFileSync(join(ai, 'INDEX.md'), 'utf8');
  assert.equal(rodar(ai).status, 0);
  assert.equal(readFileSync(join(ai, 'INDEX.md'), 'utf8'), a, 'segunda execução não muda nada');
  assert.ok(a.includes('No singular') && a.includes('Sem cabeçalho nenhum'));
  assert.equal((a.match(/## Handoffs/g) ?? []).length, 1, 'uma seção só para as duas pastas');
});

test('pasta vazia gera índice vazio e passa no --check', () => {
  const ai = docsAi();
  assert.equal(rodar(ai).status, 0);
  assert.match(readFileSync(join(ai, 'INDEX.md'), 'utf8'), /Nenhum documento ainda/);
  assert.equal(rodar(ai, '--check').status, 0);
});

test('demanda que uma tarefa ainda não feita vai escrever (`escreve`) não é citação sem arquivo; depois de feita sem arquivo, avisa', () => {
  const ai = docsAi();
  const tarefa = (marca: string) => `- [${marca}] **P1.F6.T2 Registrar** (\`depende-de\`: P1.F5.T4; \`escreve\`: docs/ai/demands/P1.F6.DEM1-importacao.md)\n`;
  doc(ai, 'plans/P1-2026-11-01-produto.md', { aidlc: '0.7.3' }, 'Plano', tarefa(' '));
  const r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  assert.ok(!/P1\.F6\.DEM1/.test(r.err), 'tarefa pendente: sem aviso');
  doc(ai, 'plans/P1-2026-11-01-produto.md', { aidlc: '0.7.3' }, 'Plano', tarefa('x'));
  assert.match(rodar(ai).err, /cita a demanda P1\.F6\.DEM1/);
});
