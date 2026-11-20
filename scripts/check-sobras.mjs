#!/usr/bin/env node
// Verificacao de sobras (HO-04/HO-06): varre os repositorios git de uma pasta e lista, SEM alterar nada,
//  - branches locais ja mescladas na principal (podem ser apagadas com `git branch -d`);
//  - branches locais NAO mescladas (nao apague sem o dono mandar);
//  - branches remotas ja mescladas (apagar e irreversivel: so com ordem do dono);
//  - worktrees registrados alem do checkout principal (e se a pasta sumiu ou esta suja).
// Sem dependencias.   node scripts/check-sobras.mjs [--root <pasta>] [--fetch] [--json] [--depth <n>]
// Padrao: --root D:/empreendedorismo/seedgrid, profundidade 4. Sai com 1 se houver sobra.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(opt('--root', 'D:/empreendedorismo/seedgrid'));
const maxDepth = Number(opt('--depth', '4'));
const doFetch = args.includes('--fetch');
const asJson = args.includes('--json');
const SKIP = new Set(['node_modules', '.git', 'target', 'dist', 'build', '.next', '_wt', '.m2']);
const KEEP = new Set(['main', 'master', 'develop']);

function git(cwd, ...a) {
  try {
    return execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 }).trim();
  } catch { return null; }
}
const lines = (s) => (s ? s.split('\n').map((x) => x.trim()).filter(Boolean) : []);

function* repos(dir, depth) {
  if (depth > maxDepth) return;
  let ents;
  try { ents = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  // so' o checkout principal (.git e' pasta); worktree tem .git como arquivo e aparece na lista do principal
  if (ents.some((e) => e.name === '.git' && e.isDirectory())) yield dir;
  for (const e of ents) {
    if (!e.isDirectory() || SKIP.has(e.name)) continue;
    yield* repos(path.join(dir, e.name), depth + 1);
  }
}

function scan(repo) {
  const heads = lines(git(repo, 'for-each-ref', '--format=%(refname:short)', 'refs/heads'));
  if (!heads.length) return null;
  const main = heads.includes('main') ? 'main' : heads.includes('master') ? 'master' : git(repo, 'symbolic-ref', '--short', 'HEAD');
  if (!main) return null;
  if (doFetch && git(repo, 'remote')) git(repo, 'fetch', '-q', '--prune');
  const merged = lines(git(repo, 'branch', '--merged', main, '--format=%(refname:short)')).filter((b) => b !== main && !KEEP.has(b));
  const unmerged = heads.filter((b) => b !== main && !KEEP.has(b) && !merged.includes(b))
    .map((b) => `${b} (+${git(repo, 'rev-list', '--count', `${main}..${b}`) ?? '?'})`);
  const remoteMain = git(repo, 'rev-parse', '-q', '--verify', `refs/remotes/origin/${main}`) ? `origin/${main}` : null;
  const remoteMerged = remoteMain
    ? lines(git(repo, 'branch', '-r', '--merged', remoteMain, '--format=%(refname:short)')).filter((b) => !/\/(HEAD|main|master|develop)$/.test(b) && b !== 'origin')
    : [];
  const wts = [];
  const blocks = (git(repo, 'worktree', 'list', '--porcelain') ?? '').split(/\n\n/).slice(1);
  for (const b of blocks) {
    const p = (b.match(/^worktree (.+)$/m) || [])[1];
    if (!p) continue;
    const br = (b.match(/^branch refs\/heads\/(.+)$/m) || [])[1] || '(detached)';
    const exists = fs.existsSync(p);
    const dirty = exists ? lines(git(p, 'status', '--short')).length : 0;
    wts.push({ path: p, branch: br, exists, dirty });
  }
  return { repo: path.relative(root, repo) || '.', main, merged, unmerged, remoteMerged, wts };
}

const results = [];
for (const r of repos(root, 0)) {
  const s = scan(r);
  if (s && (s.merged.length || s.unmerged.length || s.remoteMerged.length || s.wts.length)) results.push(s);
}

if (asJson) {
  console.log(JSON.stringify(results, null, 2));
} else if (!results.length) {
  console.log(`[check-sobras] ok: nenhuma sobra em ${root}`);
} else {
  console.log(`[check-sobras] sobras em ${root}  (somente leitura; nada foi alterado)\n`);
  for (const s of results) {
    console.log(`## ${s.repo}  (principal: ${s.main})`);
    if (s.merged.length) console.log(`  locais JA MESCLADAS (git branch -d): ${s.merged.join(', ')}`);
    if (s.unmerged.length) console.log(`  locais NAO mescladas (nao apagar sem o dono): ${s.unmerged.join(', ')}`);
    if (s.remoteMerged.length) console.log(`  remotas ja mescladas (apagar so com ordem do dono): ${s.remoteMerged.join(', ')}`);
    for (const w of s.wts) {
      const estado = !w.exists ? 'PASTA SUMIU (git worktree prune)' : w.dirty ? `com ${w.dirty} alteracao(oes): nao remova sozinho` : 'limpo (git worktree remove)';
      console.log(`  worktree ${w.path} [${w.branch}]: ${estado}`);
    }
    console.log('');
  }
  const total = results.reduce((n, s) => n + s.merged.length + s.unmerged.length + s.remoteMerged.length + s.wts.length, 0);
  console.log(`[check-sobras] ${total} sobra(s) em ${results.length} repositorio(s)`);
}
process.exit(results.length ? 1 : 0);
