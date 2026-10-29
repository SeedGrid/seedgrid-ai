import { cp, mkdtemp, readdir, readFile, rm, writeFile, mkdir } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { bundledContentDir } from '../src/core/env.js';

// Testes não devem depender de Claude Code/Codex instalados.
export const TK = 'SeedGrid/Toolkit/'; // pasta do conteúdo do toolkit dentro do vault
process.env.SEEDGRID_AI_SKIP_TOOL_DETECTION = '1';
process.env.SEEDGRID_AI_NO_UPDATE_CHECK = '1';
process.env.SEEDGRID_AI_SKIP_GIT = '1'; // testes de git ligam de novo, em tests/init-git.test.ts
process.env.SEEDGRID_AI_SKIP_MCP = '1'; // testes do MCP ligam de novo, em tests/init-mcp.test.ts

const created: string[] = [];

/** Cria um projeto temporário cujo caminho contém espaços e Unicode. */
export async function tempProject(prefix = 'projeto ção ✓ '): Promise<string> {
  const base = await mkdtemp(path.join(os.tmpdir(), 'seedgrid-ai-teste-'));
  created.push(base);
  const dir = path.join(base, `${prefix}${Math.random().toString(36).slice(2, 7)}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

export async function cleanupAll(): Promise<void> {
  await Promise.all(created.splice(0).map((d) => rm(d, { recursive: true, force: true })));
}

/** Copia o conteúdo empacotado para uma pasta editável (fonte local de teste). */
export async function copyContent(): Promise<string> {
  const base = await mkdtemp(path.join(os.tmpdir(), 'seedgrid-ai-conteudo-'));
  created.push(base);
  const dir = path.join(base, 'conteúdo fonte');
  await cp(bundledContentDir(), dir, { recursive: true, filter: (src) => !src.includes('.obsidian') });
  return dir;
}

/** Mapa caminho relativo -> conteúdo de todos os arquivos da pasta. */
export async function snapshot(dir: string, opts: { ignoreBackups?: boolean } = {}): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  async function walk(d: string, prefix: string) {
    let entries;
    try {
      entries = await readdir(d, { withFileTypes: true });
    } catch {
      return;
    }
    for (const e of entries) {
      const rel = prefix ? `${prefix}/${e.name}` : e.name;
      if (opts.ignoreBackups && rel.startsWith('.ai/backups')) continue;
      if (e.isDirectory()) await walk(path.join(d, e.name), rel);
      else out[rel] = await readFile(path.join(d, e.name), 'utf8');
    }
  }
  await walk(dir, '');
  return out;
}

export async function readText(dir: string, rel: string): Promise<string> {
  return readFile(path.join(dir, ...rel.split('/')), 'utf8');
}

export async function writeText(dir: string, rel: string, text: string): Promise<void> {
  const abs = path.join(dir, ...rel.split('/'));
  await mkdir(path.dirname(abs), { recursive: true });
  await writeFile(abs, text);
}

/** Altera o manifesto da fonte de teste. */
export async function editManifest(contentDir: string, fn: (m: any) => void): Promise<void> {
  const p = path.join(contentDir, 'manifest.json');
  const m = JSON.parse(await readFile(p, 'utf8'));
  fn(m);
  await writeFile(p, JSON.stringify(m, null, 2));
}
