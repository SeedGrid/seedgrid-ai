#!/usr/bin/env node
// E2E do AIDLC para uma APLICACAO COMPLETA (so para quem desenvolve o seedgrid-ai; fora do pacote).
// Diferente do e2e-produto-novo (que so confere a geracao do produto): aqui o pedido e o requisito de um produto inteiro
// e a sessao do Claude precisa conduzir tudo com o toolkit instalado (entrevista, plano, CRUD, telas, build, subida).
// Quem executa NAO conduz o fluxo e NAO escreve codigo do produto: so responde como o usuario, com as respostas do arquivo,
// e registra o que a sessao perguntou, onde travou e o que entregou. Perguntas sem resposta no arquivo recebem a resposta padrao
// e viram "lacunas" no relatorio (e o sinal de que o AIDLC deveria ter decidido sozinho ou que falta regra).
// Uso: node scripts/e2e-aidlc-app.mjs --destino <pasta vazia> --pedido <arquivo.md> [--respostas <json>] [--saida <pasta>]
//        [--max-turnos 30] [--modelo <modelo>] [--sem-build] [--retomar <session_id> --inicio <n> --mensagem <texto>]
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes(`--${n}`);
const win = process.platform === 'win32';

if (!arg('destino') || !arg('pedido')) { console.error('uso: node scripts/e2e-aidlc-app.mjs --destino <pasta vazia> --pedido <arquivo.md> [opcoes]'); process.exit(2); }
const destino = resolve(arg('destino'));
const pedido = readFileSync(resolve(arg('pedido')), 'utf8');
const config = JSON.parse(readFileSync(resolve(arg('respostas', join(RAIZ, 'scripts', 'e2e', 'respostas-mcp-apikeys-app.json'))), 'utf8'));
const maxTurnos = Number(arg('max-turnos', config.maxTurnos ?? 30));
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const saida = resolve(arg('saida', join(RAIZ, 'e2e-out', `app-${stamp}`)));
mkdirSync(saida, { recursive: true });

const sh = (cmd, args, opt = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: win && cmd !== process.execPath, maxBuffer: 256 * 1024 * 1024, ...opt });
const aspas = (a) => (win ? `"${String(a).replace(/"/g, '\\"')}"` : a);

function preparar() {
  if (!flag('sem-build')) {
    const b = sh('npm', ['run', 'build'], { cwd: RAIZ });
    if (b.status !== 0) throw new Error(`build do dist local falhou:\n${b.stdout}${b.stderr}`);
  }
  if (existsSync(destino) && readdirSync(destino).length) throw new Error(`a pasta ${destino} ja existe e nao esta vazia; o E2E parte de uma pasta nova`);
  mkdirSync(destino, { recursive: true });
  const i = sh(process.execPath, [join(RAIZ, 'dist', 'cli.js'), 'init', '--project', destino, '--target', 'claude']);
  if (i.status !== 0) throw new Error(`init falhou:\n${i.stdout}${i.stderr}`);
  writeFileSync(join(saida, 'init.log'), i.stdout + i.stderr);
}

// Ferramentas liberadas na sessao headless: o que um desenvolvedor usaria no produto, sem shell livre.
const FERRAMENTAS = ['Bash(node:*)', 'Bash(git:*)', 'Bash(ls:*)', 'Bash(mkdir:*)', 'Bash(cat:*)', 'Bash(mvn:*)', 'Bash(pnpm:*)', 'Bash(npm:*)', 'Bash(npx:*)',
  'Bash(podman:*)', 'Bash(podman-compose:*)', 'Bash(docker:*)', 'Bash(curl:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill', 'Agent'];

