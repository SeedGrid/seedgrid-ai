import type { ContentBundle } from '../core/content.js';
import type { DesiredState, Mode, Target } from '../core/types.js';
import { claudeAdapter } from './claude.js';
import { codexAdapter } from './codex.js';
import { agentsMdBlock, sharedFiles } from './shared.js';
import type { Adapter } from './types.js';

export const ADAPTERS: Record<Target, Adapter> = { claude: claudeAdapter, codex: codexAdapter };

/** Estado completo desejado no projeto para os targets e o modo escolhidos. */
export function buildDesiredState(bundle: ContentBundle, targets: Target[], mode: Mode): DesiredState {
  const files = sharedFiles(bundle, targets);
  const blocks = [agentsMdBlock(bundle, targets, mode)];
  for (const t of targets) {
    const a = ADAPTERS[t];
    files.push(...a.skillFiles(bundle));
    if (mode === 'native') files.push(...a.nativeAgentFiles(bundle));
    blocks.push(...a.blocks(bundle));
  }
  return { files, blocks };
}
