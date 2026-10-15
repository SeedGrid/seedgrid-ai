import type { CommandOptions, CommandResult } from './common.js';
import { runInstall } from './install.js';

/**
 * Instala o toolkit no projeto. Idempotente: repetir não altera arquivos nem
 * duplica blocos. Sem --target/--mode, reaproveita as opções do lock existente
 * (ou usa both/shared numa instalação nova).
 */
export function initCommand(opts: CommandOptions): Promise<CommandResult> {
  return runInstall('init', opts);
}
