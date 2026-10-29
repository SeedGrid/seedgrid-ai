#!/usr/bin/env node
// E2E do fluxo de produto novo (so para quem desenvolve o seedgrid-ai; fora do pacote).
// Cria a pasta do produto, roda o init com o dist LOCAL, chama "claude -p" com o pedido e responde as perguntas da skill
// em turnos seguintes (--resume), lendo as respostas de um arquivo. Guarda o JSON de cada turno e confere os criterios.
// Quem executa NAO conduz o fluxo: so responde como o usuario. Perguntas fora do esperado viram "desvios" no relatorio.
// Uso: node scripts/e2e-produto-novo.mjs --destino <pasta> [--respostas <json>] [--saida <pasta>] [--modelo <modelo>]
//        [--sem-build] [--sem-fronts] [--so-conferir] [--subir [--runtime docker|podman]] [--vigiar <repo> ...]
import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : d; };
const flag = (n) => process.argv.includes(`--${n}`);
const todos = (n) => process.argv.flatMap((a, i) => (a === `--${n}` ? [process.argv[i + 1]] : []));
const win = process.platform === 'win32';

const destino = resolve(arg('destino') ?? '');
if (!arg('destino')) { console.error('uso: node scripts/e2e-produto-novo.mjs --destino <pasta> [opcoes]'); process.exit(2); }
const respostasArq = resolve(arg('respostas', join(RAIZ, 'scripts', 'e2e', 'respostas-mcp-apikeys.json')));
const config = JSON.parse(readFileSync(respostasArq, 'utf8'));
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const saida = resolve(arg('saida', join(RAIZ, 'e2e-out', stamp)));
const vigiar = todos('vigiar').map((r) => resolve(r));
mkdirSync(saida, { recursive: true });

const sh = (cmd, args, opt = {}) => spawnSync(cmd, args, { encoding: 'utf8', shell: win && cmd !== process.execPath, maxBuffer: 256 * 1024 * 1024, ...opt });
const saidaDe = (r) => String(r.stdout ?? '') + String(r.stderr ?? '') + (r.error ? String(r.error.message) : '');
const aspas = (a) => (win ? `"${String(a).replace(/"/g, '\\"')}"` : a);
const estadoGit = (repo) => (existsSync(join(repo, '.git')) ? sh('git', ['-C', repo, 'status', '--porcelain']).stdout : null);
// Pastas gerenciadas pelo toolkit (instaladas pelo init, nao escritas pelo fluxo do produto): fora das checagens de conteudo do produto.
const GERENCIADO = (f) => /^(\.ai|\.claude|\.agents)\//.test(f) || f === 'AGENTS.md' || f === 'CLAUDE.md';
// Outras sessoes mexem nos repositorios vigiados durante o teste; o que importa e se algo NOVO cita o produto.
function citaProduto(repo, antesStatus, slug) {
  const linhas = (t) => new Set((t ?? '').split('\n').filter(Boolean));
  const antesL = linhas(antesStatus);
  const novos = [...linhas(estadoGit(repo))].filter((l) => !antesL.has(l)).map((l) => l.slice(3).trim());
  return novos.filter((rel) => { try { return readFileSync(join(repo, rel), 'utf8').includes(slug); } catch { return false; } });
}

// ---------- 1. preparo ----------
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

// ---------- 2. turnos ----------
const FERRAMENTAS = ['Bash(node:*)', 'Bash(git:*)', 'Bash(ls:*)', 'Bash(mkdir:*)', 'Bash(cat:*)', 'Read', 'Write', 'Edit', 'Glob', 'Grep', 'Skill'];
function turno(n, prompt, sessao) {
  const args = ['-p', '--output-format', 'json', '--permission-mode', 'acceptEdits', '--allowedTools', ...FERRAMENTAS.map(aspas)];
  if (config.modelo || arg('modelo')) args.push('--model', arg('modelo') ?? config.modelo);
  if (sessao) args.push('--resume', sessao);
  const t0 = Date.now();
  const r = sh('claude', args, { cwd: destino, input: prompt, timeout: 20 * 60 * 1000 });
  const ms = Date.now() - t0;
  const nome = `turno-${String(n).padStart(2, '0')}`;
  writeFileSync(join(saida, `${nome}.prompt.txt`), prompt);
  writeFileSync(join(saida, `${nome}.json`), r.stdout ?? '');
  if (r.stderr) writeFileSync(join(saida, `${nome}.stderr.txt`), r.stderr);
  let j;
  try { j = JSON.parse(r.stdout); } catch { throw new Error(`turno ${n}: saida do claude nao e JSON (status ${r.status}): ${(r.stdout || r.stderr || '').slice(0, 400)}`); }
  return { n, ms, texto: j.result ?? '', sessao: j.session_id, custo: j.total_cost_usd ?? 0, turnosInternos: j.num_turns ?? 0, erro: !!j.is_error, negadas: j.permission_denials ?? [], uso: j.usage ?? {} };
}

