---
description: "Índice das ferramentas (scripts) que o AIDLC e o ecossistema SeedGrid já têm: para que serve cada uma, como chamar e onde está. Consulte ANTES de criar uma ferramenta nova; se não existir, o plano ganha uma tarefa 'criar a ferramenta' e a linha entra aqui."
---
# Índice de ferramentas

**Regra:** antes de escrever um script, procure aqui. Se existir, use (ou estenda, registrando no plano). Se não existir, o plano ganha uma tarefa "Criar a ferramenta <nome>" com as definições (o que verifica ou gera, entrada, saída, código de saída, teste) e, **ao terminar a tarefa, a linha entra neste índice**. Ferramenta feita para "só este ticket" e jogada fora também fica registrada, com a marca "descartável", para ninguém procurar de novo.

Caminhos abaixo: **A** = `.ai/skills/...` do produto (vem com o AIDLC); **B** = repositório `seedgrid-ia` (host, só para quem desenvolve o AIDLC e a KB); **D** = repositórios de componentes do `seedgrid-platform/front`.

Como achar as skills: não existe `skills/index.md`. Liste a pasta `Toolkit/skills/` (no produto, `.ai/skills/`); cada skill é uma pasta com `SKILL.md` e, quando tem script, `scripts/`. A descrição e o uso de cada uma estão no cabeçalho do `SKILL.md` e no mapa do toolkit.

Papéis novos não trazem script: a especificação de tela do `ux-design` usa o modelo `templates/especificacao-de-tela.md` e vai para `docs/ai/designs/`; o índice geral dessa pasta sai pelo `sg-docs-index`.

## Planos e documentos (A)
| Ferramenta | Para quê | Chamada |
|---|---|---|
| `sg-plan-goal/scripts/controle.mjs` | Controle de um plano de tarefas: progresso, conferência de checklist por fase, perguntas ao dono, tabelas de varredura, tarefas que podem rodar em paralelo e a conferência final do plano (`fechamento`: lista o que foi pulado e a tabela de pendências para o dono) | `node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> status\|checklist <fase> [--completa] [--exceto-decisoes]\|pendencias\|varredura [--completa]\|fechamento\|proximas [--max 4] [--json]` |
| `sg-plan-goal/scripts/varredura-componentes.mjs` | Gera, atualiza e confere a tabela de varredura de componentes (uma linha por componente, lida do código; componente novo aparece sozinho) | `node .ai/skills/sg-plan-goal/scripts/varredura-componentes.mjs gerar\|atualizar <plano>\|conferir <plano> [--completa] --plataforma <seedgrid-platform>` |
| `sg-diagnostico/scripts/diagnostico.mjs` | Diagnostica um plano livre (briefing em prosa) contra o formato completo do `sg-plan-goal` (campo goal, Ferramentas, ondas, Fase FIM, checklist, Pendencia) e gera esqueleto nesse formato | `node .ai/skills/sg-diagnostico/scripts/diagnostico.mjs <plano> --saida <arquivo>` |
| `sg-docs-index/scripts/docs-index.mjs` | Índice geral de `docs/ai/` | `node .../docs-index.mjs [--dir docs/ai] [--check]` |
| `sg-adr/scripts/adr-index.mjs` | Índice das ADRs | `node .ai/skills/sg-adr/scripts/adr-index.mjs [--dir docs/ai/adrs] [--check]` |

## Componentes e produto novo (A)
| Ferramenta | Para quê |
|---|---|
| `sg-componente/scripts/validate-props.mjs` | Valida as props de um componente contra `data/props.json` (só leitura) |
| `sg-new-product/scripts/scaffold-produto.mjs` | Cria um produto novo de forma determinística a partir das respostas |
| `sg-new-product/scripts/reconfigurar.mjs` | Muda as respostas de um produto criado e aplica só a diferença |
| `sg-new-product/scripts/verificar-subida.mjs` | Sobe o produto gerado e diz em que passo falhou |
| `sg-dev-env/scripts/gerar-dev-env.mjs` | Gera o `dev.env` a partir do exemplo, com segredos novos |
| `sg-new-product/scripts/{matriz,mockoon,modulos-front,portas,readme-produto}.mjs` | Bibliotecas do `sg-new-product` (matriz, mock, módulos do front, portas, README do produto) |
| `sg-release/scripts/release.mjs` | Prepara a release do produto (versão, branch, commit e tag locais; para antes do push) |
| `sg-branch-status/scripts/branch-status.mjs` | Classifica branches e worktrees e limpa o que já foi mergeado |
| `sg-check-secrets/scripts/check-secrets.mjs` | Trava contra credenciais no repositório |
| `sg-custo/scripts/custo.mjs` | Custo do plano por tarefa, fase e total (tokens e valor), somando Claude Code, Codex e outras LLMs (JSON ou CSV), cada modelo com o seu preço |
| `sg-custo/scripts/leitores.mjs` | Leitores de uso por ferramenta do `sg-custo` (`claude-code`, `codex` e genérico), todos com a mesma saída |

