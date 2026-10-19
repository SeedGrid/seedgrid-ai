---
description: "Padrões obrigatórios do front-end SeedGrid: usar sempre os componentes @seedgrid/fe-components e o componente certo para cada tipo de dado (telefone, CPF, CNPJ, e-mail, moeda...). Leia antes de criar ou alterar qualquer tela React."
---
# Padrões do front-end SeedGrid

Regras **obrigatórias** para telas React que usam `@seedgrid/fe-components`. Cada regra tem um id (`FE-nn`) para citar em revisões (`sg-review`). Para detalhes de props e exemplos, consulte a KB: comece por `.ai/brain/SeedGrid/SeedGrid-components/Indice.md` e abra só a nota do grupo necessário.

## Componentes SeedGrid primeiro

- **FE-01.** Use componentes SeedGrid para toda a interface. Só use elemento HTML cru (`<input>`, `<button>`, `<select>`, `<textarea>`, `<table>`) se **não existir** componente SeedGrid equivalente; nesse caso, justifique em comentário curto.
- **FE-02.** Antes de criar um componente novo, procure no índice da KB se já existe um que atenda. Não reimplemente o que o SeedGrid já oferece.
- **FE-03.** Não invente props. Confirme nome e tipo na nota `API` do grupo; se não achar, diga que não encontrou.

## Componente certo para cada dado

Nunca use `SgInputText` (nem `<input>` com máscara própria) para um dado que tem componente específico:

| Dado | Componente | O que o `onChange` entrega |
| --- | --- | --- |
| **FE-10.** Telefone, celular, WhatsApp | `SgInputPhone` | texto mascarado `(11) 98765-4321` (10 ou 11 dígitos) |
| **FE-11.** CPF | `SgInputCPF` | texto mascarado `000.000.000-00` |
| **FE-12.** CNPJ (numérico ou alfanumérico) | `SgInputCNPJ` | texto mascarado, letras em maiúsculas |
| **FE-13.** Campo que aceita CPF **ou** CNPJ | `SgInputCPFCNPJ` | texto mascarado do tipo detectado |
| **FE-14.** E-mail | `SgInputEmail` | texto; bloqueia domínio temporário por padrão |
| **FE-15.** CEP / código postal | `SgInputPostalCode` (`country` para fora do BR) | texto mascarado do país |
| **FE-16.** Senha | `SgInputPassword` | texto |
| **FE-17.** Valor monetário | `SgInputCurrency` (`currency="BRL"`, `decimals={2}`) | string canônica `"1234.56"` (sem símbolo nem milhar) |
| **FE-18.** Número (inteiro ou decimal não monetário) | `SgInputNumber` | string canônica |
| **FE-19.** Data (prazo, vencimento, agendamento) | `SgInputDate` (`minDate`/`maxDate`) | string ISO `yyyy-MM-dd` |
| **FE-19b.** Data de nascimento | `SgInputBirthDate` (`minAge` para idade mínima) | string ISO `yyyy-MM-dd` |
| **FE-20.** Busca remota com debounce | `SgInputTextSearch` | texto |
| **FE-21.** Código de uso único (OTP) | `SgInputOTP` |
| **FE-22.** Sim/não | `SgToggleSwitch` |
| **FE-23.** Uma opção de lista fixa ou carregada uma vez | `SgCombobox` (lista remota ou grande: `SgAutocomplete`) |
| **FE-24.** Texto longo | `SgInputTextArea` |

### Como aplicar FE-10 a FE-19

- **FE-25. Valor monetário é sempre `SgInputCurrency`.** Preço, mensalidade, taxa, saldo, limite, desconto, excedente: tudo que é dinheiro. Nunca `SgInputText`, `SgInputNumber` nem `<input type="number">`, mesmo que o campo "só guarde um número". A moeda vem de `currency` (padrão `BRL`) e as casas de `decimals`; limites em `minValue`/`maxValue`.
- **FE-26. Estado do formulário guarda o texto que o componente entrega** e a conversão acontece só no envio: dinheiro e decimais com `parseDecimalInput` (a API recebe número ou string decimal, conforme o contrato); data como ISO; inteiro com `Number.parseInt(v, 10)`. Não converta a cada tecla.
- **FE-27. CPF, CNPJ, telefone e CEP chegam mascarados.** Se a API espera só dígitos, aplique `onlyDigits` no envio e `maskCpf`/`maskCnpj`/`maskPhone`/`maskPostalCodeBR` ao exibir um valor vindo da API. Confira no contrato da API antes de decidir; não duplique a regra de máscara à mão.
- **FE-28. Não reimplemente a validação** que o componente já faz (dígito verificador do CPF/CNPJ, formato de e-mail, tamanho do CEP, idade mínima). Use `required`, `validation` e `onValidation` do próprio componente. Consulta externa é opt-in: `validateWithPublicaCnpj` (CNPJ) e `validateWithViaCep` (CEP).
- **FE-29. Campo "documento" sem tipo fixo** (cliente pessoa física ou jurídica) usa `SgInputCPFCNPJ`; com tipo fixo, `SgInputCPF` ou `SgInputCNPJ`. Dois campos `SgInputText` com troca manual de máscara violam a regra.

## Estrutura e feedback

- **FE-30.** Botões: `SgButton`. Layout: `SgStack`, `SgGrid`, `SgCard` etc. no lugar de `div` com flex/grid escritos à mão.
- **FE-31.** Tabelas de dados: `SgDatatable`, paginada e ordenada no servidor quando a lista puder crescer.
- **FE-32.** Confirmação de ação destrutiva: `SgConfirmationDialog`, nunca `window.confirm`/`alert`.
- **FE-33.** Avisos ao usuário: `toast` (ou `sgWhistle`), não `alert`.
- **FE-34.** Carregamento: `SgSkeleton` (tabelas com skeleton em formato de tabela).
- **FE-35.** Textos para o usuário em linguagem de negócio, não detalhe técnico.

## CRUDs

Telas de cadastro seguem a skill `sg-crud-front` (páginas `*_list` e `*_edit`, `publicId` nas URLs, proxy em `app/api/...`). Nunca exponha o `id` numérico ao navegador quando houver `publicId`.
