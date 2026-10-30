import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-plan-goal/scripts/controle.mjs');
const mod = (await import(pathToFileURL(SCRIPT).href)) as {
  lerPlano: (t: string) => { fases: { chave: string; tarefas: { id: string; estado: string; dependeDe: string[]; escreve: string[]; temEvidencia: boolean }[] }[]; todas: { id: string; escreve: string[]; dependeDe: string[] }[] };
  proximas: (p: ReturnType<typeof mod.lerPlano>, max?: number) => { paralelo: string[]; semDeclararEscreve: string[]; espera: { id: string; motivo: string }[]; bloqueadas: { id: string; falta: string[] }[]; emAndamento: string[] };
  checklist: (p: ReturnType<typeof mod.lerPlano>, fase: string, completa: boolean, exetoDecisoes?: boolean) => { erros: string[] };
  pendencias: (p: ReturnType<typeof mod.lerPlano>) => { id: string; titulo: string; detalhe: string[]; bloqueia: string[] }[];
  bloqueadasPorDecisao: (p: ReturnType<typeof mod.lerPlano>) => Set<string>;
};

const PLANO = `# Tarefas: exemplo

## Fase 1 — Base

- [x] **T1.1 Contrato** (\`depende-de\`: nada; \`escreve\`: docs/contrato.md)
  - Aceite: contrato revisado
  - Evidencia: commit abc1234
- [x] **T1.2 Sem evidencia** (\`depende-de\`: nada; \`escreve\`: docs/outra.md)
  - Aceite: algo

## Fase 2 — Código

- [ ] **T2.1 Backend** (\`depende-de\`: T1.1; \`escreve\`: backend/src/, backend/pom.xml)
- [ ] **T2.2 Front** (\`depende-de\`: T1.1; \`escreve\`: frontend/app/)
- [ ] **T2.3 Testes do backend** (\`depende-de\`: T1.1; \`escreve\`: backend/src/test/)
- [ ] **T2.4 Docs** (\`depende-de\`: T1.1; \`escreve\`: docs/guia.md)
- [ ] **T2.5 Mais docs** (\`depende-de\`: T1.1; \`escreve\`: docs/extra.md)
- [ ] **T2.6 Integração** (\`depende-de\`: T2.1, T2.2; \`escreve\`: e2e/)
- [~] **T2.7 Em andamento** (\`depende-de\`: nada; \`escreve\`: scripts/)

## Notas

- [ ] **X.1 Fora de fase** (\`depende-de\`: nada; \`escreve\`: nada)
`;

const dirs: string[] = [];
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });
function arquivo(texto: string) {
  const d = mkdtempSync(join(tmpdir(), 'sg-controle-'));
  dirs.push(d);
  const f = join(d, 'plano.md');
  writeFileSync(f, texto);
  return f;
}
const roda = (f: string, ...a: string[]) => spawnSync(process.execPath, [SCRIPT, f, ...a], { encoding: 'utf8' });

test('lê fases, estados, depende-de, escreve e evidência; título fora de fase não vira tarefa', () => {
  const p = mod.lerPlano(PLANO);
  assert.deepEqual(p.fases.map((f) => f.chave), ['1', '2']);
  assert.equal(p.todas.length, 9);
  const t21 = p.fases[1]!.tarefas.find((t) => t.id === 'T2.1')!;
  assert.deepEqual(t21.dependeDe, ['T1.1']);
  assert.deepEqual(t21.escreve, ['backend/src/', 'backend/pom.xml']);
  assert.equal(p.fases[0]!.tarefas[0]!.temEvidencia, true);
  assert.equal(p.fases[0]!.tarefas[1]!.temEvidencia, false);
  assert.ok(!p.todas.some((t) => t.id === 'X.1'));
});

