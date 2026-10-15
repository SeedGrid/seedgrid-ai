import { exec } from 'node:child_process';
import type { Adapter } from '../adapters/types.js';

export interface ToolInfo {
  target: string;
  displayName: string;
  installed: boolean;
  version: string | null;
  /** true quando a versão instalada consta da lista validada do adaptador. */
  validated: boolean;
  validatedVersions: string[];
}

function run(command: string, timeoutMs: number): Promise<string | null> {
  return new Promise((resolve) => {
    // Comando fixo do adaptador, sem entrada do usuário. shell é necessário para .cmd no Windows.
    exec(command, { timeout: timeoutMs, windowsHide: true }, (err, stdout) => {
      resolve(err ? null : stdout.toString());
    });
  });
}

/**
 * Executa um comando de sonda (fixo, definido pelo adaptador) na pasta do projeto
 * e devolve a saída padrão, ou null em caso de falha. A entrada padrão é fechada
 * para o processo não esperar texto adicional.
 */
export function runProbe(command: string, cwd: string, timeoutMs = 60000): Promise<string | null> {
  return new Promise((resolve) => {
    const child = exec(command, { cwd, timeout: timeoutMs, windowsHide: true, maxBuffer: 64 * 1024 * 1024 }, (err, stdout) => {
      resolve(err ? null : stdout.toString());
    });
    child.stdin?.end();
  });
}

export async function detectTool(adapter: Adapter, timeoutMs = 15000): Promise<ToolInfo> {
  if (process.env.SEEDGRID_AI_SKIP_TOOL_DETECTION === '1') {
    return {
      target: adapter.target,
      displayName: adapter.displayName,
      installed: false,
      version: null,
      validated: false,
      validatedVersions: adapter.validatedVersions,
    };
  }
  const out = await run(adapter.versionCommand, timeoutMs);
  const version = out?.match(/\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?/)?.[0] ?? null;
  return {
    target: adapter.target,
    displayName: adapter.displayName,
    installed: out !== null,
    version,
    validated: version !== null && adapter.validatedVersions.includes(version),
    validatedVersions: adapter.validatedVersions,
  };
}

export interface ReviewRun {
  code: number | null;
  stdout: string;
  stderr: string;
  timedOut: boolean;
}

/**
 * Executa o comando de revisão (fixo, montado pelo adaptador) na pasta do projeto e devolve a saída.
 * A entrada padrão é fechada. Pode demorar: chama o modelo da ferramenta, com a conta do usuário.
 */
export function runReviewCommand(command: string, cwd: string, timeoutMs = 15 * 60 * 1000): Promise<ReviewRun> {
  return new Promise((resolve) => {
    const child = exec(
      command,
      { cwd, timeout: timeoutMs, windowsHide: true, maxBuffer: 64 * 1024 * 1024 },
      (err, stdout, stderr) => {
        const e = err as (NodeJS.ErrnoException & { killed?: boolean }) | null;
        resolve({
          code: e ? (typeof e.code === 'number' ? e.code : null) : 0,
          stdout: stdout.toString(),
          stderr: stderr.toString(),
          timedOut: Boolean(e?.killed),
        });
      },
    );
    child.stdin?.end();
  });
}
