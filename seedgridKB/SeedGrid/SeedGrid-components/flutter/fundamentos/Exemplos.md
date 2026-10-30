---
description: "Exemplos Dart dos fundamentos do SeedGrid em Flutter: formulário com SgForm e regras, controlador programático, idioma, tema claro/escuro, máscaras, validadores de senha e idade, consulta de CEP/CNPJ e cliente HTTP, conferidos contra a API por leitura."
tags: [seedgrid, front, component, flutter, dart, plataforma-flutter, fundamentos, exemplos]
plataforma: flutter
fonte: front/seedgrid-fe-flutter/packages
branch: main
commit: e9989b8
analisado-em: 2026-10-30
---

# Exemplos — Fundamentos (Flutter)

> **Plataforma: Flutter.** Exemplos em Dart; os de React estão em [[SeedGrid/SeedGrid-components/fundamentos/Exemplos|Exemplos — Fundamentos (React)]]. API: [[SeedGrid/SeedGrid-components/flutter/fundamentos/API|API (Flutter)]] · visão geral: [[SeedGrid/SeedGrid-components/flutter/fundamentos/Visao-geral|Visão geral (Flutter)]].

> **Como foram conferidos.** Escritos para esta nota e conferidos **por leitura** contra as assinaturas em `seedgrid_components`, `seedgrid_theme` e `seedgrid_commons` (commit `e9989b8`) e contra o uso real em `packages/seedgrid_components/test/form/`, `test/i18n/`, `apps/seedgrid_showcase/test/familiarity/formulario_screen.dart` e `apps/seedgrid_showcase/lib/main.dart`. **Não foram compilados nem executados** (sem `flutter test`/`flutter analyze` nesta análise). Os parâmetros `id`, `name`, `control`, `label`, `required` e `rules` dos campos vêm da API de cada widget ([[SeedGrid/SeedGrid-components/flutter/inputs-texto/API|Inputs de texto — Flutter]]). Importações usadas:
>
> ```dart
> import 'package:flutter/material.dart';
> import 'package:seedgrid_components/seedgrid_components.dart';
> // Só para máscaras, validadores e CEP/CNPJ chamados direto:
> import 'package:seedgrid_commons/seedgrid_commons.dart';
> ```

## 1. Formulário com `SgForm`, regras e envio

Equivale ao `useForm` + `handleSubmit` do React (ver [[SeedGrid/SeedGrid-components/flutter/Traducao-React-para-Dart|Tradução]]). O `SgButton` com `type: SgButtonType.submit` precisa estar dentro de um `SgForm`; o Enter em campo de uma linha também envia.

```dart
class CadastroForm extends StatefulWidget {
  const CadastroForm({super.key});

  @override
  State<CadastroForm> createState() => _CadastroFormState();
}

class _CadastroFormState extends State<CadastroForm> {
  final form = SgFormController(defaultValues: {'nome': '', 'email': ''});
  Map<String, Object?>? enviado;

  @override
  void dispose() {
    form.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SgForm(
      controller: form,
      onValid: (values) => setState(() => enviado = values),
      onInvalid: (errors) => debugPrint('Campos com erro: ${errors.keys}'),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SgInputText(
            id: 'nome',
            name: 'nome',
            control: form,
            label: 'Nome completo',
            required: true,
          ),
          const SizedBox(height: 12),
          SgInputEmail(
            id: 'email',
            name: 'email',
            control: form,
            label: 'E-mail',
            required: true,
          ),
          const SizedBox(height: 12),
          SgButton(label: 'Enviar', type: SgButtonType.submit),
          if (enviado != null) Text('Enviado: $enviado'),
        ],
      ),
    );
  }
}
```

Como `SgInputEmail` registra o validador próprio (formato e domínios descartáveis), um e-mail inválido faz o envio chamar `onInvalid`, ao contrário do React (decisão do dono de 2026-10-25, em [[SeedGrid/SeedGrid-components/flutter/Divergencias|Divergências]]).

## 2. Regras com mensagem e validação própria (`SgRules`)

```dart
final form = SgFormController(defaultValues: {'senha': '', 'confirma': ''});

// ...
SgInputPassword(
  id: 'senha',
  name: 'senha',
  control: form,
  label: 'Senha',
  rules: const SgRules(
    required: 'Informe a senha',
    minLength: SgRuleValue(8, 'Mínimo de 8 caracteres'),
  ),
),
SgInputPassword(
  id: 'confirma',
  name: 'confirma',
  control: form,
  label: 'Confirmar senha',
  rules: SgRules(
    // `validate`: true/null = ok, false = inválido, String = mensagem.
    validate: (v) => v == form.getValue('senha') ? true : 'As senhas diferem',
  ),
),
```

