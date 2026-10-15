import { lstat, readFile } from 'node:fs/promises';
import { scanBlock } from './blocks.js';
import { sha256 } from './hash.js';
import type { Lock } from './lock.js';
import { checkSymlinkSafety, resolveInProject } from './paths.js';
import type { ManagedBlockFile } from './types.js';

export type FileState = 'ok' | 'modificado' | 'ausente' | 'inseguro';
export type BlockState = 'ok' | 'editado' | 'ausente' | 'invalido' | 'arquivo-ausente';

export interface FileInspection {
  path: string;
  component: string;
  state: FileState;
  detail?: string;
}

export interface BlockInspection {
  file: ManagedBlockFile;
  state: BlockState;
  detail?: string;
}

export interface Inspection {
  files: FileInspection[];
  blocks: BlockInspection[];
}

export async function readIfFile(abs: string): Promise<string | null> {
  try {
    const st = await lstat(abs);
    if (!st.isFile()) return null;
    return await readFile(abs, 'utf8');
  } catch {
    return null;
  }
}

/** Compara o disco com o lock (já validado). Somente leitura. */
export async function inspectInstallation(projectRoot: string, lock: Lock): Promise<Inspection> {
  const files: FileInspection[] = [];
  for (const f of lock.files) {
    const problem = await checkSymlinkSafety(projectRoot, f.path);
    if (problem) {
      files.push({ path: f.path, component: f.component, state: 'inseguro', detail: problem });
      continue;
    }
    const text = await readIfFile(resolveInProject(projectRoot, f.path));
    if (text === null) files.push({ path: f.path, component: f.component, state: 'ausente' });
    else if (sha256(text) !== f.sha256) files.push({ path: f.path, component: f.component, state: 'modificado' });
    else files.push({ path: f.path, component: f.component, state: 'ok' });
  }
  const blocks: BlockInspection[] = [];
  for (const b of lock.blocks) {
    const text = await readIfFile(resolveInProject(projectRoot, b.file));
    if (text === null) {
      blocks.push({ file: b.file, state: 'arquivo-ausente' });
      continue;
    }
    const scan = scanBlock(text);
    if (scan.status === 'none') blocks.push({ file: b.file, state: 'ausente' });
    else if (scan.status === 'invalid') blocks.push({ file: b.file, state: 'invalido', detail: scan.reason });
    else if (sha256(scan.inner) !== b.sha256) blocks.push({ file: b.file, state: 'editado' });
    else blocks.push({ file: b.file, state: 'ok' });
  }
  return { files, blocks };
}
