export type Target = 'claude' | 'codex';
export type Mode = 'shared' | 'native';

export const ALL_TARGETS: readonly Target[] = ['claude', 'codex'];
export const ALL_MODES: readonly Mode[] = ['shared', 'native'];

/** Arquivo que o toolkit deseja ter no projeto (caminho relativo, separador "/"). */
export interface DesiredFile {
  path: string;
  content: string;
  /** Componente do manifesto ou adaptador que originou o arquivo. */
  component: string;
}

export type ManagedBlockFile = 'AGENTS.md' | 'CLAUDE.md';
export const BLOCK_FILES: readonly ManagedBlockFile[] = ['AGENTS.md', 'CLAUDE.md'];

/** Conteúdo interno (sem marcadores) de um bloco gerenciado. */
export interface DesiredBlock {
  file: ManagedBlockFile;
  inner: string;
}

export interface DesiredState {
  files: DesiredFile[];
  blocks: DesiredBlock[];
}

export class ToolkitError extends Error {
  constructor(
    message: string,
    readonly details: string[] = [],
  ) {
    super(message);
    this.name = 'ToolkitError';
  }
}
