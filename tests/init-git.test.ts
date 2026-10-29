import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { after, afterEach, beforeEach, describe, test } from 'node:test';
import { EXIT_OK } from '../src/commands/common.js';
import { initCommand } from '../src/commands/init.js';
import { cleanupAll, tempProject } from './helpers.js';

after(cleanupAll);

const git = (cwd: string, ...a: string[]) => execFileSync('git', a, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim();

describe('init: repositório git do produto', () => {
  beforeEach(() => {
    delete process.env.SEEDGRID_AI_SKIP_GIT;
  });
  afterEach(() => {
    process.env.SEEDGRID_AI_SKIP_GIT = '1';
  });

  test('pasta nova ganha main e develop no mesmo commit inicial, com a develop como branch atual', async () => {
    const project = await tempProject();
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_OK, res.lines.join('\n'));
    assert.deepEqual(git(project, 'branch', '--format=%(refname:short)').split(/\r?\n/).sort(), ['develop', 'main']);
    assert.equal(git(project, 'rev-parse', 'main'), git(project, 'rev-parse', 'develop'));
    assert.equal(git(project, 'branch', '--show-current'), 'develop');
    assert.equal(git(project, 'rev-list', '--count', 'main'), '1');
    assert.equal(git(project, 'status', '--porcelain'), '', 'o commit inicial leva tudo o que o init instalou');
    const tracked = git(project, 'ls-files').split(/\r?\n/);
    assert.ok(tracked.includes('AGENTS.md') && tracked.includes('.ai/toolkit-lock.json'));
    assert.ok((res.report as any).git.status === 'created');
    assert.ok(res.lines.some((l) => l.includes('main e develop')));
  });

  test('o pre-commit versionado barra credencial no commit e deixa passar o que está limpo', async () => {
    const project = await tempProject();
    await initCommand({ project });
    assert.equal(git(project, 'config', 'core.hooksPath'), '.githooks');
    assert.ok(git(project, 'ls-files').split(/\r?\n/).includes('.githooks/pre-commit'));
    const ident = ['-c', 'user.name=t', '-c', 'user.email=t@t.t'];
    await writeFile(path.join(project, 'ok.txt'), 'nada de segredo\n');
    git(project, 'add', 'ok.txt');
    git(project, ...ident, 'commit', '-q', '-m', 'limpo');
    await writeFile(path.join(project, 'dev.env'), 'X=1\n');
    git(project, 'add', '-f', 'dev.env');
    assert.throws(() => git(project, ...ident, 'commit', '-q', '-m', 'segredo'), /dev\.env|check-secrets|achado/);
    assert.equal(git(project, 'log', '-1', '--format=%s'), 'limpo');
  });

  test('o commit inicial não leva arquivo que o init não instalou', async () => {
    const project = await tempProject();
    await writeFile(path.join(project, 'notas.txt'), 'meu arquivo\n');
    await initCommand({ project });
    assert.ok(!git(project, 'ls-files').includes('notas.txt'));
    assert.match(git(project, 'status', '--porcelain'), /notas\.txt/);
  });

  test('pasta que já é repositório não tem as branches alteradas', async () => {
    const project = await tempProject();
    git(project, 'init', '-b', 'trunk');
    const res = await initCommand({ project });
    assert.equal(res.exitCode, EXIT_OK);
    assert.equal(git(project, 'branch', '--show-current'), 'trunk');
    assert.equal(git(project, 'branch', '--list', 'develop'), '');
    assert.equal((res.report as any).git.status, 'skipped');
  });

  test('--no-develop (seedgrid-ai-plt) cria só a main', async () => {
    const project = await tempProject();
    const res = await initCommand({ project, noDevelop: true });
    assert.equal(res.exitCode, EXIT_OK);
    assert.equal(git(project, 'branch', '--format=%(refname:short)').trim(), 'main');
    assert.equal(git(project, 'status', '--porcelain'), '');
    assert.ok(res.lines.some((l) => l.includes('Repositório git criado: main') && !l.includes('develop')));
  });

  test('dry-run não cria repositório', async () => {
    const project = await tempProject();
    await initCommand({ project, dryRun: true });
    assert.throws(() => git(project, 'rev-parse', '--git-dir'));
  });
});
