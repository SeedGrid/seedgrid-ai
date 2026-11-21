---
description: "Padrões obrigatórios do front-end SeedGrid: usar sempre os componentes SeedGrid (@seedgrid/fe-components no React, seedgrid_components no Flutter) e o componente certo para cada tipo de dado (telefone, CPF, CNPJ, e-mail, moeda...). Leia antes de criar ou alterar qualquer tela React ou Flutter."
---
# Padrões do front-end SeedGrid

Regras **obrigatórias** para telas que usam os componentes SeedGrid. Cada regra tem um id (`FE-nn`) para citar em revisões (`sg-review`). Para detalhes de props e exemplos, consulte a KB: comece por `.ai/brain/SeedGrid/SeedGrid-components/Indice.md` e abra só a nota do grupo necessário.

Como ler:

- **Regras comuns** (FE-01 a FE-46 e a seção "CRUDs") valem para React e para Flutter, com o mesmo nome de componente `Sg...`. O papel de React é o `frontend-react`; o de Flutter é o `frontend-flutter`.
- **Regras só de Flutter** (FE-50 em diante, seção "Só Flutter") ficam no fim.
- Os dois lados mantêm **paridade de comportamento**: o contrato de valores é o mesmo e a diferença deliberada está registrada em `SeedGrid-components/flutter/Paridade.md` e `SeedGrid-components/flutter/Divergencias.md`. Quem encontrar uma diferença nova a reporta ao coordenador (sessão principal); não a "corrige" no outro lado.
- Nas regras comuns, os exemplos de código e a coluna "O que o `onChange` entrega" descrevem o **React**. No Flutter confira o tipo na nota `API` do grupo em `SeedGrid-components/flutter/` antes de afirmar (FE-03).

## Regras comuns (React e Flutter)

### Componentes SeedGrid primeiro

- **FE-01.** Use componentes SeedGrid para toda a interface. Só use elemento HTML cru (`<input>`, `<button>`, `<select>`, `<textarea>`, `<table>`) se **não existir** componente SeedGrid equivalente; nesse caso, justifique em comentário curto.
- **FE-02.** Antes de criar um componente novo, procure no índice da KB se já existe um que atenda. Não reimplemente o que o SeedGrid já oferece. Se não existir, crie o componente local no padrão SeedGrid (HO-10) e sugira a promoção no fim do plano.
- **FE-03.** Não invente props. Confirme nome e tipo na nota `API` do grupo; se não achar, diga que não encontrou.

### Componente certo para cada dado

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

#### Como aplicar FE-10 a FE-19

- **FE-25. Valor monetário é sempre `SgInputCurrency`.** Preço, mensalidade, taxa, saldo, limite, desconto, excedente: tudo que é dinheiro. Nunca `SgInputText`, `SgInputNumber` nem `<input type="number">`, mesmo que o campo "só guarde um número". A moeda vem de `currency` (padrão `BRL`) e as casas de `decimals`; limites em `minValue`/`maxValue`.
- **FE-26. Estado do formulário guarda o texto que o componente entrega** e a conversão acontece só no envio: dinheiro e decimais com `parseDecimalInput` (a API recebe número ou string decimal, conforme o contrato); data como ISO; inteiro com `Number.parseInt(v, 10)`. Não converta a cada tecla.
- **FE-27. CPF, CNPJ, telefone e CEP chegam mascarados.** Se a API espera só dígitos, aplique `onlyDigits` no envio e `maskCpf`/`maskCnpj`/`maskPhone`/`maskPostalCodeBR` ao exibir um valor vindo da API. Confira no contrato da API antes de decidir; não duplique a regra de máscara à mão.
- **FE-28. Não reimplemente a validação** que o componente já faz (dígito verificador do CPF/CNPJ, formato de e-mail, tamanho do CEP, idade mínima). Use `required`, `validation` e `onValidation` do próprio componente. Consulta externa é opt-in: `validateWithPublicaCnpj` (CNPJ) e `validateWithViaCep` (CEP).
- **FE-29. Campo "documento" sem tipo fixo** (cliente pessoa física ou jurídica) usa `SgInputCPFCNPJ`; com tipo fixo, `SgInputCPF` ou `SgInputCNPJ`. Dois campos `SgInputText` com troca manual de máscara violam a regra.