let envAntes = null;
function lerEnvArquivo(rel) {
  const m = {};
  try { for (const l of readFileSync(join(destino, rel), 'utf8').split(/\r?\n/)) { const x = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(l); if (x) m[x[1]] = x[2]; } } catch { /* sem arquivo */ }
  return m;
}

function conduzir() {
  const desvios = [];
  const observacoes = [];
  const turnos = [];
  let t = turno(0, config.pedido, null);
  turnos.push(t);
  let i = 0;
  for (const r of config.respostas) {
    i++;
    const esperado = new RegExp(r.espera, 'i');
    if (!esperado.test(t.texto)) desvios.push({ turno: i, tipo: 'pergunta diferente da esperada', esperado: r.espera, recebido: t.texto.slice(0, 300) });
    t = turno(i, r.resposta, t.sessao);
    turnos.push(t);
    if (t.erro) { desvios.push({ turno: i, tipo: 'turno com erro', recebido: t.texto.slice(0, 300) }); break; }
  }
  // Depois da confirmacao a skill gera o produto e escreve os documentos; se ainda perguntar algo, e desvio.
  for (let extra = 1; extra <= (config.maxTurnosExtras ?? 3); extra++) {
    if (!/\?\s*$/.test(t.texto.trim())) break;
    observacoes.push({ turno: turnos.length, tipo: 'duvida ou oferta depois da geracao (fluxo do arquiteto; nao e pergunta da matriz)', recebido: t.texto.slice(-300) });
    t = turno(turnos.length, config.respostaPadrao ?? 'Siga com o que for necessario e finalize.', t.sessao);
    turnos.push(t);
  }
  // Mudanca depois de pronto (reconfiguracao): o pedido leva todas as respostas; perguntas seguintes recebem a confirmacao.
  if (config.depois) {
    envAntes = lerEnvArquivo('backend/dev.env');
    t = turno(turnos.length, config.depois.pedido, t.sessao);
    turnos.push(t);
    for (let extra = 1; extra <= (config.depois.maxTurnosExtras ?? 4); extra++) {
      if (!/\?\s*$/.test(t.texto.trim())) break;
      observacoes.push({ turno: turnos.length, tipo: 'pergunta durante a mudanca (reconfiguracao)', recebido: t.texto.slice(-300) });
      t = turno(turnos.length, config.depois.confirmacao ?? 'Confirmo, pode aplicar.', t.sessao);
      turnos.push(t);
    }
  }
  return { turnos, desvios, observacoes };
}

// ---------- 3. criterios ----------
function arquivos(raiz, dir = raiz, saidaArr = []) {
  for (const n of readdirSync(dir).sort()) {
    if (['node_modules', '.git', 'target', '.next', 'dist'].includes(n)) continue;
    const p = join(dir, n);
    if (statSync(p).isDirectory()) arquivos(raiz, p, saidaArr);
    else saidaArr.push(relative(raiz, p).split(sep).join('/'));
  }
  return saidaArr;
}
const md = (d) => (existsSync(join(destino, d)) ? readdirSync(join(destino, d)).filter((f) => f.endsWith('.md')) : []);

