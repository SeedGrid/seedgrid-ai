import type { ContentBundle } from '../core/content.js';
import type { DesiredBlock, DesiredFile, Target } from '../core/types.js';

export interface DiscoveryIssue {
  level: 'erro' | 'aviso';
  message: string;
}

export interface Adapter {
  target: Target;
  displayName: string;
  /** Pasta (relativa ao projeto) onde a ferramenta descobre skills de projeto. */
  skillsDir: string;
  /** Pasta (relativa ao projeto) de subagentes nativos. */
  nativeAgentsDir: string;
  nativeAgentExtension: string;
  /** Comando para obter a versão instalada. */
  versionCommand: string;
  /** Versões em que o formato native foi validado manualmente (docs/compatibilidade.md). */
  validatedVersions: string[];
  skillFiles(bundle: ContentBundle): DesiredFile[];
  nativeAgentFiles(bundle: ContentBundle): DesiredFile[];
  blocks(bundle: ContentBundle): DesiredBlock[];
  /** Valida sintaticamente um arquivo de agente nativo instalado. */
  checkNativeAgent(relPath: string, content: string): DiscoveryIssue[];
  /** Verificações extras de descoberta no projeto (configurações que desativam o recurso etc.). */
  projectChecks(projectRoot: string, mode: 'shared' | 'native'): Promise<DiscoveryIssue[]>;
  /**
   * Comando opcional que mostra o contexto realmente carregado pela ferramenta
   * sem chamar o modelo (doctor --probe). null quando não há equivalente.
   */
  probeCommand: string | null;
  /**
   * Comando que roda um prompt sem terminal interativo, somente leitura (seedgrid-ai review).
   * O prompt é montado pelo toolkit (sem texto do usuário) e não contém aspas nem metacaracteres de shell.
   */
  reviewCommand(prompt: string): string;
  /** Limitações conhecidas que o doctor sempre relata. */
  limitations(mode: 'shared' | 'native'): string[];
}

export const GENERATED_NOTICE = 'Gerado por seedgrid-ai';
