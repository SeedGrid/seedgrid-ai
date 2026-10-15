import path from 'node:path';
import { loadContent } from '../core/content.js';
import { bundledContentDir } from '../core/env.js';
import { EXIT_OK, type CommandOptions, type CommandResult } from './common.js';

/** Valida uma fonte de conteúdo (manifesto, schema, nomes e referências) sem tocar em projetos. */
export async function validateCommand(opts: CommandOptions): Promise<CommandResult> {
  const dir = opts.source ? path.resolve(opts.source) : bundledContentDir();
  const bundle = await loadContent(dir); // lança ToolkitError com todos os problemas
  const files = bundle.shared.length + bundle.skills.reduce((n, s) => n + s.files.length, 0);
  return {
    exitCode: EXIT_OK,
    report: {
      command: 'validate',
      source: dir,
      contentVersion: bundle.contentVersion,
      agents: bundle.agents.map((a) => a.id),
      brainNotes: bundle.brain?.notes ?? 0,
      skills: bundle.skills.map((s) => s.name),
      files,
      valid: true,
    },
    lines: [
      `Conteúdo válido: ${dir}`,
      `  versão ${bundle.contentVersion}; ${bundle.agents.length} papéis, ${bundle.skills.length} skills, ${bundle.brain?.notes ?? 0} notas da KB, ${files} arquivos`,
    ],
  };
}
