import { readFile } from 'node:fs/promises';
import path from 'node:path';
import type { AgentCapability, AgentDef, ContentBundle } from '../core/content.js';
import { parseFrontmatter, renderFrontmatter } from '../core/frontmatter.js';
import type { DesiredFile } from '../core/types.js';
import { scanBlock } from '../core/blocks.js';
import { GENERATED_NOTICE, type Adapter, type DiscoveryIssue } from './types.js';

/**
 * Tradução de capacidades portáveis para ferramentas do Claude Code.
 * Restringir "tools" limita o subagente, mas não é um mecanismo de segurança do projeto.
 */
const TOOLS_BY_CAPABILITY: Record<AgentCapability, string[]> = {
  'read-files': ['Read', 'Grep', 'Glob'],
  'edit-files': ['Edit', 'Write'],
  'run-checks': ['Bash'],
};

export function claudeTools(agent: AgentDef): string[] | null {
  if (agent.capabilities.length === 0) return null; // herda as ferramentas da sessão
  const tools = new Set<string>();
  for (const c of agent.capabilities) for (const t of TOOLS_BY_CAPABILITY[c]) tools.add(t);
  if (agent.preferredSkills.length > 0) tools.add('Skill');
  return [...tools];
}

export function renderClaudeAgent(agent: AgentDef, contentVersion: string): string {
  const data: Record<string, unknown> = { name: agent.id, description: agent.description };
  const tools = claudeTools(agent);
  if (tools) data.tools = tools.join(', ');
  const skills = agent.preferredSkills.length > 0 ? `Skills preferidas: ${agent.preferredSkills.join(', ')}.\n\n` : '';
  const body = [
    `<!-- ${GENERATED_NOTICE} a partir de .ai/agents/${agent.id}.md (conteúdo ${contentVersion}). Não edite; personalize em .ai/local/. -->`,
    '',
    `Você atua no papel \`${agent.id}\` do SeedGrid AI Toolkit. Siga AGENTS.md, .ai/rules/formato-entrega.md e, se existir, .ai/local/.`,
    '',
    `${skills}${agent.body.trim()}`,
    '',
  ].join('\n');
  return renderFrontmatter(data, body);
}

export const claudeAdapter: Adapter = {
  target: 'claude',
  displayName: 'Claude Code',
  skillsDir: '.claude/skills',
  nativeAgentsDir: '.claude/agents',
  nativeAgentExtension: '.md',
  versionCommand: 'claude --version',
  validatedVersions: ['2.1.299'],
  reviewCommand: (prompt) =>
    `claude -p "${prompt}" --allowedTools "Read,Grep,Glob,Bash(git diff:*),Bash(git status:*),Bash(git log:*),Bash(git ls-files:*)"`,
  probeCommand: null, // não há comando que liste skills/agentes sem abrir uma sessão com o modelo

  skillFiles(bundle: ContentBundle): DesiredFile[] {
    return bundle.skills.flatMap((s) =>
      s.files.map((f) => ({ path: `.claude/skills/${s.name}/${f.path}`, content: f.content, component: `skill:${s.name}` })),
    );
  },

  nativeAgentFiles(bundle: ContentBundle): DesiredFile[] {
    return bundle.agents.map((a) => ({
      path: `.claude/agents/${a.id}.md`,
      content: renderClaudeAgent(a, bundle.contentVersion),
      component: 'native:claude',
    }));
  },

  blocks() {
    return [
      {
        file: 'CLAUDE.md',
        inner: [
          '## SeedGrid AI Toolkit',
          '',
          '@AGENTS.md',
          '',
          'Bloco gerenciado pelo `seedgrid-ai`. As instruções do projeto estão em `AGENTS.md` (importado acima) e as regras compartilhadas em `.ai/rules/`. Siga-as também no Claude Code. Não edite entre os marcadores.',
        ].join('\n'),
      },
    ];
  },

  checkNativeAgent(relPath: string, content: string): DiscoveryIssue[] {
    const fm = parseFrontmatter(content);
    if ('error' in fm) return [{ level: 'erro', message: `${relPath}: ${fm.error}` }];
    const issues: DiscoveryIssue[] = [];
    const name = fm.data.name;
    if (typeof name !== 'string' || name.length === 0 || name.length > 256 || name.includes(':') || name.startsWith('-')) {
      issues.push({ level: 'erro', message: `${relPath}: name ausente ou inválido; o Claude Code ignora o arquivo` });
    }
    if (typeof fm.data.description !== 'string' || fm.data.description.trim() === '') {
      issues.push({ level: 'erro', message: `${relPath}: description ausente; o Claude Code ignora o arquivo` });
    }
    return issues;
  },

  async projectChecks(projectRoot: string): Promise<DiscoveryIssue[]> {
    const issues: DiscoveryIssue[] = [];
    try {
      const text = await readFile(path.join(projectRoot, 'CLAUDE.md'), 'utf8');
      const scan = scanBlock(text);
      if (scan.status === 'one' && !/^@AGENTS\.md\s*$/m.test(scan.inner)) {
        issues.push({ level: 'erro', message: 'CLAUDE.md: o bloco gerenciado não importa @AGENTS.md' });
      }
    } catch {
      issues.push({ level: 'erro', message: 'CLAUDE.md ausente: o Claude Code não lê AGENTS.md diretamente' });
    }
    return issues;
  },

  limitations(mode) {
    const out = [
      'O Claude Code lê CLAUDE.md, não AGENTS.md; o bloco em CLAUDE.md importa AGENTS.md com @AGENTS.md.',
      'Skills e agentes de projeto só são carregados em sessões abertas na pasta do projeto (ou subpastas até a raiz do repositório).',
    ];
    if (mode === 'native') {
      out.push(
        'Se .claude/agents/ não existia quando a sessão começou, reinicie a sessão para o Claude Code observar a pasta.',
        'O campo tools limita as ferramentas do subagente, mas não substitui permissões nem sandbox.',
      );
    }
    return out;
  },
};