// Le os jsonl das sessoes do claude desta pasta: a skill foi invocada? algum acesso a caminho fora da pasta do produto?
function analisarSessoes() {
  const pasta = join(homedir(), '.claude', 'projects', destino.replace(/[^A-Za-z0-9]/g, '-'));
  const r = { skillInvocada: false, fora: [], ferramentas: {}, existe: existsSync(pasta) };
  if (!r.existe) return r;
  const raiz = destino.toLowerCase().split(sep).join('/');
  const barra = String.fromCharCode(92);
  const absolutos = (texto) => [...texto.split(barra + barra).join('/').split(barra).join('/').matchAll(/(?:[A-Za-z]:\/|\/[a-z]\/|~\/)[^\s"'`;|)<>]*/g)].map((m) => m[0]);
  for (const f of readdirSync(pasta).filter((x) => x.endsWith('.jsonl'))) {
    for (const linha of readFileSync(join(pasta, f), 'utf8').split('\n').filter(Boolean)) {
      let o; try { o = JSON.parse(linha); } catch { continue; }
      for (const c of o.message?.content ?? []) {
        if (c.type !== 'tool_use') continue;
        r.ferramentas[c.name] = (r.ferramentas[c.name] ?? 0) + 1;
        if (c.name === 'Skill' && /sg-new-product/.test(JSON.stringify(c.input))) r.skillInvocada = true;
        // so os campos que apontam para o disco (nunca o conteudo de um Write/Edit)
        const alvos = [c.input?.file_path, c.input?.path, c.input?.notebook_path, ['Bash', 'PowerShell'].includes(c.name) ? c.input?.command : null].filter(Boolean);
        for (const alvo of alvos) for (const p of absolutos(String(alvo))) {
          const norm = p.toLowerCase().replace(/^\/([a-z])\//, '$1:/');
          if (norm.startsWith(raiz) || norm.startsWith('/dev/null') || norm.includes('/.claude/projects/')) continue;
          r.fora.push(`${c.name}: ${p.slice(0, 140)}`);
        }
      }
    }
  }
  r.fora = [...new Set(r.fora)];
  return r;
}

function conferir(antes) {
  const c = [];
  const ok = (nome, passou, detalhe = '') => c.push({ nome, passou: !!passou, detalhe });
  const lista = arquivos(destino);
  const sessoes = analisarSessoes();
  if (sessoes.existe) {
    ok('a skill sg-new-product foi invocada', sessoes.skillInvocada, JSON.stringify(sessoes.ferramentas));
    ok('so o toolkit instalado e a pasta do produto (nenhum caminho fora dela)', sessoes.fora.length === 0, sessoes.fora.slice(0, 5).join(' | '));
  }
  ok('produto gerado (produto.json, backend, frontend, admin)', ['produto.json', 'backend/pom.xml', 'frontend/package.json', 'admin/package.json', 'docker-compose.yml', 'backend/dev.env', 'backend/dev.env.example'].every((f) => lista.includes(f)));
  ok('plano em docs/ai/plans/', md('docs/ai/plans').length >= 1, md('docs/ai/plans').join(', '));
  ok('ADRs em docs/ai/decisions/', md('docs/ai/decisions').length >= 1, `${md('docs/ai/decisions').length} arquivo(s)`);
  ok('handoff em docs/ai/handoffs/', md('docs/ai/handoffs').length >= 1, md('docs/ai/handoffs').join(', '));
  // nada fora da pasta do produto: os repositorios vigiados nao podem ter mudado
  let slugProduto = '';
  try { slugProduto = JSON.parse(readFileSync(join(destino, 'produto.json'), 'utf8')).slug; } catch { /* produto nao gerado: ja reprovado acima */ }
  for (const repo of vigiar) { const citam = citaProduto(repo, antes.get(repo), slugProduto); ok(`nada do produto escrito em ${repo}`, citam.length === 0, citam.join(', ')); }
  const texto = lista.filter((f) => !GERENCIADO(f) && /\.(md|json|ya?ml|properties|xml|java|ts|tsx|mjs|js|txt|example|sh|html)$/i.test(f) && !['backend/dev.env', '.env'].includes(f) && !f.endsWith('.pem'));
  const citam = texto.filter((f) => /seedgrid-platform-work|seedgrid-ia-dev|seedgridKB-dev|D:\\empreendedorismo|\/d\/empreendedorismo/i.test(readFileSync(join(destino, f), 'utf8')));
  ok('produto sem referencia ao work/plataforma', citam.length === 0, citam.slice(0, 5).join(', '));
  const wf = join(destino, '.github/workflows/publicar.yml');
  let wfOk = false;
  try { wfOk = !!parse(readFileSync(wf, 'utf8')).jobs; } catch { /* invalido */ }
  ok('workflow do EasyPanel valido', wfOk);
  ok('Dockerfile em backend, frontend e admin', ['backend', 'frontend', 'admin'].every((s) => lista.includes(`${s}/Dockerfile`)));
  // manifesto, idempotencia da reconfiguracao, Mailpit, tenants de exemplo e expectativas da variante
  let manifesto = null;
  try { manifesto = JSON.parse(readFileSync(join(destino, '.seedgrid/manifesto.json'), 'utf8')); } catch { /* sem manifesto */ }
  ok('manifesto da reconfiguracao (.seedgrid/manifesto.json) com respostas e hashes', !!manifesto?.respostas && Object.keys(manifesto?.arquivos ?? {}).length > 50, manifesto ? `${Object.keys(manifesto.arquivos).length} arquivos` : 'ausente');
  if (manifesto) {
    const arqResp = join(saida, 'respostas-do-manifesto.json');
    writeFileSync(arqResp, JSON.stringify(manifesto.respostas));
    const rc = sh(process.execPath, [join(destino, '.ai', 'skills', 'sg-new-product', 'scripts', 'scaffold-produto.mjs'), '--reconfigurar', '--respostas', arqResp, '--json'], { cwd: destino });
    let j = null;
    try { j = JSON.parse(rc.stdout); } catch { /* saida invalida */ }
    ok('reconfigurar com as mesmas respostas nao acha diferenca (idempotente)', !!j?.ok && j.arquivos.length === 0 && j.env.length === 0, j ? JSON.stringify({ arquivos: j.arquivos?.slice(0, 5), env: j.env?.slice(0, 5), erros: j.erros }) : saidaDe(rc).slice(0, 300));
  }
  const compose = existsSync(join(destino, 'docker-compose.yml')) ? readFileSync(join(destino, 'docker-compose.yml'), 'utf8') : '';
  ok('compose com Mailpit local e sem Mailhog', /axllent\/mailpit/.test(compose) && !/mailhog/i.test(compose));
  let produtoJson = {};
  try { produtoJson = JSON.parse(readFileSync(join(destino, 'produto.json'), 'utf8')); } catch { /* ja reprovado */ }
  if (produtoJson.modelo === 'subdomain-tenancy') ok('tenants de exemplo: tenants-exemplo.hosts e produto.json', lista.includes('tenants-exemplo.hosts') && (produtoJson.tenantsExemplo ?? []).length > 0, JSON.stringify(produtoJson.tenantsExemplo));
  for (const rel of config.esperaArquivos?.existe ?? []) ok(`existe ${rel}`, existsSync(join(destino, rel)));
  for (const rel of config.esperaArquivos?.naoExiste ?? []) ok(`nao existe ${rel}`, !existsSync(join(destino, rel)));
  for (const [k, v] of Object.entries(config.esperaManifesto ?? {})) ok(`manifesto: ${k} = ${v}`, manifesto?.respostas?.[k] === v, String(manifesto?.respostas?.[k]));
  const envAgora = lerEnvArquivo('backend/dev.env');
  for (const [k, v] of Object.entries(config.esperaEnv ?? {})) ok(`dev.env: ${k} = ${v}`, envAgora[k] === v, envAgora[k] === undefined ? 'ausente' : 'valor diferente');
  if (config.segredosIguais && envAntes) {
    const chaves = Object.keys(envAntes).filter((k) => /PASSWORD|PRIVATE_KEY|PUBLIC_KEY|SECRET_KEY|ENCRYPTION_KEY|CRYPTO_KEY|SEARCH_KEY/.test(k) && envAgora[k] !== undefined);
    const trocados = chaves.filter((k) => envAntes[k] !== envAgora[k]);
    ok('a mudanca nao trocou nenhum segredo do dev.env', chaves.length > 3 && trocados.length === 0, trocados.join(', '));
  }
  // check-secrets so no que iria para o git (respeita o .gitignore)
  const ls = sh('git', ['-C', destino, 'ls-files', '--cached', '--others', '--exclude-standard']).stdout.split('\n').filter(Boolean);
  const limpo = mkdtempSync(join(tmpdir(), 'sg-e2e-limpo-'));
  for (const f of ls.filter((x) => !GERENCIADO(x))) { mkdirSync(dirname(join(limpo, f)), { recursive: true }); cpSync(join(destino, f), join(limpo, f)); }
  const cs = sh(process.execPath, [join(RAIZ, 'scripts', 'check-secrets.mjs'), '--dir', limpo]);
  rmSync(limpo, { recursive: true, force: true });
  ok('check-secrets limpo no que seria versionado', cs.status === 0, saidaDe(cs).slice(0, 400));
  ok('segredos fora do git (dev.env, .env, *.pem ignorados)', ['backend/dev.env', '.env'].every((f) => !ls.includes(f)) && !ls.some((f) => f.endsWith('.pem')));
  // compilacao
  const mvn = sh('mvn', ['-q', '-DskipTests', 'test-compile'], { cwd: join(destino, 'backend'), timeout: 20 * 60 * 1000 });
  ok('backend compila (mvn test-compile)', mvn.status === 0, saidaDe(mvn).slice(-600));
  if (!flag('sem-fronts')) {
    for (const app of ['frontend', 'admin']) {
      const dir = join(destino, app);
      const inst = sh('pnpm', ['install', '--frozen-lockfile'], { cwd: dir, timeout: 20 * 60 * 1000 });
      if (inst.status !== 0) { ok(`${app} compila (pnpm build)`, false, `pnpm install falhou: ${saidaDe(inst).slice(-400)}`); continue; }
      const b = sh('pnpm', ['build'], { cwd: dir, timeout: 20 * 60 * 1000 });
      ok(`${app} compila (pnpm build)`, b.status === 0, saidaDe(b).slice(-600));
    }
  }
  // subida de verdade (T3b.5): compose das dependencias, backend (health e log do boot), rota protegida, login e e-mail no Mailpit, fronts
  if (flag('subir')) {
    const runtime = arg('runtime') ?? (sh('docker', ['--version']).status === 0 ? 'docker' : 'podman');
    const v = sh(process.execPath, [join(RAIZ, 'seedgridKB', 'SeedGrid', 'Toolkit', 'skills', 'sg-new-product', 'scripts', 'verificar-subida.mjs'), '--destino', destino, '--runtime', runtime, '--json', ...(flag('sem-fronts') ? ['--sem-front'] : [])], { timeout: 30 * 60 * 1000 });
    let rel = null;
    try { rel = JSON.parse(String(v.stdout ?? '')); } catch { /* sem JSON: o script quebrou */ }
    if (!rel) ok(`subida (${runtime}): verificar-subida produziu relatorio`, false, saidaDe(v).slice(-600));
    else for (const p of rel.passos) ok(`subida (${runtime}): ${p.id}`, p.estado === 'ok' || p.estado === 'pulado', `${p.estado}: ${p.detalhe ?? ''} ${(p.log ?? []).join(' | ')}`);
    c.push({ nome: `runtime da subida: ${runtime} (o outro fica "nao verificado")`, passou: true, detalhe: '' });
  }
  return c;
}

// ---------- principal ----------
const antes = new Map(vigiar.map((r) => [r, estadoGit(r)]));
let conducao = { turnos: [], desvios: [], observacoes: [] };
if (!flag('so-conferir')) {
  preparar();
  conducao = conduzir();
}
const criterios = conferir(antes);
const soma = (k) => conducao.turnos.reduce((s, t) => s + (t[k] ?? 0), 0);
const relatorio = {
  produto: destino,
  quando: stamp,
  turnosDoUsuario: conducao.turnos.length,
  turnosInternosDoModelo: soma('turnosInternos'),
  custoUsd: Number(soma('custo').toFixed(4)),
  duracaoMin: Number((soma('ms') / 60000).toFixed(1)),
  perguntasForaDaMatriz: conducao.desvios.length,
  desvios: conducao.desvios,
  observacoes: conducao.observacoes,
  permissoesNegadas: conducao.turnos.flatMap((t) => t.negadas),
  turnos: conducao.turnos.map(({ n, ms, custo, turnosInternos, sessao }) => ({ n, ms, custo, turnosInternos, sessao })),
  criterios,
};
writeFileSync(join(saida, 'relatorio.json'), JSON.stringify(relatorio, null, 2));
console.log(`\nRelatorio: ${join(saida, 'relatorio.json')}`);
console.log(`Turnos: ${relatorio.turnosDoUsuario} (internos do modelo: ${relatorio.turnosInternosDoModelo}) | custo: US$ ${relatorio.custoUsd} | duracao: ${relatorio.duracaoMin} min | perguntas fora da matriz: ${relatorio.perguntasForaDaMatriz}`);
for (const c of criterios) console.log(`${c.passou ? 'OK    ' : 'FALHA '} ${c.nome}${c.passou || !c.detalhe ? '' : `  -> ${c.detalhe.replace(/\s+/g, ' ').slice(0, 200)}`}`);
spawnSync(process.execPath, [join(RAIZ, 'scripts', 'e2e-comandos-doc.mjs'), saida], { stdio: 'inherit' });
process.exit(criterios.every((c) => c.passou) && relatorio.perguntasForaDaMatriz === 0 ? 0 : 1);