function turno(n, prompt, sessao) {
  const args = ['-p', '--output-format', 'json', '--permission-mode', 'acceptEdits', '--allowedTools', ...FERRAMENTAS.map(aspas)];
  if (config.modelo || arg('modelo')) args.push('--model', arg('modelo') ?? config.modelo);
  if (sessao) args.push('--resume', sessao);
  const t0 = Date.now();
  const r = sh('claude', args, { cwd: destino, input: prompt, timeout: 60 * 60 * 1000 });
  const nome = `turno-${String(n).padStart(2, '0')}`;
  writeFileSync(join(saida, `${nome}.prompt.txt`), prompt);
  writeFileSync(join(saida, `${nome}.json`), r.stdout ?? '');
  if (r.stderr) writeFileSync(join(saida, `${nome}.stderr.txt`), r.stderr);
  let j;
  try { j = JSON.parse(r.stdout); } catch { return { n, ms: Date.now() - t0, texto: '', sessao, erro: true, motivo: `saida nao e JSON (status ${r.status}): ${(r.stdout || r.stderr || '').slice(0, 300)}`, custo: 0, turnosInternos: 0, negadas: [] }; }
  return { n, ms: Date.now() - t0, texto: j.result ?? '', sessao: j.session_id ?? sessao, custo: j.total_cost_usd ?? 0, turnosInternos: j.num_turns ?? 0, erro: !!j.is_error, negadas: j.permission_denials ?? [] };
}

function arquivos(raiz, dir = raiz, acc = []) {
  for (const n of readdirSync(dir).sort()) {
    if (['node_modules', '.git', 'target', '.next', 'dist'].includes(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) arquivos(raiz, p, acc);
    else acc.push(relative(raiz, p).split(sep).join('/'));
  }
  return acc;
}

function conduzir() {
  const turnos = [];
  const lacunas = [];
  const usadas = new Set();
  let t;
  let primeiro = 1;
  if (arg('retomar')) { primeiro = Number(arg('inicio', 1)); t = turno(primeiro, arg('mensagem', config.continuar ?? 'Continue.'), arg('retomar')); primeiro++; }
  else t = turno(0, pedido, null);
  turnos.push(t);
  for (let i = primeiro; i < maxTurnos && !t.erro; i++) {
    const texto = t.texto.trim();
    const pergunta = /\?\s*$/.test(texto) || /\b(posso|confirma|quer que|prefere|qual)\b[^.]*\?/i.test(texto.slice(-600));
    if (!pergunta) { if (config.fimQuando && new RegExp(config.fimQuando, 'i').test(texto)) break; if (!config.continuarSemPergunta) break; }
    let resposta = null;
    config.respostas.forEach((r, k) => { if (resposta === null && !usadas.has(k) && new RegExp(r.espera, 'i').test(texto)) { usadas.add(k); resposta = r.resposta; } });
    if (resposta === null) {
      lacunas.push({ turno: i, pergunta: texto.slice(-500) });
      resposta = pergunta ? (config.respostaPadrao ?? 'Decida pelo padrao do projeto e registre a decisao.') : (config.continuar ?? 'Continue.');
    }
    t = turno(i, resposta, t.sessao);
    turnos.push(t);
  }
  return { turnos, lacunas };
}

if (!arg('retomar')) preparar();
let turnos = [];
let lacunas = [];
try { ({ turnos, lacunas } = conduzir()); } catch (e) { writeFileSync(join(saida, 'erro.txt'), String(e.stack ?? e)); console.error(e); }
const lista = arquivos(destino).filter((f) => !/^(\.ai|\.claude|\.agents)\//.test(f));
const relatorio = {
  destino, maxTurnos, turnos: turnos.map((t) => ({ n: t.n, minutos: +(t.ms / 60000).toFixed(1), custoUsd: +t.custo.toFixed(2), passosInternos: t.turnosInternos, erro: t.erro, motivo: t.motivo, negadas: t.negadas.map((p) => p.tool_name ?? p).slice(0, 10), fim: t.texto.slice(-300) })),
  lacunas, arquivosDoProduto: lista.length, custoTotalUsd: +turnos.reduce((s, t) => s + t.custo, 0).toFixed(2),
  produtoJson: existsSync(join(destino, 'produto.json')), backend: existsSync(join(destino, 'backend/pom.xml')), frontend: existsSync(join(destino, 'frontend/package.json')),
};
writeFileSync(join(saida, 'relatorio.json'), JSON.stringify(relatorio, null, 2));
console.log(JSON.stringify({ saida, turnos: turnos.length, lacunas: lacunas.length, custoTotalUsd: relatorio.custoTotalUsd, arquivosDoProduto: lista.length }, null, 2));
