#!/usr/bin/env node
// Passo "Subir e verificar" do sg-new-product: sobe o produto gerado de verdade e diz em que passo falhou.
//   node verificar-subida.mjs --destino <pasta do produto> [--runtime docker|podman] [--timeout 240] [--sem-front] [--confirmar-admin] [--json]
// Passos: 1 dependencias do compose -> 2 backend (run.sh) responde /q/health/ready e o log do boot nao tem ERROR ->
//         3 rota protegida sem token = 401 e login do primeiro administrador (ele nasce sem e-mail confirmado: 403 e o e-mail
//         de boas-vindas chega no Mailpit; --confirmar-admin confirma e entra, so em banco de teste) -> 4 frontend/admin respondem.
// Para so o que ele mesmo subiu. Nao conserta nada e nao imprime segredo (a senha vem do backend/dev.env e fica so em memoria).
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, openSync, closeSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createConnection } from 'node:net';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { lerPortas } from './portas.mjs';

const dorme = (ms) => new Promise((r) => setTimeout(r, ms));
const windows = process.platform === 'win32';

export function lerEnv(arquivo) {
  const env = {};
  if (!existsSync(arquivo)) return env;
  for (const l of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    if (!l || l.startsWith('#') || !l.includes('=')) continue;
    env[l.slice(0, l.indexOf('='))] = l.slice(l.indexOf('=') + 1);
  }
  return env;
}

/** Trechos de ERROR do log do boot (ate `max` linhas), para o relato. */
export function errosDoLog(texto, max = 8) {
  const linhas = String(texto).split(/\r?\n/);
  const erros = linhas.filter((l) => /\bERROR\b/.test(l) && !/^\[ERROR\]\s*$/.test(l) && !/Re-run Maven|For more information|Help 1|To see the full stack/.test(l));
  // WARN que na pratica e defeito: entidade de extension fora de qualquer unidade de persistencia (a extension sobe, mas nao grava)
  linhas.forEach((l, i) => { if (/Could not find a suitable persistence unit/.test(l)) erros.push(`${l.trim()} ${linhas.slice(i + 1, i + 4).map((x) => x.trim()).join(' ')}`); });
  const causas = linhas.filter((l) => /^\s*Caused by:/.test(l)).slice(0, 4);
  return [...erros.slice(0, max), ...causas].map((l) => l.slice(0, 300));
}

function achaRuntime(pedido) {
  for (const rt of pedido ? [pedido] : ['docker', 'podman']) {
    const r = spawnSync(rt, ['--version'], { encoding: 'utf8' });
    if (r.status === 0) return rt;
  }
  return null;
}

function portaAberta(porta, host = '127.0.0.1', ms = 1500) {
  return new Promise((ok) => {
    const s = createConnection({ port: porta, host });
    const fim = (v) => { s.destroy(); ok(v); };
    s.setTimeout(ms, () => fim(false));
    s.once('connect', () => fim(true));
    s.once('error', () => fim(false));
  });
}
async function esperar(teste, ate, passo = 2000) {
  while (Date.now() < ate) { if (await teste()) return true; await dorme(passo); }
  return false;
}
async function http(url, opcoes = {}) {
  try { const r = await fetch(url, { ...opcoes, signal: AbortSignal.timeout(8000) }); return { status: r.status, corpo: await r.text() }; }
  catch (e) { return { status: 0, corpo: String(e.message ?? e) }; }
}
function matar(filho) {
  if (!filho?.pid) return;
  if (windows) spawnSync('taskkill', ['/PID', String(filho.pid), '/T', '/F']);
  else { try { process.kill(-filho.pid, 'SIGTERM'); } catch { try { filho.kill('SIGTERM'); } catch { /* ja saiu */ } } }
}

/** Encerra o que sobrou do produto (ex.: o java do Quarkus, que escapa do taskkill /T): so processos cuja linha de comando cita a pasta do produto. */
function limparRestos(destino) {
  const pasta = resolve(destino);
  if (windows) {
    const ps = `$d='${pasta.replace(/'/g, "''")}'; Get-CimInstance Win32_Process | Where-Object { $_.ProcessId -ne ${process.pid} -and $_.ProcessId -ne ${process.ppid} -and $_.CommandLine -and $_.CommandLine.ToLower().Contains($d.ToLower().Replace('/','\')) -and $_.Name -match 'java|node|mvn|bash' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }`;
    spawnSync('powershell', ['-NoProfile', '-NonInteractive', '-Command', ps], { encoding: 'utf8' });
  } else spawnSync('pkill', ['-f', '--', pasta], { encoding: 'utf8' });
}

