import { ApplyError, applyPlan, newOperationId } from '../core/apply.js';
import { resolveProject } from '../core/env.js';
import { readLock } from '../core/lock.js';
import { planRemove } from '../core/plan.js';
import {
  conflictHelp,
  EXIT_CONFLICT,
  EXIT_ERROR,
  EXIT_OK,
  planOperations,
  planSummary,
  renderPlan,
  type CommandOptions,
  type CommandResult,
} from './common.js';

/**
 * Remove apenas arquivos gerenciados intactos e blocos intactos. Havendo
 * customizações, aborta sem alterar nada. Pastas com conteúdo de terceiros
 * permanecem; .ai/local/ e .ai/backups/ nunca são apagados.
 */
export async function removeCommand(opts: CommandOptions): Promise<CommandResult> {
  const projectRoot = resolveProject(opts.project);
  const plan = await planRemove(projectRoot, await readLock(projectRoot));
  const report: Record<string, unknown> = {
    command: 'remove',
    dryRun: Boolean(opts.dryRun),
    project: projectRoot,
    summary: planSummary(plan),
    operations: planOperations(plan),
    conflicts: plan.conflicts,
    warnings: plan.warnings,
  };
  const lines = [`remove (${opts.dryRun ? 'simulação' : 'execução'}) em ${projectRoot}`, '', ...renderPlan(plan)];
  if (plan.conflicts.length > 0) {
    return { exitCode: EXIT_CONFLICT, report: { ...report, applied: false }, lines: [...lines, ...conflictHelp()] };
  }
  if (opts.dryRun) {
    return { exitCode: EXIT_OK, report: { ...report, applied: false }, lines: [...lines, '', 'Simulação: nenhum arquivo foi removido.'] };
  }
  const operationId = newOperationId();
  try {
    const result = await applyPlan(plan, operationId, opts.io);
    return {
      exitCode: EXIT_OK,
      report: { ...report, applied: true, operationId, result },
      lines: [
        ...lines,
        '',
        `Removido (operação ${operationId}).`,
        ...(result.backupDir ? [`Backup: ${result.backupDir}/ (apague .ai/backups/ quando não precisar mais)`] : []),
      ],
    };
  } catch (err) {
    if (err instanceof ApplyError) {
      return {
        exitCode: EXIT_ERROR,
        report: { ...report, applied: false, error: err.message, rollback: err.rollback },
        lines: [...lines, '', `ERRO: ${err.message}`, ...err.rollback.errors.map((e) => `  rollback falhou: ${e}`)],
      };
    }
    throw err;
  }
}