test('proximas: respeita depende-de, conflito de escrita com tarefa em andamento e o limite de 4', () => {
  const p = mod.lerPlano(PLANO);
  const r = mod.proximas(p);
  // T2.1 e T2.3 escrevem em backend/src (T2.3 dentro de T2.1): so a primeira entra
  assert.deepEqual(r.paralelo, ['T2.1', 'T2.2', 'T2.4', 'T2.5']);
  assert.ok(r.espera.some((e) => e.id === 'T2.3' && /comum com T2\.1/.test(e.motivo)));
  assert.deepEqual(r.bloqueadas, [{ id: 'T2.6', falta: ['T2.1', 'T2.2'] }]);
  assert.deepEqual(r.emAndamento, ['T2.7']);
  const limitado = mod.proximas(p, 2);
  assert.deepEqual(limitado.paralelo, ['T2.1', 'T2.2']);
  assert.ok(limitado.espera.some((e) => e.id === 'T2.4' && /limite de 2/.test(e.motivo)));
});

test('proximas: tarefa sem escreve entra, mas é avisada; depende-de feito libera a seguinte', () => {
  const p = mod.lerPlano('## Fase 1 — A\n\n- [x] **T1.1 A** (`depende-de`: nada; `escreve`: a/)\n  - Evidencia: ok\n- [ ] **T1.2 B** (`depende-de`: T1.1)\n- [ ] **T1.3 C** (`depende-de`: T1.2; `escreve`: c/)\n');
  const r = mod.proximas(p);
  assert.deepEqual(r.paralelo, ['T1.2']);
  assert.deepEqual(r.semDeclararEscreve, ['T1.2']);
  assert.deepEqual(r.bloqueadas, [{ id: 'T1.3', falta: ['T1.2'] }]);
});

test('checklist: [x] sem Evidencia falha; --completa falha com tarefa aberta; fase inexistente falha', () => {
  const p = mod.lerPlano(PLANO);
  assert.deepEqual(mod.checklist(p, '1', false).erros, ['T1.2: tarefa [x] sem linha "Evidencia:"']);
  const f2 = mod.checklist(p, '2', true).erros;
  assert.ok(f2.includes('T2.1: tarefa ainda aberta') && f2.includes('T2.7: tarefa ainda aberta'));
  assert.equal(mod.checklist(p, '2', false).erros.length, 0);
  assert.match(mod.checklist(p, '9', false).erros[0] ?? '', /nao encontrada/);
});

test('CLI: status, checklist com saída 0/1, proximas --json e erros de uso com saída 2', () => {
  const f = arquivo(PLANO);
  const s = roda(f, 'status');
  assert.equal(s.status, 0);
  assert.match(s.stdout, /Fase 1: 2\/2 feitas/);
  assert.match(s.stdout, /Fase 2: 0\/7 feitas, 1 em andamento, 6 abertas/);
  assert.equal(roda(f, 'checklist', '1').status, 1);
  assert.match(roda(f, 'checklist', '1').stdout, /fase 1: 1 problema/);
  assert.equal(roda(f, 'checklist', '2').status, 0);
  const j = JSON.parse(roda(f, 'proximas', '--json').stdout);
  assert.deepEqual(j.paralelo, ['T2.1', 'T2.2', 'T2.4', 'T2.5']);
  assert.equal(roda(f, 'nada').status, 2);
  assert.equal(roda(arquivo('# sem tarefas\n'), 'status').status, 2);
  assert.equal(spawnSync(process.execPath, [SCRIPT], { encoding: 'utf8' }).status, 2);
});

