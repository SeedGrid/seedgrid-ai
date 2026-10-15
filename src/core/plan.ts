import { lstat, readFile } from 'node:fs/promises';
import { canonicalInner, removeBlock, scanBlock, upsertBlock } from './blocks.js';
import { sha256 } from './hash.js';
import {
  isManagedPath,
  LOCK_PATH,
  LOCK_VERSION,
  sameLockContent,
  serializeLock,
  TOOL_NAME,
  type Lock,
  type LockBlockEntry,
  type LockFileEntry,
  type LockSource,
  type LockState,
} from './lock.js';
import { checkSymlinkSafety, resolveInProject } from './paths.js';
import { ToolkitError, type DesiredState, type ManagedBlockFile, type Mode, type Target } from './types.js';

export type OperationKind = 'init' | 'update' | 'remove';

export type FileAction = 'create' | 'update' | 'unchanged' | 'adopt' | 'delete' | 'forget';
export type BlockAction = 'create-file' | 'insert' | 'update' | 'unchanged' | 'remove' | 'delete-file' | 'forget';

export interface FileOp {
  path: string;
  action: FileAction;
  reason: string;
  /** Conteúdo a escrever (create/update). */
  content?: string;
  /** Hash do arquivo no momento do planejamento; null se ausente. Revalidado antes de escrever. */
  expectedHash: string | null;
}

export interface BlockOp {
  file: ManagedBlockFile;
  action: BlockAction;
  reason: string;
  newText?: string;
  expectedHash: string | null;
}

export interface Conflict {
  path: string;
  reason: string;
}

export interface LockOp {
  action: 'write' | 'unchanged' | 'delete';
  content?: string;
  expectedHash: string | null;
}

export interface Plan {
  kind: OperationKind;
  projectRoot: string;
  fileOps: FileOp[];
  blockOps: BlockOp[];
  lockOp: LockOp;
  conflicts: Conflict[];
  warnings: string[];
  /** Quantidade de escritas/remoções em disco. */
  changes: number;
  lock: Lock | null;
}

export interface InstallMeta {
  kind: 'init' | 'update';
  cliVersion: string;
  contentVersion: string;
  contentSchemaVersion: number;
  targets: Target[];
  mode: Mode;
  source: LockSource;
  operationId: string;
  now: string;
}

interface Current {
  exists: boolean;
  text?: string;
  hash?: string;
  problem?: string;
}

async function readCurrent(projectRoot: string, rel: string): Promise<Current> {
  const symlinkProblem = await checkSymlinkSafety(projectRoot, rel);
  if (symlinkProblem) return { exists: true, problem: symlinkProblem };
  const abs = resolveInProject(projectRoot, rel);
  try {
    const st = await lstat(abs);
    if (!st.isFile()) return { exists: true, problem: `${rel} existe e não é um arquivo regular` };
  } catch {
    return { exists: false };
  }
  const text = await readFile(abs, 'utf8');
  return { exists: true, text, hash: sha256(text) };
}

const WRITE_FILE_ACTIONS: FileAction[] = ['create', 'update', 'delete'];
const WRITE_BLOCK_ACTIONS: BlockAction[] = ['create-file', 'insert', 'update', 'remove', 'delete-file'];

function finish(plan: Omit<Plan, 'changes'>): Plan {
  const changes =
    plan.fileOps.filter((o) => WRITE_FILE_ACTIONS.includes(o.action)).length +
    plan.blockOps.filter((o) => WRITE_BLOCK_ACTIONS.includes(o.action)).length +
    (plan.lockOp.action === 'unchanged' ? 0 : 1);
  return { ...plan, changes };
}

async function planBlockRemoval(
  projectRoot: string,
  entry: LockBlockEntry,
  conflicts: Conflict[],
): Promise<BlockOp | null> {
  const cur = await readCurrent(projectRoot, entry.file);
  if (cur.problem) {
    conflicts.push({ path: entry.file, reason: cur.problem });
    return null;
  }
  if (!cur.exists) return { file: entry.file, action: 'forget', reason: 'arquivo já não existe', expectedHash: null };
  const scan = scanBlock(cur.text!);
  if (scan.status === 'invalid') {
    conflicts.push({ path: entry.file, reason: `bloco gerenciado inválido: ${scan.reason}` });
    return null;
  }
  if (scan.status === 'none') {
    return { file: entry.file, action: 'forget', reason: 'bloco já não existe', expectedHash: cur.hash! };
  }
  if (sha256(scan.inner) !== entry.sha256) {
    conflicts.push({ path: entry.file, reason: 'o bloco gerenciado foi editado localmente' });
    return null;
  }
  const newText = removeBlock(cur.text!);
  if (entry.createdFile && newText.trim() === '') {
    return { file: entry.file, action: 'delete-file', reason: 'arquivo criado pelo toolkit ficou vazio', expectedHash: cur.hash! };
  }
  return { file: entry.file, action: 'remove', reason: 'remove somente o bloco gerenciado', newText, expectedHash: cur.hash! };
}

