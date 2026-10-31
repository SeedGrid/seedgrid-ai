import type { AgentDef, ContentBundle, SharedFile } from '../core/content.js';
import type { DesiredBlock, DesiredFile, Mode, Target } from '../core/types.js';
import { GENERATED_NOTICE } from './types.js';

export const SHARED_ROOT = '.ai';

/** Destino instalado de um arquivo compartilhado (ex.: rules/x.md -> .ai/rules/x.md). */
export function sharedDest(contentPath: string): string {
  return `${SHARED_ROOT}/${contentPath}`;
}

function escapeCell(text: string): string {
  return text.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ');
}

/** Catálogo curto, gerado do frontmatter dos papéis para não duplicar autoria. */
export function renderCatalog(bundle: ContentBundle): string {
  const lines = [
    '# Índice de papéis',
    '',
    `<!-- ${GENERATED_NOTICE} a partir do frontmatter de agents/*.md (conteúdo ${bundle.contentVersion}). Não edite. -->`,
    '',
    'Escolha papéis por esta tabela. Leia a definição completa apenas dos papéis selecionados.',
    '',
    '| Papel | Quando usar | Capacidades | Skills preferidas | Definição |',
    '| --- | --- | --- | --- | --- |',
    ...bundle.agents.map(
      (a: AgentDef) =>
        `| ${a.id} | ${escapeCell(a.description)} | ${a.capabilities.join(', ') || '-'} | ${
          a.preferredSkills.join(', ') || '-'
        } | [${a.id}.md](${a.id}.md) |`,
    ),
    '',
  ];
  return lines.join('\n');
}

const FOLDER_INDEX: Record<'rules' | 'templates' | 'references', { title: string; intro: string }> = {
  rules: { title: 'Índice de regras', intro: 'Leia a regra quando a descrição combinar com a tarefa.' },
  templates: {
    title: 'Índice de templates',
    intro: 'Copie o modelo para o local de documentação do projeto antes de preencher; não edite o modelo.',
  },
  references: { title: 'Índice de referências', intro: 'Conhecimento estático do toolkit. Leia só o que a tarefa pedir.' },
};

/** Índice de rules, templates ou references, gerado do frontmatter para o AGENTS.md não listar arquivos. */
export function renderFolderIndex(bundle: ContentBundle, type: keyof typeof FOLDER_INDEX): string {
  const files = bundle.shared.filter((s: SharedFile) => s.type === type).sort((a, b) => a.path.localeCompare(b.path));
  const { title, intro } = FOLDER_INDEX[type];
  return [
    `# ${title}`,
    '',
    `<!-- ${GENERATED_NOTICE} a partir do frontmatter de ${type}/*.md (conteúdo ${bundle.contentVersion}). Não edite. -->`,
    '',
    intro,
    '',
    '| Arquivo | O que é e quando usar |',
    '| --- | --- |',
    ...files.map((f) => {
      const name = f.path.slice(type.length + 1);
      return `| [${name}](${name}) | ${escapeCell(f.description ?? '')} |`;
    }),
    '',
  ].join('\n');
}

export const SKILLS_INDEX_FILE = '.ai/skills/index.md';

/** Índice das skills do toolkit, gerado das descrições para o AGENTS.md não crescer a cada skill nova. */
export function renderSkillsIndex(bundle: ContentBundle): string {
  const cell = (t: string) => t.replace(/\|/g, '\\|').replace(/\s*\n\s*/g, ' ').trim();
  const lines = [
    '# Índice de skills',
    '',
    `<!-- ${GENERATED_NOTICE} a partir do frontmatter de cada SKILL.md (conteúdo ${bundle.contentVersion}). Não edite. -->`,
    '',
    'Skills instaladas pelo SeedGrid AI Toolkit. Antes de uma tarefa que combine com a descrição, leia o `SKILL.md` indicado e siga-o. Skills do próprio projeto não aparecem aqui: se existir `projeto.md` nesta pasta, ele as lista.',
    '',
    '| Skill | O que faz e quando usar | Arquivo |',
    '| --- | --- | --- |',
    ...bundle.skills.map(
      (k) => `| \`${k.name}\` | ${cell(k.description)} | [${k.name}/SKILL.md](${k.name}/SKILL.md) |`,
    ),
    '',
  ];
  return lines.join('\n');
}

