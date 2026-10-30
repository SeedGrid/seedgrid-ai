---
description: "[React; nomes iguais no Flutter] Índice \"preciso de X, use Y\": para cada necessidade de tela (CPF, tabela, aviso, data, upload…) o componente SeedGrid certo, com sinônimos e o que não usar. Substitui a busca semântica do MCP; leia inteiro (é curto) antes de escolher um componente."
tags: [seedgrid, component, indice, plataforma-react]
plataforma: react
gerado-por: seedgrid-components-mcp/scripts/export-kb-data.mjs
---
# Preciso de X, use Y (React)

> **Plataforma: React.** Os sinônimos, as alternativas ("não serve?") e as seções de hooks, funções, utilitários e factories abaixo vêm do manifesto de IA do **React** (`@seedgrid/fe-components`). Os 89 componentes `Sg*` do **Flutter** (`seedgrid_components`) têm os **mesmos nomes**, então a escolha de componente vale nas duas plataformas; o manifesto Flutter ainda não traz sinônimos nem alternativas (`aiHints` consta em `gaps` de `tools/mcp_manifest`, **não confirmado** se isso mudou depois do commit `e9989b8`). Hooks e funções listados aqui são do React; o equivalente Flutter de cada um está em "Símbolos do React" na `Visao-geral` do grupo em `flutter/`. Detalhe: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]]. **Edição manual:** esta nota é gerada por `seedgrid-components-mcp/scripts/export-kb-data.mjs`, que ainda não conhece as plataformas; o cabeçalho acima foi acrescentado à mão e precisa ser levado para o gerador, senão a próxima exportação o apaga.

> Nota **gerada** dos manifestos de IA (`seedgrid-components-mcp`); não edite à mão. Escolheu? Confira as props com `node .ai/skills/sg-componente/scripts/validate-props.mjs <Componente> ...` e leia só a seção `## Nome` do `API.md` do grupo (ver [[SeedGrid/SeedGrid-components/Indice|Índice]]).

## Campos de entrada

- `SgAutocomplete`: autocomplete; typeahead; search select; lookup field · não serve? SgCombobox ou SgRadioGroup
- `SgCheckboxGroup`: checkbox group; multi select; multiple choice; checklist field · não serve? SgRadioGroup ou SgCombobox
- `SgCombobox`: combobox; searchable select; lookup combo; assisted select · não serve? SgRadioGroup ou SgCheckboxGroup
- `SgInputBirthDate`: birth date; date of birth; dob; data de nascimento · não serve? SgInputDate
- `SgInputCNPJ`: cnpj; company tax id; documento cnpj; business tax id · não serve? SgInputCPF
- `SgInputCPF`: cpf; tax id; documento cpf; personal tax id · não serve? SgInputCNPJ
- `SgInputCPFCNPJ`: cpf cnpj; documento misto; hybrid document; cpf or cnpj · não serve? SgInputCPF
- `SgInputCurrency`: currency input; money field; price input; amount input · não serve? SgInputNumber
- `SgInputDate`: date input; calendar field; deadline input; schedule date · não serve? SgInputText ou SgInputTextArea
- `SgInputEmail`: email; email input; mail field; contact email · não serve? SgInputText
- `SgInputNumber`: number input; numeric field; quantity input; decimal input · não serve? SgInputText ou SgInputTextArea
- `SgInputOTP`: otp; one time password; verification code; auth code · não serve? SgInputPassword
- `SgInputPassword`: password; secret; credential input; login password · não serve? SgInputOTP
- `SgInputPhone`: phone; telephone; mobile; phone input
- `SgInputPostalCode`: postal code; zip code; cep; zipcode
- `SgInputText`: text field; text input; campo texto; campo livre · não serve? SgInputTextArea ou SgTextEditor
- `SgInputTextArea`: textarea; long text field; notes field; description input · não serve? SgInputText
- `SgInputTextSearch`: search input; search field; campo de busca; debounced search · não serve? SgInputText
- `SgMultiSelect`: multi select; multiselect; selecao multipla; multiple choice select · não serve? SgCombobox ou SgRadioGroup
- `SgMultiSelectChips`: multi select chips; multiselect tags; selecao multipla com chips; tag input select · não serve? SgCombobox ou SgRadioGroup
- `SgOrderList`: order list; sortable list; priority list; ranking list · não serve? SgPickList
- `SgPeriodSelector`: period selector; date range preset; seletor de periodo; filtro de periodo · não serve? SgInputDate
- `SgPickList`: pick list; dual list; transfer list; source target list
- `SgRadioGroup`: radio group; single choice; one of many; option group · não serve? SgCheckboxGroup
- `SgRating`: rating; stars; score; review rating
- `SgSlider`: slider; range input; seek bar; value slider · não serve? SgInputNumber
- `SgStepperInput`: stepper; quantity input; increment input; counter field · não serve? SgInputNumber
- `SgTextEditor`: text editor; rich text editor; wysiwyg; formatted text · não serve? SgInputText ou SgInputTextArea
- `SgToggleSwitch`: toggle; switch; boolean switch; on off control · não serve? SgButton
- `SgYearPartSelector`: year part selector; seletor de recorte de ano; seletor de semestre; seletor de trimestre · não serve? SgPeriodSelector

