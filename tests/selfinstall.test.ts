import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EXIT_ERROR, EXIT_OK } from '../src/commands/common.js';
import { selfInstallCommand, type NpmRun } from '../src/commands/selfinstall.js';
import { cliVersion } from '../src/core/env.js';

function fakeNpm(results: Record<string, NpmRun>) {
  const calls: string[] = [];
  return {
    calls,
    npmRunner: async (command: string) => {
      calls.push(command);
      return results[command.split(' ')[0] === 'npm' ? 'install' : 'check']!;
    },
  };
}

test('install: --dry-run mostra o comando e não executa nada', async () => {
  const f = fakeNpm({});
  const res = await selfInstallCommand({ dryRun: true, npmRunner: f.npmRunner });
  assert.equal(res.exitCode, EXIT_OK);
  assert.deepEqual(f.calls, []);
  assert.match(res.lines[0]!, new RegExp(`^Executaria: npm install -g @seedgrid/ai-toolkit@${cliVersion().replace(/\./g, '\.')}$`));
});

test('install: instala na versão do CLI e confere o comando no PATH', async () => {
  const f = fakeNpm({
    install: { code: 0, stdout: 'added 1 package', stderr: '' },
    check: { code: 0, stdout: `${cliVersion()}\n`, stderr: '' },
  });
  const res = await selfInstallCommand({ npmRunner: f.npmRunner });
  assert.equal(res.exitCode, EXIT_OK);
  assert.deepEqual(f.calls, [`npm install -g @seedgrid/ai-toolkit@${cliVersion()}`, 'seedgrid-ai --version']);
  assert.equal(res.report.onPath, true);
  assert.match(res.lines.join('\n'), /seedgrid-ai init/);
});

test('install: comando fora do PATH não é erro, mas orienta', async () => {
  const f = fakeNpm({
    install: { code: 0, stdout: '', stderr: '' },
    check: { code: 1, stdout: '', stderr: 'não reconhecido' },
  });
  const res = await selfInstallCommand({ npmRunner: f.npmRunner });
  assert.equal(res.exitCode, EXIT_OK);
  assert.equal(res.report.onPath, false);
  assert.match(res.lines.join('\n'), /novo terminal|PATH/);
});

test('install: falha do npm sai com erro e sugere o npx', async () => {
  const f = fakeNpm({ install: { code: 243, stdout: '', stderr: 'EACCES: permission denied' }, check: { code: 0, stdout: '', stderr: '' } });
  const res = await selfInstallCommand({ npmRunner: f.npmRunner });
  assert.equal(res.exitCode, EXIT_ERROR);
  assert.deepEqual(f.calls.length, 1, 'não confere o PATH quando a instalação falhou');
  assert.match(res.lines.join('\n'), /EACCES/);
  assert.match(res.lines.join('\n'), /npx @seedgrid\/ai-toolkit/);
});
