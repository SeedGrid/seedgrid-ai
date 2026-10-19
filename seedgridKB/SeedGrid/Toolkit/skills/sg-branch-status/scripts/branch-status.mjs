#!/usr/bin/env node
// Classifica as branches e os worktrees do repositorio e limpa o que ja foi mergeado. Sem dependencias.
//
//   node branch-status.mjs                       relatorio (nao altera nada)
//   node branch-status.mjs --json                relatorio em JSON
//   node branch-status.mjs --delete <branch>     apaga branch local, remota e worktree de uma branch MERGEADA
//   node branch-status.mjs --delete <branch> --dry-run   mostra o que faria
//   opcoes: --base <branch>  destino a comparar (padrao: develop; sem develop, main/master)
//           --days <n>       dias sem commit para uma branch nao mergeada ficar "sem dono" (padrao 14)
//           --no-remote      nao apaga a branch remota
//           --force          permite apagar branch NAO mergeada (so quando o dono mandar)
//
// Squash nao deixa ancestralidade: `git branch --merged` e `git cherry` nao enxergam uma branch que entrou por squash.
// Por isso a deteccao compara CONTEUDO: a branch esta mergeada se e ancestral do destino, ou se cada arquivo que ela
// alterou ja tem no destino o mesmo conteudo (arquivo apagado: ausente no destino), ou se mesclar a branch no destino
// nao muda a arvore do destino.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const opt = (n, d) => (args.includes(n) ? args[args.indexOf(n) + 1] : d);
const asJson = flag('--json');
const days = Number(opt('--days', '14'));
const toDelete = opt('--delete', null);
const dryRun = flag('--dry-run');
const force = flag('--force');
const noRemote = flag('--no-remote');

function run(a, { allowFail = false } = {}) {
  try {
    return execFileSync('git', a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], maxBuffer: 1 << 28 }).replace(/\r?\n$/, '');
  } catch (e) {
    if (allowFail) return null;
    throw new Error(`git ${a.join(' ')}: ${(e.stderr || e.message).toString().trim()}`);
  }
}
const ok = (a) => run(a, { allowFail: true }) !== null;
const exists = (ref) => ok(['rev-parse', '--verify', '--quiet', `${ref}^{commit}`]);

if (!ok(['rev-parse', '--git-dir'])) {
  console.error('[branch-status] esta pasta nao e um repositorio git');
  process.exit(2);
}

const hasOrigin = (run(['remote']) || '').split('\n').includes('origin');
const current = run(['branch', '--show-current'], { allowFail: true }) || '';

// ---- destino ------------------------------------------------------------------------------------------------
function pickBase() {
  const wanted = opt('--base', null);
  const cands = wanted ? [wanted] : ['develop', 'main', 'master'];
  for (const c of cands) {
    if (exists(`refs/heads/${c}`)) return { name: c, ref: `refs/heads/${c}` };
    if (hasOrigin && exists(`refs/remotes/origin/${c}`)) return { name: c, ref: `refs/remotes/origin/${c}` };
  }
  console.error(`[branch-status] destino nao encontrado (${cands.join(', ')})`);
  process.exit(2);
}
const base = pickBase();
const PROTECTED = new Set(['main', 'master', 'develop', base.name]);

// ---- conteudo -----------------------------------------------------------------------------------------------
function blob(ref, file) {
  return run(['rev-parse', '--verify', '--quiet', `${ref}:${file}`], { allowFail: true });
}

/** Esta branch ja esta no destino? Devolve { merged, why }. */
function mergedInto(ref) {
  if (ok(['merge-base', '--is-ancestor', ref, base.ref])) return { merged: true, why: 'ancestral do destino' };
  const mb = run(['merge-base', base.ref, ref], { allowFail: true });
  if (!mb) return { merged: false, why: 'sem ancestral comum' };
  const changed = run(['diff', '--name-status', '--no-renames', mb, ref]).split('\n').filter(Boolean);
  if (changed.length) {
    let same = true;
    for (const line of changed) {
      const [st, ...rest] = line.split('\t');
      const file = rest.join('\t');
      const inBase = blob(base.ref, file);
      if (st === 'D' ? inBase !== null : inBase !== blob(ref, file)) { same = false; break; }
    }
    if (same) return { merged: true, why: 'conteudo ja esta no destino (squash)' };
  }
  const tree = run(['merge-tree', '--write-tree', base.ref, ref], { allowFail: true });
  if (tree && tree.split('\n')[0] === run(['rev-parse', `${base.ref}^{tree}`])) return { merged: true, why: 'mesclar nao altera o destino' };
  return { merged: false, why: `${changed.length} arquivo(s) com conteudo diferente do destino` };
}

// ---- worktrees ----------------------------------------------------------------------------------------------
function worktrees() {
  const out = run(['worktree', 'list', '--porcelain']).split('\n\n').filter(Boolean);
  return out.map((blk) => {
    const w = { path: '', branch: null, prunable: false, main: false };
    for (const l of blk.split('\n')) {
      if (l.startsWith('worktree ')) w.path = l.slice(9);
      else if (l.startsWith('branch ')) w.branch = l.slice(7).replace('refs/heads/', '');
      else if (l.startsWith('prunable')) w.prunable = true;
    }
    return w;
  }).map((w, i) => ({ ...w, main: i === 0, missing: !fs.existsSync(w.path) }));
}
const wts = worktrees();
const wtOf = (b) => wts.filter((w) => w.branch === b && !w.main);

