import { createHash } from 'node:crypto';

/**
 * Normaliza finais de linha antes do hash. Assim, checkouts com CRLF
 * (core.autocrlf no Windows) não são confundidos com customizações.
 */
export function normalizeText(text: string): string {
  return text.replace(/\r\n/g, '\n');
}

export function sha256(text: string): string {
  return createHash('sha256').update(normalizeText(text), 'utf8').digest('hex');
}

export function isSha256(value: unknown): value is string {
  return typeof value === 'string' && /^[0-9a-f]{64}$/.test(value);
}
