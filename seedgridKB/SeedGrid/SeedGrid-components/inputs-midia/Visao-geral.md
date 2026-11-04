---
tags: [seedgrid, component, frontend, react, inputs-midia]
fonte: front/seedgrid-fe-components/packages/seedgrid-fe-components/src/inputs
branch: main
commit: bb0ad1f
analisado-em: 2026-11-04
description: "Data e hora, imagem e câmera em React (@seedgrid/fe-components): quando usar SgInputDateTime, SgFileUpload, SgImageUpload e SgCameraCapture, composição, testes e limitações. Plataforma React; o equivalente Flutter está em flutter/ com o mesmo nome de grupo."
plataforma: react
---

# Data e hora, imagem e câmera — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-midia/Visao-geral|Visão geral — Data e hora, imagem e câmera (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

> **Nova API do upload (P141, validada pelo dono no Flutter em 2026-11-04):** `SgFileUpload` é o componente base de arquivos e `SgImageUpload` é composição dele. O valor é **sempre uma lista**, `maxFiles` (padrão `1`) substitui o `multiple`, `maxSizePerFile`/`maxSizeTotal` aceitam bytes ou texto como `"1.5MB"`, e o tipo é conferido pelo conteúdo. **Sem retrocompatibilidade**: `maxSizeBytes` e o valor `File | string | null` do `SgImageUpload` deixaram de existir. Código no commit local `bb0ad1f` do `fe-components`. Ver [[SeedGrid/SeedGrid-components/flutter/inputs-midia/API|API Flutter]] (a mesma API).

> **Estado de publicação (2026-11-04): React publicado no npm em 2026.11.2.** `@seedgrid/fe-core`, `fe-commons`, `fe-components`, `fe-theme` e `fe-playground` saíram na versão `2026.11.2` (job "Publish FE Packages", a partir do commit `9552636` do `fe-components`, que inclui `839e245` e `bb0ad1f`: data e hora, imagem e câmera, `SgFileUpload` e `SgImageUpload` refeito). Versões até `2026.11.1` não têm `SgFileUpload`: exija `>=2026.11.2`. O MCP de componentes foi implantado com os manifestos novos (`d3f5f64`). O Flutter está na `main` do `fe-flutter` (commit `80aa5cb`); o **pacote Flutter não está publicado no pub.dev** (o dono não liberou). Planos P132, P133, P134 e P141.

Referência completa: [[SeedGrid/SeedGrid-components/inputs-midia/API|API de data e hora, imagem e câmera]]. Código: [[SeedGrid/SeedGrid-components/inputs-midia/Exemplos|Exemplos de data e hora, imagem e câmera]].

## Para que serve

| Componente | Para que serve | Exportado |
|---|---|---|
| `SgInputDateTime` | Campo de data e hora que recebe e entrega instantes ISO 8601 em UTC, mostrando a hora no fuso escolhido, com limites, passo de minutos e validação. | sim |
| `SgFileUpload` | **Base de arquivos:** escolhe um ou vários arquivos de qualquer tipo (clique ou arrastar e soltar), confere o tipo pelo conteúdo, valida quantidade e tamanho (por arquivo e total) e mostra a lista com ícone do tipo. O valor é sempre uma lista. Não envia nada ao servidor. | sim |
| `SgImageUpload` | **Composição** do `SgFileUpload` só para imagens: miniaturas (grade com `maxFiles` maior que 1), dimensão mínima e proporção. Funciona igual ao `SgFileUpload`. Não envia nada ao servidor. | sim |
| `SgCameraCapture` | Pré-visualização da câmera com guia de enquadramento (oval ou retângulo), alternância frontal/traseira e captura que devolve um JPEG ao pai. Não envia nada ao servidor. | sim |

Os quatro ficam em `src/inputs/` e são exportados pela raiz do pacote. **Confirmado** em `src/index.ts` e nos `*.meta.ts`.

## Quando usar

- **`SgInputDateTime`:** agendamentos, compromissos, prazos e qualquer timestamp que precise trafegar como instante UTC. Para **só data**, use `SgInputDate`; para texto livre, `SgInputText`. Para intervalo início/fim, combine dois campos com `minDate`/`maxDate`.
- **`SgFileUpload`:** anexos e documentos (PDF, planilha, áudio, qualquer arquivo), um ou vários, com limite de quantidade e de tamanho. Não serve para recorte nem para enviar ao servidor (o envio é do host).
- **`SgImageUpload`:** foto de perfil, avatar, logotipo, foto de documento, galeria de imagens (`maxFiles` maior que 1). Não serve para arquivos que não são imagem (use o `SgFileUpload`), nem para recorte ou compressão (**não fazem parte** do componente).
- **`SgCameraCapture`:** tirar a foto na hora (selfie, documento, portaria) com tratamento de permissão negada. Não grava vídeo nem áudio; não analisa qualidade nem reconhece rosto (isso é do host).
- **Câmera × galeria:** combine os dois: câmera para tirar na hora, upload para escolher da galeria.

