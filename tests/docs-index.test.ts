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

const TITULOS_FIXOS = ['Resumo', 'Demandas abertas (cobram ação de alguém)', 'Planos', 'Decisões (ADR)', 'Handoffs', 'Relatórios', 'Especificações', 'Análises', 'Demandas respondidas', 'Outros'];
/** Os títulos de nível 2 do índice, na ordem em que aparecem. */
const titulosDe = (indice: string) => [...indice.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

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
  const vazio = readFileSync(join(ai, 'INDEX.md'), 'utf8');
  assert.deepEqual(titulosDe(vazio), TITULOS_FIXOS, 'mesmo layout com a pasta vazia');
  assert.equal((vazio.match(/_Nenhum\._/g) ?? []).length, 9, 'as 9 seções de lista dizem Nenhum');
  assert.ok(vazio.includes('| **Total** | **0** |'));
  assert.equal(rodar(ai, '--check').status, 0);
});

test('layout fixo: a mesma ordem de seções com e sem demanda aberta, com e sem ADR', () => {
  const sem = docsAi();
  doc(sem, 'plans/P1-2026-11-01-produto.md', { numero: '1', status: 'em-andamento', aidlc: '0.7.8' }, 'Plano');
  assert.equal(rodar(sem).status, 0);
  const indiceSem = readFileSync(join(sem, 'INDEX.md'), 'utf8');

  const com = docsAi();
  doc(com, 'plans/P1-2026-11-01-produto.md', { numero: '1', status: 'em-andamento', aidlc: '0.7.8' }, 'Plano');
  doc(com, 'demands/P1.F1.DEM1-2026-11-01-a.md', { plano: '1', fase: '1', status: 'aberta', aidlc: '0.7.8' }, 'Aberta');
  doc(com, 'demands/P1.F1.DEM2-2026-11-01-b.md', { plano: '1', fase: '1', status: 'respondida', aidlc: '0.7.8' }, 'Respondida');
  doc(com, 'adrs/ADR1-2026-11-01-x.md', { numero: '1', status: 'aceita', aidlc: '0.7.8' }, 'Decisão');
  doc(com, 'reports/P1.F1.T1-validacao.md', { aidlc: '0.7.8' }, 'Relatório');
  doc(com, 'specs/P1.F1.T2-especificacao.md', { aidlc: '0.7.8' }, 'Especificação');
  assert.equal(rodar(com).status, 0);
  const indiceCom = readFileSync(join(com, 'INDEX.md'), 'utf8');

  assert.deepEqual(titulosDe(indiceSem), TITULOS_FIXOS);
  assert.deepEqual(titulosDe(indiceCom), TITULOS_FIXOS);
  assert.ok(indiceSem.includes('## Demandas abertas (cobram ação de alguém)\n\n_Nenhum._'), 'sem demanda aberta a seção continua lá');
  assert.ok(indiceSem.includes('## Decisões (ADR)\n\n_Nenhum._'), 'sem ADR a seção continua lá');
  assert.ok(indiceCom.includes('| Demandas abertas | 1 |') && indiceCom.includes('| Decisões (ADR) | 1 |') && indiceCom.includes('| Demandas respondidas | 1 |'));
  assert.ok(indiceCom.includes('| **Total** | **6** |'));
  assert.ok(!indiceCom.slice(indiceCom.indexOf('## Planos'), indiceCom.indexOf('## Decisões')).includes('Aberta'), 'a demanda aberta não vai para Planos');
});

test('Outros mostra uma subseção por pasta fora do padrão e Nenhum quando não há', () => {
  const ai = docsAi();
  doc(ai, 'plans/P1-2026-11-01-produto.md', { numero: '1', status: 'em-andamento', aidlc: '0.7.8' }, 'Plano');
  assert.equal(rodar(ai).status, 0);
  assert.ok(readFileSync(join(ai, 'INDEX.md'), 'utf8').endsWith('## Outros\n\n_Nenhum._\n'));
  doc(ai, 'notas/N1-2026-11-01-ideia.md', { status: 'vigente', aidlc: '0.7.8' }, 'Ideia solta');
  doc(ai, 'ADICIONAL.md', { aidlc: '0.7.8' }, 'Na raiz');
  assert.equal(rodar(ai).status, 0);
  const indice = readFileSync(join(ai, 'INDEX.md'), 'utf8');
  assert.deepEqual(titulosDe(indice), TITULOS_FIXOS, 'Outros continua sendo a última seção de nível 2');
  const outros = indice.slice(indice.indexOf('## Outros'));
  assert.ok(outros.includes('### (raiz de docs/ai)') && outros.includes('### notas'));
  assert.ok(outros.includes('Ideia solta') && outros.includes('Na raiz'));
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

test('plano proposto com tarefa feita ou em andamento reprova; em-andamento passa; concluido com tarefa aberta so avisa', () => {
  const ai = docsAi();
  const FEITA = ['- [x] **P1.F1.T1 Feita**', '  - Evidencia: x'].join(String.fromCharCode(10));
  doc(ai, 'plans/P1-2026-11-01-a.md', { numero: '1', status: 'proposto', data: '2026-11-01', aidlc: '0.7.6' }, 'A', FEITA);
  let r = rodar(ai);
  assert.equal(r.status, 1);
  assert.match(r.err, /"proposto" com 1 tarefa/);
  doc(ai, 'plans/P1-2026-11-01-a.md', { numero: '1', status: 'em-andamento', data: '2026-11-01', aidlc: '0.7.6' }, 'A', FEITA);
  r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  doc(ai, 'plans/P1-2026-11-01-a.md', { numero: '1', status: 'proposto', data: '2026-11-01', aidlc: '0.7.6' }, 'A', '- [ ] **P1.F1.T1 Aberta**');
  assert.equal(rodar(ai).status, 0);
  doc(ai, 'plans/P1-2026-11-01-a.md', { numero: '1', status: 'concluido', data: '2026-11-01', aidlc: '0.7.6' }, 'A', '- [ ] **P1.F1.T1 Aberta**');
  r = rodar(ai);
  assert.equal(r.status, 0, r.err);
  assert.match(r.err, /"concluido" com 1 tarefa/);
});
