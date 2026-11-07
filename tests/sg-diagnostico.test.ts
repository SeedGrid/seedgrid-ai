import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { test } from 'node:test';

const TK = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills');
const DIAG = join(TK, 'sg-diagnostico/scripts/diagnostico.mjs');
const CONTROLE = join(TK, 'sg-plan-goal/scripts/controle.mjs');
const node = (...a: string[]) => spawnSync(process.execPath, a, { encoding: 'utf8' });

// Plano livre, no estilo do plano de produto do display: sem ids de tarefa, com hipoteses, ordem de execucao e "Em aberto".
const LIVRE = `---
status: proposto
---

# Produto Exemplo — plano

## 2.3 Hipóteses a provar

| # | Hipótese | Como provar |
|---|---|---|
| H1 | O host pode emitir chave de dispositivo | Teste de integração |
| H2 | ~~URL assinada~~ **Resolvida pela KB** | Teste simples |

## 7. Ordem de execução

| Fase | Conteúdo | Portão humano |
|---|---|---|
| 0 | Reconhecimento e provas | Conta no Pulse |
| 1 | Base: ativação por QR | — |
| 2 | Ads: upload e campanhas | Vídeo em hardware |

## 8. Em aberto

**Bloqueia o plano**
1. **Protocolo do ERP** (o dono envia).

**Pedem confirmação do dono (padrões propostos)**
| Tema | Padrão proposto |
|---|---|
| Tempo-limite da pesquisa | 5 min, configurável |

**Resolvidas pelo dono (datadas em 2026-10-30)**
- QR Code carrega empresa e código.
- O Pulse de produção é o canal.
`;

function projeto() {
  const dir = mkdtempSync(join(tmpdir(), 'sg-diag-'));
  mkdirSync(join(dir, 'docs/ai/plans'), { recursive: true });
  const plano = join(dir, 'docs/ai/plans/livre.md');
  writeFileSync(plano, LIVRE);
  return { dir, plano };
}