## Host `seedgrid-ia` e KB (B)
| Ferramenta | Para quê | Chamada |
|---|---|---|
| `scripts/kb-catalogs.mjs` | Gera os catálogos da KB (propriedades, enums, índice de componentes) a partir das notas | `node scripts/kb-catalogs.mjs` |
| `scripts/kb-versions.mjs` | Gera `Versoes.md`: versão que a KB descreve × versão atual (e publicada, com `--published`) | `node scripts/kb-versions.mjs --write` |
| `scripts/check-catalogo-pins.mjs` | Confere as versões fixadas do catálogo do `sg-new-product` contra os poms | roda no `npm test` |
| `scripts/check-pack.mjs` | Confere o que entraria no pacote npm sem publicar | `node scripts/check-pack.mjs [--release <tag>]` |
| `scripts/sync-boilerplates.mjs` | Sincroniza `Toolkit/boilerplates/` com o repositório `boilerplate` | `node scripts/sync-boilerplates.mjs [--ref origin/main] [--dry-run]` |
| `scripts/e2e-*.mjs` | Testes ponta a ponta do AIDLC com agente real (custam dinheiro; usam `--orcamento`) | ver o cabeçalho de cada um |
| `scripts/kb-componentes-vs-codigo.mjs` | Compara as páginas de API da KB (React e Flutter) com o manifesto do MCP, o `generated-props.json` e o construtor Dart; acusa prop removida, nova, tipo/padrão/obrigatória divergente, extra inexistente, `disabled`, `rules` e `SgRules` (sai com 1 se houver); com `--tipos` confere também tipo e padrão de cada prop (React: `generated-props.json`, manifesto e inicializador no `.tsx`; Flutter: campo e `this.x = v` do construtor Dart; omissões do gerador viram aviso) | `node scripts/kb-componentes-vs-codigo.mjs [Componente] [--plataforma flutter\|react\|ambas] [--tipos] [--exemplos] [--resumo] [--json]` |
| `scripts/kb-extensions-vs-codigo.mjs` | Compara os catálogos de Extensions (`Catalogo-de-propriedades.md` e `Catalogo-de-enums.md`, linhas Quarkus) com o código Java do `seedgrid-platform`: propriedades por `@ConfigMapping` (`@WithName`, `@WithParentName`, Map = `<nome>`), `@ConfigProperty`, constantes, placeholders e `microprofile-config.properties`; enums públicos (nome e valores). Acusa propriedade/enum só no código, só no catálogo ou com valores diferentes (sai com 1). Falsos positivos conhecidos ficam em `scripts/kb-extensions-vs-codigo.baseline.json`, cada um com motivo. Rust e front ficam de fora | `node scripts/kb-extensions-vs-codigo.mjs [--platform <pasta>] [--so propriedades\|enums] [--gerar-baseline]` |

## Repositórios de componentes (D)
| Ferramenta | Para quê |
|---|---|
| `seedgrid-fe-flutter/tools/showcase_parity/verify.mjs` | Verificador de paridade dos exemplos dos showcases React × Flutter (`--strict` para exigir zero divergência; `baseline.json` e `excecoes.json`) |
| `seedgrid-fe-flutter/tools/showcase_i18n/extract.mjs` | Extrai e confere os textos do showcase nos 5 idiomas (`--faltam`) |
| `seedgrid-fe-flutter/tools/parity_table` | Gera `paridade.json` e `PARIDADE.md` (estado de cada componente) |
| `seedgrid-fe-flutter/tools/{gen_props,mcp_manifest,parity_vectors,showcase_snippets,export_i18n}` | Geradores de props, manifesto do MCP, vetores de paridade, trechos do showcase e i18n |
| `java/seedgrid-components-mcp/scripts/sync-from-front.mjs` | Sincroniza os manifestos do MCP a partir do código dos dois pacotes (`--build`, `--only-flutter`) |

## Como manter este índice
- Ferramenta nova **entra aqui no mesmo commit em que é criada** (tarefa do plano: "linha no índice de ferramentas").
- Ferramenta removida ou trocada sai daqui ou ganha a marca "descartável".
- A descrição de cada linha sai do cabeçalho do próprio script; se o cabeçalho mudar, ajuste a linha.
