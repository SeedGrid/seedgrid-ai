import { lstat, realpath } from 'node:fs/promises';
import path from 'node:path';
import { ToolkitError } from './types.js';

const MAX_REL_PATH = 400;

/**
 * Caminho relativo portável: separador "/", sem raiz, sem letra de unidade,
 * sem segmentos vazios, "." ou "..".
 */
export function isSafeRelPath(value: unknown): value is string {
  if (typeof value !== 'string' || value.length === 0 || value.length > MAX_REL_PATH) return false;
  if (value.includes('\\') || value.includes('\0') || value.includes(':')) return false;
  if (value.startsWith('/')) return false;
  return value.split('/').every((seg) => seg !== '' && seg !== '.' && seg !== '..');
}

export function toPosix(p: string): string {
  return p.split(path.sep).join('/');
}

export function isInside(parent: string, child: string): boolean {
  const rel = path.relative(parent, child);
  return rel === '' || (!rel.startsWith('..') && !path.isAbsolute(rel));
}

/** Resolve um caminho relativo do projeto, rejeitando escapes. */
export function resolveInProject(projectRoot: string, rel: string): string {
  if (!isSafeRelPath(rel)) {
    throw new ToolkitError(`Caminho inválido ou fora do projeto: ${JSON.stringify(rel)}`);
  }
  const abs = path.resolve(projectRoot, ...rel.split('/'));
  if (!isInside(projectRoot, abs) || abs === projectRoot) {
    throw new ToolkitError(`Caminho fora do projeto: ${rel}`);
  }
  return abs;
}

/**
 * Garante que nenhum componente existente do caminho seja um link simbólico
 * que leve para fora do projeto e que o arquivo final não seja um link.
 * Retorna a descrição do problema ou null.
 */
export async function checkSymlinkSafety(projectRoot: string, rel: string): Promise<string | null> {
  const rootReal = await realpath(projectRoot);
  const segments = rel.split('/');
  let current = projectRoot;
  for (let i = 0; i < segments.length; i++) {
    current = path.join(current, segments[i]!);
    let st;
    try {
      st = await lstat(current);
    } catch {
      return null; // o restante do caminho ainda não existe
    }
    if (st.isSymbolicLink()) {
      if (i === segments.length - 1) {
        return `${rel}: o destino é um link simbólico; o toolkit não escreve através de links.`;
      }
      const target = await realpath(current).catch(() => null);
      if (!target || !isInside(rootReal, target)) {
        return `${rel}: ${segments.slice(0, i + 1).join('/')} é um link simbólico que aponta para fora do projeto.`;
      }
    }
  }
  return null;
}
