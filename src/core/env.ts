import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ToolkitError } from './types.js';

/** Raiz do pacote (pasta que contém package.json, dist/ e seedgridKB/). */
export function packageRoot(): string {
  // dist/core/env.js ou build-test/src/core/env.js -> sobe até achar package.json
  let dir = path.dirname(fileURLToPath(import.meta.url));
  for (let i = 0; i < 5; i++) {
    try {
      statSync(path.join(dir, 'package.json'));
      return dir;
    } catch {
      dir = path.dirname(dir);
    }
  }
  throw new ToolkitError('package.json do toolkit não encontrado');
}

export function cliVersion(): string {
  const pkg = JSON.parse(readFileSync(path.join(packageRoot(), 'package.json'), 'utf8')) as { version: string };
  return pkg.version;
}

/** Conteúdo empacotado junto com o CLI. A versão do CLI identifica este conteúdo. */
export function bundledContentDir(): string {
  return path.join(packageRoot(), 'seedgridKB');
}

export function resolveProject(project: string | undefined): string {
  const abs = path.resolve(project ?? process.cwd());
  let st;
  try {
    st = statSync(abs);
  } catch {
    throw new ToolkitError(`Pasta do projeto não encontrada: ${abs}`);
  }
  if (!st.isDirectory()) throw new ToolkitError(`O caminho do projeto não é uma pasta: ${abs}`);
  return abs;
}
