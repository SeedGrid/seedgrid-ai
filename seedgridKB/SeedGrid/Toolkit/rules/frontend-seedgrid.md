---
description: "Padrões obrigatórios do front-end SeedGrid: usar sempre os componentes @seedgrid/fe-components e o componente certo para cada tipo de dado (telefone, CPF, CNPJ, e-mail, moeda...). Leia antes de criar ou alterar qualquer tela React."
---
# Padrões do front-end SeedGrid

Regras **obrigatórias** para telas React que usam `@seedgrid/fe-components`. Cada regra tem um id (`FE-nn`) para citar em revisões (`seedgrid-review`). Para detalhes de props e exemplos, consulte a KB: comece por `.ai/brain/SeedGrid/SeedGrid-components/Indice.md` e abra só a nota do grupo necessário.

## Componentes SeedGrid primeiro

- **FE-01.** Use componentes SeedGrid para toda a interface. Só use elemento HTML cru (`<input>`, `<button>`, `<select>`, `<textarea>`, `<table>`) se **não existir** componente SeedGrid equivalente; nesse caso, justifique em comentário curto.
- **FE-02.** Antes de criar um componente novo, procure no índice da KB se já existe um que atenda. Não reimplemente o que o SeedGrid já oferece.
- **FE-03.** Não invente props. Confirme nome e tipo na nota `API` do grupo; se não achar, diga que não encontrou.

## Componente certo para cada dado

Nunca use `SgInputText` (nem `<input>` com máscara própria) para um dado que tem componente específico:

| Dado | Componente |
| --- | --- |
| **FE-10.** Telefone, celular, WhatsApp | `SgInputPhone` |
| **FE-11.** CPF | `SgInputCPF` |
| **FE-12.** CNPJ | `SgInputCNPJ` |
| **FE-13.** Campo que aceita CPF **ou** CNPJ | `SgInputCPFCNPJ` |
| **FE-14.** E-mail | `SgInputEmail` |
| **FE-15.** CEP / código postal | `SgInputPostalCode` |
| **FE-16.** Senha | `SgInputPassword` |
| **FE-17.** Valor monetário | `SgInputCurrency` (`currency="BRL"`, `decimals={2}`) |
| **FE-18.** Número (inteiro ou decimal não monetário) | `SgInputNumber` |
| **FE-19.** Data / data de nascimento | `SgInputDate` / `SgInputBirthDate` |
| **FE-20.** Busca remota com debounce | `SgInputTextSearch` |
| **FE-21.** Código de uso único (OTP) | `SgInputOTP` |
| **FE-22.** Sim/não | `SgToggleSwitch` |
| **FE-23.** Uma opção de lista fixa ou carregada uma vez | `SgCombobox` (lista remota ou grande: `SgAutocomplete`) |
| **FE-24.** Texto longo | `SgInputTextArea` |

## Estrutura e feedback

- **FE-30.** Botões: `SgButton`. Layout: `SgStack`, `SgGrid`, `SgCard` etc. no lugar de `div` com flex/grid escritos à mão.
- **FE-31.** Tabelas de dados: `SgDatatable`, paginada e ordenada no servidor quando a lista puder crescer.
- **FE-32.** Confirmação de ação destrutiva: `SgConfirmationDialog`, nunca `window.confirm`/`alert`.
- **FE-33.** Avisos ao usuário: `toast` (ou `sgWhistle`), não `alert`.
- **FE-34.** Carregamento: `SgSkeleton` (tabelas com skeleton em formato de tabela).
- **FE-35.** Textos para o usuário em linguagem de negócio, não detalhe técnico.

## CRUDs

Telas de cadastro seguem a skill `seedgrid-crud` (páginas `*_list` e `*_edit`, `publicId` nas URLs, proxy em `app/api/...`). Nunca exponha o `id` numérico ao navegador quando houver `publicId`.