Essas recomendações vêm dos `aiHints` dos `*.meta.ts` (**Confirmado**) e das props existentes (**Inferência**).

## Regras que valem para os quatro

- **O componente nunca envia ao servidor.** `SgFileUpload` e `SgImageUpload` entregam uma **lista** (`SgFileValue[]`: `File` escolhido agora ou `{ name, url }` de arquivo já salvo) em `onChange`; `SgCameraCapture` entrega um `Blob` JPEG em `onCapture`. O envio (upload, serviço de arquivos) é do host. **Confirmado**.
- **Erros chegam por callback com código estável**, não só por texto: `onError(code, message)`. O `message` já vem traduzido; use o `code` para a lógica.
  - `SgFileUpload` e `SgImageUpload`: `type`, `size`, `total`, `count` e, só na imagem, `dimension` e `aspect`; `onError(code, message, fileName)` vem **por arquivo** e os demais seguem válidos;
  - `SgCameraCapture`: `permission`, `noCamera`, `failed`.
- **Textos traduzidos** em cinco idiomas pelas chaves `components.inputs.fileupload.*`, `components.inputs.imageupload.*` e equivalentes (ver [[SeedGrid/SeedGrid-components/inputs-midia/API#Internacionalização|API]]).
- **Lógica pura compartilhada com o Flutter**: `dateTimeLogic.ts`, `fileUploadLogic.ts`, `imageUploadLogic.ts` e `cameraLogic.ts` geram vetores de teste que o Dart também confere, então as regras (fuso, validação de arquivo, guia, classificação de erro) são as mesmas nas duas plataformas.

## Composição e dependências

- `SgInputDateTime` é montado sobre `SgInputText` (rótulo, `labelPosition`, `clearButton`, `elevation`, etc.): as props de aparência do `SgInputText` valem aqui. Sem dependência nova.
- `SgFileUpload` importa `react`, o i18n do pacote, o `Controller` do `react-hook-form` e ícones do `lucide-react` (`File`, `FileArchive`, `FileAudio`, `FileImage`, `FileSpreadsheet`, `FileText`, `FileVideo`, `Presentation`, `Upload`, `X`). `SgImageUpload` **monta um `SgFileUpload`** (composição) e acrescenta o ícone `ImageOff` e as regras de imagem. `SgCameraCapture` importa só `react`, o i18n e ícones do `lucide-react`. Nenhuma dependência nova no pacote. **Confirmado** nos `import` dos arquivos `.tsx`.
- **Formulário (react-hook-form):** `SgInputDateTime`, `SgFileUpload` e `SgImageUpload` aceitam `name`/`control`; o valor no formulário é a lista `SgFileValue[]`. `SgCameraCapture` **não** se liga ao formulário (`acceptsDataBinding: false`); guarde o `Blob` no estado do pai.

## Testes (lidos, **não executados** por esta KB)

`tests/input-datetime.test.mjs`, `tests/file-upload-logic.test.mjs`, `tests/file-upload-dom.test.mjs`, `tests/image-upload.test.mjs`, `tests/image-upload-dom.test.mjs` e `tests/camera-capture.test.mjs`, mais os vetores de paridade. A câmera foi testada **só com câmera simulada**.

## Limitações e pontos de atenção

- **Câmera exige contexto seguro** (HTTPS ou `localhost`) e a permissão do usuário. Sem isso o componente mostra o estado `permission`, `noCamera` ou `failed`. **Inferência** a partir de `getUserMedia`.
- **Não testado em dispositivo real**: a câmera só foi validada com mock. Teste em celular antes de depender dela em produção.
- `SgInputDateTime`: o campo guarda **instantes**. Quem trabalha com "data e hora sem fuso" (horário de parede) deve fixar `timeZone`. O padrão é o fuso local do navegador.
- `SgFileUpload` e `SgImageUpload`: nada é enviado e nada é recortado ou comprimido. A leitura de dimensões do `SgImageUpload` só roda quando há `minWidth`, `minHeight` ou `aspect`. A paridade com o Flutter é **parcial**: o React aceita arrastar e soltar e entrega `File` do navegador; o Flutter abre o seletor do sistema e entrega `SgFile`.
- `SgCameraCapture` não tem `onFrame`: a análise de qualidade fica fora da versão 1.
- Nenhum dos quatro está publicado ainda (ver o aviso no topo).
