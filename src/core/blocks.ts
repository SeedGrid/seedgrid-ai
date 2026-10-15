import { normalizeText } from './hash.js';

export const BLOCK_BEGIN = '<!-- BEGIN SEEDGRID AI TOOLKIT -->';
export const BLOCK_END = '<!-- END SEEDGRID AI TOOLKIT -->';

export type BlockScan =
  | { status: 'none' }
  | { status: 'one'; start: number; end: number; inner: string }
  | { status: 'invalid'; reason: string };

function count(text: string, needle: string): number {
  let n = 0;
  for (let i = text.indexOf(needle); i >= 0; i = text.indexOf(needle, i + needle.length)) n++;
  return n;
}

/** Localiza o bloco gerenciado. start/end delimitam o bloco, marcadores inclusive. */
export function scanBlock(text: string): BlockScan {
  const begins = count(text, BLOCK_BEGIN);
  const ends = count(text, BLOCK_END);
  if (begins === 0 && ends === 0) return { status: 'none' };
  if (begins !== 1 || ends !== 1) {
    return { status: 'invalid', reason: `marcadores duplicados ou incompletos (BEGIN=${begins}, END=${ends})` };
  }
  const start = text.indexOf(BLOCK_BEGIN);
  const endMarker = text.indexOf(BLOCK_END);
  if (endMarker < start) return { status: 'invalid', reason: 'o marcador END aparece antes de BEGIN' };
  const inner = text.slice(start + BLOCK_BEGIN.length, endMarker);
  return { status: 'one', start, end: endMarker + BLOCK_END.length, inner: canonicalInner(inner) };
}

/** Forma canônica do conteúdo interno, usada no hash e nas comparações. */
export function canonicalInner(inner: string): string {
  return normalizeText(inner).replace(/^\n+/, '').replace(/\n+$/, '');
}

function detectEol(text: string): string {
  return text.includes('\r\n') ? '\r\n' : '\n';
}

export function renderBlock(inner: string, eol = '\n'): string {
  const body = canonicalInner(inner).split('\n').join(eol);
  return `${BLOCK_BEGIN}${eol}${body}${eol}${BLOCK_END}`;
}

/** Insere ou substitui o bloco, preservando todo o texto fora dos marcadores. */
export function upsertBlock(text: string | null, inner: string): string {
  if (text === null || text.length === 0) return `${renderBlock(inner)}\n`;
  const eol = detectEol(text);
  const scan = scanBlock(text);
  if (scan.status === 'invalid') throw new Error(scan.reason);
  if (scan.status === 'one') {
    return text.slice(0, scan.start) + renderBlock(inner, eol) + text.slice(scan.end);
  }
  const sep = text.endsWith(eol) ? eol : eol + eol;
  return `${text}${sep}${renderBlock(inner, eol)}${eol}`;
}

/** Remove o bloco e a quebra de linha que o acompanhava, preservando o restante. */
export function removeBlock(text: string): string {
  const scan = scanBlock(text);
  if (scan.status !== 'one') return text;
  const eol = detectEol(text);
  let before = text.slice(0, scan.start);
  let after = text.slice(scan.end);
  if (after.startsWith(eol)) after = after.slice(eol.length);
  if ((after.length === 0 || after.startsWith(eol)) && before.endsWith(eol + eol)) before = before.slice(0, -eol.length);
  return before + after;
}