## Botões e ações

- `SgButton`: button; cta; action button; submit button · não serve? SgPanel ou SgCard
- `SgFloatActionButton`: fab; floating action button; quick action button; floating cta · não serve? SgButton ou SgSplitButton
- `SgSplitButton`: split button; dropdown action button; menu button; compound action · não serve? SgButton
- `SgToolbarIconButton`: toolbar icon button; icon action; quick toolbar action; shortcut button · não serve? SgButton

## Dados e tabelas

- `SgDatatable`: datatable; data grid; table; listing grid

## Feedback e avisos

- `SgAvatar`: avatar; profile image; user avatar; identity badge · não serve? SgBadge
- `SgAvatarGroup`: avatar group; team avatars; participant stack; member avatars · não serve? SgAvatar
- `SgBadge`: badge; tag; status chip; counter badge
- `SgBadgeOverlay`: badge overlay; notification overlay; indicator overlay; statusoverlay · não serve? SgBadge
- `SgConfirmationDialog`: confirmation dialog; confirm modal; danger prompt; warning confirm · não serve? SgDialog
- `SgDialog`: dialog; modal; overlay modal; popup dialog
- `SgPopup`: popup; anchored popup; context menu popup; contextual overlay · não serve? SgDialog ou SgConfirmationDialog
- `SgSkeleton`: skeleton; loading placeholder; content shimmer; loading block
- `SgToaster`: toaster; toast container; toast notifications; toastcontainer · não serve? SgConfirmationDialog
- `SgToastHost`: toast host; toast mount point; notification host; toasthost
- `SgWhistleHost`: alert host; message stack host; persistent notifications host; alerthost
- `SgWhistler`: alert renderer; message stack; persistent notifications; alertrenderer · não serve? SgWhistleHost

## Layout e containers

- `AppShell`: app shell; application shell; page frame; layout shell
- `SgAccordion`: accordion; collapsible sections; expansion panels; disclosure group
- `SgCard`: card; content card; summary card; surface block
- `SgCarousel`: carousel; slider; gallery slider; content rotator
- `SgDockLayout`: dock layout; workspace layout; zone layout; docking shell · não serve? SgPanel ou SgCard
- `SgDockScreen`: dock screen; workspace screen; docking shell; dock workspace
- `SgDockZone`: dock zone; dock region; layout zone; drop area
- `SgExpandablePanel`: expandable panel; drawer; sliding panel; side panel · não serve? SgDialog
- `SgGrid`: grid; responsive grid; columns layout; card grid · não serve? SgStack
- `SgGroupBox`: group box; fieldset; form group; titled section · não serve? SgAccordion
- `SgPanel`: panel; container; section; group box · não serve? SgButton
- `SgScreen`: screen; page shell; layout shell; workspace
- `SgStack`: stack; flex stack; row/column layout; linear container · não serve? SgGrid

## Navegação e overlays

- `SgBreadcrumb`: breadcrumb; navigation trail; path navigation; hierarchy trail · não serve? SgMenu
- `SgDockMenu`: dock menu; launcher; quick menu; floating dock
- `SgMenu`: menu; sidebar; navigation menu; app menu · não serve? SgBreadcrumb
- `SgPageControl`: tabs; page control; tabbed navigation; section tabs
- `SgPageControlPage`: tab page; page control page; navigation page; tab panel
- `SgToolBar`: toolbar; action bar; command bar; floating toolbar · não serve? SgMenu
- `SgTreeView`: tree view; hierarchy tree; permission tree; navigation tree
- `SgWizard`: wizard; step form; multi-step flow; guided flow
- `SgWizardPage`: wizard page; wizard step; step page; form step

## Gadgets e visualização

