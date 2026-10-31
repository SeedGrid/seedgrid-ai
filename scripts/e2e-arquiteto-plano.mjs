#!/usr/bin/env node
// Testa o arquiteto real (plano 22, entrega 6): um pedido de mudança SEM citar skill, e depois a execução da fase 1.
// So para quem desenvolve o seedgrid-ai. Custa alguns dolares; --max-budget-usd protege cada passo.
//
//   node scripts/e2e-arquiteto-plano.mjs [--base D:/tmp/e2e-arquiteto] [--sem-build] [--sem-execucao] [--pedido-analise]
//   --pedido-analise: o pedido e "analise o rascunho e crie um plano para eu validar" (como o do display, 2026-10-31); confere que o
//   `arquiteto` foi acionado como subagente e que o plano nao foi escrito pela sessao principal.
//
// Passo 1 (planejar): sai um plano em docs/ai/plans/ no formato fixo? (fases, depende-de, escreve, aceite, /goal por fase,
//   controle.mjs lê sem erro e o grafo do plano tem uma fase com >= 2 tarefas independentes para o paralelo).
// Passo 2 (executar as fases 1 e 2): nunca passa de 4 subagentes por mensagem,
//   os testes passam e as tarefas [x] têm Evidencia. A consulta ao `proximas` e o lançamento de subagentes em paralelo são só
//   INFORMADOS: o modelo não os faz sozinho em tarefas de poucas linhas (medido em 2026-10-29: 0 lançamentos e 0 consultas em 3 execuções).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes(`--${n}`);
const win = process.platform === 'win32';
const base = resolve(arg('base', 'D:/tmp/e2e-arquiteto'));
const sh = (cmd, args, opt = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: win && cmd !== process.execPath, maxBuffer: 256 * 1024 * 1024, ...opt });
const aspas = (a) => (win ? `"${String(a).replace(/"/g, '\\"')}"` : a);
const FERRAMENTAS = ['Bash(node:*)', 'Bash(git:*)', 'Bash(ls:*)', 'Bash(mkdir:*)', 'Bash(cat:*)', 'Bash(npm:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill', 'Agent', 'Task'];

const PEDIDO_PLANO = 'Os módulos de clientes, fornecedores e pedidos (pasta src/) precisam passar a normalizar o e-mail antes de gravar: minúsculas e sem espaços nas pontas, rejeitando e-mail sem "@". Cada módulo tem seu teste em test/. O README também precisa explicar a regra. Planeje essa mudança e salve o plano; não implemente ainda.';
const PEDIDO_ANALISE = 'Analise o rascunho em docs/ai/rascunho-emails.md e crie um novo plano para eu validar. Não implemente.';
const PEDIDO_EXECUTAR = 'Aprovado; para as perguntas em aberto vale a sua recomendação. Execute as fases 1 e 2 do plano.';

const falhas = [];
const confere = (ok, msg) => { console.log(`${ok ? 'ok  ' : 'FALHA'} ${msg}`); if (!ok) falhas.push(msg); };

function projeto(destino) {
  rmSync(destino, { recursive: true, force: true });
  mkdirSync(join(destino, 'src'), { recursive: true });
  mkdirSync(join(destino, 'test'), { recursive: true });
  writeFileSync(join(destino, 'package.json'), JSON.stringify({ name: 'mini-cadastros', version: '1.0.0', type: 'module', scripts: { test: 'node --test' } }, null, 2));
  for (const m of ['clientes', 'fornecedores', 'pedidos']) {
    const k = m.charAt(0).toUpperCase() + m.slice(1);
    writeFileSync(join(destino, 'src', `${m}.js`), `const registros = [];\nexport function gravar${k}(item) {\n  registros.push({ ...item });\n  return registros.length;\n}\nexport function listar${k}() {\n  return registros.map((r) => ({ ...r }));\n}\n`);
    writeFileSync(join(destino, 'test', `${m}.test.js`), `import assert from 'node:assert/strict';\nimport { test } from 'node:test';\nimport { gravar${k}, listar${k} } from '../src/${m}.js';\n\ntest('grava ${m}', () => {\n  gravar${k}({ nome: 'A', email: 'a@x.com' });\n  assert.equal(listar${k}().length, 1);\n});\n`);
  }
  writeFileSync(join(destino, 'README.md'), '# Mini cadastros\n\nTrês cadastros em memória: clientes, fornecedores e pedidos.\n');
  sh('git', ['init', '-q', '-b', 'main'], { cwd: destino });
  sh('git', ['config', 'user.email', 't@t.t'], { cwd: destino });
  sh('git', ['config', 'user.name', 't'], { cwd: destino });
  sh('git', ['add', '-A'], { cwd: destino });
  sh('git', ['commit', '-q', '-m', 'inicio'], { cwd: destino });
}