### Estrutura e feedback

- **FE-30.** Botões: `SgButton`. Layout: `SgStack`, `SgGrid`, `SgCard` etc. no lugar de `div` com flex/grid escritos à mão.
- **FE-31.** Tabelas de dados: `SgDatatable`, paginada e ordenada no servidor quando a lista puder crescer.
- **FE-32.** Confirmação de ação destrutiva: `SgConfirmationDialog`, nunca `window.confirm`/`alert`.
- **FE-33.** Avisos ao usuário: `toast` (ou `sgWhistle`), não `alert`.
- **FE-34.** Carregamento: `SgSkeleton` (tabelas com skeleton em formato de tabela).
- **FE-35.** Textos para o usuário em linguagem de negócio, não detalhe técnico.

### CRUDs

Telas de cadastro seguem a skill do lado: `sg-crud-front` (React/Next: páginas `*_list` e `*_edit`, `publicId` nas URLs, proxy em `app/api/...`) ou `sg-crud-front-flutter` (Flutter: telas separadas de lista e de formulário). Nunca exponha o `id` numérico quando houver `publicId`.

- **FE-36.** Tabela de cadastro (`SgDatatable` nas listas dos cruds) traz o `publicId` em uma coluna ID, **mostrando só os 5 últimos caracteres, com reticências antes (`…385e8`), e um ícone de copiar ao lado** que copia o `publicId` inteiro (como na lista de usuários do admin do report). Nenhuma coluna, link, filtro ou tela mostra o `id` numérico (exceção: a tela de auditoria e o export das extensions, ver BE-30); o `publicId` inteiro aparece na URL e no formulário de edição.

- **FE-37.** Ações de linha nas tabelas de cadastro usam os ícones **padrão: lápis para editar e lixeira para excluir**. Não invente outros ícones nem rótulos de texto. No React: `SgButton` com `appearance="ghost"`, `iconOnly`, `Edit3` do `lucide-react` (`severity="secondary"`) e `Trash2` (`severity="danger"`), com `aria-label` e `title` ("Editar <nome>", "Excluir <nome>") como na lista de usuários do admin; no Flutter, os equivalentes Material (`Icons.edit_outlined` e `Icons.delete_outline`). Esconda a ação sem a permissão correspondente e a lixeira de registro protegido. Excluir sempre pede confirmação (`SgConfirmationDialog`, nunca `confirm()` nativo). "Registro protegido" é o que a regra de negócio da entidade não deixa excluir (ex.: usuário root, perfil do sistema); num cadastro novo, só vale se o dono definir algum. Design novo de CRUD não troca esses ícones. **Ações de domínio ou de estado** (publicar, aposentar, desativar, reativar, importar) podem ter ícone próprio, sempre com `aria-label` e `title`, mas não ocupam o lugar de editar e excluir; "ver detalhes" não ganha ícone de olho: abre pelo nome do registro.
- **FE-38.** O **calendário da empresa** (dias úteis, feriados, semana de trabalho e exceções) **só existe em produto que marcou a extension opcional `business-days`** (a tela, a rota, o BFF, o menu e as permissões `BUSINESS_DAY_*` não vêm por padrão; P180) e, quando existe, é **uma única tela** (`app/dias-uteis/page.tsx`), no padrão da tela do `seedgrid-report-client`, e não um conjunto de cadastros (`holiday_list`, `holiday_edit`, `holiday_reference`, `week_profile`, `work_override_*`, `calendar`). A tela tem: ano e **Salvar**; "A semana da empresa" com um cartão por dia (Dia todo, Meio período ou Fechado, `SgRadioGroup`); legenda (feriado do cadastro, feriado móvel calculado, meio período, a empresa não abre) com os dias úteis do ano; grade de 12 meses com os dias úteis de cada mês e o clique no dia para cadastrar, editar ou excluir feriado, abrir a empresa naquele dia ou fechar só naquele dia; feriados móveis em seção recolhível com "voltar a herdar". O seletor de **empresa só aparece quando a conta tem mais de uma**; com uma só, a tela mostra o nome e o calendário é dela. As **permissões são por empresa** (token da empresa escolhida): sem leitura a tela mostra "sem permissão" (mantendo o seletor para voltar); sem alterar, esconde o Salvar e deixa a semana e a grade só leitura; sem criar, não oferece novo feriado nem abrir o dia; sem excluir, esconde Excluir. Fala com a extension `business-days` (BFF `/api/business-days/*`). Não gere menu nem telas separadas para feriados e semana de trabalho.

