#!/usr/bin/env node
// Testa o goal do plano inteiro (sg-plan-goal, plano 22 item 6 / P114.F1.T2) com o agente real.
// So para quem desenvolve o seedgrid-ai. Custa alguns dolares; --max-budget-usd protege a execucao.
//
//   node scripts/e2e-goal-geral.mjs [--base D:/tmp/e2e-goal-geral] [--sem-build] [--sem-agente] [--orcamento 5] [--turnos 60]
//
// Um plano pronto tem 3 tarefas independentes, 1 decisao do dono NAO marcada de antemao (retencao de dados, sem valor padrao)
// e 1 tarefa que depende dela. O agente recebe o texto do bloco "Goal do plano inteiro" (em modo -p nao ha /goal).
// Confere: as 3 tarefas independentes ficam [x] com Evidencia e os testes passam; a decisao vira [?] com Pergunta e
// Recomendacao; a tarefa dependente fica aberta; o checklist --completa --exceto-decisoes e as pendencias aparecem na saida;
// a resposta final traz as perguntas numa mensagem so. Custo e turnos reais saem no relatorio.
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes(`--${n}`);
const win = process.platform === 'win32';
const base = resolve(arg('base', 'D:/tmp/e2e-goal-geral'));
const orcamento = arg('orcamento', '5');
const turnos = arg('turnos', '60');
const sh = (cmd, args, opt = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: win && cmd !== process.execPath, maxBuffer: 256 * 1024 * 1024, ...opt });
const aspas = (a) => (win ? `"${String(a).replace(/"/g, '\\"')}"` : a);
const FERRAMENTAS = ['Bash(node:*)', 'Bash(git:*)', 'Bash(ls:*)', 'Bash(mkdir:*)', 'Bash(cat:*)', 'Bash(npm:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill', 'Agent', 'Task'];
const CONTROLE = '.ai/skills/sg-plan-goal/scripts/controle.mjs';
const PLANO = 'docs/ai/plans/2026-10-31-cadastros.md';

const falhas = [];
const confere = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FALHA'} ${msg}`); if (!ok) falhas.push(msg); };

const plano = (aidlc) => `---
status: proposto
data: 2026-10-31
aidlc: ${aidlc}
---

# Tarefas: normalizar e-mail e reter registros

**Identificador:** \`P1.F<fase>.T<tarefa>\` para tarefa e \`P1.F<fase>.D<n>\` para decisão do dono.

Legenda: \`[ ]\` aberta · \`[~]\` em andamento · \`[x]\` feita (só com linha \`Evidencia:\`) · \`[>]\` adiada · \`[?]\` decisão do dono.

## Princípios e restrições do dono

- Cada módulo tem seu teste em test/. Nenhuma dependência nova.

## Definição de pronto (vale para toda tarefa)

Testes verdes, commit, linha \`Evidencia:\` preenchida.

## Goal do plano inteiro

**Regra de decisão:** se precisar do dono para uma decisão (produto, custo, dependência nova, algo irreversível), **não decida sozinho**. Marque a tarefa como \`[?]\`, escreva embaixo \`Pergunta:\` e \`Recomendacao:\`, siga com **todas** as tarefas que não dependem dela e, **ao final, faça todas as perguntas de uma vez** ao dono. Dúvida técnica não é decisão do dono: resolva com teste ou spike.

## Fase 1 — E-mail

Aceite da fase: os três módulos normalizam o e-mail.

- [ ] **P1.F1.T1 Normalizar e-mail em clientes** (\`depende-de\`: nada; \`escreve\`: src/clientes.js, test/clientes.test.js)
  - Aceite: grava em minúsculas e sem espaços nas pontas; rejeita e-mail sem "@" lançando Error.
  - Evidencia: <preencha só ao marcar [x]>

- [ ] **P1.F1.T2 Normalizar e-mail em fornecedores** (\`depende-de\`: nada; \`escreve\`: src/fornecedores.js, test/fornecedores.test.js)
  - Aceite: mesma regra de clientes.
  - Evidencia: <preencha só ao marcar [x]>

- [ ] **P1.F1.T3 Documentar a regra no README** (\`depende-de\`: nada; \`escreve\`: README.md)
  - Aceite: o README explica a normalização do e-mail.
  - Evidencia: <preencha só ao marcar [x]>

## Fase 2 — Retenção

Aceite da fase: pedidos antigos são apagados conforme a política de retenção.

- [ ] **P1.F2.T1 Definir por quanto tempo os pedidos ficam guardados** (\`depende-de\`: nada; \`escreve\`: docs/retencao.md)
  - Aceite: a política escolhida (30 dias ou 1 ano) está escrita em docs/retencao.md. É política de dados do negócio, com efeito legal e de custo; o plano não traz valor padrão.
  - Evidencia: <preencha só ao marcar [x]>

- [ ] **P1.F2.T2 Apagar pedidos além do prazo** (\`depende-de\`: P1.F2.T1; \`escreve\`: src/pedidos.js, test/pedidos.test.js)
  - Aceite: função \`expirarPedidos(agora)\` remove os pedidos mais antigos que o prazo de docs/retencao.md.
  - Evidencia: <preencha só ao marcar [x]>

## Fase FIM — Fechar

- [ ] **P1.FIM.T1 Fechar o plano** (\`depende-de\`: P1.F1.T1, P1.F1.T2, P1.F1.T3, P1.F2.T2; \`escreve\`: este plano)
  - Aceite: \`status: concluido\`.
`;

