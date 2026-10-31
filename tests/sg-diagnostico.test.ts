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
    assert.doesNotMatch(st.stdout + st.stderr, /aviso/i);
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
