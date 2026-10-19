import { execFile, spawn } from 'node:child_process';
import { promisify } from 'node:util';

const run = promisify(execFile);

export interface GitSetup {
  /** created: pasta virou repositório; skipped: nada feito (motivo em `reason`). */
  status: 'created' | 'skipped' | 'failed';
  reason: string;
  branches?: string[];
}

async function git(cwd: string, args: string[], env: NodeJS.ProcessEnv = process.env): Promise<string> {
  const { stdout } = await run('git', args, { cwd, env, windowsHide: true, maxBuffer: 1 << 24 });
  return stdout.trim();
}

/**
 * git add com a lista de caminhos por stdin (--pathspec-from-file): com os boilerplates são centenas de arquivos e a
 * linha de comando do Windows (cerca de 32 mil caracteres) não comportaria todos como argumentos.
 */
function gitAdd(cwd: string, paths: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn('git', ['add', '--pathspec-from-file=-', '--pathspec-file-nul'], { cwd, windowsHide: true, stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    child.stderr.on('data', (d: Buffer) => {
      stderr += d.toString();
    });
    child.on('error', reject);
    child.on('close', (code) => (code === 0 ? resolve() : reject(new Error(stderr.trim() || `git add saiu com código ${code}`))));
    child.stdin.end(paths.join('\0'));
  });
}

/**
 * Pasta nova de produto: `git init -b main`, commit inicial só com o que o init instalou e a branch `develop` a partir dele.
 * A `main` e a `develop` ficam apontando para o mesmo commit e a `develop` fica como branch atual; a branch de trabalho
 * (`feature/...`) sai da `develop` e é criada pelo orquestrador, não pelo init.
 * Não mexe em pasta que já está dentro de um repositório git. Falha de git nunca desfaz a instalação.
 */
export async function setupProductRepo(projectRoot: string, paths: string[], opts: { develop?: boolean } = {}): Promise<GitSetup> {
  const develop = opts.develop !== false;
  if (process.env.SEEDGRID_AI_SKIP_GIT === '1') return { status: 'skipped', reason: 'SEEDGRID_AI_SKIP_GIT=1' };
  try {
    await git(projectRoot, ['--version']);
  } catch {
    return { status: 'skipped', reason: 'git não encontrado' };
  }
  try {
    await git(projectRoot, ['rev-parse', '--show-toplevel']);
    return { status: 'skipped', reason: 'a pasta já está em um repositório git; branches não alteradas' };
  } catch {
    // não é repositório: segue
  }
  try {
    await git(projectRoot, ['init', '-b', 'main']);
    await gitAdd(projectRoot, paths);
    const env = { ...process.env };
    let hasIdentity = true;
    try {
      await git(projectRoot, ['config', 'user.name']);
      await git(projectRoot, ['config', 'user.email']);
    } catch {
      hasIdentity = false;
    }
    if (!hasIdentity) {
      Object.assign(env, { GIT_AUTHOR_NAME: 'SeedGrid AI', GIT_AUTHOR_EMAIL: 'seedgrid-ai@localhost', GIT_COMMITTER_NAME: 'SeedGrid AI', GIT_COMMITTER_EMAIL: 'seedgrid-ai@localhost' });
    }
    await git(projectRoot, ['-c', 'commit.gpgsign=false', 'commit', '-m', 'chore: instala o seedgrid-ai toolkit'], env);
    if (develop) await git(projectRoot, ['switch', '-c', 'develop']);
    return {
      status: 'created',
      reason: develop ? 'git init -b main, commit inicial e develop' : 'git init -b main e commit inicial',
      branches: develop ? ['main', 'develop'] : ['main'],
    };
  } catch (err) {
    return { status: 'failed', reason: `git: ${(err as Error).message.split('\n')[0]}` };
  }
}