/** Procura no Mailpit o e-mail de boas-vindas do administrador e devolve o token do link, se houver. */
async function emailChegou(portas, email) {
  const mp = (portas.servicos ?? []).find((s) => /mailpit/i.test(s.imagem + s.servico) && /interface web/i.test(s.finalidade));
  if (!mp) return null;
  const base = `http://127.0.0.1:${mp.portaHost}`;
  const b = await http(`${base}/api/v1/search?query=${encodeURIComponent('to:' + email)}`);
  let msgs = []; try { msgs = JSON.parse(b.corpo).messages ?? []; } catch { return null; }
  if (!msgs.length) return null;
  const m = await http(`${base}/api/v1/message/${msgs[0].ID}`);
  const tk = /token=([A-Za-z0-9._~%-]+)/.exec(m.corpo);
  return { token: tk ? decodeURIComponent(tk[1]) : null };
}

export async function verificar({ destino, runtime, timeout = 240, front = true, confirmarAdmin = false, log = () => {} }) {
  const passos = [];
  const registra = (id, estado, detalhe = '', extra = {}) => { passos.push({ id, estado, detalhe, ...extra }); log(`${estado === 'ok' ? 'OK   ' : estado === 'pulado' ? 'PULOU' : 'FALHA'} ${id}${detalhe ? ' - ' + detalhe : ''}`); return estado !== 'falha'; };
  const filhos = [];
  const subiuServicos = [];
  let composeProjeto = null;
  const tmp = mkdtempSync(join(tmpdir(), 'sg-subida-'));
  const rt = achaRuntime(runtime);
  const fim = () => { for (const f of filhos.reverse()) matar(f); limparRestos(destino); };
  try {
    const produtoJson = join(destino, 'produto.json');
    if (!existsSync(produtoJson)) { registra('produto', 'falha', 'produto.json nao encontrado em ' + destino); return { ok: false, passos }; }
    const produto = JSON.parse(readFileSync(produtoJson, 'utf8'));
    const portaBack = (produto.servicos ?? []).find((s) => s.tipo === 'backend')?.porta ?? 8080;

    // 1. dependencias do compose (sem os servicos de perfil, como o Mockoon)
    const portas = lerPortas(destino);
    const deps = [...new Set(portas.servicos.filter((s) => !s.perfis.length).map((s) => s.servico))];
    if (deps.length) {
      if (!rt) return (registra('dependencias', 'falha', 'nem docker nem podman encontrados no PATH'), { ok: false, passos });
      // Projeto proprio da verificacao: nunca reaproveita nem derruba containers/volume de outro produto com o mesmo nome (ex.: o que o dono esta rodando).
      const projeto = `sgv-${String(produto.slug ?? 'produto').replace(/[^a-z0-9]/g, '')}-${createHash('sha1').update(resolve(destino)).digest('hex').slice(0, 6)}`;
      const ocupadas = [];
      for (const p of portas.servicos.filter((s) => !s.perfis.length)) if (await portaAberta(p.portaHost)) ocupadas.push(p.portaHost);
      if (ocupadas.length) return (registra('dependencias', 'falha', `porta(s) ${[...new Set(ocupadas)].join(', ')} ja em uso (outro compose ou processo, talvez o proprio produto rodando); pare-o e rode de novo. Nada foi tocado.`), { ok: false, passos });
      composeProjeto = projeto;
      const antes = spawnSync(rt, ['compose', '-p', projeto, 'ps', '--services', '--filter', 'status=running'], { cwd: destino, encoding: 'utf8' });
      const jaRodando = new Set(String(antes.stdout ?? '').split(/\r?\n/).filter(Boolean));
      const up = spawnSync(rt, ['compose', '-p', projeto, 'up', '-d', ...deps], { cwd: destino, encoding: 'utf8' });
      if (up.status !== 0) return (registra('dependencias', 'falha', `${rt} compose up falhou: ${String(up.stderr).trim().split('\n').slice(-3).join(' | ').slice(0, 300)}`), { ok: false, passos });
      subiuServicos.push(...deps.filter((d) => !jaRodando.has(d)));
      const publicadas = portas.servicos.filter((s) => !s.perfis.length).map((s) => s.portaHost);
      const ate = Date.now() + timeout * 1000;
      const todas = await esperar(async () => (await Promise.all(publicadas.map((p) => portaAberta(p)))).every(Boolean), ate);
      if (!todas) return (registra('dependencias', 'falha', `porta(s) nao abriram em ${timeout}s: ${publicadas.join(', ')}`), { ok: false, passos });
      registra('dependencias', 'ok', `${deps.join(', ')} (${rt})`);
    } else registra('dependencias', 'pulado', 'compose sem servicos');

    // 2. backend
    if (await portaAberta(portaBack)) return (registra('backend', 'falha', `a porta ${portaBack} ja esta em uso por outro processo; pare-o e rode de novo`), { ok: false, passos });
    const backend = join(destino, 'backend');
    if (!existsSync(join(backend, 'run.sh'))) return (registra('backend', 'falha', 'backend/run.sh nao existe (modelo sem boilerplate de backend?)'), { ok: false, passos });
    const arqLog = join(tmp, 'backend.log');
    const fd = openSync(arqLog, 'w');
    const back = spawn('bash', ['run.sh'], { cwd: backend, stdio: ['ignore', fd, fd], detached: !windows, windowsHide: true });
    closeSync(fd);
    filhos.push(back);
    let saiu = null; back.once('exit', (c) => { saiu = c; });
    const ate = Date.now() + timeout * 1000;
    const pronto = await esperar(async () => saiu === null && (await http(`http://127.0.0.1:${portaBack}/q/health/ready`)).status === 200, ate, 3000);
    const logTxt = existsSync(arqLog) ? readFileSync(arqLog, 'utf8') : '';
    if (!pronto) {
      const cauda = logTxt.split(/\r?\n/).filter(Boolean).slice(-6).map((l) => l.slice(0, 200));
      return (registra('backend', 'falha', saiu !== null ? `run.sh saiu com codigo ${saiu}` : `/q/health/ready nao respondeu 200 em ${timeout}s`, { log: errosDoLog(logTxt).concat(cauda) }), { ok: false, passos });
    }
    const erros = errosDoLog(logTxt);
    if (erros.length) registra('backend', 'falha', `subiu, mas o log do boot tem ${erros.length} linha(s) ERROR`, { log: erros });
    else registra('backend', 'ok', `/q/health/ready 200 na porta ${portaBack}, log do boot sem ERROR`);

    // 3. seguranca: rota protegida sem token = 401; login do primeiro administrador conforme o estado dele
    {
      const base = `http://127.0.0.1:${portaBack}`;
      const sem = await http(`${base}/me/profile`);
      if (sem.status !== 401) registra('rota-protegida', 'falha', `GET /me/profile sem token respondeu ${sem.status} (esperado 401)`);
      else registra('rota-protegida', 'ok', 'GET /me/profile sem token: 401');
      const env = lerEnv(join(backend, 'dev.env'));
      const email = env.SEEDGRID_SECURITY_FIRST_ADMIN_USER_EMAIL;
      const senha = env.SEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD;
      if (!email || !senha) registra('login', 'pulado', 'dev.env sem primeiro administrador (nao verificado)');
      else {
        const entrar = () => http(`${base}/public/auth/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ login: email, password: senha }) });
        let l = await entrar();
        if (l.status === 403 && /confirm/i.test(l.corpo)) {
          // estado normal do primeiro uso: o administrador ainda nao clicou no link do e-mail de boas-vindas
          const chegou = await emailChegou(portas, email);
          if (confirmarAdmin && chegou?.token) {
            const c = await http(`${base}/public/auth/confirm-email?token=${encodeURIComponent(chegou.token)}`);
            if (c.status === 200) l = await entrar();
            else registra('login', 'falha', `confirmar o e-mail do administrador respondeu ${c.status}`);
          }
          if (l.status === 403) registra('login', chegou ? 'ok' : 'falha', chegou ? 'primeiro administrador ainda sem e-mail confirmado (403, esperado no primeiro uso); o e-mail de boas-vindas chegou no Mailpit. Login completo nao verificado (use --confirmar-admin num banco de teste)' : 'login 403 (e-mail nao confirmado) e o e-mail de boas-vindas NAO chegou no Mailpit');
        }
        if (l.status !== 403 || confirmarAdmin) {
          let j = {}; try { j = JSON.parse(l.corpo); } catch { /* corpo nao e JSON */ }
          const token = j.accessToken ?? j.access_token ?? j.token ?? null;
          const pendente = ['changePasswordRequired', 'termsAcceptanceRequired', 'companySelectionRequired'].filter((k) => j[k] === true);
          if (l.status === 200 && token && pendente.length) registra('login', 'ok', `credenciais validas; o primeiro acesso ainda exige: ${pendente.join(', ')} (o token e restrito ate la). Rota com token nao verificada`);
          else if (l.status === 200 && token) {
            const com = await http(`${base}/me/profile`, { headers: { authorization: `Bearer ${token}` } });
            if (com.status === 200) registra('login', 'ok', 'login devolveu token; GET /me/profile com token: 200');
            else registra('login', 'falha', `GET /me/profile com token respondeu ${com.status} (esperado 200); campos da resposta do login: ${Object.keys(j).join(', ')}${j.code ? '; code=' + j.code : ''}${j.passwordChangeRequired !== undefined ? '; passwordChangeRequired=' + j.passwordChangeRequired : ''}`);
          } else if (l.status === 401 && /PASSWORD_CHANGE_REQUIRED/.test(l.corpo)) registra('login', 'ok', 'credenciais validas; o primeiro acesso exige troca de senha (PASSWORD_CHANGE_REQUIRED). Rota com token nao verificada');
          else if (!passos.some((p) => p.id === 'login')) registra('login', 'falha', `POST /public/auth/login respondeu ${l.status}${l.status === 200 ? ' sem token no corpo' : ''}`);
        }
      }
    }

    // 4. frontend e admin
    if (!front) registra('frontend', 'pulado', '--sem-front');
    else for (const app of (produto.servicos ?? []).filter((s) => s.tipo !== 'backend')) {
      const pasta = join(destino, app.nome);
      if (!existsSync(join(pasta, 'package.json'))) { registra(app.nome, 'pulado', `${app.nome}/ sem package.json (nao verificado)`); continue; }
      if (await portaAberta(app.porta)) { registra(app.nome, 'falha', `a porta ${app.porta} ja esta em uso por outro processo`); continue; }
      const pnpm = spawnSync(windows ? 'pnpm.cmd' : 'pnpm', ['--version'], { encoding: 'utf8', shell: windows });
      if (pnpm.status !== 0) { registra(app.nome, 'pulado', 'pnpm nao encontrado (nao verificado)'); continue; }
      if (!existsSync(join(pasta, 'node_modules'))) {
        const inst = spawnSync(windows ? 'pnpm.cmd' : 'pnpm', ['install', '--frozen-lockfile'], { cwd: pasta, encoding: 'utf8', timeout: 600000, shell: windows });
        if (inst.status !== 0) { registra(app.nome, 'falha', 'pnpm install falhou: ' + String(inst.stderr || inst.stdout).trim().split('\n').slice(-2).join(' | ').slice(0, 240)); continue; }
      }
      const arq = join(tmp, `${app.nome}.log`); const fdf = openSync(arq, 'w');
      const f = spawn(windows ? 'pnpm.cmd' : 'pnpm', ['dev', '-p', String(app.porta)], { cwd: pasta, stdio: ['ignore', fdf, fdf], detached: !windows, windowsHide: true, shell: windows });
      closeSync(fdf); filhos.push(f);
      const ok = await esperar(async () => (await http(`http://127.0.0.1:${app.porta}/`)).status > 0, Date.now() + timeout * 1000, 3000);
      if (ok) registra(app.nome, 'ok', `responde na porta ${app.porta}`);
      else registra(app.nome, 'falha', `nao respondeu em ${timeout}s`, { log: readFileSync(arq, 'utf8').split(/\r?\n/).filter(Boolean).slice(-5).map((x) => x.slice(0, 200)) });
    }
    return { ok: passos.every((p) => p.estado !== 'falha'), passos };
  } finally {
    fim();
    if (composeProjeto && rt) spawnSync(rt, ['compose', '-p', composeProjeto, 'down', '-v'], { cwd: destino, encoding: 'utf8' }); // projeto so da verificacao: sai com o volume, para o proximo teste nao herdar senha antiga
    else if (subiuServicos.length && rt) spawnSync(rt, ['compose', 'stop', ...subiuServicos], { cwd: destino, encoding: 'utf8' });
    try { rmSync(tmp, { recursive: true, force: true }); } catch { /* o log pode estar aberto no Windows */ }
  }
}

async function main() {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
  const destino = resolve(arg('destino') ?? process.cwd());
  const json = process.argv.includes('--json');
  const r = await verificar({ destino, runtime: arg('runtime'), timeout: Number(arg('timeout') ?? 240), front: !process.argv.includes('--sem-front'), confirmarAdmin: process.argv.includes('--confirmar-admin'), log: json ? () => {} : (m) => console.log(m) });
  if (json) console.log(JSON.stringify(r, null, 2));
  else {
    for (const p of r.passos) if (p.log?.length) console.log(`  [${p.id}] trecho do log:\n    ` + p.log.join('\n    '));
    console.log(r.ok ? '\nSubiu e respondeu: todos os passos aplicaveis passaram.' : '\nO produto NAO subiu limpo: veja o primeiro passo com FALHA. Nada foi consertado.');
  }
  process.exit(r.ok ? 0 : 1);
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