export function sharedFiles(bundle: ContentBundle, targets: Target[]): DesiredFile[] {
  const files: DesiredFile[] = bundle.shared.map((s) => ({
    path: sharedDest(s.path),
    content: s.content,
    component: s.component,
  }));
  files.push({ path: sharedDest('agents/index.md'), content: renderCatalog(bundle), component: 'agents' });
  for (const type of ['rules', 'templates', 'references'] as const) {
    files.push({ path: sharedDest(`${type}/index.md`), content: renderFolderIndex(bundle, type), component: type });
  }
  // Cópia canônica em .ai/skills (o AGENTS.md aponta para ela); as cópias nativas das ferramentas vêm dos adapters.
  for (const k of bundle.skills) {
    for (const f of k.files) files.push({ path: `.ai/skills/${k.name}/${f.path}`, content: f.content, component: `skill:${k.name}` });
  }
  files.push({ path: SKILLS_INDEX_FILE, content: renderSkillsIndex(bundle), component: 'skills-index' });
  return files;
}

/** Instruções de consulta à base de conhecimento SeedGrid (.ai/brain/), quando o conteúdo a inclui. */
function brainLines(bundle: ContentBundle): string[] {
  if (!bundle.brain) return [];
  const entries = bundle.brain.entrypoints.map((e) => `\`${e}\``).join(', ');
  return [
    `- **Base de conhecimento SeedGrid** (extensions Quarkus, componentes React, propriedades e enums): \`.ai/brain/\` (${bundle.brain.notes} notas, somente leitura). Consulte-a antes de usar ou configurar qualquer extension ou componente SeedGrid.`,
    `  - Comece pelos índices, sem varrer a pasta inteira: ${entries}.`,
    '  - Links `[[SeedGrid/...]]` nas notas são caminhos a partir de `.ai/brain/` (acrescente `.md`).',
    '  - O frontmatter (`commit`, `analisado-em`) diz a que versão do código a nota se refere. Se a versão usada no projeto puder diferir, avise o usuário e registre a dúvida como demanda; não abra o jar nem o pacote da extension para conferir.',
    '  - **Extension: só pela KB (HO-08).** O produto usa as extensions publicadas; não tem o fonte delas e não deve ir atrás dele. Se a KB não responde o que a tarefa precisa, é falha da KB: diga que não encontrou, registre a demanda em `docs/ai/demands/AAAA-MM-DD-assunto.md` e siga com o que a extension oferece (configuração, SPI). Não abra fonte, jar nem pacote de extension para descobrir. Antes de concluir “a KB não responde”, esgote a pasta da extension (`Visao-geral`, `SPIs`, `Exemplos`, `Configuracao`) e busque em toda ela, sem cortar a saída.',
    '  - Não invente propriedades, valores padrão ou enums que não estejam nas notas; diga que não encontrou.',
    '  - Não edite `.ai/brain/`: ela é atualizada por `seedgrid-ai update`.',
  ];
}

const STANDARD_RULES: [string, string][] = [
  ['rules/frontend-seedgrid.md', 'front-end'],
  ['rules/backend-seedgrid.md', 'back-end, comum a todas as linguagens'],
  ['rules/backend-java-seedgrid.md', 'back-end Java'],
];

/** Padrões SeedGrid obrigatórios (front e back), quando o conteúdo os inclui. */
function standardsLines(bundle: ContentBundle): string[] {
  const present = STANDARD_RULES.filter(([p]) => bundle.shared.some((s) => s.path === p));
  if (present.length === 0) return [];
  const review = bundle.skills.some((k) => k.name === 'sg-review')
    ? ' Para conferir se o código segue o padrão, use a skill `sg-review`.'
    : '';
  const list = present.map(([p, label]) => `\`.ai/${p}\` (${label})`).join(' e ');
  return [`- **Padrões SeedGrid obrigatórios:** ao implementar ou alterar código, siga ${list}.${review}`];
}