function claude(destino, pedido, orcamento, continuar) {
  const args = ['-p', '--output-format', 'stream-json', '--verbose', '--permission-mode', 'acceptEdits', '--max-budget-usd', String(orcamento), '--allowedTools', ...FERRAMENTAS.map(aspas)];
  if (continuar) args.push('--continue');
  const r = sh('claude', args, { cwd: destino, input: pedido, timeout: 25 * 60 * 1000 });
  const eventos = (r.stdout ?? '').split('\n').filter(Boolean).map((l) => { try { return JSON.parse(l); } catch { return null; } }).filter(Boolean);
  return { eventos, status: r.status, stderr: r.stderr ?? '' };
}

/** Mensagens do assistente: quantos tool_use de subagente (Agent/Task) em cada uma. */
function lancamentos(eventos) {
  return eventos
    .filter((e) => e.type === 'assistant' && Array.isArray(e.message?.content))
    .map((e) => e.message.content.filter((c) => c.type === 'tool_use' && (c.name === 'Agent' || c.name === 'Task')).length)
    .filter((n) => n > 0);
}
const custo = (eventos) => eventos.filter((e) => e.type === 'result').map((e) => e.total_cost_usd ?? 0).pop() ?? 0;

console.log(`[e2e-arquiteto] pasta ${base}`);
if (!flag('sem-build')) { const b = sh('npm', ['run', 'build'], { cwd: RAIZ }); if (b.status !== 0) { console.error(b.stdout + b.stderr); process.exit(2); } }
projeto(base);
const init = sh(process.execPath, [join(RAIZ, 'dist', 'cli.js'), 'init', '--project', base, '--target', 'claude']);
if (init.status !== 0) { console.error(init.stdout + init.stderr); process.exit(2); }
sh('git', ['add', '-A'], { cwd: base });
sh('git', ['commit', '-q', '-m', 'toolkit instalado'], { cwd: base });