test('o template do plano é lido pelo controle sem erro de formato', () => {
  const modelo = readFileSync(resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-plan-goal/assets/plano-de-tarefas.md'), 'utf8');
  const p = mod.lerPlano(modelo);
  assert.deepEqual(p.fases.map((f) => f.chave), ['1', '2', 'FIM']);
  assert.ok(p.todas.every((t) => t.escreve.length > 0), 'todo exemplo do template declara escreve');
  const r = mod.proximas(p);
  assert.deepEqual(r.paralelo, ['P000.F1.T1']);
});

const PLANO_DECISAO = `# Tarefas: com decisao

## Fase 1 — A

- [x] **T1.1 Feita** (\`depende-de\`: nada; \`escreve\`: a/)
  - Evidencia: abc
- [?] **T1.2 Escolher banco** (\`depende-de\`: nada; \`escreve\`: este plano)
  - Pergunta: Postgres ou MySQL?
  - Recomendacao: Postgres
- [ ] **T1.3 Migrar** (\`depende-de\`: T1.2; \`escreve\`: db/)
- [ ] **T1.4 Depois da migracao** (\`depende-de\`: T1.3; \`escreve\`: db2/)
- [ ] **T1.5 Livre** (\`depende-de\`: T1.1; \`escreve\`: livre/)
`;

test('decisao do dono: --exceto-decisoes ignora so o que espera a [?]; pendencias lista pergunta e bloqueios', () => {
  const p = mod.lerPlano(PLANO_DECISAO);
  assert.deepEqual([...mod.bloqueadasPorDecisao(p)].sort(), ['T1.3', 'T1.4']);
  assert.deepEqual(mod.checklist(p, '1', true).erros.sort(), ['T1.3: tarefa ainda aberta', 'T1.4: tarefa ainda aberta', 'T1.5: tarefa ainda aberta']);
  assert.deepEqual(mod.checklist(p, '1', true, true).erros, ['T1.5: tarefa ainda aberta']);
  const q = mod.pendencias(p);
  assert.equal(q.length, 1);
  assert.equal(q[0]!.id, 'T1.2');
  assert.deepEqual(q[0]!.bloqueia.sort(), ['T1.3', 'T1.4']);
  assert.ok(q[0]!.detalhe.some((l) => /Recomendacao: Postgres/.test(l)));
});

test('CLI: pendencias imprime as perguntas e sai 0; --exceto-decisoes zera o checklist quando o resto esta feito', () => {
  const feito = PLANO_DECISAO.replace('- [ ] **T1.5 Livre** (`depende-de`: T1.1; `escreve`: livre/)', '- [x] **T1.5 Livre** (`depende-de`: T1.1; `escreve`: livre/)\n  - Evidencia: ok');
  const f = arquivo(feito);
  const p = roda(f, 'pendencias');
  assert.equal(p.status, 0);
  assert.match(p.stdout, /T1\.2: .*Escolher banco/);
  assert.match(p.stdout, /bloqueia: T1\.3, T1\.4/);
  assert.match(p.stdout, /1 pergunta\(s\) ao dono/);
  assert.equal(roda(f, 'checklist', '1', '--completa').status, 1);
  const ok = roda(f, 'checklist', '1', '--completa', '--exceto-decisoes');
  assert.equal(ok.status, 0);
  assert.match(ok.stdout, /fase 1: 0 problema/);
  assert.match(roda(arquivo(PLANO), 'pendencias').stdout, /0 pergunta/);
});

test('identificador falante P<plano>.F<fase>.T<tarefa>: lido em fase 3b e FIM, com depende-de e proximas', () => {
  const p = mod.lerPlano(`# T

## Fase 3b — Algo

- [x] **P24.F3b.T5 Feita** (\`depende-de\`: nada; \`escreve\`: a/)
  - Evidencia: ok
- [ ] **P24.F3b.T6 Repetir o E2E** (\`depende-de\`: P24.F3b.T5; \`escreve\`: b/)

## Fase FIM — Fechar

- [ ] **P24.FIM.T1 Fechar** (\`depende-de\`: P24.F3b.T6; \`escreve\`: este plano)
`);
  assert.deepEqual(p.fases.map((f) => f.chave), ['3b', 'FIM']);
  assert.deepEqual(p.todas.map((t) => t.id), ['P24.F3b.T5', 'P24.F3b.T6', 'P24.FIM.T1']);
  assert.deepEqual(p.todas[1]!.dependeDe, ['P24.F3b.T5']);
  const r = mod.proximas(p);
  assert.deepEqual(r.paralelo, ['P24.F3b.T6']);
  assert.deepEqual(r.bloqueadas, [{ id: 'P24.FIM.T1', falta: ['P24.F3b.T6'] }]);
});
