import { exec, spawn } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { createInterface } from 'node:readline/promises';
import { TOOL_NAME } from './lock.js';

export const NO_UPDATE_CHECK_ENV = 'SEEDGRID_AI_NO_UPDATE_CHECK';

export interface UpdateInfo {
  current: string;
  latest: string;
  newer: boolean;
}

/** Compara versões x.y.z (sufixos de pré-release ficam abaixo da versão final). */
export function compareVersions(a: string, b: string): number {
  const parse = (v: string) => {
    const [core = '', pre] = v.replace(/^v/, '').split('-', 2);
    return { nums: core.split('.').map((n) => Number.parseInt(n, 10) || 0), pre };
  };
  const pa = parse(a);
  const pb = parse(b);
  for (let i = 0; i < 3; i++) {
    const d = (pa.nums[i] ?? 0) - (pb.nums[i] ?? 0);
    if (d !== 0) return Math.sign(d);
  }
  if (pa.pre === pb.pre) return 0;
  if (!pa.pre) return 1;
  if (!pb.pre) return -1;
  return pa.pre.localeCompare(pb.pre, undefined, { numeric: true });
}

export function updateCheckDisabled(): boolean {
  return process.env[NO_UPDATE_CHECK_ENV] === '1' || Boolean(process.env.CI);
}

/**
 * Consulta a versão "latest" publicada no npm (somente leitura). Usa o próprio
 * npm para respeitar registry, proxy e .npmrc. Retorna null sem rede, sem
 * pacote publicado ou em caso de qualquer falha.
 */
export async function checkLatest(current: string, timeoutMs = 8000): Promise<UpdateInfo | null> {
  const simulated = process.env.SEEDGRID_AI_TEST_LATEST; // somente testes: evita rede
  if (simulated) return { current, latest: simulated, newer: compareVersions(simulated, current) > 0 };
  if (updateCheckDisabled()) return null;
  // Cache por usuário: a consulta ao npm custa alguns segundos, então é feita no máximo a cada 12 h.
  const cacheFile = path.join(os.homedir(), '.cache', 'seedgrid-ai', 'update-check.json');
  try {
    const cached = JSON.parse(await readFile(cacheFile, 'utf8')) as { checkedAt: number; latest: string | null };
    if (Date.now() - cached.checkedAt < CACHE_TTL_MS) {
      return cached.latest ? { current, latest: cached.latest, newer: compareVersions(cached.latest, current) > 0 } : null;
    }
  } catch {
    // sem cache válido
  }
  const latest = await queryNpm(timeoutMs);
  try {
    await mkdir(path.dirname(cacheFile), { recursive: true });
    await writeFile(cacheFile, JSON.stringify({ checkedAt: Date.now(), latest }));
  } catch {
    // cache é opcional
  }
  return latest ? { current, latest, newer: compareVersions(latest, current) > 0 } : null;
}

const CACHE_TTL_MS = 12 * 60 * 60 * 1000;

function queryNpm(timeoutMs: number): Promise<string | null> {
  return new Promise((resolve) => {
    const child = exec(
      `npm view ${TOOL_NAME}@latest version --json`,
      { timeout: timeoutMs, windowsHide: true },
      (err, stdout) => {
        if (err) return resolve(null);
        try {
          const latest = JSON.parse(stdout.toString().trim()) as unknown;
          resolve(typeof latest === 'string' && /^\d+\.\d+\.\d+/.test(latest) ? latest : null);
        } catch {
          resolve(null);
        }
      },
    );
    child.stdin?.end();
  });
}

export function isInteractive(): boolean {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

/** Pergunta sim/não no terminal. Enter vazio usa o padrão. */
export async function confirm(question: string, defaultYes = true): Promise<boolean> {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = (await rl.question(`${question} ${defaultYes ? '[Y/n]' : '[y/N]'} `)).trim().toLowerCase();
    if (answer === '') return defaultYes;
    return ['y', 'yes', 's', 'sim'].includes(answer);
  } finally {
    rl.close();
  }
}

const UNSAFE_FOR_SHELL = /["%^&|<>!`$\r\n]/;

/** Linha de comando equivalente, para exibir ou para o usuário rodar manualmente. */
export function npxCommandLine(version: string, args: string[]): string {
  const quote = (a: string) => (/[\s'"]/.test(a) ? `"${a}"` : a);
  return ['npx', `${TOOL_NAME}@${version}`, ...args].map(quote).join(' ');
}

/**
 * Executa a versão indicada do pacote via npx, repassando os argumentos.
 * Retorna o código de saída, ou null se não for seguro montar o comando.
 */
export function runPublishedVersion(version: string, args: string[]): Promise<number | null> {
  if (args.some((a) => UNSAFE_FOR_SHELL.test(a))) return Promise.resolve(null);
  const quoted = args.map((a) => (/\s/.test(a) ? `"${a}"` : a));
  return new Promise((resolve) => {
    // shell é necessário para npx.cmd no Windows; os argumentos já foram filtrados acima.
    const child = spawn('npx', ['--yes', `${TOOL_NAME}@${version}`, ...quoted], {
      stdio: 'inherit',
      shell: true,
      env: { ...process.env, [NO_UPDATE_CHECK_ENV]: '1' }, // evita perguntar de novo na versão nova
    });
    child.on('error', () => resolve(1));
    child.on('exit', (code) => resolve(code ?? 1));
  });
}
