---
description: "Índice das ferramentas (scripts) que o AIDLC e o ecossistema SeedGrid já têm: para que serve cada uma, como chamar e onde está. Consulte ANTES de criar uma ferramenta nova; se não existir, o plano ganha uma tarefa 'criar a ferramenta' e a linha entra aqui."
---
# Índice de ferramentas

**Regra:** antes de escrever um script, procure aqui. Se existir, use (ou estenda, registrando no plano). Se não existir, o plano ganha uma tarefa "Criar a ferramenta <nome>" com as definições (o que verifica ou gera, entrada, saída, código de saída, teste) e, **ao terminar a tarefa, a linha entra neste índice**. Ferramenta feita para "só este ticket" e jogada fora também fica registrada, com a marca "descartável", para ninguém procurar de novo.

Caminhos abaixo: **A** = `.ai/skills/...` do produto (vem com o AIDLC); **B** = repositório `seedgrid-ia` (host, só para quem desenvolve o AIDLC e a KB); **C** = repositório `seedgrid-platform-work`; **D** = repositórios de componentes do `seedgrid-platform/front`.

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

## Host `seedgrid-ia` e KB (B)
| Ferramenta | Para quê | Chamada |
|---|---|---|
| `scripts/kb-catalogs.mjs` | Gera os catálogos da KB (propriedades, enums, índice de componentes) a partir das notas | `node scripts/kb-catalogs.mjs` |
| `scripts/kb-versions.mjs` | Gera `Versoes.md`: versão que a KB descreve × versão atual (e publicada, com `--published`) | `node scripts/kb-versions.mjs --write` |
| `scripts/check-catalogo-pins.mjs` | Confere as versões fixadas do catálogo do `sg-new-product` contra os poms | roda no `npm test` |
| `scripts/check-pack.mjs` | Confere o que entraria no pacote npm sem publicar | `node scripts/check-pack.mjs [--release <tag>]` |
| `scripts/sync-boilerplates.mjs` | Sincroniza `Toolkit/boilerplates/` com o repositório `boilerplate` | `node scripts/sync-boilerplates.mjs [--ref origin/main] [--dry-run]` |
| `scripts/e2e-*.mjs` | Testes ponta a ponta do AIDLC com agente real (custam dinheiro; usam `--orcamento`) | ver o cabeçalho de cada um |
| **Planejada:** `scripts/kb-componentes-vs-codigo.mjs` | Compara as páginas de API da KB com o manifesto do MCP e o código Dart | criada na P156.F0.T1; passa a constar aqui ao terminar |

## Work `seedgrid-platform-work` (C)
| Ferramenta | Para quê | Chamada |
|---|---|---|
| `scripts/gerar-indice.mjs` | Gera `INDEX.md` do work e confere as regras de estado | `node scripts/gerar-indice.mjs [--check]` |
| `scripts/situacao.mjs` | Mostra a situação da pasta em relação ao remoto; rode antes de ler ou escrever | `node scripts/situacao.mjs [--check]` |
| `scripts/renomear-por-numero.mjs` | Renomeia documentos abertos para `<L><numero>-AAAA-MM-DD-assunto.md` e corrige referências | `node scripts/renomear-por-numero.mjs` |

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
