---
tags: [seedgrid, component, frontend, react, inputs-selecao, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: ad30fc11de
analisado-em: 2026-10-14
---

# Inputs de seleção: exemplos

Todos os exemplos foram conferidos contra [[SeedGrid/SeedGrid-components/inputs-selecao/API|API dos inputs de seleção]]. As fontes são relativas a `front/seedgrid-fe-components/apps/showcase/src/app/components/`. Os exemplos não foram compilados nem executados.

## SgAutocomplete com fonte assíncrona e `control`

Fonte: `sg-autocomplete/samples/basico.tsx.sample`. O formulário guarda o **texto** selecionado; o objeto completo chega por `onSelect`.

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete, type SgAutocompleteItem } from "@seedgrid/fe-components";

type Country = { id: number; description: string; code: string };

const COUNTRIES: Country[] = [
  { id: 1, description: "Afghanistan", code: "AF" },
  { id: 2, description: "Albania", code: "AL" },
  { id: 3, description: "Brazil", code: "BR" },
  { id: 4, description: "South Africa", code: "ZA" }
];

const source = async (query: string) => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const q = query.toLowerCase();
  return COUNTRIES.filter((c) => c.description.toLowerCase().includes(q));
};

export default function Example() {
  const { control } = useForm({ defaultValues: { country: "" } });
  const [selected, setSelected] = React.useState<SgAutocompleteItem | null>(null);

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        mapItem={(raw) => ({ id: raw.id, label: raw.description })}
        minLengthForSearch={1}
        onSelect={(item) => setSelected(item)}
      />
      {selected ? <pre>{JSON.stringify(selected, null, 2)}</pre> : null}
    </form>
  );
}
```

## SgCombobox com lista local agrupada

Fonte: `sg-combobox/samples/basico-com-lista-de-objetos.tsx.sample`, com a lista encurtada. O `value`/`onValueChange` trabalham com o **id**; `onSelect` entrega o objeto original.

```tsx
import * as React from "react";
import { SgCombobox } from "@seedgrid/fe-components";

type Country = { id: number; description: string; code: string; region: string };

const COUNTRIES: Country[] = [
  { id: 1, description: "Brazil", code: "BR", region: "Americas" },
  { id: 2, description: "Argentina", code: "AR", region: "Americas" },
  { id: 5, description: "Germany", code: "DE", region: "Europe" },
  { id: 7, description: "Portugal", code: "PT", region: "Europe" }
];

export default function Example() {
  const [countryId, setCountryId] = React.useState<string | number | null>(null);
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);

  return (
    <>
      <SgCombobox<Country>
        id="cb-basic"
        label="Country"
        source={COUNTRIES}
        value={countryId}
        onValueChange={setCountryId}
        grouped
        mapItem={(raw) => ({ id: raw.id, label: raw.description, value: raw.code, group: raw.region })}
        onSelect={(value) => setSelectedCountry(value)}
      />
      <div>{selectedCountry ? JSON.stringify(selectedCountry, null, 2) : "No item selected"}</div>
    </>
  );
}
```

## SgCheckboxGroup controlado e via ref

Fontes: `sg-checkbox-group/samples/basico.tsx.sample` e `sg-checkbox-group/samples/ref-imperativo.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgCheckboxGroup, SgGrid, type SgCheckboxGroupOption, type SgCheckboxGroupRef } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  const [selected, setSelected] = React.useState<(string | number)[]>(["option1"]);
  const checkboxRef = React.useRef<SgCheckboxGroupRef>(null);

  return (
    <>
      <SgCheckboxGroup id="basic" title="Choose options" source={BASIC_OPTIONS} value={selected} onChange={setSelected} />
      <SgCheckboxGroup ref={checkboxRef} id="ref-example" title="Select options" source={BASIC_OPTIONS} showCheckAll />
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton onClick={() => console.log(checkboxRef.current?.getChecked())}>getChecked()</SgButton>
        <SgButton onClick={() => checkboxRef.current?.checkAll()}>checkAll()</SgButton>
        <SgButton onClick={() => checkboxRef.current?.clearAll()}>clearAll()</SgButton>
        <SgButton onClick={() => checkboxRef.current?.setChecked(["option2"])}>setChecked</SgButton>
      </SgGrid>
    </>
  );
}
```

## SgRadioGroup com `register`

Fonte: `sg-radio-group/samples/react-hook-form-register.tsx.sample`.

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Uva", value: "grape" }
];

export default function Example() {
  const { register, handleSubmit } = useForm();
  return (
    <form onSubmit={handleSubmit((data) => alert(JSON.stringify(data, null, 2)))} className="space-y-4">
      <SgRadioGroup name="fruit" title="Choose your fruit" source={FRUIT_OPTIONS} register={register} />
      <SgButton type="submit">Submit</SgButton>
    </form>
  );
}
```

