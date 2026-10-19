import path from 'node:path';
import type { Io } from '../core/apply.js';
import { isInside, toPosix } from '../core/paths.js';
import type { Plan } from '../core/plan.js';
import { ALL_MODES, ToolkitError, type Mode, type Target } from '../core/types.js';

export interface CommandOptions {
  project?: string;
  source?: string;
  target?: string;
  mode?: string;
  dryRun?: boolean;
  /** init: em pasta nova, cria só a main (sem a develop). */
  noDevelop?: boolean;
  json?: boolean;
  /** doctor: executa sondas locais das ferramentas (sem chamar modelos). */
  probe?: boolean;
  /** review: escopo (front, back; vazio = os dois), ferramenta e varredura do projeto inteiro. */
  scope?: string;
  tool?: string;
  full?: boolean;
  /** Somente testes: substitui a execução de comandos npm (install). */
  npmRunner?: (command: string, timeoutMs: number) => Promise<import('./selfinstall.js').NpmRun>;
  /** Somente testes: substitui a execução do comando de revisão. */
  runner?: (command: string, cwd: string) => Promise<import('../core/tools.js').ReviewRun>;
  /** Somente testes: substitui operações de disco. */
  io?: Io;
}

export interface CommandResult {
  exitCode: number;
  report: Record<string, unknown>;
  lines: string[];
}

export const EXIT_OK = 0;
export const EXIT_ERROR = 1;
export const EXIT_CONFLICT = 2;
/** review: a revisão terminou e encontrou violações. */
export const EXIT_VIOLATIONS = 3;

export function parseTargets(value: string | undefined): Target[] | undefined {
  if (value === undefined) return undefined;
  if (value === 'both') return ['claude', 'codex'];
  if (value === 'claude' || value === 'codex') return [value];
  throw new ToolkitError(`--target inválido: ${value} (use claude, codex ou both)`);
}

export function parseMode(value: string | undefined): Mode | undefined {
  if (value === undefined) return undefined;
  if ((ALL_MODES as readonly string[]).includes(value)) return value as Mode;
  throw new ToolkitError(`--mode inválido: ${value} (use shared ou native)`);
}

/** Caminho relativo portável da fonte local, apenas se estiver dentro do projeto. */
export function sourceRelPath(projectRoot: string, sourceDir: string): string | undefined {
  if (!isInside(projectRoot, sourceDir) || sourceDir === projectRoot) return undefined;
  return toPosix(path.relative(projectRoot, sourceDir));
}

const FILE_LABELS: Record<string, string> = {
  create: 'criar',
  update: 'atualizar',
  unchanged: 'sem mudança',
  adopt: 'adotar',
  delete: 'remover',
  forget: 'esquecer',
  'create-file': 'criar arquivo',
  insert: 'inserir bloco',
  remove: 'remover bloco',
  'delete-file': 'remover arquivo',
};

export function planOperations(plan: Plan) {
  return [
    ...plan.fileOps.map((o) => ({ path: o.path, type: 'file', action: o.action, reason: o.reason })),
    ...plan.blockOps.map((o) => ({ path: o.file, type: 'block', action: o.action, reason: o.reason })),
    {
      path: '.ai/toolkit-lock.json',
      type: 'lock',
      action:
        plan.lockOp.action === 'write'
          ? plan.lockOp.expectedHash === null
            ? 'create'
            : 'update'
          : plan.lockOp.action === 'delete'
            ? 'delete'
            : 'unchanged',
      reason: 'registro da instalação',
    },
  ];
}

export function planSummary(plan: Plan): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const op of planOperations(plan)) summary[op.action] = (summary[op.action] ?? 0) + 1;
  return summary;
}

export function renderPlan(plan: Plan): string[] {
  const lines: string[] = [];
  const ops = planOperations(plan);
  const changing = ops.filter((o) => o.action !== 'unchanged');
  // Os modelos de boilerplate têm centenas de arquivos: uma linha por modelo e ação.
  const grouped = new Map<string, { label: string; dir: string; n: number }>();
  for (const o of changing) {
    const label = o.type === 'block' && o.action === 'update' ? 'atualizar bloco' : FILE_LABELS[o.action] ?? o.action;
    const model = /^(\.ai\/boilerplates\/[^/]+)\//.exec(o.path);
    if (model) {
      const key = `${label}|${model[1]}`;
      const g = grouped.get(key) ?? { label, dir: model[1]!, n: 0 };
      g.n += 1;
      grouped.set(key, g);
      continue;
    }
    lines.push(`  ${label.padEnd(16)} ${o.path}`);
  }
  for (const g of grouped.values()) lines.push(`  ${g.label.padEnd(16)} ${g.dir}/ (${g.n} arquivo(s))`);
  const unchanged = ops.length - changing.length;
  if (unchanged > 0) lines.push(`  ${'sem mudança'.padEnd(16)} ${unchanged} item(ns)`);
  if (plan.warnings.length > 0) {
    lines.push('', 'Avisos:');
    for (const w of plan.warnings) lines.push(`  - ${w}`);
  }
  if (plan.conflicts.length > 0) {
    lines.push('', `Conflitos (${plan.conflicts.length}):`);
    for (const c of plan.conflicts) lines.push(`  ! ${c.path}: ${c.reason}`);
  }
  return lines;
}

export function conflictHelp(): string[] {
  return [
    '',
    'Operação abortada: nada foi alterado.',
    'Para resolver: mova suas personalizações para .ai/local/, restaure o arquivo original',
    '(o backup da última operação fica em .ai/backups/<operação>/) ou renomeie o arquivo conflitante.',
    'O toolkit não sobrescreve customizações, nem com --yes.',
  ];
}
