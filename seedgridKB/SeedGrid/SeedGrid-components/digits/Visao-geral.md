---
tags: [seedgrid, front, component, digits]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/digits
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Dígitos animados (`src/digits`)

Oito componentes que exibem **um caractere (ou um texto curto)** com um efeito visual próprio — placar flip, painel LED, display de 7 segmentos, neon, folha de papel descartada etc. São blocos de construção: o relógio [[SeedGrid/SeedGrid-components/gadgets/API|SgClock]] (`digitalStyle`) e o [[SeedGrid/SeedGrid-components/gadgets/API|SgStringAnimator]] compõem vários deles. Não têm eventos nem estado controlado além de `value`.

- API completa (props, ref, acessibilidade): [[SeedGrid/SeedGrid-components/digits/API|API dos dígitos]]
- Exemplos TSX: [[SeedGrid/SeedGrid-components/digits/Exemplos|Exemplos dos dígitos]]
- Gadgets que os usam: [[SeedGrid/SeedGrid-components/gadgets/Visao-geral|Gadgets]]
- Instalação, CSS e i18n do pacote: [[SeedGrid/SeedGrid-components/fundamentos/Visao-geral|Fundamentos]]

## Componentes

| Componente | Exportado | Para que serve | Showcase |
|---|---|---|---|
| `SgDiscardDigit` | sim (+ `SgDiscardDigitHandle`) | Pilha de folhas; a do topo é descartada/chega ao trocar o valor; paginação imperativa via `ref`. | `/components/digits/sg-discard-digit` |
| `SgFadeDigit` | sim | Card com fade-out/fade-in (200 ms fixos). | `/components/digits/sg-fade-digit` |
| `SgFlipDigit` | sim | Card flip via `@pqina/flip` (import dinâmico, SSR-safe). | `/components/digits/sg-flip-digit` |
| `SgMatrixDigit` | sim | Texto em matriz de pontos 5×7 (LED). Aceita vários caracteres. | `/components/digits/sg-matrix-digit` |
| `SgNeonDigit` | sim | Texto com brilho neon e troca animada. | `/components/digits/sg-neon-digit` |
| `SgRoller3DDigit` | sim | Tambor vertical que rola até `value` dentro de `items`. | `/components/digits/sg-roller3d-digit` |
| `SgSegmentDigit` | sim | Segmentos SVG compactos com `currentColor`; suporta `:`. | `/components/digits/sg-segment-digit` |
| `SgSevenSegmentDigit` | sim (+ `SgSevenSegmentDigitPalette`) | Display LED de 7 segmentos com paletas, glow e skew; hexadecimal 0-F. | `/components/digits/sg-seven-segment-digit` |

Todos exportados pelo barrel `src/index.ts` (Confirmado). Os `index.ts` de cada subpasta (`src/digits/<x>/index.ts`) só reexportam e não são entradas do `exports` do `package.json` (apenas `"."` e `"./style.css"`).

## Quando usar qual

| Necessidade | Componente |
|---|---|
| Contador/placar estilo aeroporto | `SgFlipDigit` |
| Painel LED de texto livre | `SgMatrixDigit` |
| Relógio/visor numérico clássico | `SgSevenSegmentDigit` (grande, com paleta) ou `SgSegmentDigit` (pequeno, herda cor) |
| Rolagem tipo odômetro com conjunto de valores próprio | `SgRoller3DDigit` (`items`) |
| Paginação "folheando" | `SgDiscardDigit` + `ref` (`increasePage`/`decreasePage`) |
| Efeito decorativo/temático | `SgNeonDigit`, `SgFadeDigit` |

## Dependências

- `@pqina/flip` `^1.8.4` — dependência (não peer) do pacote, usada só por `SgFlipDigit`; tipagem local em `src/digits/flip-digit/pqina-flip.d.ts`. Confirmado (`package.json`).
- React (peer). Estilo via classes Tailwind compiladas no CSS do pacote e estilos inline; tokens `--sg-*` do tema em alguns componentes (ex.: `SgRoller3DDigit`, `SgSegmentDigit`).

## Testes

Não há teste dedicado aos dígitos em `packages/seedgrid-fe-components/tests/` (busca por `Digit` só encontra `i18n-components-contract.test.mjs`). Os dígitos são exercitados indiretamente por `tests/gadgets.test.mjs` (SgClock) — não executados nesta análise.

## Limitações e lacunas

- `SgFlipDigit` e `SgRoller3DDigit` não expõem o valor a tecnologias assistivas (sem `aria-label`/`role`). Confirmado.
- Nenhum dígito trata `prefers-reduced-motion` (não encontrado no código).
- Apenas `SgDiscardDigit`, `SgMatrixDigit`, `SgNeonDigit`, `SgSevenSegmentDigit` e `SgSegmentDigit` aceitam `style`; `SgFadeDigit`, `SgFlipDigit` e `SgRoller3DDigit` só `className`.
