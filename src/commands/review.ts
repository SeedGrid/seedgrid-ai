import { stat } from 'node:fs/promises';
import path from 'node:path';
import { ADAPTERS } from '../adapters/index.js';
import { resolveProject } from '../core/env.js';
import { readLock } from '../core/lock.js';
import { detectTool, runReviewCommand, type ReviewRun } from '../core/tools.js';
import { ALL_TARGETS, ToolkitError, type Target } from '../core/types.js';
import { EXIT_ERROR, EXIT_OK, EXIT_VIOLATIONS, type CommandOptions, type CommandResult } from './common.js';

export const REVIEW_SKILL = 'seedgrid-review';
export const REVIEW_SCOPES = ['front', 'back', 'both'] as const;
export type ReviewScope = (typeof REVIEW_SCOPES)[number];

export interface ReviewSummary {
  scope: string;
  violations: number;
  blocking: number;
  notVerified: number;
}

const SCOPE_TEXT: Record<ReviewScope, string> = { front: 'front', back: 'back', both: 'front e back' };

export function parseScope(value: string | undefined): ReviewScope {
  if (value === undefined) return 'both';
  if ((REVIEW_SCOPES as readonly string[]).includes(value)) return value as ReviewScope;
  throw new ToolkitError(`Escopo inválido: ${value} (use front, back ou nenhum para os dois)`);
}

/** Prompt fixo: só enums e texto do toolkit, sem entrada livre do usuário (vai para um comando de shell). */
export function reviewPrompt(scope: ReviewScope, full: boolean): string {
  const target = full ? 'o projeto inteiro' : 'os arquivos alterados (diff)';
  return `Use a skill ${REVIEW_SKILL} para revisar ${target} no escopo ${SCOPE_TEXT[scope]}. Siga a skill e termine com o bloco seedgrid-review-json.`;
}

/** Extrai o último bloco seedgrid-review-json da saída do modelo; null se ausente ou inválido. */
export function parseReviewSummary(output: string): ReviewSummary | null {
  const blocks = [...output.matchAll(/```seedgrid-review-json\s*\n([\s\S]*?)```/g)];
  const last = blocks.at(-1)?.[1];
  if (last === undefined) return null;
  let data: unknown;
  try {
    data = JSON.parse(last);
  } catch {
    return null;
  }
  if (data === null || typeof data !== 'object') return null;
  const d = data as Record<string, unknown>;
  const num = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : null);
  const violations = num(d.violations);
  const blocking = num(d.blocking);
  if (violations === null || blocking === null || blocking > violations) return null;
  return {
    scope: typeof d.scope === 'string' ? d.scope : 'both',
    violations,
    blocking,
    notVerified: num(d.notVerified) ?? 0,
  };
}

async function skillInstalled(projectRoot: string, target: Target): Promise<boolean> {
  const dir = ADAPTERS[target].skillsDir;
  try {
    return (await stat(path.join(projectRoot, ...dir.split('/'), REVIEW_SKILL, 'SKILL.md'))).isFile();
  } catch {
    return false;
  }
}

/**
 * Revisa o código do projeto contra os padrões SeedGrid chamando, em modo somente leitura,
 * a skill seedgrid-review na ferramenta de IA instalada (Claude Code ou Codex).
 * Usa o login do usuário na ferramenta e consome tokens; nenhum outro comando chama o modelo.
 */
export async function reviewCommand(opts: CommandOptions): Promise<CommandResult> {
  const projectRoot = resolveProject(opts.project);
  const scope = parseScope(opts.scope);
  const lockState = await readLock(projectRoot);
  if (lockState.status === 'absent') {
    throw new ToolkitError('O SeedGrid AI Toolkit não está instalado neste projeto.', ['Instale com: seedgrid-ai init']);
  }
  if (lockState.status === 'invalid') {
    throw new ToolkitError('O lock .ai/toolkit-lock.json é inválido.', lockState.errors);
  }

  const wanted = opts.tool;
  if (wanted !== undefined && !(ALL_TARGETS as readonly string[]).includes(wanted)) {
    throw new ToolkitError(`--tool inválido: ${wanted} (use claude ou codex)`);
  }
  const order: Target[] = wanted ? [wanted as Target] : ['claude', 'codex'];
  const candidates = order.filter((t) => lockState.lock.targets.includes(t));
  if (candidates.length === 0) {
    throw new ToolkitError(`A ferramenta pedida não está entre os targets instalados (${lockState.lock.targets.join(', ')}).`);
  }

  let chosen: Target | null = null;
  const skipped: string[] = [];
  for (const t of candidates) {
    if (!(await skillInstalled(projectRoot, t))) {
      skipped.push(`${ADAPTERS[t].displayName}: skill ${REVIEW_SKILL} não instalada (rode seedgrid-ai update)`);
      continue;
    }
    if (!opts.runner && !(await detectTool(ADAPTERS[t])).installed) {
      skipped.push(`${ADAPTERS[t].displayName}: ferramenta não encontrada no PATH`);
      continue;
    }
    chosen = t;
    break;
  }
  if (!chosen) throw new ToolkitError('Nenhuma ferramenta disponível para a revisão.', skipped);

  const adapter = ADAPTERS[chosen];
  const command = adapter.reviewCommand(reviewPrompt(scope, opts.full ?? false));
  const run: ReviewRun = await (opts.runner ?? runReviewCommand)(command, projectRoot);
  const summary = run.timedOut || run.code !== 0 ? null : parseReviewSummary(run.stdout);
  const base = { command: 'review', project: projectRoot, tool: chosen, scope, full: opts.full ?? false };

  if (run.timedOut || run.code !== 0 || !summary) {
    const reason = run.timedOut
      ? 'a ferramenta não terminou no tempo limite'
      : run.code !== 0
        ? `a ferramenta terminou com erro (código ${run.code ?? 'desconhecido'})`
        : 'a resposta não trouxe o bloco seedgrid-review-json válido; o resultado abaixo não pôde ser contado';
    return {
      exitCode: EXIT_ERROR,
      report: { ...base, ok: false, reason, output: run.stdout, stderr: run.stderr },
      lines: [`Revisão não concluída: ${reason}.`, '', run.stdout.trim() || run.stderr.trim() || '(sem saída)'],
    };
  }
  return {
    exitCode: summary.violations > 0 ? EXIT_VIOLATIONS : EXIT_OK,
    report: { ...base, ok: true, ...summary, output: run.stdout },
    lines: [
      run.stdout.trim(),
      '',
      `Revisão por ${adapter.displayName} (${SCOPE_TEXT[scope]}): ${summary.violations} violação(ões), ${summary.blocking} bloqueante(s), ${summary.notVerified} item(ns) não verificado(s).`,
    ],
  };
}