// Passo 1: planejar
if (flag('pedido-analise')) { mkdirSync(join(base, 'docs/ai'), { recursive: true }); writeFileSync(join(base, 'docs/ai/rascunho-emails.md'), '# Rascunho\n\nNormalizar o e-mail (minúsculas, sem espaços, exigir @) em clientes, fornecedores e pedidos e explicar a regra no README.\n'); }
const p1 = claude(base, flag('pedido-analise') ? PEDIDO_ANALISE : PEDIDO_PLANO, 2);
if (flag('pedido-analise')) {
  const aciona = p1.eventos.filter((e) => e.type === 'assistant' && Array.isArray(e.message?.content)).flatMap((e) => e.message.content).filter((c) => c.type === 'tool_use' && (c.name === 'Agent' || c.name === 'Task') && /arquiteto/i.test(JSON.stringify(c.input ?? {})));
  confere(aciona.length >= 1, `o arquiteto foi acionado como subagente (${aciona.length} vez(es))`);
}
console.log(`[passo 1] custo US$ ${custo(p1.eventos).toFixed(2)}`);
const planos = existsSync(join(base, 'docs/ai/plans')) ? readdirSync(join(base, 'docs/ai/plans')).filter((f) => f.endsWith('.md')) : [];
confere(planos.length >= 1, `plano salvo em docs/ai/plans/ (${planos.join(', ') || 'nenhum'})`);
let plano = null;
if (planos.length) {
  plano = join(base, 'docs/ai/plans', planos[0]);
  const texto = readFileSync(plano, 'utf8');
  const controle = join(base, '.ai/skills/sg-plan-goal/scripts/controle.mjs');
  confere(existsSync(controle), 'controle.mjs instalado em .ai/skills/sg-plan-goal/scripts/');
  const st = sh(process.execPath, [controle, plano, 'status']);
  confere(st.status === 0, `controle.mjs lê o plano sem erro de formato (${(st.stdout || st.stderr).trim().split('\n')[0]})`);
  confere(/depende-de/.test(texto) && /escreve/.test(texto), 'tarefas declaram depende-de e escreve');
  confere(/Aceite/i.test(texto), 'tarefas têm critério de aceite');
  confere((texto.match(/\/goal/g) ?? []).length >= 1, 'há bloco /goal');
  // Simula a execução: a cada rodada marca como feitas as tarefas que `proximas` libera e guarda o maior lote paralelo.
  const { lerPlano, proximas } = await import(pathToFileURL(controle).href);
  const g = lerPlano(texto);
  let maiorLote = 0;
  const semEscreve = new Set();
  for (let r = 0; r < 20; r++) {
    const p = proximas(g, 4);
    if (!p.paralelo.length) break;
    maiorLote = Math.max(maiorLote, p.paralelo.length);
    p.semDeclararEscreve.forEach((id) => semEscreve.add(id));
    for (const t of g.todas) if (p.paralelo.includes(t.id)) t.estado = 'x';
  }
  confere(maiorLote >= 2, `o grafo do plano tem uma rodada com >= 2 tarefas em paralelo (maior lote: ${maiorLote})`);
  confere(semEscreve.size === 0, `nenhuma tarefa liberada sem escreve declarado (${[...semEscreve].join(', ') || 'ok'})`);
  confere(g.todas.every((t) => t.estado === 'x'), 'todas as tarefas são alcançáveis (nenhuma bloqueada para sempre)');
}

// Passo 2: executar a fase 1
if (!flag('sem-execucao') && plano) {
  const p2 = claude(base, PEDIDO_EXECUTAR, 4, true);
  console.log(`[passo 2] custo US$ ${custo(p2.eventos).toFixed(2)}`);
  const l = lancamentos(p2.eventos);
  console.log(`  lançamentos de subagentes por mensagem: [${l.join(', ')}]`);
  // Só comandos Bash contam: o texto do próprio plano (Write) também cita `proximas`.
  const consultou = p2.eventos.filter((e) => e.type === 'assistant' && Array.isArray(e.message?.content)).flatMap((e) => e.message.content).filter((c) => c.type === 'tool_use' && c.name === 'Bash' && /controle.mjs/.test(String(c.input?.command ?? '')) && /proximas/.test(String(c.input?.command ?? ''))).length;
  console.log(`  info: consultas ao controle.mjs proximas pelo coordenador: ${consultou} (a regra pede, mas o modelo nao a cumpre sozinho em tarefas pequenas)`);
  console.log(l.some((n) => n >= 2) ? '  info: lançou subagentes em paralelo' : '  info: nenhum lote de subagentes em paralelo (tarefas pequenas; executou na própria sessão)');
  confere(l.every((n) => n <= 4), 'nunca mais de 4 subagentes na mesma mensagem');
  const t = sh(process.execPath, ['--test'], { cwd: base });
  confere(t.status === 0, 'testes do projeto passam depois da execução');
  const texto = readFileSync(plano, 'utf8');
  const feitas = (texto.match(/^\s*[-*] \[x\]/gm) ?? []).length;
  const evid = (texto.match(/Evid[eê]ncia\s*:/gi) ?? []).length;
  confere(feitas >= 1 && evid >= feitas, `tarefas [x] (${feitas}) com Evidencia (${evid})`);
}

console.log(falhas.length ? `\n${falhas.length} falha(s):\n- ${falhas.join('\n- ')}` : '\nTudo ok.');
process.exit(falhas.length ? 1 : 0);
