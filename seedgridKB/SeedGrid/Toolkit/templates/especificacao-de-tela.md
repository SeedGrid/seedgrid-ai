---
description: "Modelo de especificação de tela: objetivo, estados, componentes SeedGrid, textos e i18n, acessibilidade e comportamento em 360/390 px, para o front implementar sem decidir o desenho."
---
# Especificação de tela: <nome da tela>

> Modelo do SeedGrid AI Toolkit. Copie para `docs/ai/designs/` com o nome `P<plano>.F<fase>.T<tarefa>-AAAA-MM-DD-assunto.md` antes de preencher; não edite o modelo.

- **AIDLC:** <contentVersion de `.ai/toolkit-lock.json`, ex.: 0.6.1>
- **Status:** proposto | aprovado (data e quem aprovou)
- **Plano e tarefa:** P<plano>.F<fase>.T<tarefa> (título)
- **Desenho:** <link do conector de desenho, quando houver; senão "sem desenho, só esta especificação">

## Objetivo
Uma frase: quem usa a tela e o que consegue fazer nela. Permissão necessária e rota.

## Dados e API
- Dados exibidos e enviados, com o endpoint de cada um (contrato vindo do backend).
- Erros previstos da API e como a tela os mostra.

## Estrutura da tela
Descreva por regiões, de cima para baixo (cabeçalho, filtros, conteúdo, ações). Se houver desenho, aponte a região correspondente.

## Componentes SeedGrid
| Região | Componente | Observação |
| --- | --- | --- |
| Ação principal | `SgButton` | severity, texto pela chave `...` |
| Layout em colunas | `SgGrid` | colunas por breakpoint |

Use o nome real do componente, conferido no catálogo. Componente que não existe: registre em "Lacunas".

## Estados
| Estado | O que o usuário vê | Ação possível |
| --- | --- | --- |
| Vazio | | |
| Carregando | | |
| Erro | | |
| Sucesso | | |
| Sem permissão | | |

## Textos e i18n
| Chave | pt-BR | Outros idiomas exigidos |
| --- | --- | --- |
| `tela.titulo` | | |

Todo texto visível tem chave. Mensagens de erro e de sucesso entram aqui também.

## Acessibilidade
- Rótulo de cada campo e botão; foco inicial; ordem de foco.
- Erros de validação anunciados e ligados ao campo.
- Contraste e uso só de teclado (abrir, confirmar, fechar).

## Comportamento por largura
| Largura | Comportamento |
| --- | --- |
| 360 px | |
| 390 px | |
| Desktop | |

Informe o que reorganiza (colunas viram pilha, tabela vira lista ou rola na horizontal), o que se esconde e onde ficam as ações.

## Ferramenta de desenho: situação
A ferramenta de desenho **ainda não foi escolhida** (spike da tarefa P163.F1.T4). Levantamento nas ferramentas vistas pela sessão que escreveu este modelo:

| Item | Situação |
| --- | --- |
| Conector de Figma | a confirmar: nenhum visto nas ferramentas dessa sessão |
| Skill de Figma | a confirmar: nenhuma vista |
| Outra ferramenta de desenho | a confirmar |
| Ferramentas existentes nas sessões do dono | a confirmar: o dono informa o que usa |

Enquanto não houver confirmação, a especificação em Markdown é a entrega completa.

## Lacunas
Componentes, textos ou decisões que faltam. Cada item diz quem resolve.

## Critérios de aceite da tela
- [ ] Critério verificável 1 (o front e o teste conferem)
- [ ] Todos os estados acima implementados
- [ ] Funciona em 360 e 390 px sem rolagem horizontal da página
