import type { CommandOptions, CommandResult } from './common.js';
import { runInstall } from './install.js';

/**
 * Aplica o conteúdo empacotado no CLI em execução (ou --source local) a uma
 * instalação existente. Não consulta a rede.
 */
export function updateCommand(opts: CommandOptions): Promise<CommandResult> {
  return runInstall('update', opts);
}