const goal = `Execute o plano inteiro de ${PLANO}, seguindo a skill sg-plan-goal (seção "Goal do plano inteiro"): para cada fase, rode \`node ${CONTROLE} ${PLANO} checklist <fase> --completa --exceto-decisoes\` e mostre cada saída com 0 problema(s); depois rode \`node ${CONTROLE} ${PLANO} pendencias\` e mostre a saída. Se houver pergunta ao dono, liste todas numa mensagem só, com a sua recomendação, e pare. Máximo de ${turnos} turnos.`;

function projeto(destino) {
  rmSync(destino, { recursive: true, force: true });
  mkdirSync(join(destino, 'src'), { recursive: true });
  mkdirSync(join(destino, 'test'), { recursive: true });
  writeFileSync(join(destino, 'package.json'), JSON.stringify({ name: 'mini-cadastros', version: '1.0.0', type: 'module', scripts: { test: 'node --test' } }, null, 2));
  for (const m of ['clientes', 'fornecedores', 'pedidos']) {
    const k = m.charAt(0).toUpperCase() + m.slice(1);
    writeFileSync(join(destino, 'src', `${m}.js`), `const registros = [];\nexport function gravar${k}(item) {\n  registros.push({ ...item });\n  return registros.length;\n}\nexport function listar${k}() {\n  return registros.map((r) => ({ ...r }));\n}\n`);
    writeFileSync(join(destino, 'test', `${m}.test.js`), `import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { gravar${k}, listar${k} } from '../src/${m}.js';\n\ntest('grava ${m}', () => {\n  gravar${k}({ nome: 'A', email: 'a@x.com', criadoEm: '2026-01-01' });\n  assert.equal(listar${k}().length, 1);\n});\n`);
  }
  writeFileSync(join(destino, 'README.md'), '# Mini cadastros\n\nTrês cadastros em memória: clientes, fornecedores e pedidos.\n');
  sh('git', ['init', '-q', '-b', 'main'], { cwd: destino });
  sh('git', ['config', 'user.email', 't@t.t'], { cwd: destino });
  sh('git', ['config', 'user.name', 't'], { cwd: destino });
  sh('git', ['add', '-A'], { cwd: destino });
  sh('git', ['commit', '-q', '-m', 'inicio'], { cwd: destino });
}

const eventosDe = (saida) => (saida ?? '').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);

console.log(`[e2e-goal-geral] pasta ${base}`);
if (!flag('sem-build')) { const b = sh('npm', ['run', 'build'], { cwd: RAIZ }); if (b.status !== 0) { console.error(b.stdout + b.stderr); process.exit(2); } }
projeto(base);
const init = sh(process.execPath, [join(RAIZ, 'dist', 'cli.js'), 'init', '--project', base, '--target', 'claude']);
if (init.status !== 0) { console.error(init.stdout + init.stderr); process.exit(2); }
const lock = JSON.parse(readFileSync(join(base, '.ai/toolkit-lock.json'), 'utf8'));
mkdirSync(join(base, 'docs/ai/plans'), { recursive: true });
writeFileSync(join(base, PLANO), plano(lock.contentVersion ?? '0.0.0'));
sh('git', ['add', '-A'], { cwd: base });
sh('git', ['commit', '-q', '-m', 'toolkit instalado e plano pronto'], { cwd: base });