`SgRules` com `validate` não é `const` (usa `form`). O mesmo padrão aparece em `test/form/sg_form_test.dart` (`validate: (v) => v == f.getValue('senha') ? true : 'diferente'`).

## 3. Controlador programático: `setValue`, `trigger`, `setError`, `reset`

Útil fora de `SgForm` (por exemplo, preencher a partir de uma API e validar antes de abrir uma etapa).

```dart
final form = SgFormController(defaultValues: {'email': ''});
form.registerField('email', rules: const SgRules(required: 'Obrigatório'));

Future<void> exemplo() async {
  // Muda o valor sem chamar o onChange do campo e valida em seguida.
  await form.setValue('email', 'ana@exemplo.com', shouldValidate: true);

  final ok = await form.trigger(['email']); // true se válido
  debugPrint('válido: $ok, erros: ${form.errors}');

  // Erro vindo do servidor, mostrado sob o campo.
  form.setError('email', 'E-mail já cadastrado', type: 'server');

  // Volta aos padrões e limpa erros/dirty/touched.
  form.reset();
}
```

Para reagir às mudanças na tela, ouça o controlador: `ListenableBuilder(listenable: form, builder: (context, _) => Text('${form.getValues()}'))` (o padrão de `formulario_screen.dart`).

## 4. Idioma dos componentes

Provider na árvore (recomendado) e atalho para ler o idioma:

```dart
MaterialApp(
  builder: (context, child) => SgComponentsI18nProvider(
    locale: 'pt-BR',
    // Sobrescreve só uma chave; o resto vem do catálogo pt-BR embutido.
    messages: const {'components.wizard.next': 'Avançar'},
    child: child!,
  ),
  home: const Scaffold(body: Center(child: Text('Olá'))),
)
```

```dart
// Dentro de um widget abaixo do provider:
final i18n = context.sgI18n; // ou useComponentsI18n(context)
final texto = t(i18n, 'components.wizard.next'); // 'Avançar'
final comParametro = t(i18n, 'components.validators.password.minSize', {'min': 8});
```

Sem árvore de widgets (por exemplo, num serviço), use o estado global:

```dart
setComponentsI18n(const SgComponentsI18nInput(locale: 'es'));
final msg = t(getComponentsI18n(), 'components.actions.clear');
```

O padrão sem nada configurado é `en-US`. O provider **não** herda o estado gravado por `setComponentsI18n` (só o idioma embutido e o `messages` dele).

## 5. Tema, claro/escuro e tokens

O `SeedThemeProvider` vai abaixo do `MaterialApp`, em `builder:` (assim o tema entra no `ThemeData`):

```dart
MaterialApp(
  builder: (context, child) => SeedThemeProvider(
    initialTheme: const SeedThemeInput(
      seed: '#16803D',
      mode: SgThemeMode.light,
      radius: 12,
    ),
    child: child!,
  ),
  home: const PaginaTema(),
)

class PaginaTema extends StatelessWidget {
  const PaginaTema({super.key});

  @override
  Widget build(BuildContext context) {
    final tema = useSgTheme(context);
    return Scaffold(
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // Token tipado: --sg-primary-600 -> primary600.
            Container(width: 48, height: 48, color: tema.theme.primary600),
            const SizedBox(height: 12),
            SgButton(
              label: 'Alternar claro/escuro',
              onClick: () => tema.setMode(
                tema.currentMode == Brightness.light
                    ? Brightness.dark
                    : Brightness.light,
              ),
            ),
            SgButton(
              label: 'Trocar cor',
              onClick: () => tema.setTheme(seed: '#7C3AED'),
            ),
          ],
        ),
      ),
    );
  }
}
```

Fora do provider, `useSgTheme(context)` lança `StateError`; para ler o tema sem exigir o provider use `sgThemeOf(context)` (cai no tema padrão). Token por nome: `tema.theme.color('--sg-btn-primary-bg')`.

## 6. Máscaras e validadores soltos

