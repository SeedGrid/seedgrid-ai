import path from 'node:path';
import { ADAPTERS, buildDesiredState } from '../adapters/index.js';
import { ApplyError, applyPlan, newOperationId } from '../core/apply.js';
import { loadContent } from '../core/content.js';
import { setupProductRepo } from '../core/git.js';
import { bundledContentDir, cliVersion, resolveProject } from '../core/env.js';
import { readLock, type LockSource } from '../core/lock.js';
import { planInstall } from '../core/plan.js';
import { detectTool } from '../core/tools.js';
import { ToolkitError } from '../core/types.js';
import {
  conflictHelp,
  EXIT_CONFLICT,
  EXIT_ERROR,
  EXIT_OK,
  parseMode,
  parseTargets,
  planOperations,
  planSummary,
  renderPlan,
  sourceRelPath,
  type CommandOptions,
  type CommandResult,
} from './common.js';

/** Fluxo comum de init e update: carregar conteúdo, planejar, checar conflitos e aplicar. */
export async function runInstall(kind: 'init' | 'update', opts: CommandOptions): Promise<CommandResult> {
  const projectRoot = resolveProject(opts.project);
  const lockState = await readLock(projectRoot);
  if (kind === 'update' && lockState.status === 'absent') {
    throw new ToolkitError('Nenhuma instalação encontrada neste projeto. Use "seedgrid-ai init".');
  }
  const prev = lockState.status === 'ok' ? lockState.lock : null;
  const targets = parseTargets(opts.target) ?? prev?.targets ?? ['claude', 'codex'];
  const mode = parseMode(opts.mode) ?? prev?.mode ?? 'shared';

  const sourceDir = opts.source ? path.resolve(opts.source) : bundledContentDir();
  const bundle = await loadContent(sourceDir);
  const source: LockSource = opts.source
    ? { type: 'local', ...(sourceRelPath(projectRoot, sourceDir) ? { path: sourceRelPath(projectRoot, sourceDir) } : {}) }
    : { type: 'bundled' };

  const operationId = newOperationId();
  const plan = await planInstall(projectRoot, buildDesiredState(bundle, targets, mode), lockState, {
    kind,
    cliVersion: cliVersion(),
    contentVersion: bundle.contentVersion,
    contentSchemaVersion: bundle.schemaVersion,
    targets,
    mode,
    source,
    operationId,
    now: new Date().toISOString(),
  });

  if (kind === 'update' && prev?.source.type === 'local' && !opts.source) {
    plan.warnings.push('A instalação anterior usou uma fonte local; este update usa o conteúdo empacotado no CLI.');
  }
  if (mode === 'native') {
    for (const t of targets) {
      const info = await detectTool(ADAPTERS[t]);
      if (!info.installed) {
        plan.warnings.push(`${info.displayName} não encontrado: arquivos native gerados, mas a descoberta real não foi testada.`);
      } else if (!info.validated) {
        plan.warnings.push(
          `${info.displayName} ${info.version ?? '?'} não está entre as versões validadas (${info.validatedVersions.join(', ')}); confirme a descoberta dos agentes.`,
        );
      }
    }
  }

  const report: Record<string, unknown> = {
    command: kind,
    dryRun: Boolean(opts.dryRun),
    project: projectRoot,
    targets,
    mode,
    contentVersion: bundle.contentVersion,
    source,
    summary: planSummary(plan),
    operations: planOperations(plan),
    conflicts: plan.conflicts,
    warnings: plan.warnings,
  };
  const header = `${kind} (${opts.dryRun ? 'simulação' : 'execução'}) em ${projectRoot}`;
  const lines = [header, `targets: ${targets.join(', ')} | modo: ${mode} | conteúdo: ${bundle.contentVersion}`, '', ...renderPlan(plan)];

  if (plan.conflicts.length > 0) {
    return { exitCode: EXIT_CONFLICT, report: { ...report, applied: false }, lines: [...lines, ...conflictHelp()] };
  }
  if (opts.dryRun) {
    return { exitCode: EXIT_OK, report: { ...report, applied: false }, lines: [...lines, '', 'Simulação: nenhum arquivo foi escrito.'] };
  }
  if (plan.changes === 0) {
    return { exitCode: EXIT_OK, report: { ...report, applied: false }, lines: [...lines, '', 'Nada a fazer: a instalação já está atualizada.'] };
  }
  try {
    const result = await applyPlan(plan, operationId, opts.io);
    const repo =
      kind === 'init'
        ? await setupProductRepo(
            projectRoot,
            planOperations(plan).filter((o) => o.action !== 'unchanged' && o.action !== 'delete').map((o) => o.path),
          )
        : null;
    return {
      exitCode: EXIT_OK,
      report: { ...report, applied: true, operationId, result, ...(repo ? { git: repo } : {}) },
      lines: [
        ...lines,
        '',
        `Concluído (operação ${operationId}).`,
        ...(repo?.status === 'created' ? ['Repositório git criado: branches main e develop (atual: develop). A branch de trabalho sai da develop.'] : []),
        ...(repo?.status === 'failed' ? [`Aviso: ${repo.reason}. A instalação foi concluída; crie as branches main e develop manualmente.`] : []),
        ...(result.backupDir ? [`Backup dos arquivos alterados: ${result.backupDir}/`] : []),
        'Abra uma nova sessão do Claude Code ou do Codex para carregar as mudanças.',
        'Verifique com: seedgrid-ai doctor',
      ],
    };
  } catch (err) {
    if (err instanceof ApplyError) {
      return {
        exitCode: EXIT_ERROR,
        report: { ...report, applied: false, error: err.message, rollback: err.rollback, backupDir: err.backupDir },
        lines: [
          ...lines,
          '',
          `ERRO: ${err.message}`,
          ...err.rollback.errors.map((e) => `  rollback falhou: ${e}`),
          ...(err.backupDir ? [`Backup: ${err.backupDir}/ (veja docs/instalacao.md, "Recuperação")`] : []),
        ],
      };
    }
    throw err;
  }
}