export function agentsMdBlock(bundle: ContentBundle, targets: Target[], mode: Mode): DesiredBlock {
  const nativeDirs = [
    targets.includes('claude') ? '`.claude/agents/`' : null,
    targets.includes('codex') ? '`.codex/agents/`' : null,
  ]
    .filter(Boolean)
    .join(' e ');
  const delegation =
    mode === 'native'
      ? `- Modo \`native\`: os papéis do catálogo também estão registrados como subagentes em ${nativeDirs}, com os mesmos ids. Use-os quando a ferramenta os reconhecer; caso contrário, siga o modo shared e informe a indisponibilidade.`
      : '- Modo `shared`: para delegar, use o mecanismo de subagentes disponível na ferramenta e passe a definição do papel. Sem subagentes, aplique o papel na sessão principal e **avise o usuário antes de começar**.';
  const inner = [
    '## SeedGrid AI Toolkit',
    '',
    `Bloco gerenciado pelo \`seedgrid-ai\` (conteúdo ${bundle.contentVersion}, modo \`${mode}\`). Não edite entre os marcadores; personalize em \`.ai/local/\`.`,
    '',
    ...(bundle.agentsNotes.length > 0 ? [...bundle.agentsNotes.map((n) => `> ${n}`), ''] : []),
    'Cada pasta de `.ai/` tem um `index.md` com o que há nela: comece por ele e leia só o que a tarefa pedir.',
    '',
    '- Regras: `.ai/rules/`. Antes de tarefas não triviais, leia `coordenacao.md`.',
    '- **Documentos que você gerar** (planos, handoff, decisões, especificações, relatórios) são salvos em `docs/ai/<tipo>/` (planos em `docs/ai/plans/`, decisões/ADR em `docs/ai/decisions/`), nunca em outro lugar do projeto; veja `.ai/rules/documentos.md`.',
    ...standardsLines(bundle),
    '- **Coordenação:** a sessão principal é o coordenador: siga `.ai/rules/coordenacao.md` (**para planejar, analisar ou implementar qualquer coisa não trivial, inclusive um pedido só de “crie ou analise um plano”, acione o `arquiteto` como subagente primeiro: o plano é dele, nunca da sessão principal**; depois delega aos papéis em `.ai/agents/`). **Pedido de produto, projeto ou sistema SeedGrid novo: sua PRIMEIRA ação é invocar a skill `sg-new-product`** (antes do `arquiteto` e antes de explorar outras pastas ou escrever código); nunca monte o projeto à mão nem copie outro produto; se o pedido for só o plano de um produto novo, acione a skill ou pergunte antes. Host nunca altera extension da plataforma: **leia `.ai/rules/limites-do-host.md` antes de qualquer dúvida sobre extension**. **Siga o combinado; não invente:** o que o pedido, o plano ou as regras não dizem, copie do padrão existente no projeto; sem padrão, pergunte uma coisa por vez; divergência do combinado não é sua para decidir (`.ai/rules/coordenacao.md`).',
    '- Papéis: `.ai/agents/`.',
    `- Skills: \`.ai/skills/\` (${bundle.skills.length}). Antes de uma tarefa que combine com a descrição, leia o \`SKILL.md\` indicado no índice.`,
    '- Templates: `.ai/templates/`. Referências: `.ai/references/`.',
    '- **MCP de componentes** (`seedgrid-components`, registrado pelo `init` em `.mcp.json` e `.codex/config.toml`): é um servidor só para React e Flutter; **passe sempre `platform`** (`react` no front/Next.js, `flutter` no app Flutter; sem ele a tool dá erro). Antes de recomendar ou escrever um componente SeedGrid, consulte-o ou a KB. Qual endereço registrar: `.ai/references/mcp-de-componentes-react-e-flutter.md`.',
    ...brainLines(bundle),
    '- Personalizações do projeto ficam em `.ai/local/` (se existir) e prevalecem sobre as regras compartilhadas; veja `.ai/rules/personalizacao-local.md`.',
    delegation,
  ].join('\n');
  return { file: 'AGENTS.md', inner };
}
