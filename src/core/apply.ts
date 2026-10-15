import { randomBytes } from 'node:crypto';
import * as fsp from 'node:fs/promises';
import path from 'node:path';
import { sha256 } from './hash.js';
import { LOCK_PATH } from './lock.js';
import { resolveInProject } from './paths.js';
import type { Plan } from './plan.js';
import { ToolkitError } from './types.js';

export const BACKUP_ROOT = '.ai/backups';

/** Operações de disco usadas na aplicação; injetáveis para testar falhas de escrita. */
export interface Io {
  readFile(p: string): Promise<Buffer>;
  writeFile(p: string, data: string | Buffer): Promise<void>;
  rename(from: string, to: string): Promise<void>;
  rm(p: string): Promise<void>;
  mkdir(p: string): Promise<void>;
  rmdirIfEmpty(p: string): Promise<boolean>;
  exists(p: string): Promise<boolean>;
}

export const nodeIo: Io = {
  readFile: (p) => fsp.readFile(p),
  writeFile: (p, d) => fsp.writeFile(p, d),
  rename: (a, b) => fsp.rename(a, b),
  rm: (p) => fsp.rm(p, { force: true }),
  mkdir: async (p) => {
    await fsp.mkdir(p, { recursive: true });
  },
  rmdirIfEmpty: async (p) => {
    try {
      if ((await fsp.readdir(p)).length > 0) return false;
      await fsp.rmdir(p);
      return true;
    } catch {
      return false;
    }
  },
  exists: async (p) => {
    try {
      await fsp.lstat(p);
      return true;
    } catch {
      return false;
    }
  },
};

export function newOperationId(now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z');
  return `${stamp}-${randomBytes(3).toString('hex')}`;
}

interface Step {
  rel: string;
  kind: 'write' | 'delete';
  content?: string;
  expectedHash: string | null;
}

export interface ApplyResult {
  operationId: string;
  backupDir: string | null;
  written: string[];
  deleted: string[];
  prunedDirs: string[];
}

export class ApplyError extends ToolkitError {
  constructor(
    message: string,
    readonly rollback: { complete: boolean; errors: string[]; restored: string[] },
    readonly backupDir: string | null,
  ) {
    super(message, rollback.errors);
    this.name = 'ApplyError';
  }
}

function stepsOf(plan: Plan): Step[] {
  const steps: Step[] = [];
  for (const op of plan.fileOps) {
    if (op.action === 'create' || op.action === 'update') {
      steps.push({ rel: op.path, kind: 'write', content: op.content!, expectedHash: op.expectedHash });
    } else if (op.action === 'delete') {
      steps.push({ rel: op.path, kind: 'delete', expectedHash: op.expectedHash });
    }
  }
  for (const op of plan.blockOps) {
    if (op.action === 'delete-file') steps.push({ rel: op.file, kind: 'delete', expectedHash: op.expectedHash });
    else if (op.newText !== undefined && op.action !== 'unchanged' && op.action !== 'forget') {
      steps.push({ rel: op.file, kind: 'write', content: op.newText, expectedHash: op.expectedHash });
    }
  }
  // O lock é sempre o último passo: se algo falhar antes, o lock antigo continua válido.
  if (plan.lockOp.action === 'write') {
    steps.push({ rel: LOCK_PATH, kind: 'write', content: plan.lockOp.content!, expectedHash: plan.lockOp.expectedHash });
  } else if (plan.lockOp.action === 'delete') {
    steps.push({ rel: LOCK_PATH, kind: 'delete', expectedHash: plan.lockOp.expectedHash });
  }
  return steps;
}

async function currentHash(io: Io, abs: string): Promise<string | null> {
  if (!(await io.exists(abs))) return null;
  return sha256((await io.readFile(abs)).toString('utf8'));
}

async function writeSafely(io: Io, abs: string, content: string, opId: string): Promise<void> {
  await io.mkdir(path.dirname(abs));
  const tmp = `${abs}.seedgrid-tmp-${opId}`;
  try {
    await io.writeFile(tmp, content);
    await io.rename(tmp, abs); // substituição por renomeação: atômica por arquivo onde o sistema suporta
  } catch (err) {
    await io.rm(tmp).catch(() => undefined);
    throw err;
  }
}

