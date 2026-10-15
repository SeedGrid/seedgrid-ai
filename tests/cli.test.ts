import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { cleanupAll, snapshot, tempProject } from './helpers.js';

after(cleanupAll);

const CLI = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'src', 'cli.js');

function run(args: string[], extraEnv: Record<string, string> = {}) {
  const r = spawnSync(process.execPath, [CLI, ...args], {
    encoding: 'utf8',
    env: { ...process.env, SEEDGRID_AI_SKIP_TOOL_DETECTION: '1', SEEDGRID_AI_NO_UPDATE_CHECK: '1', ...extraEnv },
  });
  return { code: r.status, out: r.stdout, err: r.stderr };
}

test('--json produz plano consumível por scripts e dry-run não escreve', async () => {
  const project = await tempProject();
  const r = run(['init', '--target', 'both', '--mode', 'shared', '--dry-run', '--json', '--project', project]);
  assert.equal(r.code, 0, r.err);
  const report = JSON.parse(r.out);
  assert.equal(report.command, 'init');
  assert.equal(report.dryRun, true);
  assert.ok(report.operations.some((o: { path: string }) => o.path === '.claude/skills/revisar-codigo/SKILL.md'));
  assert.deepEqual(await snapshot(project), {});
});

test('instala, mostra status e remove pela linha de comando', async () => {
  const project = await tempProject();
  assert.equal(run(['init', '--project', project]).code, 0);
  const st = JSON.parse(run(['status', '--json', '--project', project]).out);
  assert.equal(st.installed, true);
  assert.equal(run(['remove', '--project', project]).code, 0);
});

test('argumentos inválidos retornam erro', () => {
  assert.equal(run(['init', '--target', 'vscode', '--dry-run']).code, 1);
  assert.equal(run(['status', '--mode', 'native']).code, 1);
  assert.equal(run(['desconhecido']).code, 1);
  assert.equal(run(['init', '--opcao-inexistente']).code, 1);
  assert.match(run(['--version']).out, /^\d+\.\d+\.\d+/);
});

test('versão mais nova no npm: fora do terminal só avisa, sem perguntar nem delegar', async () => {
  const project = await tempProject();
  const newer = { SEEDGRID_AI_TEST_LATEST: '99.0.0' };
  assert.equal(run(['init', '--project', project]).code, 0);

  const st = run(['status', '--project', project], newer);
  assert.equal(st.code, 0, st.err);
  assert.match(st.out, /versão 99\.0\.0 disponível/);
  assert.match(st.out, /npx @seedgrid\/ai-toolkit@99\.0\.0 update --project/);

  const json = JSON.parse(run(['status', '--json', '--project', project], newer).out);
  assert.deepEqual(json.npm, { latest: '99.0.0', newer: true });

  // update segue com o conteúdo deste CLI e avisa em stderr.
  const up = run(['update', '--project', project], newer);
  assert.equal(up.code, 0, up.err);
  assert.match(up.err, /versão 99\.0\.0 disponível/);
  assert.match(up.out, /Nada a fazer/);

  // Versão igual ou mais antiga: nenhum aviso. --no-update-check também silencia.
  assert.doesNotMatch(run(['status', '--project', project], { SEEDGRID_AI_TEST_LATEST: '0.0.1' }).out, /disponível no npm/);
  assert.doesNotMatch(run(['update', '--project', project, '--no-update-check'], newer).err, /disponível/);
});

test('update sem instalação orienta usar init', async () => {
  const project = await tempProject();
  const r = run(['update', '--project', project]);
  assert.equal(r.code, 1);
  assert.match(r.err, /seedgrid-ai init/);
});

test('review: escopo posicional, opções próprias e erros de uso', () => {
  assert.equal(run(['review', 'front', 'back']).code, 1, 'só um escopo');
  assert.equal(run(['review', '--tool', 'claude', '--probe']).code, 1, 'opção de outro comando');
  assert.equal(run(['doctor', '--full']).code, 1, '--full é só do review');
  assert.equal(run(['status', 'front']).code, 1, 'escopo só no review');
  const project = path.join(path.dirname(CLI), 'inexistente-review');
  assert.equal(run(['review', 'mobile', '--project', project]).code, 1);
});

test('sem argumentos, help e --help listam todos os comandos', () => {
  for (const args of [[], ['help'], ['--help'], ['-h']]) {
    const r = run(args);
    assert.equal(r.code, 0, args.join(' '));
    for (const c of ['install', 'init', 'update', 'status', 'doctor', 'remove', 'validate', 'review']) {
      assert.match(r.out, new RegExp(`^  ${c}\\s+\\S`, 'm'), `${c} descrito na ajuda (${args.join(' ') || 'sem argumentos'})`);
    }
  }
});