test('o diagnostico acusa o que falta e reconhece hipoteses, fases e decisoes do plano livre', () => {
  const { dir, plano } = projeto();
  try {
    const r = JSON.parse(node(DIAG, plano, '--json').stdout);
    assert.equal(r.tarefas, 0);
    assert.equal(r.encontrado.hipoteses, 2);
    assert.equal(r.encontrado.fasesNaOrdemDeExecucao, 3);
    assert.equal(r.encontrado.decisoesAbertas, 2);
    assert.equal(r.encontrado.decisoesResolvidas, 2);
    const p = r.problemas.join('\n');
    assert.match(p, /aidlc/);
    assert.match(p, /nenhuma tarefa/);
    assert.match(p, /\/goal/);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('o esqueleto sai ao lado, no formato da sg-plan-goal, sem tocar o original, e o controle.mjs le sem aviso', () => {
  const { dir, plano } = projeto();
  try {
    writeFileSync(join(dir, '.ai-lock-marker'), '');
    mkdirSync(join(dir, '.ai'), { recursive: true });
    writeFileSync(join(dir, '.ai/toolkit-lock.json'), JSON.stringify({ contentVersion: '9.9.9' }));
    const novo = join(dir, 'docs/ai/plans/livre-tarefas.md');
    const g = node(DIAG, plano, '--saida', novo, '--plano', '7');
    assert.equal(g.status, 0, g.stderr);
    assert.equal(readFileSync(plano, 'utf8'), LIVRE, 'o original continua intacto');
    const t = readFileSync(novo, 'utf8');
    assert.match(t, /aidlc: 9\.9\.9/);
    assert.match(t, /\*\*P7\.F0\.D1 Protocolo do ERP/);
    assert.match(t, /- \[\?\] \*\*P7\.F0\.D2 Tempo-limite da pesquisa/);
    assert.match(t, /Recomendacao: 5 min, configurável/);
    assert.match(t, /- \[x\] \*\*P7\.F0\.D3 QR Code/);
    assert.match(t, /\*\*P7\.F0\.T1 Provar H1/);
    assert.match(t, /## Fase 1 — Base: ativação por QR/);
    assert.match(t, /Portão humano: Vídeo em hardware/);
    assert.match(t, /\*\*P7\.FIM\.T1 /);
    const st = node(CONTROLE, novo, 'status');
    assert.equal(st.status, 0, st.stderr);
    // o esqueleto tem <definir>: o status avisa, para o coordenador nao apresentar o plano sem preencher
    assert.match(st.stderr, /\[aviso\] \d+ tarefa\(s\) com "<definir>"/);
    assert.doesNotMatch(st.stderr, /aidlc/i);
    const pend = node(CONTROLE, novo, 'pendencias');
    assert.match(pend.stdout, /P7\.F0\.D1/);
    assert.match(pend.stdout, /P7\.F0\.D2/);
    // nunca sobrescreve nem aceita o proprio original como saida
    assert.equal(node(DIAG, plano, '--saida', novo).status, 2);
    assert.equal(node(DIAG, plano, '--saida', plano).status, 2);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});

test('--novo grava em docs/ai/plans com o proximo numero livre e o numero na primeira linha do cabecalho', () => {
  const { dir, plano } = projeto();
  try {
    mkdirSync(join(dir, '.ai'), { recursive: true });
    writeFileSync(join(dir, '.ai/toolkit-lock.json'), JSON.stringify({ contentVersion: '9.9.9' }));
    writeFileSync(join(dir, 'docs/ai/plans/P4-2026-01-01-antigo.md'), '---\nnumero: 4\nstatus: concluido\n---\n');
    const r = spawnSync(process.execPath, [DIAG, plano, '--novo', 'Alojamentos & Presença'], { encoding: 'utf8', cwd: join(dir, 'docs') });
    assert.equal(r.status, 0, r.stderr);
    const nome = /P5-\d{4}-\d{2}-\d{2}-alojamentos-presenca\.md/.exec(r.stdout)?.[0];
    assert.ok(nome, r.stdout);
    const t = readFileSync(join(dir, 'docs/ai/plans', nome!), 'utf8');
    assert.match(t, /^---\nnumero: 5\n/);
    assert.match(t, /\*\*P5\.F0\.D1 /);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});


// ---------- formato completo (P157.F2.T2) ----------
const COMPLETO = `---
numero: 9
aidlc: 1.0.0
titulo: "Completo"
status: proposto
data: 2026-11-07
origem: "teste"
goal: |
  /goal Plano completo de x.md: rode ...
---
# Tarefas: completo

## Goal do plano (o /goal está no campo goal do cabeçalho)

## Ferramentas (consultar o índice)

| Ferramenta | Para quê | No índice? | Onde |
|---|---|---|---|
| controle.mjs | status | sim | scripts |

## Ordem de execução: série e paralelo (Gantt)

| Onda | Tarefas | Modo | Agentes | Depende de | Escreve |
|---|---|---|---|---|---|
| 1 | P9.F1.T1 | série | 1 | nada | a/ |

## Fase 1 — A

- [ ] **P9.F1.T1 Fazer** (\`depende-de\`: nada; \`escreve\`: a/)
  - Aceite: feito

## Fase FIM — Conferência

- [ ] **P9.FIM.T1 Conferir** (\`depende-de\`: P9.F1.T1; \`escreve\`: este plano)
  - Aceite: ok
- [ ] **P9.FIM.T2 Repassar** (\`depende-de\`: P9.FIM.T1; \`escreve\`: este plano)
  - Aceite: ok
- [ ] **P9.FIM.T3 Fechar** (\`depende-de\`: P9.FIM.T2; \`escreve\`: este plano)
  - Aceite: ok
`;

function diagDe(texto: string) {
  const dir = mkdtempSync(join(tmpdir(), 'sg-diag-fmt-'));
  try {
    const plano = join(dir, 'p.md');
    writeFileSync(plano, texto);
    return JSON.parse(node(DIAG, plano, '--json').stdout) as { problemas: string[]; formatoCompleto: Record<string, unknown> };
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

test('o diagnostico aceita o plano no formato completo e acusa cada seção que falta', () => {
  assert.deepEqual(diagDe(COMPLETO).problemas, []);
  const sem = (re: RegExp) => diagDe(COMPLETO.replace(re, '')).problemas.join('\n');
  assert.match(sem(/goal: \|\n  \/goal [^\n]*\n/), /sem o campo `goal:`/);
  assert.match(sem(/## Ferramentas[\s\S]*?(?=## Ordem)/), /sem a secao "Ferramentas"/);
  assert.match(sem(/\| Onda \|[^\n]*\n\|---[^\n]*\n\| 1 \|[^\n]*\n/), /sem a tabela de ondas/);
  assert.match(sem(/- \[ \] \*\*P9\.FIM\.T3[\s\S]*$/), /sem a Fase FIM com as tarefas FIM\.T1/);
});

test('o diagnostico acusa plano transversal sem checklist por tarefa e Pendencia sem Quem resolve', () => {
  const transversal = COMPLETO + '\n<!-- varredura:comp:inicio -->\n| Componente | Feito | Quem conferiu | Evidencia |\n|---|---|---|---|\n| A | [ ] |  |  |\n<!-- varredura:comp:fim -->\n';
  assert.match(diagDe(transversal).problemas.join('\n'), /transversal \(tem varredura\) sem a secao "Checklist por tarefa"/);
  assert.doesNotMatch(diagDe(transversal.replace('## Fase 1', '## Checklist por tarefa\n\n## Fase 1')).problemas.join('\n'), /Checklist por tarefa/);
  const pend = COMPLETO.replace('  - Aceite: feito\n', '  - Aceite: feito\n  - Pendencia: falta um dado\n');
  assert.match(diagDe(pend).problemas.join('\n'), /"Pendencia:" sem "Quem resolve:": P9\.F1\.T1/);
  const pendOk = COMPLETO.replace('  - Aceite: feito\n', '  - Aceite: feito\n  - Pendencia: falta um dado. Quem resolve: dono. Desde: 2026-11-07.\n');
  assert.deepEqual(diagDe(pendOk).problemas, []);
});

test('o esqueleto novo já nasce com goal no cabeçalho, Ferramentas, ondas e Fase FIM com 3 tarefas, e o diagnóstico não acusa o formato', () => {
  const { dir, plano } = projeto();
  try {
    mkdirSync(join(dir, '.ai'), { recursive: true });
    writeFileSync(join(dir, '.ai/toolkit-lock.json'), JSON.stringify({ contentVersion: '9.9.9' }));
    const novo = join(dir, 'docs/ai/plans/livre-tarefas.md');
    assert.equal(node(DIAG, plano, '--saida', novo, '--plano', '7').status, 0);
    const t = readFileSync(novo, 'utf8');
    const cab = /^---\r?\n([\s\S]*?)\r?\n---/.exec(t)?.[1] ?? '';
    assert.match(cab, /^goal: \|\n  \/goal Plano completo de /m);
    assert.ok(cab.indexOf('origem:') < cab.indexOf('goal:'));
    assert.match(t, /^## Ferramentas/m);
    assert.match(t, /^## Ordem de execução: série e paralelo/m);
    assert.match(t, /\*\*P7\.FIM\.T1 Conferir todos os checklists/);
    assert.match(t, /\*\*P7\.FIM\.T2 Repassar as pendências ao dono/);
    assert.match(t, /\*\*P7\.FIM\.T3 Fechar o plano/);
    assert.match(t, /controle\.mjs <plano> fechamento/);
    const r = JSON.parse(node(DIAG, novo, '--json').stdout) as { problemas: string[] };
    const fmt = r.problemas.filter((p) => /goal:|Ferramentas|ondas|Fase FIM|Checklist por tarefa/.test(p));
    assert.deepEqual(fmt, []);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
});
