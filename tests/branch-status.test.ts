import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { bundledContentDir } from '../src/core/env.js';
import { cleanupAll, tempProject } from './helpers.js';

after(cleanupAll);

const SCRIPT = path.join(bundledContentDir(), 'SeedGrid', 'Toolkit', 'skills', 'sg-branch-status', 'scripts', 'branch-status.mjs');
const ENV = { ...process.env, GIT_AUTHOR_NAME: 't', GIT_AUTHOR_EMAIL: 't@t', GIT_COMMITTER_NAME: 't', GIT_COMMITTER_EMAIL: 't@t' };

function git(cwd: string, ...a: string[]): string {
  return execFileSync('git', ['-c', 'commit.gpgsign=false', '-c', 'core.autocrlf=false', ...a], { cwd, env: ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
}
function status(cwd: string, ...a: string[]): { code: number; out: string; json?: any } {
  try {
    const out = execFileSync('node', [SCRIPT, ...a], { cwd, env: ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, out, json: a.includes('--json') ? JSON.parse(out) : undefined };
  } catch (e: any) {
    return { code: e.status, out: `${e.stdout}${e.stderr}` };
  }
}
function write(cwd: string, file: string, text: string) {
  mkdirSync(path.dirname(path.join(cwd, file)), { recursive: true });
  writeFileSync(path.join(cwd, file), text);
}
function commit(cwd: string, file: string, text: string, msg: string) {
  write(cwd, file, text);
  git(cwd, 'add', file);
  git(cwd, 'commit', '-m', msg);
}

/** Repositorio com origin (bare), main e develop. */
async function repo() {
  const root = path.dirname(await tempProject('r'));
  const bare = path.join(root, 'origin.git');
  const work = path.join(root, 'work');
  mkdirSync(work, { recursive: true });
  git(root, 'init', '--bare', '-b', 'main', bare);
  git(work, 'init', '-b', 'main');
  git(work, 'remote', 'add', 'origin', bare);
  commit(work, 'README.md', 'a\n', 'inicio');
  git(work, 'push', '-u', 'origin', 'main');
  git(work, 'switch', '-c', 'develop');
  git(work, 'push', '-u', 'origin', 'develop');
  return { root, work, bare };
}

/** Cria feature/<nome> com um arquivo e a integra em develop por squash (sem ancestralidade). */
function squashFeature(work: string, name: string, file: string) {
  git(work, 'switch', '-c', `feature/${name}`, 'develop');
  commit(work, file, `${name}\n`, `${name} 1`);
  commit(work, file, `${name} v2\n`, `${name} 2`);
  git(work, 'push', '-u', 'origin', `feature/${name}`);
  git(work, 'switch', 'develop');
  git(work, 'merge', '--squash', `feature/${name}`);
  git(work, 'commit', '-m', `squash ${name}`);
  git(work, 'push', 'origin', 'develop');
}

describe('branch-status', () => {
  test('branch integrada por squash e mergeada (git branch --merged nao a enxerga)', async () => {
    const { work } = await repo();
    squashFeature(work, 'a', 'a.txt');
    assert.ok(!git(work, 'branch', '--merged', 'develop').includes('feature/a'), 'premissa: squash nao deixa ancestralidade');
    const r = status(work, '--json');
    const b = r.json.branches.find((x: any) => x.name === 'feature/a' && !x.remote);
    assert.equal(b.status, 'mergeada');
    assert.match(b.why, /squash/);
  });

  test('branch com commit novo e em uso e nao e proposta para limpeza', async () => {
    const { work } = await repo();
    git(work, 'switch', '-c', 'feature/b', 'develop');
    commit(work, 'b.txt', 'b\n', 'b');
    git(work, 'switch', 'develop');
    const r = status(work, '--json');
    assert.equal(r.json.branches.find((x: any) => x.name === 'feature/b').status, 'em uso');
    assert.ok(!status(work).out.includes('--delete feature/b'));
  });

  test('branch antiga e nao mergeada vira sem dono', async () => {
    const { work } = await repo();
    git(work, 'switch', '-c', 'feature/c', 'develop');
    commit(work, 'c.txt', 'c\n', 'c');
    git(work, 'switch', 'develop');
    const r = status(work, '--json', '--days', '-1');
    assert.equal(r.json.branches.find((x: any) => x.name === 'feature/c').status, 'sem dono');
  });

  test('--delete apaga branch local, remota e worktree de uma mergeada', async () => {
    const { work, root } = await repo();
    squashFeature(work, 'd', 'd.txt');
    const wt = path.join(root, 'wt-d');
    git(work, 'worktree', 'add', wt, 'feature/d');
    const r = status(work, '--delete', 'feature/d');
    assert.equal(r.code, 0, r.out);
    assert.ok(!existsSync(wt));
    assert.equal(git(work, 'branch', '--list', 'feature/d').trim(), '');
    assert.equal(git(work, 'ls-remote', '--heads', 'origin', 'feature/d').trim(), '');
  });

  test('--dry-run nao altera nada', async () => {
    const { work } = await repo();
    squashFeature(work, 'e', 'e.txt');
    const r = status(work, '--delete', 'feature/e', '--dry-run');
    assert.equal(r.code, 0);
    assert.match(r.out, /\[dry-run\]/);
    assert.notEqual(git(work, 'branch', '--list', 'feature/e').trim(), '');
  });

  test('recusa apagar main, develop e branch nao mergeada', async () => {
    const { work } = await repo();
    git(work, 'switch', '-c', 'feature/f', 'develop');
    commit(work, 'f.txt', 'f\n', 'f');
    git(work, 'switch', 'develop');
    for (const b of ['main', 'develop']) assert.equal(status(work, '--delete', b).code, 3, b);
    const r = status(work, '--delete', 'feature/f');
    assert.equal(r.code, 3);
    assert.match(r.out, /NAO esta mergeada/);
    assert.notEqual(git(work, 'branch', '--list', 'feature/f').trim(), '');
    assert.notEqual(git(work, 'ls-remote', '--heads', 'origin', 'main').trim(), '');
  });

  test('worktree com pasta apagada e reportado como orfao', async () => {
    const { work, root } = await repo();
    git(work, 'switch', '-c', 'feature/g', 'develop');
    commit(work, 'g.txt', 'g\n', 'g');
    git(work, 'switch', 'develop');
    const wt = path.join(root, 'wt-g');
    git(work, 'worktree', 'add', wt, 'feature/g');
    execFileSync('node', ['-e', `require('fs').rmSync(${JSON.stringify(wt)},{recursive:true,force:true})`]);
    const r = status(work, '--json');
    assert.match(r.json.worktrees[0].status, /orfao/);
  });

  test('sem develop usa main como destino', async () => {
    const root = path.dirname(await tempProject('r'));
    const work = path.join(root, 'w');
    mkdirSync(work, { recursive: true });
    git(work, 'init', '-b', 'main');
    commit(work, 'x.txt', 'x\n', 'x');
    git(work, 'switch', '-c', 'feature/h');
    commit(work, 'h.txt', 'h\n', 'h');
    git(work, 'switch', 'main');
    git(work, 'merge', '--squash', 'feature/h');
    git(work, 'commit', '-m', 'squash h');
    const r = status(work, '--json');
    assert.equal(r.json.base, 'main');
    assert.equal(r.json.branches.find((x: any) => x.name === 'feature/h').status, 'mergeada');
  });
});