/**
 * Aplica um plano sem conflitos. Faz backup do que será alterado, escreve via
 * arquivo temporário + renomeação e tenta desfazer tudo se algum passo falhar.
 * Não há atomicidade global entre vários arquivos.
 */
export async function applyPlan(plan: Plan, operationId: string, io: Io = nodeIo): Promise<ApplyResult> {
  if (plan.conflicts.length > 0) throw new ToolkitError('O plano tem conflitos; nada foi alterado.');
  const root = plan.projectRoot;
  const steps = stepsOf(plan);
  const result: ApplyResult = { operationId, backupDir: null, written: [], deleted: [], prunedDirs: [] };
  if (steps.length === 0) return result;

  // 1. Revalida: o disco não pode ter mudado entre o planejamento e a escrita.
  for (const s of steps) {
    const h = await currentHash(io, resolveInProject(root, s.rel));
    if (h !== s.expectedHash) {
      throw new ToolkitError(`${s.rel} mudou depois do planejamento; nada foi alterado. Execute o comando novamente.`);
    }
  }

  // 2. Backup dos arquivos existentes que serão modificados ou apagados.
  const existing = steps.filter((s) => s.expectedHash !== null);
  const backupRel = `${BACKUP_ROOT}/${operationId}`;
  const backupAbs = resolveInProject(root, backupRel);
  if (existing.length > 0) {
    const ignoreFile = resolveInProject(root, `${BACKUP_ROOT}/.gitignore`);
    await io.mkdir(backupAbs);
    if (!(await io.exists(ignoreFile))) await io.writeFile(ignoreFile, '# Backups locais do seedgrid-ai\n*\n');
    for (const s of existing) {
      const dest = path.join(backupAbs, ...s.rel.split('/'));
      await io.mkdir(path.dirname(dest));
      await io.writeFile(dest, await io.readFile(resolveInProject(root, s.rel)));
    }
    await io.writeFile(
      path.join(backupAbs, 'operation.json'),
      `${JSON.stringify({ operationId, kind: plan.kind, files: existing.map((s) => s.rel) }, null, 2)}\n`,
    );
    result.backupDir = backupRel;
  }

  // 3. Executa, registrando como desfazer cada passo.
  const undo: { rel: string; hadFile: boolean }[] = [];
  try {
    for (const s of steps) {
      const abs = resolveInProject(root, s.rel);
      undo.push({ rel: s.rel, hadFile: s.expectedHash !== null });
      if (s.kind === 'write') {
        await writeSafely(io, abs, s.content!, operationId);
        result.written.push(s.rel);
      } else {
        await io.rm(abs);
        result.deleted.push(s.rel);
      }
    }
  } catch (err) {
    const rollback = { complete: true, errors: [] as string[], restored: [] as string[] };
    for (const u of undo.reverse()) {
      const abs = resolveInProject(root, u.rel);
      try {
        if (u.hadFile) {
          const data = await io.readFile(path.join(backupAbs, ...u.rel.split('/')));
          await writeSafely(io, abs, data.toString('utf8'), `${operationId}-rb`);
        } else {
          await io.rm(abs);
        }
        result.written = result.written.filter((w) => w !== u.rel);
        rollback.restored.push(u.rel);
      } catch (rbErr) {
        rollback.complete = false;
        rollback.errors.push(`${u.rel}: ${(rbErr as Error).message}`);
      }
    }
    throw new ApplyError(
      `Falha ao escrever: ${(err as Error).message}. ${
        rollback.complete ? 'Rollback concluído.' : 'Rollback INCOMPLETO; restaure manualmente a partir do backup.'
      }`,
      rollback,
      result.backupDir,
    );
  }

  // 4. Remove pastas que ficaram vazias, sem subir até a raiz do projeto.
  for (const rel of result.deleted) {
    let dir = path.posix.dirname(rel);
    while (dir !== '.' && dir !== BACKUP_ROOT && dir !== '.ai/backups') {
      if (!(await io.rmdirIfEmpty(resolveInProject(root, dir)))) break;
      result.prunedDirs.push(dir);
      dir = path.posix.dirname(dir);
    }
  }
  return result;
}