## SgMultiSelect e SgMultiSelectChips

Fontes: `sg-multi-select/samples/limpavel-e-com-limite.tsx.sample` e `sg-multi-select-chips/samples/rotulo-curto.tsx.sample`.

```tsx
import * as React from "react";
import { SgButton, SgMultiSelect, SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" }
];

const BRANCHES = [
  { label: "1 - Matriz Sao Paulo", chipLabel: "1", value: 1 },
  { label: "2 - Filial Campinas", chipLabel: "2", value: 2 },
  { label: "3 - Filial Centro", chipLabel: "3", value: 3 }
];

export default function App() {
  const [capped, setCapped] = React.useState<SgMultiSelectOptionValue[]>([]);
  const [branches, setBranches] = React.useState<SgMultiSelectOptionValue[]>([1, 3]);
  return (
    <>
      <SgMultiSelect
        id="ms-capped"
        label="Empresas (max 2)"
        placeholder="Selecione ate 2 empresas"
        options={COMPANIES}
        value={capped}
        onChange={setCapped}
        clearable
        maxSelected={2}
      />
      <SgButton size="sm" appearance="outline" onClick={() => setCapped([])}>Clear</SgButton>

      <SgMultiSelectChips
        id="msc-chip-label"
        label="Filiais"
        placeholder="Selecione as empresas"
        options={BRANCHES}
        value={branches}
        onChange={setBranches}
        searchable
      />
    </>
  );
}
```

## SgOrderList com controles externos por ref

Fonte: `sg-order-list/samples/selecao-multipla-controles-externos-ref.tsx.sample`.

```tsx
import React from "react";
import { SgButton, SgGrid, SgOrderList, type SgOrderListItem, type SgOrderListRef } from "@seedgrid/fe-components";

const PIPELINE_STEPS: SgOrderListItem[] = [
  { label: "Prospeccao", value: "lead" },
  { label: "Qualificacao", value: "qualify" },
  { label: "Proposta", value: "proposal" },
  { label: "Negociacao", value: "negotiation" },
  { label: "Fechamento", value: "close" }
];

export default function Example() {
  const [pipelineItems, setPipelineItems] = React.useState<SgOrderListItem[]>(PIPELINE_STEPS);
  const pipelineRef = React.useRef<SgOrderListRef>(null);

  return (
    <div className="space-y-4">
      <SgOrderList
        ref={pipelineRef}
        id="order-ref"
        title="Etapas do pipeline"
        source={PIPELINE_STEPS}
        value={pipelineItems}
        onChange={setPipelineItems}
        selectionMode="multiple"
        showControls={false}
      />
      <SgGrid columns={{ base: 2, md: 5 }} gap={8}>
        <SgButton onClick={() => pipelineRef.current?.moveTop()}>Move Top</SgButton>
        <SgButton onClick={() => pipelineRef.current?.moveUp()}>Move Up</SgButton>
        <SgButton onClick={() => pipelineRef.current?.moveDown()}>Move Down</SgButton>
        <SgButton onClick={() => pipelineRef.current?.moveBottom()}>Move Bottom</SgButton>
        <SgButton onClick={() => pipelineRef.current?.clearSelection()}>Clear Selection</SgButton>
      </SgGrid>
    </div>
  );
}
```

## SgPickList controlado com filtros

Fonte: `sg-pick-list/samples/com-filtros.tsx.sample`.

