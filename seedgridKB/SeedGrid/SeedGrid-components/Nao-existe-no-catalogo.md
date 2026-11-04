---
description: "[React] O que NÃO existe no catálogo de componentes SeedGrid (upload de arquivo, gráficos de barras/pizza/linha, abas), o que existe perto disso e como contornar. Leia antes de planejar uma tela que dependa deles, para não abrir demanda à toa."
tags: [seedgrid, component, lacunas, plataforma-react, upload, grafico, abas, toast]
plataforma: react
analisado-em: 2026-11-01
---
# O que não existe no catálogo (React)

> Conferido em 2026-11-01 na listagem de pastas e arquivos de `front/seedgrid-fe-components/packages/seedgrid-fe-components/src` (grupos `buttons`, `commons`, `digits`, `gadgets`, `inputs`, `layout`, `menus`, `overlay`, `realtime`, `wizard`) e no [[SeedGrid/SeedGrid-components/Catalogo|Catálogo]]. Se o nome não está no catálogo, o componente não existe: não invente `SgTabs`, `SgFileUpload` ou `SgChart`.

| Preciso de… | Existe? | O que há perto | O que fazer |
|---|---|---|---|
| Upload de arquivo (escolher arquivo, vários arquivos, arrastar e soltar, progresso) | **Parcial.** `SgFileUpload` (qualquer tipo, vários arquivos, limites de quantidade e tamanho, tipo conferido pelo conteúdo) e `SgImageUpload` (imagens, grade de miniaturas) **existem nas duas plataformas** (P141): Flutter na `main` do `fe-flutter` (`e5e8baf`) e React publicado no npm em 2026.11.2 (`bb0ad1f`); Flutter fora do pub.dev. **Arrastar e soltar só no React**; **progresso de envio em nenhuma**: o componente não envia, entrega a lista de arquivos ao host. | `SgFileUpload`/`SgImageUpload` em [[SeedGrid/SeedGrid-components/inputs-midia/Visao-geral|inputs-midia (React)]] e [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Visao-geral|inputs-midia (Flutter)]]; `SgTextEditor` tem seletor de arquivo próprio, só para HTML do editor; `filemanagement` (backend) recebe arquivos. | No Flutter use `SgFileUpload`. No React use `SgFileUpload` (`@seedgrid/fe-components` 2026.11.2 ou mais novo). |
| Gráfico de barras, pizza, linha, composição | **Não.** Não há componente de gráfico. | `SgRadialGauge` e `SgLinearGauge` (medidores com faixas), em `gadgets`. | Para composição simples, barras de progresso/medidores; para gráfico de verdade, peça à plataforma ou use uma biblioteca de gráficos no host. |
| Abas (tabs) | **Não** há `SgTabs`. | `SgAccordion`, `SgExpandablePanel`, `SgPanel`, `SgWizard`/`SgWizardPage` (passo a passo). | Acordeão ou painéis; para abas reais, estado do host + `SgButton`. |
| Ação dentro do toast (ex.: "Desfazer") | **Sim.** | `toast(msg, { action: { label, onClick } })`; tipo `SgToastAction = { label: ReactNode; onClick?: () => void }`, em `SgToastOptions`. | Use direto; detalhes em [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API|feedback e exibição]]. |

Observação: a nota gerada [[SeedGrid/SeedGrid-components/Preciso-de|Preciso de X, use Y]] cita "upload" na descrição, mas **não tem entrada de upload**; a descrição é genérica (vem do gerador) e não prova que o componente exista.