// ---- branches -----------------------------------------------------------------------------------------------
function branches() {
  const rows = [];
  const fmt = '%(refname)\t%(committerdate:unix)\t%(authorname)';
  const add = (refPrefix, strip, remote) => {
    for (const l of run(['for-each-ref', `--format=${fmt}`, refPrefix]).split('\n').filter(Boolean)) {
      const [ref, ts, author] = l.split('\t');
      const name = ref.replace(strip, '');
      if (name === 'HEAD' || (remote && name === 'HEAD')) continue;
      rows.push({ name, ref, remote, ageDays: Math.floor((Date.now() / 1000 - Number(ts)) / 86400), author });
    }
  };
  add('refs/heads', 'refs/heads/', false);
  if (hasOrigin) add('refs/remotes/origin', 'refs/remotes/origin/', true);
  return rows.filter((r) => !PROTECTED.has(r.name));
}

function classify(r) {
  const m = mergedInto(r.ref);
  const inWt = !r.remote && (wtOf(r.name).length > 0 || r.name === current);
  let status;
  if (m.merged) status = 'mergeada';
  else if (inWt || r.ageDays <= days) status = 'em uso';
  else status = 'sem dono';
  return { ...r, status, why: m.merged ? m.why : inWt ? 'checkout ativo' : r.ageDays <= days ? `commit ha ${r.ageDays} dia(s)` : `${m.why}; sem commit ha ${r.ageDays} dia(s)` };
}

// ---- apagar -------------------------------------------------------------------------------------------------
function del(name) {
  if (PROTECTED.has(name)) { console.error(`[branch-status] recusado: ${name} e protegida (main/develop/destino)`); process.exit(3); }
  if (name === current) { console.error(`[branch-status] recusado: ${name} esta com checkout; troque de branch antes`); process.exit(3); }
  const local = exists(`refs/heads/${name}`);
  const remote = hasOrigin && exists(`refs/remotes/origin/${name}`);
  if (!local && !remote) { console.error(`[branch-status] branch ${name} nao existe`); process.exit(2); }
  const info = classify({ name, ref: local ? `refs/heads/${name}` : `refs/remotes/origin/${name}`, remote: !local, ageDays: 0, author: '' });
  if (info.status !== 'mergeada' && !force) {
    console.error(`[branch-status] recusado: ${name} NAO esta mergeada em ${base.name} (${info.why}). Pergunte ao dono; so ele manda usar --force.`);
    process.exit(3);
  }
  const steps = [];
  for (const w of wtOf(name)) steps.push(['worktree', ['worktree', 'remove', w.path], `remover worktree ${w.path}`]);
  if (local) steps.push(['local', ['branch', '-D', name], `apagar branch local ${name}`]);
  if (remote && !noRemote) steps.push(['remote', ['push', 'origin', '--delete', name], `apagar branch remota origin/${name}`]);
  for (const [, a, label] of steps) {
    if (dryRun) { console.log(`[dry-run] ${label}`); continue; }
    try { run(a); console.log(`ok: ${label}`); } catch (e) {
      console.error(`falhou: ${label}\n  ${e.message}\n  (worktree com mudancas nao e removido sozinho: reporte ao dono)`);
      process.exit(4);
    }
  }
  if (!dryRun && !noRemote) run(['fetch', '--prune', 'origin'], { allowFail: true });
}

if (toDelete) { del(toDelete); process.exit(0); }

// ---- relatorio ----------------------------------------------------------------------------------------------
const rows = branches().map(classify).sort((a, b) => a.status.localeCompare(b.status) || a.name.localeCompare(b.name));
const wtRows = wts.filter((w) => !w.main).map((w) => {
  const row = w.branch ? rows.find((r) => !r.remote && r.name === w.branch) : null;
  const status = w.missing || w.prunable ? 'orfao (pasta ausente)' : row && row.status === 'mergeada' ? 'orfao (branch mergeada)' : 'em uso';
  return { path: w.path, branch: w.branch, status };
});

if (asJson) {
  console.log(JSON.stringify({ base: base.name, branches: rows, worktrees: wtRows }, null, 2));
  process.exit(0);
}
console.log(`[branch-status] destino: ${base.name}; branch atual: ${current || '(detached)'}`);
for (const s of ['mergeada', 'sem dono', 'em uso']) {
  const list = rows.filter((r) => r.status === s);
  if (!list.length) continue;
  console.log(`\n${s.toUpperCase()} (${list.length})`);
  for (const r of list) console.log(`  ${r.remote ? 'origin/' : ''}${r.name}  - ${r.why}`);
}
const orphan = wtRows.filter((w) => w.status !== 'em uso');
if (wtRows.length) {
  console.log(`\nWORKTREES (${wtRows.length})`);
  for (const w of wtRows) console.log(`  ${w.path} [${w.branch || 'detached'}]  - ${w.status}`);
}
const cleanable = rows.filter((r) => r.status === 'mergeada' && !r.remote).map((r) => r.name);
if (cleanable.length || orphan.length) {
  console.log('\nLimpeza proposta (confirme com o dono antes de apagar o que nao for seu):');
  for (const n of cleanable) console.log(`  node branch-status.mjs --delete ${n}`);
  if (orphan.length) console.log('  git worktree prune   (worktrees com pasta ausente)');
} else if (!rows.length) console.log('\nNada sobrando.');
