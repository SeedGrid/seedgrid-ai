#!/usr/bin/env node
// Mede se um pedido de produto novo aciona a skill sg-new-product (so o primeiro turno; sem entrevista nem geracao).
// So para quem desenvolve o seedgrid-ai. Custa cerca de US$ 0,2 por tentativa; --max-budget-usd protege contra o desvio caro.
//
//   node scripts/e2e-gatilho-skill.mjs [--n 8] [--base D:/tmp/e2e-gatilho] [--sem-build] [--modelo <id>]
//
// Criterios por tentativa: a skill foi invocada; nenhum caminho fora da pasta foi tocado (lido dos jsonl da sessao).
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const win = process.platform === 'win32';
const N = Number(arg('n', '8'));
const base = resolve(arg('base', 'D:/tmp/e2e-gatilho'));
const sh = (cmd, args, opt = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: win && cmd !== process.execPath, maxBuffer: 256 * 1024 * 1024, ...opt });
const aspas = (a) => (win ? `"${String(a).replace(/"/g, '\\"')}"` : a);

// Formas diferentes de pedir a mesma coisa (nenhuma cita a skill).
const PEDIDOS = [
  'Quero criar um produto SeedGrid novo nesta pasta: o portal de gestão das chaves de API usadas pelo MCP do SeedGrid. O projeto se chama seedgrid-mcp-apikeys.',
  'Preciso de um sistema novo da SeedGrid para controle de contratos de uma imobiliária. Pode começar o projeto aqui?',
  'Cria um projeto novo SeedGrid pra mim: um painel de cobrança com assinaturas. Vamos começar.',
  'Vou começar um produto novo SeedGrid, um portal para cadastro de clientes com login por empresa. Por onde começamos?',
];
const FERRAMENTAS = ['Bash(node:*)', 'Bash(git:*)', 'Bash(ls:*)', 'Bash(mkdir:*)', 'Bash(cat:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill'];

function analisar(destino) {
  const pasta = join(homedir(), '.claude', 'projects', destino.replace(/[^A-Za-z0-9]/g, '-'));
  const r = { skillInvocada: false, fora: [], ferramentas: {} };
  if (!existsSync(pasta)) return r;
  const raiz = destino.toLowerCase().split(sep).join('/');
  const barra = String.fromCharCode(92);
  const absolutos = (t) => [...t.split(barra + barra).join('/').split(barra).join('/').matchAll(/(?:[A-Za-z]:\/|\/[a-z]\/|~\/)[^\s"'`;|)<>]*/g)].map((m) => m[0]);
  for (const f of readdirSync(pasta).filter((x) => x.endsWith('.jsonl'))) {
    for (const linha of readFileSync(join(pasta, f), 'utf8').split('\n').filter(Boolean)) {
      let o; try { o = JSON.parse(linha); } catch { continue; }
      for (const c of o.message?.content ?? []) {
        if (c.type !== 'tool_use') continue;
        r.ferramentas[c.name] = (r.ferramentas[c.name] ?? 0) + 1;
        if (c.name === 'Skill' && /sg-new-product/.test(JSON.stringify(c.input))) r.skillInvocada = true;
        const alvos = [c.input?.file_path, c.input?.path, ['Bash', 'PowerShell'].includes(c.name) ? c.input?.command : null].filter(Boolean);
        for (const alvo of alvos) for (const p of absolutos(String(alvo))) {
          const norm = p.toLowerCase().replace(/^\/([a-z])\//, '$1:/');
          if (norm.startsWith(raiz) || norm.startsWith('/dev/null') || norm.includes('/.claude/projects/')) continue;
          r.fora.push(`${c.name}: ${p.slice(0, 120)}`);
        }
      }
    }
  }
  r.fora = [...new Set(r.fora)];
  return r;
}

if (!process.argv.includes('--sem-build')) {
  const b = sh('npm', ['run', 'build'], { cwd: RAIZ });
  if (b.status !== 0) { console.error(`build falhou:\n${b.stdout}${b.stderr}`); process.exit(2); }
}
mkdirSync(base, { recursive: true });
const linhas = [];
let total = 0;
for (let i = 1; i <= N; i++) {
  const destino = join(base, `t${String(i).padStart(2, '0')}`, 'seedgrid-mcp-apikeys');
  rmSync(join(base, `t${String(i).padStart(2, '0')}`), { recursive: true, force: true });
  mkdirSync(destino, { recursive: true });
  const init = sh(process.execPath, [join(RAIZ, 'dist', 'cli.js'), 'init', '--project', destino, '--target', 'claude']);
  if (init.status !== 0) { console.error(`init falhou:\n${init.stdout}${init.stderr}`); process.exit(2); }
  const pedido = PEDIDOS[(i - 1) % PEDIDOS.length];
  const args = ['-p', '--output-format', 'json', '--permission-mode', 'acceptEdits', '--max-budget-usd', '1.5', '--allowedTools', ...FERRAMENTAS.map(aspas)];
  if (arg('modelo')) args.push('--model', arg('modelo'));
  const r = sh('claude', args, { cwd: destino, input: pedido, timeout: 8 * 60 * 1000 });
  let j = {};
  try { j = JSON.parse(r.stdout); } catch { /* segue: sem JSON conta como falha */ }
  const a = analisar(destino);
  const custo = j.total_cost_usd ?? 0;
  total += custo;
  const ok = a.skillInvocada && a.fora.length === 0;
  linhas.push({ i, ok, skill: a.skillInvocada, fora: a.fora, custo, turnos: j.num_turns ?? 0, pedido: pedido.slice(0, 50) });
  console.log(`${String(i).padStart(2)}  ${ok ? 'OK ' : 'FALHA'}  skill=${a.skillInvocada ? 'sim' : 'NAO'}  fora=${a.fora.length}  turnos=${j.num_turns ?? '?'}  US$ ${custo.toFixed(2)}  ${pedido.slice(0, 48)}`);
  for (const f of a.fora.slice(0, 3)) console.log(`      fora: ${f}`);
}
const oks = linhas.filter((l) => l.ok).length;
console.log(`\n${oks} de ${N} tentativas acionaram a skill sem sair da pasta. Custo total: US$ ${total.toFixed(2)}`);
writeFileSync(join(base, 'resultado.json'), JSON.stringify({ n: N, oks, total, linhas }, null, 2));
process.exit(oks === N ? 0 : 1);
