import { exec } from 'node:child_process';
import { cliVersion } from '../core/env.js';
import { TOOL_NAME } from '../core/lock.js';
import { EXIT_ERROR, EXIT_OK, type CommandOptions, type CommandResult } from './common.js';

export interface NpmRun {
  code: number | null;
  stdout: string;
  stderr: string;
}

/** Executa um comando fixo (sem entrada do usuário) e devolve o resultado. shell é necessário para npm.cmd no Windows. */
function runFixed(command: string, timeoutMs: number): Promise<NpmRun> {
  return new Promise((resolve) => {
    const child = exec(command, { timeout: timeoutMs, windowsHide: true, maxBuffer: 16 * 1024 * 1024 }, (err, stdout, stderr) => {
      const e = err as (NodeJS.ErrnoException & { code?: number | string }) | null;
      resolve({ code: e ? (typeof e.code === 'number' ? e.code : null) : 0, stdout: stdout.toString(), stderr: stderr.toString() });
    });
    child.stdin?.end();
  });
}

/**
 * Instala o comando `seedgrid-ai` na máquina (npm install -g), na versão deste CLI.
 * Depois, os demais comandos ficam disponíveis sem npx. Não toca em nenhum projeto.
 */
export async function selfInstallCommand(opts: CommandOptions): Promise<CommandResult> {
  const version = cliVersion();
  const command = `npm install -g ${TOOL_NAME}@${version}`;
  const base = { command: 'install', version, npmCommand: command };

  if (opts.dryRun) {
    return {
      exitCode: EXIT_OK,
      report: { ...base, dryRun: true },
      lines: [`Executaria: ${command}`, 'Nada foi instalado (--dry-run).'],
    };
  }

  const run = opts.npmRunner ?? runFixed;
  const result = await run(command, 5 * 60 * 1000);
  if (result.code !== 0) {
    const detail = (result.stderr.trim() || result.stdout.trim() || '(sem saída)').split('\n').slice(-8).join('\n');
    return {
      exitCode: EXIT_ERROR,
      report: { ...base, ok: false, code: result.code, stderr: result.stderr },
      lines: [
        `Não foi possível instalar com "${command}" (código ${result.code ?? 'desconhecido'}).`,
        detail,
        '',
        'Se for permissão, configure um prefixo global do npm para o seu usuário ou rode o terminal com a permissão necessária.',
        'Sem instalar, você ainda pode usar: npx @seedgrid/ai-toolkit <comando>',
      ],
    };
  }

  const check = await run('seedgrid-ai --version', 30 * 1000);
  const found = check.code === 0 && check.stdout.trim() === version;
  return {
    exitCode: EXIT_OK,
    report: { ...base, ok: true, onPath: found },
    lines: [
      `Instalado: ${TOOL_NAME}@${version} (comando seedgrid-ai).`,
      found
        ? 'O comando já está disponível neste terminal.'
        : 'Se "seedgrid-ai" não for reconhecido, abra um novo terminal ou confira se a pasta global do npm (npm prefix -g) está no PATH.',
      '',
      'Próximos passos, na pasta do projeto:',
      '  seedgrid-ai init       # instala o toolkit no projeto',
      '  seedgrid-ai --help     # lista todos os comandos',
      `Para atualizar o próprio comando no futuro: npx ${TOOL_NAME}@latest install`,
    ],
  };
}