async function planFileRemoval(projectRoot: string, entry: LockFileEntry, conflicts: Conflict[], why: string): Promise<FileOp | null> {
  const cur = await readCurrent(projectRoot, entry.path);
  if (cur.problem) {
    conflicts.push({ path: entry.path, reason: cur.problem });
    return null;
  }
  if (!cur.exists) return { path: entry.path, action: 'forget', reason: 'arquivo já não existe', expectedHash: null };
  if (cur.hash !== entry.sha256) {
    conflicts.push({ path: entry.path, reason: `${why}, mas foi modificado localmente` });
    return null;
  }
  return { path: entry.path, action: 'delete', reason: why, expectedHash: cur.hash! };
}

/** Planeja init/update. Não escreve nada. */
export async function planInstall(
  projectRoot: string,
  desired: DesiredState,
  lockState: LockState,
  meta: InstallMeta,
): Promise<Plan> {
  const conflicts: Conflict[] = [];
  const warnings: string[] = [];
  const fileOps: FileOp[] = [];
  const blockOps: BlockOp[] = [];

  if (lockState.status === 'invalid') {
    conflicts.push({ path: LOCK_PATH, reason: `lock inválido: ${lockState.errors.join('; ')}` });
  }
  const prevLock = lockState.status === 'ok' ? lockState.lock : null;
  const prevFiles = new Map((prevLock?.files ?? []).map((f) => [f.path, f]));
  const prevBlocks = new Map((prevLock?.blocks ?? []).map((b) => [b.file, b]));

  const seen = new Set<string>();
  for (const d of desired.files) {
    if (!isManagedPath(d.path)) throw new ToolkitError(`Destino fora das áreas gerenciadas: ${d.path}`);
    const key = d.path.toLowerCase();
    if (seen.has(key)) throw new ToolkitError(`Destino duplicado no plano: ${d.path}`);
    seen.add(key);
  }

  const newFiles: LockFileEntry[] = [];
  for (const d of desired.files) {
    const desiredHash = sha256(d.content);
    newFiles.push({ path: d.path, sha256: desiredHash, component: d.component });
    const cur = await readCurrent(projectRoot, d.path);
    if (cur.problem) {
      conflicts.push({ path: d.path, reason: cur.problem });
      continue;
    }
    const prev = prevFiles.get(d.path);
    if (!cur.exists) {
      fileOps.push({ path: d.path, action: 'create', reason: prev ? 'arquivo gerenciado ausente' : 'novo', content: d.content, expectedHash: null });
    } else if (cur.hash === desiredHash) {
      fileOps.push({
        path: d.path,
        action: prev ? 'unchanged' : 'adopt',
        reason: prev ? 'sem mudanças' : 'arquivo existente idêntico passa a ser gerenciado',
        expectedHash: cur.hash,
      });
    } else if (prev && cur.hash === prev.sha256) {
      fileOps.push({ path: d.path, action: 'update', reason: 'nova versão do conteúdo', content: d.content, expectedHash: cur.hash! });
    } else if (prev) {
      conflicts.push({ path: d.path, reason: 'modificado localmente desde a última instalação' });
    } else if (d.component.startsWith('skill:')) {
      // Padronização: a skill do toolkit prevalece sobre uma skill de projeto com o mesmo nome (o original vai para o backup).
      fileOps.push({ path: d.path, action: 'update', reason: 'skill do toolkit substitui arquivo existente de mesmo nome', content: d.content, expectedHash: cur.hash! });
      warnings.push(`${d.path}: substituído pela skill do toolkit; o original fica no backup da operação`);
    } else {
      conflicts.push({ path: d.path, reason: 'arquivo existente não gerenciado pelo toolkit, com conteúdo diferente' });
    }
  }

  const desiredPaths = new Set(desired.files.map((d) => d.path));
  for (const prev of prevFiles.values()) {
    if (desiredPaths.has(prev.path)) continue;
    const op = await planFileRemoval(projectRoot, prev, conflicts, 'não faz mais parte da instalação');
    if (op) fileOps.push(op);
  }

  const newBlocks: LockBlockEntry[] = [];
  for (const b of desired.blocks) {
    const inner = canonicalInner(b.inner);
    const desiredHash = sha256(inner);
    const prev = prevBlocks.get(b.file);
    const cur = await readCurrent(projectRoot, b.file);
    if (cur.problem) {
      conflicts.push({ path: b.file, reason: cur.problem });
      continue;
    }
    const createdFile = prev?.createdFile ?? !cur.exists;
    newBlocks.push({ file: b.file, sha256: desiredHash, createdFile });
    if (!cur.exists) {
      if (prev) warnings.push(`${b.file} não existe mais e será recriado com o bloco gerenciado.`);
      blockOps.push({ file: b.file, action: 'create-file', reason: 'novo arquivo com bloco gerenciado', newText: upsertBlock(null, inner), expectedHash: null });
      continue;
    }
    const scan = scanBlock(cur.text!);
    if (scan.status === 'invalid') {
      conflicts.push({ path: b.file, reason: `bloco gerenciado inválido: ${scan.reason}` });
    } else if (scan.status === 'none') {
      if (prev) warnings.push(`O bloco gerenciado foi removido de ${b.file} e será reinserido ao final do arquivo.`);
      blockOps.push({ file: b.file, action: 'insert', reason: 'adiciona bloco ao final, preservando o texto existente', newText: upsertBlock(cur.text!, inner), expectedHash: cur.hash! });
    } else {
      const curInner = sha256(scan.inner);
      if (curInner === desiredHash) {
        blockOps.push({ file: b.file, action: 'unchanged', reason: 'sem mudanças', expectedHash: cur.hash! });
      } else if (prev && curInner === prev.sha256) {
        blockOps.push({ file: b.file, action: 'update', reason: 'atualiza somente o bloco gerenciado', newText: upsertBlock(cur.text!, inner), expectedHash: cur.hash! });
      } else {
        conflicts.push({
          path: b.file,
          reason: prev ? 'o bloco gerenciado foi editado localmente' : 'já existe um bloco SEEDGRID AI TOOLKIT não registrado no lock',
        });
      }
    }
  }
  const desiredBlockFiles = new Set(desired.blocks.map((b) => b.file));
  for (const prev of prevBlocks.values()) {
    if (desiredBlockFiles.has(prev.file)) continue;
    const op = await planBlockRemoval(projectRoot, prev, conflicts);
    if (op) blockOps.push(op);
  }

  const lock: Lock = {
    lockVersion: LOCK_VERSION,
    tool: TOOL_NAME,
    cliVersion: meta.cliVersion,
    contentVersion: meta.contentVersion,
    contentSchemaVersion: meta.contentSchemaVersion,
    targets: [...meta.targets].sort(),
    mode: meta.mode,
    source: meta.source,
    lastOperation: { id: meta.operationId, kind: meta.kind, at: meta.now },
    files: newFiles,
    blocks: newBlocks,
  };
  const lockCur = await readCurrent(projectRoot, LOCK_PATH);
  if (lockCur.problem) conflicts.push({ path: LOCK_PATH, reason: lockCur.problem });
  const lockUnchanged = prevLock !== null && sameLockContent(prevLock, lock);
  const lockOp: LockOp = lockUnchanged
    ? { action: 'unchanged', expectedHash: lockCur.hash ?? null }
    : { action: 'write', content: serializeLock(lock), expectedHash: lockCur.hash ?? null };

  if (prevLock && prevLock.contentVersion !== meta.contentVersion) {
    const cmp = prevLock.contentVersion.localeCompare(meta.contentVersion, undefined, { numeric: true });
    if (cmp > 0) warnings.push(`O conteúdo instalado (${prevLock.contentVersion}) é mais novo que o da fonte (${meta.contentVersion}).`);
  }

  return finish({ kind: meta.kind, projectRoot, fileOps, blockOps, lockOp, conflicts, warnings, lock: lockUnchanged ? prevLock : lock });
}

