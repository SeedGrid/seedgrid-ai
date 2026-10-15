import assert from 'node:assert/strict';
import { rm } from 'node:fs/promises';
import path from 'node:path';
import { after, describe, test } from 'node:test';
import { EXIT_ERROR, EXIT_OK, EXIT_VIOLATIONS } from '../src/commands/common.js';
import { initCommand } from '../src/commands/init.js';
import { parseReviewSummary, reviewCommand, reviewPrompt } from '../src/commands/review.js';
import type { ReviewRun } from '../src/core/tools.js';
import { ToolkitError } from '../src/core/types.js';
import { cleanupAll, tempProject } from './helpers.js';

after(cleanupAll);

const block = (json: string) => `Relatório...\n\n\`\`\`seedgrid-review-json\n${json}\n\`\`\`\n`;
const ok = (stdout: string): ReviewRun => ({ code: 0, stdout, stderr: '', timedOut: false });

function fakeRunner(result: ReviewRun) {
  const calls: { command: string; cwd: string }[] = [];
  return {
    calls,
    runner: async (command: string, cwd: string) => {
      calls.push({ command, cwd });
      return result;
    },
  };
}

describe('review: bloco de resultado', () => {
  test('lê o último bloco válido e rejeita inconsistências', () => {
    assert.deepEqual(parseReviewSummary(block('{"scope":"front","violations":2,"blocking":1,"notVerified":3}')), {
      scope: 'front',
      violations: 2,
      blocking: 1,
      notVerified: 3,
    });
    const two = `${block('{"violations":9,"blocking":0}')}\n${block('{"violations":1,"blocking":0}')}`;
    assert.equal(parseReviewSummary(two)?.violations, 1, 'vale o último bloco');
    assert.equal(parseReviewSummary('sem bloco'), null);
    assert.equal(parseReviewSummary(block('{não é json}')), null);
    assert.equal(parseReviewSummary(block('{"violations":1,"blocking":2}')), null, 'bloqueantes não passam do total');
    assert.equal(parseReviewSummary(block('{"violations":"1","blocking":0}')), null);
    assert.equal(parseReviewSummary(block('{"violations":-1,"blocking":0}')), null);
  });

  test('o prompt não contém aspas nem metacaracteres de shell', () => {
    for (const scope of ['front', 'back', 'both'] as const) {
      for (const full of [false, true]) assert.doesNotMatch(reviewPrompt(scope, full), /["'`$&|;<>\\]/);
    }
  });
});

describe('review: comando', () => {
  test('sem instalação ou com escopo/ferramenta inválidos, falha com orientação', async () => {
    const project = await tempProject();
    await assert.rejects(reviewCommand({ project, runner: fakeRunner(ok('')).runner }), (e: unknown) => {
      assert.ok(e instanceof ToolkitError);
      assert.match(e.details.join(' '), /seedgrid-ai init/);
      return true;
    });
    await initCommand({ project, target: 'both' });
    await assert.rejects(reviewCommand({ project, scope: 'mobile', runner: fakeRunner(ok('')).runner }), /Escopo inválido/);
    await assert.rejects(reviewCommand({ project, tool: 'gemini', runner: fakeRunner(ok('')).runner }), /--tool inválido/);
  });

  test('escolhe o Claude Code por padrão, em modo somente leitura, e devolve código 3 com violações', async () => {
    const project = await tempProject();
    await initCommand({ project, target: 'both' });
    const f = fakeRunner(ok(block('{"scope":"front","violations":2,"blocking":1,"notVerified":0}')));
    const res = await reviewCommand({ project, scope: 'front', runner: f.runner });
    assert.equal(res.exitCode, EXIT_VIOLATIONS);
    assert.equal(res.report.tool, 'claude');
    assert.equal(res.report.violations, 2);
    assert.equal(f.calls.length, 1);
    assert.equal(f.calls[0]!.cwd, project);
    assert.match(f.calls[0]!.command, /^claude -p "Use a skill sg-review .*escopo front/);
    assert.match(f.calls[0]!.command, /--allowedTools "Read,Grep,Glob,Bash\(git diff:\*\)/);
    assert.doesNotMatch(f.calls[0]!.command, /Edit|Write/, 'a revisão não recebe ferramentas de escrita');
    assert.match(res.lines.join('\n'), /2 violação\(ões\), 1 bloqueante/);
  });

  test('--tool codex usa o sandbox somente leitura; --full pede o projeto inteiro; sem violações sai 0', async () => {
    const project = await tempProject();
    await initCommand({ project, target: 'both' });
    const f = fakeRunner(ok(block('{"scope":"both","violations":0,"blocking":0}')));
    const res = await reviewCommand({ project, tool: 'codex', full: true, runner: f.runner });
    assert.equal(res.exitCode, EXIT_OK);
    assert.equal(res.report.tool, 'codex');
    assert.match(f.calls[0]!.command, /^codex exec --sandbox read-only "Use a skill sg-review .*projeto inteiro.*front e back/);
  });

  test('só o target instalado é considerado; skill ausente orienta o update', async () => {
    const project = await tempProject();
    await initCommand({ project, target: 'codex' });
    const f = fakeRunner(ok(block('{"violations":0,"blocking":0}')));
    assert.equal((await reviewCommand({ project, runner: f.runner })).report.tool, 'codex');
    await assert.rejects(reviewCommand({ project, tool: 'claude', runner: f.runner }), /não está entre os targets instalados/);

    await rm(path.join(project, '.agents', 'skills', 'sg-review'), { recursive: true });
    await assert.rejects(reviewCommand({ project, runner: f.runner }), (e: unknown) => {
      assert.ok(e instanceof ToolkitError);
      assert.match(e.details.join(' '), /skill sg-review não instalada \(rode seedgrid-ai update\)/);
      return true;
    });
  });

  test('falha da ferramenta, tempo esgotado ou resposta sem bloco não viram "sem violações"', async () => {
    const project = await tempProject();
    await initCommand({ project, target: 'claude' });
    const cases: [ReviewRun, RegExp][] = [
      [{ code: 1, stdout: '', stderr: 'não autenticado', timedOut: false }, /terminou com erro \(código 1\)/],
      [{ code: null, stdout: 'parcial', stderr: '', timedOut: true }, /tempo limite/],
      [ok('Revisei tudo e está tudo certo.'), /não trouxe o bloco seedgrid-review-json válido/],
    ];
    for (const [run, pattern] of cases) {
      const res = await reviewCommand({ project, runner: fakeRunner(run).runner });
      assert.equal(res.exitCode, EXIT_ERROR);
      assert.equal(res.report.ok, false);
      assert.match(res.lines.join('\n'), pattern);
    }
  });
});
