# Formato do conteúdo (autoria)

Todo conteúdo distribuído vive no **vault Obsidian `seedgridKB/`** (abra essa pasta no Obsidian) e é descrito por `seedgridKB/manifest.json`. Valide sempre com:

```bash
npm run build
node dist/cli.js validate                          # conteúdo empacotado
node dist/cli.js validate --source ./seedgridKB    # o vault em edição
```

A validação acumula todos os problemas e nada é instalado a partir de conteúdo inválido.

## O vault

```text
seedgridKB/
├── manifest.json            ← lista o que é distribuído (não aparece no Obsidian)
├── AGENTS.md, CLAUDE.md     ← instruções para quem MANTÉM o vault; não são distribuídos
├── Bem-vindo.md, .obsidian/ ← não distribuídos
└── SeedGrid/
    ├── Visao-geral.md, Extensions/, SeedGrid-components/, ...   ← base de conhecimento (KB)
    └── Toolkit/             ← agents/, rules/, templates/, references/, skills/
```

| Origem no vault | Destino no projeto |
| --- | --- |
| `SeedGrid/**` (exceto `Toolkit/`) | `.ai/brain/SeedGrid/**` (somente leitura) |
| `SeedGrid/Toolkit/agents`, `rules`, `templates`, `references` | `.ai/agents`, `.ai/rules`, `.ai/templates`, `.ai/references` |
| `SeedGrid/Toolkit/skills/<nome>/` | `.claude/skills/<nome>/` e `.agents/skills/<nome>/` |

O `AGENTS.md` do vault orienta quem **mantém** a documentação (atualizar notas, não inventar comportamento) e é diferente do bloco que o CLI grava nos projetos, que orienta quem **consome** a KB. Por isso o do vault nunca é distribuído.

### Por que `Toolkit/` e não `.ai/`

O Obsidian ignora pastas que começam com ponto: notas dentro de uma pasta `.ai/` ficariam invisíveis no explorador, na busca e no grafo. O instalador faz a tradução para `.ai/` nos projetos.

### Regras de escrita

- **Notas da KB** (`SeedGrid/` fora de `Toolkit/`): wikilinks do Obsidian com **caminho completo a partir da raiz do vault** (`[[SeedGrid/Extensions/security/Configuracao|texto]]`). Nos projetos, o caminho continua válido a partir de `.ai/brain/`.
- **Conteúdo do Toolkit** (agents, rules, skills...): links **Markdown relativos** (`[texto](../templates/x.md)`), porque skills precisam funcionar fora do Obsidian. Em *Configurações → Arquivos e links*, mantenha "Usar [[Wikilinks]]" desligado ao editar esses arquivos.
- Pastas de skill precisam manter o nome igual ao campo `name` do `SKILL.md`; o Obsidian atualiza links ao renomear, mas não o `name`.

### Validações da KB

Falham o `validate`, o CI e a publicação:

- wikilink sem destino na base instalada (links dentro de `` `código` `` e de blocos de código são ignorados; `\|` em tabelas é entendido);
- caminho local de máquina (`C:\Users\...`, `D:\empreendedorismo\...`, `/c/Users/...`);
- possível segredo (chaves Stripe `sk_live_`/`whsec_`, AWS `AKIA...`, tokens do GitHub, corpo de chave privada). Use placeholders como `<SEGREDO:nome>`;
- arquivo que não seja `.md` dentro de `SeedGrid/` (imagens ainda não são suportadas);
- `entrypoints` do manifesto apontando para nota inexistente.

Arquivos e pastas que começam com ponto são ignorados.

## Manifesto

```json
{
  "schemaVersion": 2,
  "contentVersion": "0.4.0",
  "toolkitBase": "SeedGrid/Toolkit",
  "components": [
    { "id": "agents", "type": "agents", "files": ["agents/arquiteto.md"] },
    { "id": "rules", "type": "rules", "files": ["rules/coordenacao.md"] },
    { "id": "templates", "type": "templates", "files": ["templates/especificacao-tarefa.md"] },
    { "id": "references", "type": "references", "files": ["references/glossario.md"] },
    {
      "id": "skill:sg-plan-change",
      "type": "skill",
      "name": "sg-plan-change",
      "files": [
        "SKILL.md",
        { "path": "assets/especificacao-tarefa.md", "from": "templates/especificacao-tarefa.md" }
      ]
    },
    {
      "id": "brain",
      "type": "brain",
      "base": "SeedGrid",
      "entrypoints": ["Visao-geral.md", "Extensions/Catalogo-de-propriedades.md"]
    }
  ]
}
```

