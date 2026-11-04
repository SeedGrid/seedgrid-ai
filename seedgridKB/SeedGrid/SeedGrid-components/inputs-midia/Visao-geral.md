---
tags: [seedgrid, component, frontend, react, inputs-midia]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs
branch: main
commit: 839e245
analisado-em: 2026-11-04
description: "Data e hora, imagem e câmera em React (@seedgrid/fe-components): quando usar SgInputDateTime, SgImageUpload e SgCameraCapture, composição, testes e limitações. Plataforma React; o equivalente Flutter está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Data e hora, imagem e câmera — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Visao-geral|Visão geral — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **API do `SgImageUpload` vai mudar (P141, decidido pelo dono em 2026-11-04):** o Flutter já usa a nova (valor sempre `lista`, `maxFiles`, `maxSizePerFile`/`maxSizeTotal` com texto como `"1.5MB"`, e o novo `SgFileUpload` como base); **o React ainda tem a API antiga descrita abaixo** (`File`, `maxSizeBytes`) até a rodada P141.F4, depois da validação do Flutter. Ver [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API Flutter]].

> **Estado de publicação (2026-11-04): ainda não publicado no npm.** Os três componentes estão no commit `839e245` do `fe-components`, **só local** (sem push): o push na `main` publica o pacote e o showcase, e depende do teste do dono. Até a publicação, `import { SgInputDateTime } from "@seedgrid/fe-components"` falha nas versões já publicadas (até 2026.11.1). O Flutter já está na `main` do `fe-flutter` (commit `6a35c93`, pacote não publicado no pub.dev). Planos P132, P133 e P134.

Referência completa: [[SeedGrid/SeedGrid-components/inputs-midia/API|API de data e hora, imagem e câmera]]. Código: [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos de data e hora, imagem e câmera]].

## Para que serve

| Componente | Para que serve | Exportado |
|---|---|---|
| `SgInputDateTime` | Campo de data e hora que recebe e entrega instantes ISO 8601 em UTC, mostrando a hora no fuso escolhido, com limites, passo de minutos e validação. | sim |
| `SgImageUpload` | Escolhe uma imagem (clique ou arrastar e soltar), valida tipo, tamanho, dimensão mínima e proporção, mostra a pré-visualização e permite remover. Não envia nada ao servidor. | sim |
| `SgCameraCapture` | Pré-visualização da câmera com guia de enquadramento (oval ou retângulo), alternância frontal/traseira e captura que devolve um JPEG ao pai. Não envia nada ao servidor. | sim |

Os três ficam em `src/inputs/` e são exportados pela raiz do pacote. **Confirmado** em `src/index.ts` e nos `*.meta.ts`.

## Quando usar

- **`SgInputDateTime`:** agendamentos, compromissos, prazos e qualquer timestamp que precise trafegar como instante UTC. Para **só data**, use `SgInputDate`; para texto livre, `SgInputText`. Para intervalo início/fim, combine dois campos com `minDate`/`maxDate`.
- **`SgImageUpload`:** foto de perfil, avatar, logotipo, foto de documento. Não serve para arquivos que não são imagem (PDF, planilha), nem para recorte ou compressão (**não fazem parte** do componente).
- **`SgCameraCapture`:** tirar a foto na hora (selfie, documento, portaria) com tratamento de permissão negada. Não grava vídeo nem áudio; não analisa qualidade nem reconhece rosto (isso é do host).
- **Câmera × galeria:** combine os dois: câmera para tirar na hora, upload para escolher da galeria.

Essas recomendações vêm dos `aiHints` dos `*.meta.ts` (**Confirmado**) e das props existentes (**Inferência**).

## Regras que valem para os três

- **O componente nunca envia ao servidor.** `SgImageUpload` entrega um `File` em `onChange`; `SgCameraCapture` entrega um `Blob` JPEG em `onCapture`. O envio (upload, serviço de arquivos) é do host. **Confirmado**.
- **Erros chegam por callback com código estável**, não só por texto: `onError(code, message)`. O `message` já vem traduzido; use o `code` para a lógica.
  - `SgImageUpload`: `type`, `size`, `dimension`, `aspect`;
  - `SgCameraCapture`: `permission`, `noCamera`, `failed`.
- **Textos traduzidos** em cinco idiomas pelas chaves `components.inputs.imageupload.*` e equivalentes (ver [[SeedGrid/SeedGrid-components/inputs-midia/API#Internacionalização|API]]).
- **Lógica pura compartilhada com o Flutter**: `dateTimeLogic.ts`, `imageUploadLogic.ts` e `cameraLogic.ts` geram vetores de teste que o Dart também confere, então as regras (fuso, validação, guia, classificação de erro) são as mesmas nas duas plataformas.

## Composição e dependências

- `SgInputDateTime` é montado sobre `SgInputText` (rótulo, `labelPosition`, `clearButton`, `elevation`, etc.): as props de aparência do `SgInputText` valem aqui. Sem dependência nova.
- `SgImageUpload` e `SgCameraCapture` importam só `react`, o i18n do pacote e ícones do `lucide-react` (`ImagePlus`, `Trash2`, `Camera`, `RefreshCw`, `SwitchCamera`); `SgImageUpload` usa ainda o `Controller` do `react-hook-form`. Nenhuma dependência nova no pacote. **Confirmado** nos `import` dos arquivos `.tsx`.
- **Formulário (react-hook-form):** `SgInputDateTime` e `SgImageUpload` aceitam `name`/`control`. `SgCameraCapture` **não** se liga ao formulário (`acceptsDataBinding: false`); guarde o `Blob` no estado do pai.

## Testes (lidos, **não executados** por esta KB)

`tests/input-datetime.test.mjs`, `tests/image-upload.test.mjs` e `tests/camera-capture.test.mjs`, mais os vetores de paridade. O relato da `front` (2026-11-04): React 358 testes ok antes do commit. A câmera foi testada **só com câmera simulada**.

## Limitações e pontos de atenção

- **Câmera exige contexto seguro** (HTTPS ou `localhost`) e a permissão do usuário. Sem isso o componente mostra o estado `permission`, `noCamera` ou `failed`. **Inferência** a partir de `getUserMedia`.
- **Não testado em dispositivo real**: a câmera só foi validada com mock. Teste em celular antes de depender dela em produção.
- `SgInputDateTime`: o campo guarda **instantes**. Quem trabalha com "data e hora sem fuso" (horário de parede) deve fixar `timeZone`. O padrão é o fuso local do navegador.
- `SgImageUpload`: a leitura de dimensões só roda quando há `minWidth`, `minHeight` ou `aspect`.
- `SgCameraCapture` não tem `onFrame`: a análise de qualidade fica fora da versão 1.
- Nenhum dos três está publicado ainda (ver o aviso no topo).
