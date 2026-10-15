import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { normalizeText } from './hash.js';

export interface Frontmatter {
  data: Record<string, unknown>;
  body: string;
}

/** Lê frontmatter YAML. O "---" de abertura precisa ser a primeira linha. */
export function parseFrontmatter(text: string): Frontmatter | { error: string } {
  const src = normalizeText(text).replace(/^﻿/, '');
  if (!src.startsWith('---\n')) return { error: 'o arquivo não começa com "---" na primeira linha' };
  const end = src.indexOf('\n---', 3);
  if (end < 0) return { error: 'frontmatter sem "---" de fechamento' };
  const after = src.slice(end + 4);
  if (after.length > 0 && !after.startsWith('\n')) return { error: 'linha de fechamento do frontmatter inválida' };
  let data: unknown;
  try {
    data = parseYaml(src.slice(4, end + 1));
  } catch (err) {
    return { error: `YAML inválido: ${(err as Error).message.split('\n')[0]}` };
  }
  if (data === null || typeof data !== 'object' || Array.isArray(data)) {
    return { error: 'o frontmatter deve ser um mapa YAML' };
  }
  return { data: data as Record<string, unknown>, body: after.replace(/^\n/, '') };
}

export function renderFrontmatter(data: Record<string, unknown>, body: string): string {
  const yaml = stringifyYaml(data, { lineWidth: 0 }).trimEnd();
  return `---\n${yaml}\n---\n${body}`;
}