| Campo | Regra |
| --- | --- |
| `schemaVersion` | `2` (versão do formato do manifesto) |
| `contentVersion` | semver; deve ser **igual** à versão do pacote (`package.json`); aumente a cada mudança de conteúdo |
| `agentsNotes` | (opcional) até 10 linhas curtas que o bloco do `AGENTS.md` mostra no topo, como aviso (ex.: o modo de trabalho que uma camada adicional exige) |
| `toolkitBase` | pasta do vault onde ficam `agents/`, `rules/`, `templates/`, `references/` e `skills/` (aqui, `SeedGrid/Toolkit`) |
| `components[].id` | único; para skills, `skill:<name>` |
| `components[].type` | `agents`, `rules`, `templates`, `references`, `skill` ou `brain` |
| `files` (tipos compartilhados) | caminhos relativos a `toolkitBase`, dentro da pasta do tipo; instalados em `.ai/<caminho>` |
| `files` (skill) | caminhos relativos a `<toolkitBase>/skills/<name>/`; ou `{ "path", "from" }` para copiar um arquivo de outro lugar do toolkit sem duplicar a autoria |
| `brain.base` | pasta do vault cujas notas `.md` formam a KB (todas, recursivamente); instaladas em `.ai/brain/<base>/` |
| `brain.exclude` | (opcional) caminhos relativos a `base` a deixar de fora; terminar em `/` exclui uma pasta. `toolkitBase` dentro de `base` é excluído automaticamente |
| `brain.entrypoints` | notas (relativas a `base`) que o bloco do `AGENTS.md` indica como ponto de partida; precisam existir |

Só pode haver um componente `brain`. Ele é opcional: sem ele, o bloco do `AGENTS.md` não menciona a KB.

Regras verificadas: caminhos relativos sem `..`, sem links simbólicos e em UTF-8; todo arquivo das pastas do toolkit deve constar no manifesto; IDs e nomes únicos; links Markdown relativos devem apontar para arquivos existentes no layout instalado.

Não há sistema de dependências nem perfis no MVP.

## Papéis (`SeedGrid/Toolkit/agents/<id>.md`)

Schema próprio do toolkit, em frontmatter YAML:

```yaml
---
id: backend-java
description: Implementa APIs Java e persistência quando a tarefa altera o backend.
capabilities: [read-files, edit-files, run-checks]
preferred_skills: [sg-validate-change]
---
```

| Campo | Obrigatório | Regra |
| --- | --- | --- |
| `id` | sim | minúsculas, números e hífens (até 64); igual ao nome do arquivo |
| `description` | sim | até 300 caracteres; vai para o catálogo — diga **quando** usar |
| `capabilities` | não | lista de `read-files`, `edit-files`, `run-checks` (intenções portáveis) |
| `preferred_skills` | não | nomes de skills existentes no manifesto |

Outros campos são rejeitados. Em especial, **não fixe modelos** (`model`) no conteúdo compartilhado.

O corpo deve ter as seções `## Objetivo`, `## Quando usar`, `## Entradas necessárias`, `## Responsabilidades`, `## Limites` e `## Formato da entrega`. Restrições escritas no corpo são instruções, não mecanismos de segurança; não afirme que uma instrução impede tecnicamente uma ação.

`agents/index.md` é **gerado** a partir do frontmatter e não pode ser escrito à mão.

## Skills (`SeedGrid/Toolkit/skills/<name>/`)

Padrão aberto [Agent Skills](https://agentskills.io/specification):

- `SKILL.md` obrigatório, com frontmatter na primeira linha.
- `name`: 1 a 64 caracteres, `[a-z0-9-]`, sem hífen no início/fim nem `--`, igual ao nome da pasta.
- `description`: 1 a 1024 caracteres, dizendo o que faz **e quando usar**.
- Campos aceitos: `name`, `description`, `license`, `compatibility`, `metadata` (mapa texto→texto), `allowed-tools`. Extensões específicas de ferramenta (como `context`, `paths`, `disable-model-invocation` do Claude Code ou `agents/openai.yaml` do Codex) são rejeitadas no conteúdo compartilhado; se forem necessárias, devem ser implementadas no adaptador.
- Recursos opcionais em `scripts/`, `references/` e `assets/`, referenciados por caminhos relativos a partir do `SKILL.md`. Cada skill deve ser autocontida.
- Extensão opcional do Codex: `agents/openai.yaml` (nome de exibição, descrição curta, prompt padrão). É copiado para os dois destinos; o Claude Code o ignora. Liste-o em `files` como qualquer outro arquivo.
- Mantenha o `SKILL.md` curto (menos de 500 linhas); detalhes vão para `references/`.

Scripts de skills nunca são executados pelo instalador.

## Regras, templates e referências

- `rules/`: instruções de coordenação lidas pela sessão principal. Links relativos entre arquivos `.ai/` são permitidos (por exemplo, `../agents/index.md`).
- `templates/`: modelos distribuídos. Produtos de tarefas reais (planos, ADRs, relatórios) pertencem a cada projeto e **não** voltam para o toolkit automaticamente.
- `references/`: conhecimento estático.

Cada arquivo de `rules/`, `templates/` e `references/` precisa de frontmatter com `description` (até 300 caracteres, dizendo o que é e **quando** usar; coloque entre aspas se tiver `:`). É ela que vai para o `index.md` da pasta, gerado na instalação. `index.md` é nome reservado em `agents/`, `rules/`, `templates/` e `references/` e não pode constar no manifesto.

## Blocos gerenciados

O texto dos blocos de `AGENTS.md` e `CLAUDE.md` é gerado pelos adaptadores (`src/adapters/shared.ts` e `src/adapters/claude.ts`), não pelo manifesto. Mantenha-os curtos: eles apontam para `.ai/`, não repetem o conteúdo.
