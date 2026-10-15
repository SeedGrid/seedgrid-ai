#!/usr/bin/env node
import { realpathSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';
import { EXIT_ERROR, type CommandOptions, type CommandResult } from './commands/common.js';
import { doctorCommand } from './commands/doctor.js';
import { initCommand } from './commands/init.js';
import { removeCommand } from './commands/remove.js';
import { reviewCommand } from './commands/review.js';
import { selfInstallCommand } from './commands/selfinstall.js';
import { statusCommand } from './commands/status.js';
import { updateCommand } from './commands/update.js';
import { validateCommand } from './commands/validate.js';
import { cliVersion } from './core/env.js';
import { TOOL_NAME } from './core/lock.js';
import { ToolkitError } from './core/types.js';
import {
  checkLatest,
  confirm,
  isInteractive,
  npxCommandLine,
  runPublishedVersion,
  type UpdateInfo,
} from './core/updates.js';

const HELP = `seedgrid-ai — instala o SeedGrid AI Toolkit em projetos locais (Claude Code e Codex)

Comandos:
  install   Instala o comando seedgrid-ai nesta máquina (npm install -g), para usar sem npx; não altera nenhum projeto
  init      Instala o toolkit (regras, papéis, skills, base de conhecimento) no projeto; idempotente
  update    Leva o projeto ao conteúdo da versão do CLI em execução (use npx @seedgrid/ai-toolkit@latest para a mais nova)
  status    Mostra versões, opções e divergências da instalação
  doctor    Diagnostica sintaxe, consistência e limitações; --probe confirma a descoberta real no Codex
  remove    Remove só o que o toolkit instalou e continua intacto
  validate  Valida uma fonte de conteúdo (manifesto, papéis, skills, KB) sem tocar em projetos
  review    Confere o código contra os padrões SeedGrid, chamando a skill seedgrid-review no Claude Code ou no Codex
  help      Mostra esta ajuda

Uso:
  seedgrid-ai install  [--dry-run]
  seedgrid-ai init     [--target claude|codex|both] [--mode shared|native] [--source <pasta>] [--dry-run]
  seedgrid-ai update   [--target ...] [--mode ...] [--source <pasta>] [--dry-run]
  seedgrid-ai status
  seedgrid-ai doctor   [--probe]
  seedgrid-ai remove   [--dry-run]
  seedgrid-ai validate [--source <pasta>]
  seedgrid-ai review   [front|back] [--tool claude|codex] [--full]

Opções comuns:
  --project <caminho>  Projeto alvo (padrão: pasta atual)
  --json               Saída JSON para scripts
  --dry-run            Mostra o plano sem escrever nenhum arquivo
  --probe              (doctor) Confirma a descoberta real onde a ferramenta oferece sonda local
                       (Codex: codex debug prompt-input; não chama o modelo, mas inicia a CLI com sua configuração)
  --tool, --full       (review) Ferramenta que executa a revisão (padrão: Claude Code, depois Codex) e revisão do projeto inteiro
                       (padrão: só os arquivos alterados). Chama o modelo da ferramenta com o seu login e consome tokens;
                       roda em modo somente leitura. Código de saída 3 quando há violações.
  --no-update-check    Não consulta o npm por versões mais novas (também: SEEDGRID_AI_NO_UPDATE_CHECK=1)
  --version, --help

Primeira vez: npx @seedgrid/ai-toolkit@latest install  (depois use seedgrid-ai init, update, ... sem npx)
Padrões do init: --target both --mode shared (ou as opções do lock existente).
Em terminal interativo, init/update/status perguntam se devem usar uma versão mais nova publicada no npm.
Conflitos abortam a operação inteira (código de saída 2); nada é sobrescrito.`;

type Handler = (opts: CommandOptions) => Promise<CommandResult>;

const COMMANDS: Record<string, { handler: Handler; allowed: string[] }> = {
  install: { handler: selfInstallCommand, allowed: ['dry-run'] },
  init: { handler: initCommand, allowed: ['target', 'mode', 'source', 'dry-run'] },
  update: { handler: updateCommand, allowed: ['target', 'mode', 'source', 'dry-run'] },
  status: { handler: statusCommand, allowed: [] },
  doctor: { handler: doctorCommand, allowed: ['probe'] },
  remove: { handler: removeCommand, allowed: ['dry-run'] },
  validate: { handler: validateCommand, allowed: ['source'] },
  review: { handler: reviewCommand, allowed: ['tool', 'full'] },
};

export async function main(argv: string[]): Promise<number> {
  let parsed;
  try {
    parsed = parseArgs({
      args: argv,
      allowPositionals: true,
      strict: true,
      options: {
        target: { type: 'string' },
        mode: { type: 'string' },
        source: { type: 'string' },
        project: { type: 'string' },
        'dry-run': { type: 'boolean' },
        json: { type: 'boolean' },
        probe: { type: 'boolean' },
        tool: { type: 'string' },
        full: { type: 'boolean' },
        'no-update-check': { type: 'boolean' },
        help: { type: 'boolean', short: 'h' },
        version: { type: 'boolean', short: 'v' },
      },
    });
  } catch (err) {
    console.error(`${(err as Error).message}\n\n${HELP}`);
    return EXIT_ERROR;
  }
  const { values, positionals } = parsed;
  if (values.version) {
    console.log(cliVersion());
    return 0;
  }
  const name = positionals[0];
  if (values.help || !name || name === 'help') {
    console.log(HELP);
    return 0;
  }
  const command = COMMANDS[name];
  const maxPositionals = name === 'review' ? 2 : 1;
  if (!command || positionals.length > maxPositionals) {
    console.error(`Comando desconhecido: ${positionals.join(' ')}\n\n${HELP}`);
    return EXIT_ERROR;
  }
  for (const opt of ['target', 'mode', 'source', 'dry-run', 'probe', 'tool', 'full'] as const) {
    if (values[opt] !== undefined && !command.allowed.includes(opt)) {
      console.error(`A opção --${opt} não se aplica ao comando ${name}.`);
      return EXIT_ERROR;
    }
  }
  const opts: CommandOptions = {
    project: values.project,
    source: values.source,
    target: values.target,
    mode: values.mode,
    dryRun: values['dry-run'] ?? false,
    json: values.json ?? false,
    probe: values.probe ?? false,
    scope: name === 'review' ? positionals[1] : undefined,
    tool: values.tool,
    full: values.full ?? false,
  };
  // Consulta somente leitura ao npm; nunca com --source (conteúdo local em teste).
  const checkUpdates = ['init', 'update', 'status', 'doctor'].includes(name) && !values['no-update-check'] && !opts.source;
  const update = checkUpdates ? await checkLatest(cliVersion()) : null;
  const newer = update?.newer ? update : null;
  const canAsk = newer !== null && isInteractive() && !opts.json;

  try {
    if (newer && (name === 'init' || name === 'update')) {
      if (canAsk) {
        console.log(`Versão ${newer.latest} do SeedGrid AI Toolkit disponível (este CLI: ${newer.current}).`);
        if (await confirm(`Usar a ${newer.latest} neste ${name}?`)) return delegate(newer, argv);
      } else if (!opts.json) {
        console.error(updateNotice(newer, argv));
      }
    }

    const result = await command.handler(opts);
    if (newer) result.report.npm = { latest: newer.latest, newer: true };
    if (opts.json) console.log(JSON.stringify(result.report, null, 2));
    else console.log(result.lines.join('\n'));

    if (newer && (name === 'status' || name === 'doctor') && !opts.json) {
      const installed = result.report.installed === true;
      const followUp = [installed ? 'update' : 'init', '--project', String(result.report.project)];
      console.log('');
      if (canAsk && name === 'status' && installed) {
        console.log(`Versão ${newer.latest} do SeedGrid AI Toolkit disponível (este CLI: ${newer.current}).`);
        if (await confirm('Atualizar este projeto agora?')) return delegate(newer, followUp);
      } else {
        console.log(updateNotice(newer, followUp));
      }
    }
    return result.exitCode;
  } catch (err) {
    const isKnown = err instanceof ToolkitError;
    const details = isKnown ? err.details : [];
    if (opts.json) {
      console.log(JSON.stringify({ command: name, error: (err as Error).message, details }, null, 2));
    } else {
      console.error(`ERRO: ${(err as Error).message}`);
      for (const d of details) console.error(`  - ${d}`);
      if (!isKnown) console.error((err as Error).stack);
    }
    return EXIT_ERROR;
  }
}

function updateNotice(info: UpdateInfo, args: string[]): string {
  return `Aviso: versão ${info.latest} disponível no npm (este CLI: ${info.current}). Para usá-la: ${npxCommandLine(info.latest, args)}. Para atualizar o comando seedgrid-ai instalado na máquina: npx ${TOOL_NAME}@latest install`;
}

/** Repassa o comando para a versão publicada mais nova. */
async function delegate(info: UpdateInfo, args: string[]): Promise<number> {
  console.log(`> ${npxCommandLine(info.latest, args)}`);
  const code = await runPublishedVersion(info.latest, args);
  if (code === null) {
    console.error('Os argumentos contêm caracteres que não podem ser repassados com segurança. Rode o comando acima manualmente.');
    return EXIT_ERROR;
  }
  return code;
}

function invokedDirectly(): boolean {
  if (!process.argv[1]) return false;
  try {
    return realpathSync(process.argv[1]) === realpathSync(fileURLToPath(import.meta.url));
  } catch {
    return false;
  }
}

if (invokedDirectly()) {
  main(process.argv.slice(2)).then((code) => {
    process.exitCode = code;
  });
}
