import { loadContent } from '../core/content.js';
import { bundledContentDir, cliVersion, resolveProject } from '../core/env.js';
import { inspectInstallation } from '../core/inspect.js';
import { readLock } from '../core/lock.js';
import { EXIT_ERROR, EXIT_OK, type CommandOptions, type CommandResult } from './common.js';

/** Resumo da instalação: versões, opções e divergências em relação ao lock. Somente leitura. */
export async function statusCommand(opts: CommandOptions): Promise<CommandResult> {
  const projectRoot = resolveProject(opts.project);
  const lockState = await readLock(projectRoot);
  let bundledVersion: string | null = null;
  try {
    bundledVersion = (await loadContent(bundledContentDir())).contentVersion;
  } catch {
    bundledVersion = null;
  }
  const base = { command: 'status', project: projectRoot, cliVersion: cliVersion(), bundledContentVersion: bundledVersion };

  if (lockState.status === 'absent') {
    return {
      exitCode: EXIT_OK,
      report: { ...base, installed: false },
      lines: [`SeedGrid AI Toolkit não instalado em ${projectRoot}.`, 'Instale com: seedgrid-ai init --target both --mode shared'],
    };
  }
  if (lockState.status === 'invalid') {
    return {
      exitCode: EXIT_ERROR,
      report: { ...base, installed: true, lockValid: false, lockErrors: lockState.errors },
      lines: ['O lock .ai/toolkit-lock.json é inválido:', ...lockState.errors.map((e) => `  - ${e}`)],
    };
  }
  const lock = lockState.lock;
  const insp = await inspectInstallation(projectRoot, lock);
  const count = (s: string) => insp.files.filter((f) => f.state === s).length;
  const divergent = [...insp.files.filter((f) => f.state !== 'ok'), ...insp.blocks.filter((b) => b.state !== 'ok')];
  const updateAvailable = bundledVersion !== null && bundledVersion !== lock.contentVersion;

  const lines = [
    `SeedGrid AI Toolkit em ${projectRoot}`,
    `  conteúdo instalado: ${lock.contentVersion} (CLI ${lock.cliVersion}, fonte ${lock.source.type}${lock.source.path ? `: ${lock.source.path}` : ''})`,
    `  targets: ${lock.targets.join(', ')} | modo: ${lock.mode}`,
    `  última operação: ${lock.lastOperation.kind} ${lock.lastOperation.id}`,
    `  arquivos gerenciados: ${insp.files.length} (ok ${count('ok')}, modificados ${count('modificado')}, ausentes ${count('ausente')}, inseguros ${count('inseguro')})`,
    `  blocos: ${insp.blocks.map((b) => `${b.file} ${b.state}`).join(', ')}`,
  ];
  if (divergent.length > 0) {
    lines.push('', 'Divergências:');
    for (const f of insp.files.filter((x) => x.state !== 'ok')) lines.push(`  ${f.state.padEnd(10)} ${f.path}${f.detail ? ` (${f.detail})` : ''}`);
    for (const b of insp.blocks.filter((x) => x.state !== 'ok')) lines.push(`  bloco ${b.state.padEnd(10)} ${b.file}`);
  }
  if (updateAvailable) {
    lines.push('', `Conteúdo ${bundledVersion} disponível no CLI ${cliVersion()}. Simule com: seedgrid-ai update --dry-run`);
  }
  return {
    exitCode: EXIT_OK,
    report: {
      ...base,
      installed: true,
      lockValid: true,
      contentVersion: lock.contentVersion,
      installedWithCli: lock.cliVersion,
      targets: lock.targets,
      mode: lock.mode,
      source: lock.source,
      lastOperation: lock.lastOperation,
      updateAvailable,
      files: insp.files,
      blocks: insp.blocks,
    },
    lines,
  };
}