- `SgCalendar`: calendar; month calendar; date gadget; schedule calendar · não serve? SgInputDate
- `SgClock`: clock; time widget; digital clock; analog clock
- `SgClockThemePicker`: clock theme picker; theme selector; theme chooser; visual theme picker
- `SgClockThemePreview`: clock theme preview; theme thumbnail; theme preview; style preview · não serve? SgClockThemePicker
- `SgDiscardDigit`: discard digit; animated digit; counter digit; digitdisplay
- `SgFadeDigit`: fade digit; animated digit; nixie-style digit; digitdisplay
- `SgFlipDigit`: flip digit; flip clock digit; animated digit; digitdisplay
- `SgLinearGauge`: linear gauge; linear meter; level indicator; measurement bar · não serve? SgInputNumber
- `SgMatrixDigit`: matrix digit; dot matrix digit; panel digit; digitdisplay
- `SgNeonDigit`: neon digit; glow digit; highlight digit; digitdisplay
- `SgPlayground`: code sandbox; interactive editor; live demo; code playground
- `SgQRCode`: qr code; code generator; pix qr; scan code
- `SgRadialGauge`: radial gauge; speedometer; dial gauge; circular meter · não serve? SgLinearGauge
- `SgRoller3DDigit`: roller 3d digit; 3d digit; animated roller digit; digitdisplay
- `SgSegmentDigit`: segment digit; segmented digit; digital segment display; digitdisplay
- `SgSevenSegmentDigit`: seven segment digit; 7 segment display; digital clock digit; digitdisplay
- `SgStringAnimator`: string animator; animated text; text transition; display animator

## Hooks e funções

- `buscarCep`: postal code lookup; cep search; address finder; cep
- `buscarCnpj`: company lookup; cnpj search; business finder; cnpj
- `createApiPersistenceStrategy`: server persistence; api state sync; backend storage; state
- `createCompositePersistenceStrategy`: dual persistence; fallback persistence; hybrid storage; resilient persistence
- `createHttpClient`: api client; fetch wrapper; http request client; http
- `createLocalStorageStrategy`: browser persistence; local storage strategy; client-side state storage; state
- `dismissSgToast`: dismiss toast; close notification; clear toast; dismissal
- `dismissSgWhistle`: dismiss whistle; close notification; clear alert; dismissal
- `sgWhistle`: whistle; banner; alert; notification banner
- `subscribeSgToasts`: subscribe; listen to toasts; toast observer; subscription · não serve? SgToastHost
- `subscribeSgWhistles`: subscribe; listen to whistles; whistle observer; subscription · não serve? SgWhistleHost
- `toast`: toast notification; notification; snackbar; userfeedback · não serve? SgDialog ou SgConfirmationDialog
- `useComponentsI18n`: i18n context; locale hook; translation context; locale
- `useDebouncedValue`: debounced search; debounced input; debounced state; search debounce
- `useSgClockThemeResolver`: theme resolver; clock theme; theme switcher; themeresolver · não serve? SgClockThemeProvider
- `useSgEnvironment`: environment context; environment hook; persistence context; environmentcontext · não serve? useSgPersistence ou useSgPersistentState
- `useSgNamespaceProvider`: namespace context; tenant provider; isolation scope; namespacecontext · não serve? useSgEnvironment
- `useSgPersistence`: persistence hook; state storage; persistence layer; persistencelayer · não serve? useState
- `useSgPersistentState`: persistent state; synced state; stored state; persistentstate · não serve? useState
- `useSgRealtimeEvent`: realtime event; pulse event; on notice; realtimechannel
- `useSgRealtimeStatus`: realtime status; pulse status; connection state; connectionstatus
- `useSgTheme`: theme context; theme hook; design token access; themecontext
- `useSgTime`: time context; time sync; server time; ticker
- `useTheme`: legacy theme hook; use theme; theme compatibility hook; legacythemehook · não serve? useSgTheme

## Providers

- `SeedGridRegistry`: module registry; provider registry; app composer; navigation builder
- `SeedThemeProvider`: theme provider; seed theme; design token provider; themeprovider
- `SgClockThemeProvider`: clock theme provider; theme resolver provider; clock theme context; themeprovider · não serve? SgClockThemePicker
- `SgComponentsI18nProvider`: components i18n provider; locale provider; messages provider; translation context
- `SgEnvironmentProvider`: environment provider; persistence provider; namespace provider; storage context
- `SgRealtimeProvider`: realtime provider; pulse provider; websocket provider; push notifications
- `SgTimeProvider`: time provider; server time context; clock time provider; synced time provider
- `ThemeProvider`: legacy theme provider; theme provider compatibility; old theme provider; legacythemeprovider

## Utilitários

- `buildScaleFromHex`: build color scale; palette generator; hex scale; colorscalegeneration
- `captureException`: error capture; exception reporter; error guard; run guarded
- `clamp`: clamp; bound number; limit value; rangeconstraint
- `extractApiErrorMessage`: rfc7807 parser; problem details; api validation message; violations message
- `getSystemMode`: system mode; prefers color scheme; detect dark mode; systemmodedetection

## Factories

- `createApiClient`: api client; fetch wrapper; http client; authenticated fetch