```tsx
import React from "react";
import { SgPickList, type SgPickListItem } from "@seedgrid/fe-components";

export default function Example() {
  const [filterValue, setFilterValue] = React.useState({
    source: [
      { label: "Berlin", value: "berlin" },
      { label: "Boston", value: "boston" },
      { label: "Lisbon", value: "lisbon" },
      { label: "Madrid", value: "madrid" },
      { label: "Sao Paulo", value: "sao-paulo" }
    ] as SgPickListItem[],
    target: [] as SgPickListItem[]
  });

  return (
    <SgPickList
      id="pick-filter"
      title="Cities"
      source={filterValue.source}
      target={filterValue.target}
      value={filterValue}
      onChange={(event) => setFilterValue({ source: event.source, target: event.target })}
      showSourceFilter
      showTargetFilter
      sourceHeader="Available"
      targetHeader="Selected"
    />
  );
}
```

## SgPeriodSelector e SgYearPartSelector

Fontes: `sg-period-selector/samples/basico.tsx.sample` e `sg-year-part-selector/samples/so-semestre.tsx.sample`. Os dois entregam `startDate`/`endDate` já resolvidos.

```tsx
import * as React from "react";
import {
  SgPeriodSelector,
  SgYearPartSelector,
  YearPartKind,
  type ResolvedPeriod,
  type ResolvedYearPart
} from "@seedgrid/fe-components";

export default function Example() {
  const [period, setPeriod] = React.useState<ResolvedPeriod | null>(null);
  const [resolved, setResolved] = React.useState<ResolvedYearPart | null>(null);

  return (
    <div className="w-full max-w-xl space-y-4">
      <SgPeriodSelector id="ps-basic" label="Periodo" locale="pt-BR" onChange={setPeriod} />
      <pre className="text-xs">
        {period ? JSON.stringify({ preset: period.preset, start: period.startDate, end: period.endDate }, null, 2) : "Nenhum periodo selecionado"}
      </pre>

      <SgYearPartSelector
        id="yps-semester"
        label="Semestre de apuracao"
        locale="pt-BR"
        allowedKinds={[YearPartKind.SEMESTER]}
        onChange={setResolved}
      />
      <p className="text-xs">{resolved ? resolved.label : "Nenhum recorte confirmado ainda"}</p>
    </div>
  );
}
```

Uso sem componente, com a mesma lógica (exportada):

```ts
import { PeriodPreset, resolvePeriod, resolveYearPart, YearPartKind } from "@seedgrid/fe-components";

const mes = resolvePeriod(PeriodPreset.LAST_MONTH, new Date(), { locale: "pt-BR" });
const semestre = resolveYearPart({ year: 2024, kind: YearPartKind.SEMESTER, part: 1 }, "pt-BR");
```

## SgToggleSwitch com `register` e `control`

Fonte: `sg-toggle-switch/samples/react-hook-form.tsx.sample`.

```tsx
import * as React from "react";
import { Check, X } from "lucide-react";
import { useForm, type FieldValues } from "react-hook-form";
import { SgButton, SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  const { register, control, handleSubmit } = useForm<FieldValues>({
    defaultValues: { notifications: false, active: true } as FieldValues
  });

  return (
    <form onSubmit={handleSubmit((data) => console.log(data))}>
      <SgToggleSwitch id="demo-rhf-register" name="notifications" label="Receber notificacoes por email" register={register} />
      <SgToggleSwitch id="demo-rhf-control" name="active" label="Conta ativa" control={control} onIcon={<Check size={12} />} offIcon={<X size={12} />} />
      <SgButton type="submit">Enviar</SgButton>
    </form>
  );
}
```

## SgRating, SgSlider e SgStepperInput (controlados)

Fontes: `sg-rating/samples/react-hook-form.tsx.sample` (com `control`), `sg-slider/samples/controle-externo.tsx.sample` e `sg-stepper-input/samples/controle-externo.tsx.sample`.

```tsx
import React from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { SgRating, SgSlider, SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  const { control } = useForm<FieldValues>({ defaultValues: { productRating: 4 } });
  const [volume, setVolume] = React.useState(35);
  const [idade, setIdade] = React.useState(18);

  return (
    <div className="max-w-sm space-y-3">
      <SgRating label="Rate the product" name="productRating" control={control} allowHalf />
      <SgSlider id="slider-controlled" minValue={0} maxValue={100} value={volume} onChange={setVolume} ariaLabel="Volume" />
      <SgStepperInput id="stepper-controlled" minValue={10} maxValue={30} step={1} value={idade} width={210} onChange={setIdade} />
    </div>
  );
}
```