/** Planeja a remoção dos arquivos e blocos registrados no lock. Não escreve nada. */
export async function planRemove(projectRoot: string, lockState: LockState): Promise<Plan> {
  if (lockState.status === 'absent') throw new ToolkitError('Nenhuma instalação encontrada (sem .ai/toolkit-lock.json).');
  if (lockState.status === 'invalid') {
    throw new ToolkitError('O lock é inválido; nada foi removido.', lockState.errors);
  }
  const conflicts: Conflict[] = [];
  const fileOps: FileOp[] = [];
  const blockOps: BlockOp[] = [];
  for (const f of lockState.lock.files) {
    const op = await planFileRemoval(projectRoot, f, conflicts, 'arquivo gerenciado');
    if (op) fileOps.push(op);
  }
  for (const b of lockState.lock.blocks) {
    const op = await planBlockRemoval(projectRoot, b, conflicts);
    if (op) blockOps.push(op);
  }
  const lockCur = await readCurrent(projectRoot, LOCK_PATH);
  if (lockCur.problem) conflicts.push({ path: LOCK_PATH, reason: lockCur.problem });
  return finish({
    kind: 'remove',
    projectRoot,
    fileOps,
    blockOps,
    lockOp: { action: 'delete', expectedHash: lockCur.hash ?? null },
    conflicts,
    warnings: [],
    lock: null,
  });
}