```dart
maskCpf('52998224725');            // 529.982.247-25
maskCnpj('11222333000181');        // 11.222.333/0001-81
maskCpfCnpj('11222333000181');     // 11.222.333/0001-81
maskPostalCodePT('1000001');       // 1000-001
maskPhone('11987654321');          // (11) 98765-4321

isValidCpf('529.982.247-25');      // true
isValidCpf('111.111.111-11');      // false (todos iguais)
isValidEmail(' ana@exemplo.com '); // true (faz trim)
isBlockedEmailDomain('x@yopmail.com'); // true (domínio descartável)
```

Os valores de entrada vêm dos casos de `test/form/sg_form_component_validators_test.dart` (CPF e CNPJ válidos); os resultados de máscara decorrem da lógica de `masks.dart` (lida, não executada).

## 7. Senha e idade: resultado x mensagem

No Dart `validatePassword` devolve o **resultado**; a mensagem traduzida vem de `seedgrid_components`.

```dart
final r = validatePassword('abc', const PasswordPolicy(minSize: 8));
r.ok;        // false
r.problems;  // [minSize, upper, number, special, sequence] (lista de PasswordProblem)

// Texto no idioma do contexto (ou do estado global, se não passar i18n):
final msg = validatePasswordMessage('abc', const PasswordPolicy(minSize: 8), context.sgI18n);

// Idade mínima de 18 anos (data ISO):
final idade = validateBirthDate('2012-05-10', const BirthDatePolicy(minAge: 18));
idade.problem; // BirthDateProblem.ageMin (depende da data de hoje)
final textoIdade = birthDateValidationMessage(idade, context.sgI18n);
```

A lista de `problems` de `'abc'` foi deduzida da leitura de `validatePassword` (tamanho, maiúscula, número, especial e sequência `abc`); os nomes dos enums são os do código.

## 8. Consulta de CEP e CNPJ

```dart
Future<void> consultar() async {
  try {
    final cep = await buscarCep('01310-100'); // lança Exception se não tiver 8 dígitos
    debugPrint('${cep.logradouro}, ${cep.localidade}/${cep.uf}');
  } catch (e) {
    debugPrint('CEP: $e'); // "CEP não encontrado." ou "Falha ao consultar CEP (<status>)."
  }

  final empresa = await buscarCnpj('11.222.333/0001-81'); // null em falha de rede ou não 2xx
  debugPrint(empresa?.razaoSocial ?? 'CNPJ não encontrado');
}
```

Nos testes, passe um `http.Client` falso (`client:`) para não usar a rede. `buscarCnpj` só aceita CNPJ numérico (remove letras).

## 9. Cliente HTTP com token

```dart
final api = SgHttpClient(
  HttpClientOptions(
    baseUrl: 'https://api.exemplo.com',
    getAccessToken: () => meuToken, // devolva null se não houver sessão
  ),
);

Future<void> salvar() async {
  try {
    final criado = await api.request(
      '/clientes',
      method: 'POST',
      body: {'nome': 'Ana'}, // Map vira JSON; String vai crua
    );
    debugPrint('Criado: $criado'); // JSON decodificado (null em 204)
  } on SgHttpException catch (e) {
    debugPrint('HTTP ${e.status}: ${e.body}');
  } finally {
    api.close();
  }
}
```

`meuToken` é uma variável sua (nenhum valor de credencial deve ir para o código ou para a KB).

## 10. Texto como `String` ou `Widget` (`sgNode`)

Para quem escreve um widget próprio no estilo dos componentes SeedGrid:

```dart
class MeuRotulo extends StatelessWidget {
  const MeuRotulo({super.key, this.label});

  /// `String`, `num` ou `Widget` (como o `ReactNode` do React).
  final Object? label;

  @override
  Widget build(BuildContext context) => sgNode(label) ?? const SizedBox.shrink();
}
```

`sgNode('Salvar')` vira `Text('Salvar')`; um tipo diferente de `String`, `num` ou `Widget` lança `ArgumentError`.

## Não verificado

- Nenhum dos exemplos foi compilado ou executado; os resultados comentados (`// 529.982.247-25` etc.) vêm da leitura das funções, não de execução.
- `r.problems` do exemplo 7 foi deduzido da leitura de `validatePassword` (tamanho, maiúscula, número, especial e sequência `abc`); `idade.problem` depende da data de hoje.
- Exemplos de formulário com `SgInputPassword`, `SgInputEmail` e `SgInputText` assumem os parâmetros `id`, `name`, `control`, `label`, `required`, `rules` (Confirmado nos construtores de `SgInputText`, `SgInputEmail` e `SgInputPassword`, e em `formulario_screen.dart`).