- **FE-39.** O **cadastro de empresas** (company) é **sempre pessoa jurídica**: a tela não tem campo "Tipo de pessoa" nem CPF opcional. A coluna `cpf_cnpj` da tabela existe só por compatibilidade com o b2c; no formulário de empresa o documento é CNPJ. Os campos usam os componentes certos (FE-10 a FE-13, FE-27, FE-29): CNPJ com `SgInputCNPJ`, CEP com `SgInputPostalCode`, telefone, celular e WhatsApp (inclusive os do **representante legal**) com `SgInputPhone`, e-mail com `SgInputEmail`, CPF do representante com `SgInputCPF`. **Nunca `SgInputText` para documento, telefone, CEP ou e-mail.** A busca é ligada: `SgInputCNPJ` com `validateWithPublicaCnpj` e `onPublicaCnpjResult` (o componente só consulta e devolve a resposta crua; a **tela** preenche razão social, nome fantasia, endereço e telefone, como faz o `CompanyEditor` do `fe-security`), e `SgInputPostalCode` com `validateWithViaCep` e `onViaCepResult`. Reaproveite o `CompanyEditor` do scaffold do `fe-security` em vez de reescrever o formulário. Errado: `<SgInputText id="company-cpf-cnpj" label="CNPJ" />` e um seletor PF/PJ. Certo: `<SgInputCNPJ id="company-cnpj" validateWithPublicaCnpj onPublicaCnpjResult={preencherEmpresa} />`. Motivo: o `company_edit` do boilerplate `subdomain-tenancy` nasceu com 16 `SgInputText` e o Display herdou o erro (P180).
- **FE-40.** O **menu lateral tem sempre o grupo "Segurança"**, no app do cliente (`frontend`) e no admin, com as telas de segurança e auditoria: Usuários, Convidar usuário externo (quando o produto convida), Perfis, API Keys e Auditoria. Item de segurança solto na raiz do menu é erro. **Empresas** é um item próprio, logo acima do grupo, por ser cadastro de negócio; a posição de ambos no menu é a da FE-44. Cada `href` do menu tem a `page.tsx` correspondente e a permissão da tela. Errado: `data.ts` com Usuários, Perfis, API Keys e Auditoria como itens de primeiro nível no front enquanto o admin agrupa. Certo: o mesmo agrupamento nos dois. Motivo: o `data.ts` do front do boilerplate era uma lista plana e o admin tinha o grupo; o Display mostrou o front sem ele (P180).
- **FE-41.** **Contador de uso só aparece se o domínio tem esse contador.** Trial, condições comerciais, termos do plano, cartões de plano e textos de apoio só falam de "requisições", "solicitações" ou "MB armazenados" quando o produto declara o contador correspondente (ver BE-74). O contador `requests` e o texto "Mais solicitações de IA, mais relatórios" do boilerplate são **demonstração e texto de outro produto** e não vão para o produto. Errado: o Display mostrando "Requisições incluído no plano" sem ter nenhum recurso que conte requisições. Certo: o bloco do contador só existe para o que o produto declarou, e os textos de plano são neutros ou do próprio produto.
- **FE-42.** **O cliente nunca vê instrução de administrador.** Plano sem preço configurado no provedor de pagamento (Stripe) **não é assinável** no app do cliente: o botão "Assinar" fica desabilitado ou escondido e o texto é de negócio ("este plano ainda não está disponível"). A mensagem "Cadastre o ID de preço do Stripe nesse plano pelo admin" existe **só** no admin. Todo plano ativo do produto entregue tem preço no provedor (checklist de entrega). Reforça FE-35. Errado: o modal de planos do cliente dizendo "Cadastre o ID de preço pelo admin". Certo: o plano sem preço não aparece como assinável e o admin mostra o aviso para quem configura.
- **FE-43.** **Componente SeedGrid usa `enabled`, nunca `disabled`.** Para desabilitar um campo, botão ou item `Sg...` passe `enabled={false}` (ou `enabled={!salvando}`); a prop `disabled` **não existe** nos componentes (foi trocada por `enabled` na P149, igual no React e no Flutter, onde a convenção de tradução mantém o nome canônico). O `SgButton` também tem `loading`: o botão fica inativo se `enabled` for `false` ou `loading` for verdadeiro. Elementos HTML nativos (`<button>`, `<input>`) continuam com `disabled`. Errado: `<SgButton label="Salvar" disabled={salvando} />`. Certo: `<SgButton label="Salvar" enabled={!salvando} />`. Verificação automática: `npm run check-sg-enabled` (parte do `npm test`) reprova `disabled` em tag `<Sg...>` nos boilerplates. Fontes: `SeedGrid-components/react/buttons/API.md` e `SeedGrid-components/flutter/inputs-midia/API.md` (P149).
- **FE-44.** **Empresas e Segurança são sempre as últimas opções do menu lateral**, nessa ordem (Empresas, depois o grupo Segurança), logo acima do menu do usuário (`sgUserMenu`). Os itens do domínio do produto vêm antes. Vale para o app do cliente e para o admin (no admin, o grupo Segurança fica por último e não há Empresas). Errado: Empresas e Segurança no topo do menu, com os itens do produto depois (como estava no Display). Certo: Dispositivos, Mídias, Campanhas… e, no fim, Empresas e Segurança. Verificação: `check-padroes-tela` (regra `menu-ordem`). Motivo: o dono pediu que as áreas de administração do cliente fiquem juntas, perto do menu do usuário (P180).
- **FE-45.** **A configuração do próprio produto fica no `sgUserMenu`, não no menu lateral.** Se o app tem tela de configuração (por exemplo "Configuração do Display"), ela entra na entrada **"Configurações"** do menu do usuário, junto de "Meu perfil", "Minha assinatura" e "Sair". O menu lateral fica só com o domínio do produto e, no fim, Empresas e Segurança (FE-44). Errado: "Configuração do Display" como último item do menu lateral. Certo: "Configurações" no `sgUserMenu` apontando para a tela de configuração do produto. Motivo: o dono pediu em 2026-11-20 (P180).
- **FE-46.** **Ação assíncrona de botão (salvar, confirmar, excluir, enviar) devolve a Promise ao `SgButton`**: `onClick={() => salvar()}` ou `onClick={salvar}`, nunca `onClick={() => void salvar()}` nem um bloco `{ salvar(); }`. O `SgButton` só entra em loading sozinho (desabilitado, `aria-busy`, ignora cliques seguidos) quando o `onClick` devolve a Promise; com `void` o botão fica livre e **o clique repetido duplica o registro** (defeito grave visto no Display em 2026-11-21, P190). Além do botão, a função de salvar trava com uma guarda própria (`useRef`) para o caso de Enter no formulário ou dois atalhos. (P190.)

## Só Flutter (`frontend-flutter`)

- **FE-50.** Use o pacote `seedgrid_components`; para traduzir um padrão do React use `SeedGrid-components/flutter/Traducao-React-para-Dart.md`, não invente equivalente.
- **FE-51.** Valor inicial de componente de entrada: `initialValue`; `SgInputDateTime` não tem `initialValue` e usa `defaultValue`. Dentro de `SgForm`, dê o valor inicial por `defaultValues` do `SgFormController` (ou `reset`) com o tipo certo (número para número); ver `SeedGrid-components/flutter/Divergencias.md`.
- **FE-52.** Formulário com `SgForm` e `SgFormController` (no lugar do react-hook-form); `dispose` do controller. Sem `setState` de página para valor de campo (ADR 63): `ListenableBuilder`/`ValueListenableBuilder`.
- **FE-53 (proposta, a confirmar com o dono).** Mudança visual leva teste de widget e golden test; golden usa a fonte de teste do Flutter e não compara texto com o React.
- **FE-54.** Componente `parcial` ou com ressalva em `Paridade.md` tem limite conhecido; cite-o na entrega em vez de contornar com widget local.
