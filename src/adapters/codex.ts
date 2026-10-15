import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseToml } from 'smol-toml';
import type { AgentDef, ContentBundle } from '../core/content.js';
import type { DesiredFile } from '../core/types.js';
import { GENERATED_NOTICE, type Adapter, type DiscoveryIssue } from './types.js';

function tomlBasicString(value: string): string {
  return JSON.stringify(value); // strings JSON simples são strings básicas TOML válidas
}

/** String multilinha legível; usa literal ''' quando possível. */
export function tomlMultiline(value: string): string {
  const text = value.replace(/\r\n/g, '\n');
  if (!text.includes("'''") && !/[\x00-\x08\x0b-\x1f\x7f]/.test(text)) {
    return `'''\n${text}'''`;
  }
  const escaped = text
    .replace(/\\/g, '\\\\')
    .replace(/"""/g, '""\\"')
    .replace(/[\x00-\x08\x0b-\x1f\x7f]/g, (c) => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`);
  return `"""\n${escaped}"""`;
}

export function renderCodexAgent(agent: AgentDef, contentVersion: string): string {
  const skills = agent.preferredSkills.length > 0 ? `Skills preferidas: ${agent.preferredSkills.join(', ')}.\n\n` : '';
  const instructions = [
    `Você atua no papel \`${agent.id}\` do SeedGrid AI Toolkit. Siga AGENTS.md, .ai/rules/formato-entrega.md e, se existir, .ai/local/.`,
    '',
    `${skills}${agent.body.trim()}`,
    '',
  ].join('\n');
  return [
    `# ${GENERATED_NOTICE} a partir de .ai/agents/${agent.id}.md (conteúdo ${contentVersion}).`,
    '# Não edite; personalize em .ai/local/.',
    `name = ${tomlBasicString(agent.id)}`,
    `description = ${tomlBasicString(agent.description)}`,
    `developer_instructions = ${tomlMultiline(instructions)}`,
    '',
  ].join('\n');
}

export const codexAdapter: Adapter = {
  target: 'codex',
  displayName: 'Codex',
  skillsDir: '.agents/skills',
  nativeAgentsDir: '.codex/agents',
  nativeAgentExtension: '.toml',
  versionCommand: 'codex --version',
  validatedVersions: ['0.160.1'],
  // Renderiza o prompt visível ao modelo (AGENTS.md e lista de skills) sem chamar o modelo.
  reviewCommand: (prompt) => `codex exec --sandbox read-only "${prompt}"`,
  probeCommand: 'codex debug prompt-input "seedgrid-ai doctor --probe"',

  skillFiles(bundle: ContentBundle): DesiredFile[] {
    return bundle.skills.flatMap((s) =>
      s.files.map((f) => ({ path: `.agents/skills/${s.name}/${f.path}`, content: f.content, component: `skill:${s.name}` })),
    );
  },

  nativeAgentFiles(bundle: ContentBundle): DesiredFile[] {
    // Um arquivo por agente em .codex/agents/; .codex/config.toml não é alterado.
    return bundle.agents.map((a) => ({
      path: `.codex/agents/${a.id}.toml`,
      content: renderCodexAgent(a, bundle.contentVersion),
      component: 'native:codex',
    }));
  },

  blocks() {
    return []; // o Codex lê AGENTS.md nativamente
  },

  checkNativeAgent(relPath: string, content: string): DiscoveryIssue[] {
    let data: Record<string, unknown>;
    try {
      data = parseToml(content) as Record<string, unknown>;
    } catch (err) {
      return [{ level: 'erro', message: `${relPath}: TOML inválido: ${(err as Error).message.split('\n')[0]}` }];
    }
    const issues: DiscoveryIssue[] = [];
    for (const key of ['name', 'description', 'developer_instructions']) {
      if (typeof data[key] !== 'string' || (data[key] as string).trim() === '') {
        issues.push({ level: 'erro', message: `${relPath}: campo obrigatório "${key}" ausente` });
      }
    }
    return issues;
  },

  async projectChecks(projectRoot: string, mode): Promise<DiscoveryIssue[]> {
    const issues: DiscoveryIssue[] = [];
    if (mode !== 'native') return issues;
    let raw: string | null = null;
    try {
      raw = await readFile(path.join(projectRoot, '.codex', 'config.toml'), 'utf8');
    } catch {
      return issues;
    }
    try {
      const cfg = parseToml(raw) as Record<string, unknown>;
      const agents = cfg.agents as Record<string, unknown> | undefined;
      if (agents && agents.enabled === false) {
        issues.push({ level: 'aviso', message: '.codex/config.toml define [agents] enabled = false; subagentes estão desativados' });
      }
    } catch (err) {
      issues.push({ level: 'erro', message: `.codex/config.toml inválido: ${(err as Error).message.split('\n')[0]}` });
    }
    return issues;
  },

  limitations(mode) {
    const out = ['O Codex lê AGENTS.md e .agents/skills/ a partir da pasta atual até a raiz do repositório.'];
    if (mode === 'native') {
      out.push(
        'O Codex só carrega camadas .codex/ do projeto (inclusive .codex/agents/) quando o projeto é confiável (trusted).',
        'capabilities não são traduzidas para o Codex: a leitura de arquivos usa o shell, e sandbox_mode/approval_policy em arquivos de agente não sobrescrevem a sessão principal.',
      );
    }
    return out;
  },
};