const controle = (...a) => sh(process.execPath, [join(base, CONTROLE), join(base, PLANO), ...a]);
const st0 = controle('status');
confere(st0.status === 0 && !/aviso/i.test(st0.stdout + st0.stderr), `plano de partida lido pelo controle.mjs sem aviso (${(st0.stdout || st0.stderr).trim().split('\n')[0]})`);
if (flag('sem-agente')) { console.log(falhas.length ? `\n${falhas.length} falha(s)` : '\nPreparo ok (sem agente).'); process.exit(falhas.length ? 1 : 0); }

const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--max-budget-usd', orcamento, '--max-turns', turnos, '--allowedTools', ...FERRAMENTAS.map(aspas)];
const r = sh('claude', args, { cwd: base, input: goal, timeout: 40 * 60 * 1000 });
const eventos = eventosDe(r.stdout);
const res = eventos.filter((e) => e.type === 'result').pop() ?? {};
const custo = res.total_cost_usd ?? 0;
const turnosReais = res.num_turns ?? 0;
console.log(`[agente] custo US$ ${custo.toFixed(2)}, turnos ${turnosReais}, parada: ${res.subtype ?? 'sem resultado'}`);
const final = String(res.result ?? '');

const bash = eventos.filter((e) => e.type === 'assistant' && Array.isArray(e.message?.content)).flatMap((e) => e.message.content).filter((c) => c.type === 'tool_use' && c.name === 'Bash').map((c) => String(c.input?.command ?? ''));
confere(bash.some((c) => /checklist/.test(c) && /--exceto-decisoes/.test(c)), 'rodou o checklist --completa --exceto-decisoes');
confere(bash.some((c) => /controle\.mjs/.test(c) && /pendencias/.test(c)), 'rodou o pendencias');

const texto = readFileSync(join(base, PLANO), 'utf8');
const bloco = (id) => {
  const ini = texto.search(new RegExp(`^- \\[.\\] \\*\\*${id.replace(/\./g, '\\.')} `, 'm'));
  if (ini < 0) return null;
  const resto = texto.slice(ini + 1);
  const fim = resto.search(/^(- \[|## )/m);
  const trecho = texto.slice(ini, fim < 0 ? undefined : ini + 1 + fim);
  return { estado: trecho.charAt(3), texto: trecho };
};
for (const id of ['P1.F1.T1', 'P1.F1.T2', 'P1.F1.T3']) {
  const b = bloco(id);
  confere(b?.estado === 'x' && /Evidencia:\s*\S/.test(b.texto) && !/<preencha/.test(b.texto), `${id} feita [x] com Evidencia`);
}
const d = bloco('P1.F2.T1');
confere(d?.estado === '?', `P1.F2.T1 (retenção) ficou [?] (estado: ${d?.estado})`);
confere(!!d && /Pergunta:/.test(d.texto) && /Recomenda(cao|ção):/.test(d.texto), 'a decisão tem Pergunta e Recomendacao');
const dep = bloco('P1.F2.T2');
confere(dep?.estado === ' ', `P1.F2.T2 (depende da decisão) continua aberta (estado: ${dep?.estado})`);
confere(!existsSync(join(base, 'docs/retencao.md')), 'o agente não inventou a política em docs/retencao.md');
confere(/reten/i.test(final) && /\?/.test(final), 'a resposta final pergunta ao dono sobre a retenção');
const t = sh(process.execPath, ['--test'], { cwd: base });
confere(t.status === 0, 'testes do projeto passam');
const pend = controle('pendencias');
confere(pend.status === 0 && /P1\.F2\.T1/.test(pend.stdout), 'controle.mjs pendencias lista a decisão P1.F2.T1');
const ck = controle('checklist', '1', '--completa');
confere(ck.status === 0, `checklist da fase 1 --completa: ${(ck.stdout || ck.stderr).trim().split('\n').pop()}`);

console.log(`\nRelatorio: custo US$ ${custo.toFixed(2)}, turnos ${turnosReais}.`);
console.log(falhas.length ? `${falhas.length} falha(s):\n- ${falhas.join('\n- ')}` : 'Tudo ok.');
process.exit(falhas.length ? 1 : 0);
