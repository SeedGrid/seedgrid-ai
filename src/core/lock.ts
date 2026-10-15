import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { isSha256 } from './hash.js';
import { isSafeRelPath } from './paths.js';
import { ALL_MODES, ALL_TARGETS, BLOCK_FILES, type ManagedBlockFile, type Mode, type Target } from './types.js';

export const LOCK_PATH = '.ai/toolkit-lock.json';
export const LOCK_VERSION = 1;
export const TOOL_NAME = '@seedgrid/ai-toolkit';

/** Prefixos onde o toolkit pode gerenciar arquivos. Qualquer outro caminho no lock é rejeitado. */
export const MANAGED_PREFIXES = ['.ai/', '.claude/skills/', '.claude/agents/', '.agents/skills/', '.codex/agents/'];
/** Áreas de .ai/ que nunca são gerenciadas. */
export const UNMANAGED_AI_PREFIXES = ['.ai/local/', '.ai/backups/'];

export interface LockFileEntry {
  path: string;
  sha256: string;
  component: string;
}

export interface LockBlockEntry {
  file: ManagedBlockFile;
  sha256: string;
  /** true quando o toolkit criou o arquivo; ele pode ser apagado no remove se ficar vazio. */
  createdFile: boolean;
}

export interface LockSource {
  type: 'bundled' | 'local';
  /** Somente para fonte local dentro do projeto: caminho relativo. */
  path?: string;
}

export interface Lock {
  lockVersion: number;
  tool: string;
  cliVersion: string;
  contentVersion: string;
  contentSchemaVersion: number;
  targets: Target[];
  mode: Mode;
  source: LockSource;
  lastOperation: { id: string; kind: string; at: string };
  files: LockFileEntry[];
  blocks: LockBlockEntry[];
}

export type LockState =
  | { status: 'absent' }
  | { status: 'ok'; lock: Lock; raw: string }
  | { status: 'invalid'; errors: string[]; raw: string };

export function isManagedPath(p: string): boolean {
  if (!isSafeRelPath(p) || p === LOCK_PATH) return false;
  if (UNMANAGED_AI_PREFIXES.some((u) => p.startsWith(u))) return false;
  return MANAGED_PREFIXES.some((m) => p.startsWith(m) && p.length > m.length);
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

/** Valida o lock como dado não confiável antes de usá-lo para escrever ou remover. */
export function validateLock(data: unknown): { lock?: Lock; errors: string[] } {
  const errors: string[] = [];
  if (!isRecord(data)) return { errors: ['o lock deve ser um objeto JSON'] };
  if (data.lockVersion !== LOCK_VERSION) errors.push(`lockVersion não suportado: ${String(data.lockVersion)}`);
  if (data.tool !== TOOL_NAME) errors.push(`tool inesperado: ${String(data.tool)}`);
  for (const k of ['cliVersion', 'contentVersion'] as const) {
    if (typeof data[k] !== 'string') errors.push(`${k} ausente`);
  }
  if (typeof data.contentSchemaVersion !== 'number') errors.push('contentSchemaVersion ausente');
  if (
    !Array.isArray(data.targets) ||
    data.targets.length === 0 ||
    !data.targets.every((t) => (ALL_TARGETS as readonly unknown[]).includes(t))
  ) {
    errors.push('targets inválido');
  }
  if (!(ALL_MODES as readonly unknown[]).includes(data.mode)) errors.push('mode inválido');
  const src = data.source;
  if (!isRecord(src) || (src.type !== 'bundled' && src.type !== 'local')) errors.push('source inválido');
  else if (src.path !== undefined && !isSafeRelPath(src.path)) errors.push('source.path deve ser relativo ao projeto');
  if (!isRecord(data.lastOperation)) errors.push('lastOperation ausente');

  const seen = new Set<string>();
  if (!Array.isArray(data.files)) errors.push('files deve ser uma lista');
  else {
    for (const f of data.files) {
      if (!isRecord(f) || typeof f.path !== 'string' || !isManagedPath(f.path)) {
        errors.push(`entrada de arquivo inválida ou fora das áreas gerenciadas: ${JSON.stringify(isRecord(f) ? f.path : f)}`);
        continue;
      }
      if (!isSha256(f.sha256)) errors.push(`hash inválido para ${f.path}`);
      if (typeof f.component !== 'string') errors.push(`component ausente para ${f.path}`);
      const key = f.path.toLowerCase(); // Windows/macOS não diferenciam maiúsculas
      if (seen.has(key)) errors.push(`arquivo repetido no lock: ${f.path}`);
      seen.add(key);
    }
  }
  if (!Array.isArray(data.blocks)) errors.push('blocks deve ser uma lista');
  else {
    const seenBlocks = new Set<string>();
    for (const b of data.blocks) {
      if (!isRecord(b) || !(BLOCK_FILES as readonly unknown[]).includes(b.file)) {
        errors.push(`bloco inválido: ${JSON.stringify(b)}`);
        continue;
      }
      if (!isSha256(b.sha256)) errors.push(`hash inválido para bloco em ${String(b.file)}`);
      if (typeof b.createdFile !== 'boolean') errors.push(`createdFile ausente para ${String(b.file)}`);
      if (seenBlocks.has(b.file as string)) errors.push(`bloco repetido: ${String(b.file)}`);
      seenBlocks.add(b.file as string);
    }
  }
  return errors.length > 0 ? { errors } : { lock: data as unknown as Lock, errors };
}

export async function readLock(projectRoot: string): Promise<LockState> {
  let raw: string;
  try {
    raw = await readFile(path.join(projectRoot, ...LOCK_PATH.split('/')), 'utf8');
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return { status: 'absent' };
    return { status: 'invalid', errors: [`não foi possível ler o lock: ${(err as Error).message}`], raw: '' };
  }
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (err) {
    return { status: 'invalid', errors: [`JSON inválido: ${(err as Error).message}`], raw };
  }
  const { lock, errors } = validateLock(data);
  return lock ? { status: 'ok', lock, raw } : { status: 'invalid', errors, raw };
}

export function serializeLock(lock: Lock): string {
  const sorted: Lock = {
    ...lock,
    targets: [...lock.targets].sort(),
    files: [...lock.files].sort((a, b) => a.path.localeCompare(b.path)),
    blocks: [...lock.blocks].sort((a, b) => a.file.localeCompare(b.file)),
  };
  return `${JSON.stringify(sorted, null, 2)}\n`;
}

/** Igualdade semântica, ignorando a última operação e a versão do CLI. */
export function sameLockContent(a: Lock, b: Lock): boolean {
  const strip = (l: Lock) =>
    serializeLock({ ...l, lastOperation: { id: '', kind: '', at: '' }, cliVersion: '' });
  return strip(a) === strip(b);
}
