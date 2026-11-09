---
tags: [seedgrid, component, frontend, react, inputs-selecao, exemplos]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Inputs de seleção e valores, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Inputs de seleção: exemplos — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/inputs-selecao/Exemplos|Exemplos — Inputs de seleção e valores (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente estão abaixo (React, 14 componentes, 113 exemplos), na ordem e com os títulos da página dele em pt-BR (`/components/<slug>`). Cada bloco é cópia 1:1 do arquivo `samples/*.tsx.sample` do exemplo, indicado em `Fonte:` (caminho relativo à raiz do repositório `seedgrid-fe-components`), e é o mesmo código que o showcase renderiza e mostra no bloco de código. Conferência de 2026-11-09 (seedgrid-fe-components 0f304bb): os blocos foram regerados por script a partir dos `.sample` e comparados texto a texto (idênticos). Não foram compilados nem executados no navegador nesta conferência. O texto abaixo de cada título é a descrição que a página mostra (i18n pt-BR do showcase; alguns trechos ainda estão em inglês). A seção Playground de cada página não tem `.sample` e fica de fora. As classes utilitárias (`flex`, `gap-4`…) são Tailwind do app de exemplo. Os tipos e props usados estão descritos em [[SeedGrid/SeedGrid-components/inputs-selecao/API|API]].

## SgAutocomplete

Página: `sg-autocomplete/page.tsx` (11 exemplo(s) com código na página; abaixo 11).

### Básico

Digite e veja resultados conforme a busca.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/basico.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete, type SgAutocompleteItem } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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
  const { control } = useForm({
    defaultValues: { country: "" }
  });
  const [selected, setSelected] = React.useState<SgAutocompleteItem | null>(null);

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        mapItem={(raw) => ({
          id: raw.id,
          label: raw.description
        })}
        minLengthForSearch={1}
        onSelect={(item) => setSelected(item)}
      />

      {selected ? (
        <pre>{JSON.stringify(selected, null, 2)}</pre>
      ) : null}
    </form>
  );
}
```

### Conteúdo personalizado

Renderiza o item com o código do país.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/customizado.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete, type SgAutocompleteItem } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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

const mapItem = (raw: Country): SgAutocompleteItem => ({
  id: raw.id,
  label: raw.description,
  data: raw
});

export default function Example() {
  const { control } = useForm({
    defaultValues: { country: "" }
  });

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        mapItem={mapItem}
        renderItem={(item) => (
          <div className="flex items-center gap-2">
            <span>{(item.data as Country).code}</span>
            <span>{item.label}</span>
          </div>
        )}
      />
    </form>
  );
}
```

### Agrupado

Agrupa pela primeira letra.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/agrupado.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete, type SgAutocompleteItem } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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

const mapItem = (raw: Country): SgAutocompleteItem => ({
  id: raw.id,
  label: raw.description,
  data: raw
});

export default function Example() {
  const { control } = useForm({
    defaultValues: { country: "" }
  });

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        mapItem={mapItem}
        grouped
      />
    </form>
  );
}
```

### Botão dropdown

Botão para abrir/fechar a lista. Com um item selecionado, reabrir mostra a lista completa com o item destacado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/dropdown.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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
  const { control } = useForm({
    defaultValues: { country: "" }
  });

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        showDropDownButton
        openOnFocus
      />
    </form>
  );
}
```

### Rodapé

Rodapé personalizado com ação.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/footer.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete, type SgAutocompleteItem } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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

const mapItem = (raw: Country): SgAutocompleteItem => ({
  id: raw.id,
  label: raw.description,
  data: raw
});

export default function Example() {
  const { control } = useForm({
    defaultValues: { country: "" }
  });

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        renderFooter={(query) => (
          <button>Add new "{query}"</button>
        )}
        mapItem={mapItem}
      />
    </form>
  );
}
```

### Comprimento mínimo

Só busca a partir de 3 caracteres.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/tamanho-minimo.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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
  const { control } = useForm({
    defaultValues: { country: "" }
  });

  return (
    <form>
      <SgAutocomplete
        id="country"
        name="country"
        control={control}
        label="Country"
        source={source}
        minLengthForSearch={3}
      />
    </form>
  );
}
```

### Raio da borda

Aplica raio de borda ao campo e à lista de sugestões.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/border-radius.tsx.sample`

```tsx
import React from "react";
import { SgAutocomplete, type SgAutocompleteItem } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
};

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

const mapItem = (raw: Country): SgAutocompleteItem => ({
  id: raw.id,
  label: raw.description,
  group: raw.description[0],
  data: raw
});

export default function Example() {
  return (
    <div className="w-80">
      <SgAutocomplete
        id="ac-radius"
        label="Country"
        source={source}
        mapItem={mapItem}
        minLengthForSearch={1}
        showDropDownButton
        openOnFocus
        borderRadius={14}
      />
    </div>
  );
}
```

### Fonte assíncrona

A fonte é assíncrona; enquanto espera aparece o texto de carregamento (loadingText). Respostas antigas são descartadas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/fonte-assincrona.tsx.sample`

```tsx
import { SgAutocomplete } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="w-80">
      <SgAutocomplete
        id="ac-async"
        label="Cidade"
        delay={200}
        loadingText="Buscando cidades..."
        source={async (query: string) => {
          await new Promise((resolve) => setTimeout(resolve, 600));
          return ["Curitiba", "Cuiabá", "Campinas", "Cascavel"].filter((c) =>
            c.toLowerCase().includes(query.toLowerCase())
          );
        }}
      />
    </div>
  );
}
```

### Valor livre e limpar ao escolher

allowCustomValue guarda o que foi digitado; clearOnSelect esvazia o campo depois de escolher (útil para adicionar itens).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/valor-livre.tsx.sample`

```tsx
import { SgAutocomplete } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="w-80 space-y-3">
      <SgAutocomplete
        id="ac-free"
        label="Aceita texto livre"
        allowCustomValue
        source={(query: string) =>
          ["Alpha", "Beta", "Gamma"].filter((item) =>
            item.toLowerCase().includes(query.toLowerCase())
          )
        }
      />
      <SgAutocomplete
        id="ac-add"
        label="Limpa ao escolher"
        clearOnSelect
        source={(query: string) =>
          ["Item A", "Item B", "Item C"].filter((item) =>
            item.toLowerCase().includes(query.toLowerCase())
          )
        }
      />
    </div>
  );
}
```

### Limite de resultados

maxResult limita quantos itens a lista mostra.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/limite-de-resultados.tsx.sample`

```tsx
import { SgAutocomplete } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="w-80">
      <SgAutocomplete
        id="ac-limit"
        label="Máximo de 2 resultados"
        maxResult={2}
        source={(query: string) =>
          ["Rio Branco", "Rio Claro", "Rio Grande", "Rio Verde"].filter((item) =>
            item.toLowerCase().includes(query.toLowerCase())
          )
        }
      />
    </div>
  );
}
```

### Dentro de um formulário

name + control + required, como no react-hook-form.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-autocomplete/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgAutocomplete, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  const [submitted, setSubmitted] = React.useState("");
  const { control, handleSubmit } = useForm<{ fruit: string }>({ defaultValues: { fruit: "" } });

  return (
    <form className="w-80 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(values.fruit))}>
      <SgAutocomplete
        id="fruit"
        name="fruit"
        control={control}
        label="Fruta"
        required
        requiredMessage="Escolha uma fruta"
        source={(query: string) =>
          ["Banana", "Laranja", "Uva"].filter((item) =>
            item.toLowerCase().includes(query.toLowerCase())
          )
        }
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p className="text-sm">Enviado: {submitted}</p> : null}
    </form>
  );
}
```

## SgCombobox

Página: `sg-combobox/page.tsx` (6 exemplo(s) com código na página; abaixo 6).

### 1) Básico com lista de objetos

Sem input livre: com foco no campo, digite letras e ele "pula" para o item correspondente.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-combobox/samples/basico-com-lista-de-objetos.tsx.sample`

```tsx
import * as React from "react";
import { SgCombobox } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
  region: string;
};

const COUNTRIES: Country[] = [
  { id: 1, description: "Brazil", code: "BR", region: "Americas" },
  { id: 2, description: "Argentina", code: "AR", region: "Americas" },
  { id: 3, description: "United States", code: "US", region: "Americas" },
  { id: 4, description: "Canada", code: "CA", region: "Americas" },
  { id: 5, description: "Germany", code: "DE", region: "Europe" },
  { id: 6, description: "France", code: "FR", region: "Europe" },
  { id: 7, description: "Portugal", code: "PT", region: "Europe" },
  { id: 8, description: "India", code: "IN", region: "Asia" },
  { id: 9, description: "Japan", code: "JP", region: "Asia" },
  { id: 10, description: "Australia", code: "AU", region: "Oceania" }
];

export default function Example() {
  const [selectedCountry, setSelectedCountry] = React.useState<Country | null>(null);

  return (
    <>
      <SgCombobox<Country>
        id="cb-basic"
        label="Country"
        source={COUNTRIES}
        openOnFocus
        grouped
        mapItem={(raw) => ({
          id: raw.id,
          label: raw.description,
          value: raw.code,
          group: raw.region
        })}
        onSelect={(value) => setSelectedCountry(value)}
      />

      <div>
        {selectedCountry ? JSON.stringify(selectedCountry, null, 2) : "No item selected"}
      </div>
    </>
  );
}
```

### 2) Controlado por value

Use value/onValueChange para definir programaticamente um valor válido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-combobox/samples/controlado-por-value.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgCombobox } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
  region: string;
};

const COUNTRIES: Country[] = [
  { id: 1, description: "Brazil", code: "BR", region: "Americas" },
  { id: 2, description: "Argentina", code: "AR", region: "Americas" },
  { id: 3, description: "United States", code: "US", region: "Americas" },
  { id: 4, description: "Canada", code: "CA", region: "Americas" },
  { id: 5, description: "Germany", code: "DE", region: "Europe" },
  { id: 6, description: "France", code: "FR", region: "Europe" },
  { id: 7, description: "Portugal", code: "PT", region: "Europe" },
  { id: 8, description: "India", code: "IN", region: "Asia" },
  { id: 9, description: "Japan", code: "JP", region: "Asia" },
  { id: 10, description: "Australia", code: "AU", region: "Oceania" }
];

export default function Example() {
  const [selectedId, setSelectedId] = React.useState<string | number | null>(null);
  const [selectedControlled, setSelectedControlled] = React.useState<Country | null>(null);
  const selectedByValue = COUNTRIES.find((item) => String(item.id) === String(selectedId ?? "")) ?? null;

  return (
    <>
      <SgCombobox<Country>
        id="cb-controlled"
        label="Country (controlled)"
        value={selectedId}
        source={COUNTRIES}
        openOnFocus
        mapItem={(raw) => ({
          id: raw.id,
          label: `${raw.description} (${raw.code})`,
          value: raw.code,
          group: raw.region
        })}
        onValueChange={setSelectedId}
        onSelect={setSelectedControlled}
      />

      <SgButton onClick={() => setSelectedId(5)}>Definir Alemanha (id 5)</SgButton>
      <SgButton onClick={() => setSelectedId(9)}>Definir Japão (id 9)</SgButton>
      <SgButton onClick={() => setSelectedId(null)}>Limpar valor</SgButton>

      <div>
        <div>valor: {selectedId == null || selectedId === "" ? "(vazio)" : String(selectedId)}</div>
        <div>
          resolvido por value: {selectedByValue ? `${selectedByValue.description} (${selectedByValue.code})` : "(nenhum)"}
        </div>
        <div>
          último onSelect: {selectedControlled ? `${selectedControlled.description} (${selectedControlled.code})` : "(nenhum)"}
        </div>
      </div>
    </>
  );
}
```

### 3) Fonte assíncrona + render personalizado

Suporte a loadingText, renderItem, renderGroupHeader, renderFooter e itemTooltip.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-combobox/samples/source-async-custom-render.tsx.sample`

```tsx
import * as React from "react";
import { SgCombobox } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
  region: string;
};

const COUNTRIES: Country[] = [
  { id: 1, description: "Brazil", code: "BR", region: "Americas" },
  { id: 2, description: "Argentina", code: "AR", region: "Americas" },
  { id: 3, description: "United States", code: "US", region: "Americas" },
  { id: 4, description: "Canada", code: "CA", region: "Americas" },
  { id: 5, description: "Germany", code: "DE", region: "Europe" },
  { id: 6, description: "France", code: "FR", region: "Europe" },
  { id: 7, description: "Portugal", code: "PT", region: "Europe" },
  { id: 8, description: "India", code: "IN", region: "Asia" },
  { id: 9, description: "Japan", code: "JP", region: "Asia" },
  { id: 10, description: "Australia", code: "AU", region: "Oceania" }
];

export default function Example() {
  const source = async () => {
    await new Promise((r) => setTimeout(r, 300));
    return COUNTRIES;
  };
  const [selectedAsync, setSelectedAsync] = React.useState<Country | null>(null);

  return (
    <>
      <SgCombobox<Country>
        id="cb-async"
        label="Country (async)"
        source={source}
        openOnFocus
        grouped
        loadingText="Loading countries..."
        mapItem={(raw) => ({
          id: raw.id,
          label: raw.description,
          value: raw.code,
          group: raw.region
        })}
        renderGroupHeader={(group) => <span className="uppercase tracking-wide">{group}</span>}
        renderItem={(item) => (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold">{item.value}</span>
            <span>{item.label}</span>
          </div>
        )}
        itemTooltip={(item) => <span>{item.label}</span>}
        renderFooter={(_, hasResults) => (
          <span className="text-xs text-muted-foreground">
            {hasResults ? "Select one item from the list." : "No records."}
          </span>
        )}
        onSelect={setSelectedAsync}
      />

      <div>
        {selectedAsync ? `Selected: ${selectedAsync.description} (${selectedAsync.code})` : "No item selected"}
      </div>
    </>
  );
}
```

### 4) Raio da borda

Aplica o raio no input e no dropdown.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-combobox/samples/border-radius.tsx.sample`

```tsx
import React from "react";
import { SgCombobox } from "@seedgrid/fe-components";

type Country = {
  id: number;
  description: string;
  code: string;
  region: string;
};

const COUNTRIES: Country[] = [
  { id: 1, description: "Brazil", code: "BR", region: "Americas" },
  { id: 2, description: "Argentina", code: "AR", region: "Americas" },
  { id: 3, description: "United States", code: "US", region: "Americas" },
  { id: 4, description: "Canada", code: "CA", region: "Americas" },
  { id: 5, description: "Germany", code: "DE", region: "Europe" },
  { id: 6, description: "France", code: "FR", region: "Europe" },
  { id: 7, description: "Portugal", code: "PT", region: "Europe" },
  { id: 8, description: "India", code: "IN", region: "Asia" },
  { id: 9, description: "Japan", code: "JP", region: "Asia" },
  { id: 10, description: "Australia", code: "AU", region: "Oceania" }
];

export default function Example() {
  return (
    <div className="w-96">
      <SgCombobox<Country>
        id="cb-radius"
        label="Country with custom radius"
        source={COUNTRIES}
        openOnFocus
        grouped
        borderRadius={14}
        mapItem={(raw) => ({
          id: raw.id,
          label: raw.description,
          value: raw.code,
          group: raw.region
        })}
      />
    </div>
  );
}
```

### 5) Lista simples

Toque no campo para abrir. Com o campo focado, digitar uma letra salta para o item que começa com ela (type-ahead).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-combobox/samples/lista-simples.tsx.sample`

```tsx
import React from "react";
import { SgCombobox } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="w-96">
      <SgCombobox<string> id="fruta" label="Fruta" source={["Abacate", "Abacaxi", "Banana", "Laranja", "Uva"]} />
    </div>
  );
}
```

### 6) Dentro de um formulário

name + control + required: a mensagem aparece no envio e some ao escolher.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-combobox/samples/formulario.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgCombobox } from "@seedgrid/fe-components";

export default function Example() {
  const { control, handleSubmit } = useForm<{ pagamento: string }>({ defaultValues: { pagamento: "" } });
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form className="w-96 space-y-3" onSubmit={handleSubmit((values) => setSubmitted(values.pagamento))}>
      <SgCombobox<string>
        id="pagamento"
        name="pagamento"
        control={control}
        label="Forma de pagamento"
        required
        requiredMessage="Escolha uma forma"
        source={["Boleto", "Cartão", "Pix"]}
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <div className="text-sm">Enviado: {submitted}</div> : null}
    </form>
  );
}
```

## SgCheckboxGroup

Página: `sg-checkbox-group/page.tsx` (17 exemplo(s) com código na página; abaixo 17).

### sectionTitles[0]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  const [selected, setSelected] = React.useState<(string | number)[]>(["option1"]);

  return (
    <>
      <SgCheckboxGroup
        id="basic"
        title="Choose options"
        source={BASIC_OPTIONS}
        value={selected}
        onChange={setSelected}
        style={{ border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 12, padding: 12 }}
      />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">Valores selecionados: <strong>[{selected.join(", ")}]</strong></p>
    </>
  );
}
```

### sectionTitles[1]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/orientation-horizontal.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Grape", value: "grape" }
];

export default function Example() {
  const [selected, setSelected] = React.useState<(string | number)[]>([]);

  return (
    <>
      <SgCheckboxGroup id="horizontal" title="Select fruits" source={FRUIT_OPTIONS} orientation="horizontal" value={selected} onChange={setSelected} />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">Valores selecionados: <strong>[{selected.join(", ")}]</strong></p>
    </>
  );
}
```

### sectionTitles[2]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/com-icones.tsx.sample`

```tsx
import React from "react";
import { Heart, Star, ThumbsUp } from "lucide-react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const OPTIONS_WITH_ICONS: SgCheckboxGroupOption[] = [
  { label: "Favorito", value: "favorite", icon: <Heart className="w-4 h-4" /> },
  { label: "Importante", value: "important", icon: <Star className="w-4 h-4" /> },
  { label: "Curtir", value: "like", icon: <ThumbsUp className="w-4 h-4" /> }
];

export default function Example() {
  return <SgCheckboxGroup id="with-icons" title="Choose actions" source={OPTIONS_WITH_ICONS} />;
}
```

### sectionTitles[3]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/apenas-icones.tsx.sample`

```tsx
import React from "react";
import { Circle, Square, Triangle } from "lucide-react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const SHAPE_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Circle", value: "circle", icon: <Circle className="w-5 h-5" /> },
  { label: "Square", value: "square", icon: <Square className="w-5 h-5" /> },
  { label: "Triangle", value: "triangle", icon: <Triangle className="w-5 h-5" /> }
];

export default function Example() {
  return <SgCheckboxGroup id="icon-only" title="Choose shapes" source={SHAPE_OPTIONS} iconOnly />;
}
```

### sectionTitles[4]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/selecao-controlada.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  const [selected, setSelected] = React.useState<(string | number)[]>(["option2"]);

  return (
    <>
      <SgCheckboxGroup id="controlled-selection" title="Controlled selection" source={BASIC_OPTIONS} value={selected} onChange={setSelected} />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">Value: [{selected.join(", ")}]</p>
    </>
  );
}
```

### sectionTitles[5]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/controle-externo-setvalue-getvalue.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, SgButton, SgGrid, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Grape", value: "grape" }
];

export default function Example() {
  const [selected, setSelected] = React.useState<(string | number)[]>(["banana"]);

  return (
    <div className="space-y-4">
      <SgCheckboxGroup id="external-control" title="Favorite fruits" source={FRUIT_OPTIONS} value={selected} onChange={setSelected} />
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton onClick={() => setSelected(["apple"])}>Set Apple</SgButton>
        <SgButton onClick={() => setSelected(["banana", "grape"])}>Banana + Grape</SgButton>
        <SgButton onClick={() => setSelected(FRUIT_OPTIONS.map((o) => o.value))}>Select All</SgButton>
        <SgButton onClick={() => setSelected([])}>Clear</SgButton>
      </SgGrid>
      <p className="text-sm text-[rgb(var(--sg-muted))]">Current value: <strong>[{selected.join(", ")}]</strong></p>
    </div>
  );
}
```

### sectionTitles[6]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/com-opcao-desabilitada.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const PRIORITY_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent", enabled: false }
];

export default function Example() {
  return <SgCheckboxGroup id="with-disabled-option" title="Priority level" source={PRIORITY_OPTIONS} />;
}
```

### sectionTitles[7]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/grupo-disabled.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  return <SgCheckboxGroup id="disabled-group" title="Options desabilitadas" source={BASIC_OPTIONS} value={["option2"]} enabled={false} />;
}
```

### sectionTitles[8]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/read-only.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Grape", value: "grape" }
];

export default function Example() {
  return <SgCheckboxGroup id="readonly" title="Current configuration (read-only)" source={FRUIT_OPTIONS} value={["banana", "grape"]} readOnly />;
}
```

### sectionTitles[9]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/obrigatorio-com-validacao.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { Mail, Phone, Home } from "lucide-react";
import { SgCheckboxGroup, SgButton, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const CONTACT_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Email", value: "email", icon: <Mail className="w-4 h-4" /> },
  { label: "Phone", value: "phone", icon: <Phone className="w-4 h-4" /> },
  { label: "In person", value: "in-person", icon: <Home className="w-4 h-4" /> }
];

export default function Example() {
  const { control, handleSubmit } = useForm();
  const onSubmit = (data: any) => alert(`Dados do formulario: ${JSON.stringify(data, null, 2)}`);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SgCheckboxGroup name="preference" title="Contact preference *" source={CONTACT_OPTIONS} control={control} required />
      <SgButton type="submit">Submit</SgButton>
    </form>
  );
}
```

### sectionTitles[10]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/horizontal-com-icones-coloridos.tsx.sample`

```tsx
import React from "react";
import { Sun, Moon, Cloud } from "lucide-react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const WEATHER_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Sun", value: "sun", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
  { label: "Moon", value: "moon", icon: <Moon className="w-5 h-5 text-blue-500" /> },
  { label: "Cloud", value: "cloud", icon: <Cloud className="w-5 h-5 text-gray-500" /> }
];

export default function Example() {
  return <SgCheckboxGroup id="horizontal-colored" title="Weather conditions" source={WEATHER_OPTIONS} orientation="horizontal" />;
}
```

### sectionTitles[11]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/selection-style-highlight-lista.tsx.sample`

```tsx
import React from "react";
import { Landmark, Bell, RefreshCw } from "lucide-react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const LIST_HIGHLIGHT_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Reserve", value: "reserve", icon: <Landmark className="w-4 h-4 text-indigo-600" /> },
  { label: "Alert", value: "alert", icon: <Bell className="w-4 h-4 text-rose-600" /> },
  { label: "Refresh", value: "refresh", icon: <RefreshCw className="w-4 h-4 text-emerald-600" /> }
];

export default function Example() {
  const [selected, setSelected] = React.useState<(string | number)[]>(["reserve"]);
  return (
    <>
      <SgCheckboxGroup id="highlight-list" title="Options" source={LIST_HIGHLIGHT_OPTIONS} value={selected} onChange={setSelected} selectionStyle="highlight" className="max-w-xs" />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">Value: <strong>[{selected.join(", ")}]</strong></p>
    </>
  );
}
```

### sectionTitles[12]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/com-groupbox-customizado.tsx.sample`

```tsx
import React from "react";
import { Heart, Star, ThumbsUp } from "lucide-react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const OPTIONS_WITH_ICONS: SgCheckboxGroupOption[] = [
  { label: "Favorito", value: "favorite", icon: <Heart className="w-4 h-4" /> },
  { label: "Importante", value: "important", icon: <Star className="w-4 h-4" /> },
  { label: "Curtir", value: "like", icon: <ThumbsUp className="w-4 h-4" /> }
];

export default function Example() {
  return (
    <SgCheckboxGroup
      id="custom-groupbox"
      title="Choose with custom style"
      source={OPTIONS_WITH_ICONS}
      groupBoxProps={{
        title: "Preferences",
        className: "border-2 border-[rgb(var(--sg-primary-500))]"
      }}
    />
  );
}
```

### sectionTitles[13]!

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/react-hook-form-register.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgCheckboxGroup, SgButton, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Grape", value: "grape" }
];

export default function Example() {
  const { register, handleSubmit } = useForm();
  const onSubmit = (data: any) => alert(`Dados do formulario: ${JSON.stringify(data, null, 2)}`);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SgCheckboxGroup name="fruits" title="Choose your fruits" source={FRUIT_OPTIONS} register={register} />
      <SgButton type="submit">Submit</SgButton>
    </form>
  );
}
```

### sectionTitles[15]!

Checkbox 'Selecionar todos' separado por divisor, com estado indeterminate quando parcialmente selecionado

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/check-all-showcheckall.tsx.sample`

```tsx
import React from "react";
import { Star } from "lucide-react";
import { SgCheckboxGroup, type SgCheckboxGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Sem label customizado (usa i18n)</p>
        <SgCheckboxGroup id="check-all" title="Select all example" source={BASIC_OPTIONS} showCheckAll />
      </div>
      <div>
        <p className="mb-2 text-xs text-muted-foreground">Com checkAllLabel e checkAllIcon</p>
        <SgCheckboxGroup id="check-all-custom" title="With custom label + icon" source={BASIC_OPTIONS} showCheckAll checkAllLabel="Marcar tudo" checkAllIcon={<Star className="w-4 h-4 text-yellow-500" />} />
      </div>
    </div>
  );
}
```

### sectionTitles[16]!

Estado inicial definido diretamente na prop checked de cada option (modo uncontrolled)

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/checked-inicial-no-source.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgCheckboxGroup
      id="source-checked"
      title="Favorite fruits (initial from source)"
      source={[
        { label: "Apple", value: "apple" },
        { label: "Banana", value: "banana", checked: true },
        { label: "Orange", value: "orange" },
        { label: "Grape", value: "grape", checked: true }
      ]}
    />
  );
}
```

### sectionTitles[17]!

Acesso imperativo por código: getChecked, checkAll, clearAll, setChecked

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-checkbox-group/samples/ref-imperativo.tsx.sample`

```tsx
import React from "react";
import { SgCheckboxGroup, SgButton, SgGrid, type SgCheckboxGroupOption, type SgCheckboxGroupRef } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgCheckboxGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  const checkboxRef = React.useRef<SgCheckboxGroupRef>(null);
  const [output, setOutput] = React.useState("");

  return (
    <>
      <SgCheckboxGroup ref={checkboxRef} id="ref-example" title="Select options" source={BASIC_OPTIONS} showCheckAll />
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton onClick={() => setOutput(JSON.stringify(checkboxRef.current?.getChecked()))}>getChecked()</SgButton>
        <SgButton onClick={() => { checkboxRef.current?.checkAll(); setOutput("checkAll()"); }}>checkAll()</SgButton>
        <SgButton onClick={() => { checkboxRef.current?.clearAll(); setOutput("clearAll()"); }}>clearAll()</SgButton>
        <SgButton onClick={() => { checkboxRef.current?.setChecked(["option2"]); setOutput('setChecked(["option2"])'); }}>setChecked</SgButton>
      </SgGrid>
      {output && <p className="text-sm">Output: <strong>{output}</strong></p>}
    </>
  );
}
```

## SgRadioGroup

Página: `sg-radio-group/page.tsx` (14 exemplo(s) com código na página; abaixo 14).

### 1) Básico

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgRadioGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  const [selectedBasic, setSelectedBasic] = React.useState<string | number | null>("option1");

  return (
    <>
      <SgRadioGroup
        id="basic"
        title="Choose an option"
        source={BASIC_OPTIONS}
        value={selectedBasic ?? undefined}
        onChange={setSelectedBasic}
        style={{ border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 12, padding: 12 }}
      />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">Valor selecionado: <strong>{selectedBasic}</strong></p>
    </>
  );
}
```

### 2) Orientação Horizontal

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/orientation-horizontal.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Uva", value: "grape" }
];

export default function Example() {
  const [selectedFruit, setSelectedFruit] = React.useState<string | number | null>(null);
  return <SgRadioGroup id="horizontal" title="Select a fruit" source={FRUIT_OPTIONS} orientation="horizontal" value={selectedFruit ?? undefined} onChange={setSelectedFruit} />;
}
```

### 3) Com Ícones

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/com-icones.tsx.sample`

```tsx
import React from "react";
import { Heart, Star, ThumbsUp } from "lucide-react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const OPTIONS_WITH_ICONS: SgRadioGroupOption[] = [
  { label: "Favorito", value: "favorite", icon: <Heart className="w-4 h-4" /> },
  { label: "Importante", value: "important", icon: <Star className="w-4 h-4" /> },
  { label: "Curtir", value: "like", icon: <ThumbsUp className="w-4 h-4" /> }
];

export default function Example() {
  return <SgRadioGroup id="with-icons" title="Choose an action" source={OPTIONS_WITH_ICONS} />;
}
```

### 4) Apenas Ícones (Icon Only)

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/apenas-icones.tsx.sample`

```tsx
import React from "react";
import { Circle, Square, Triangle } from "lucide-react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const SHAPE_OPTIONS: SgRadioGroupOption[] = [
  { label: "Circle", value: "circle", icon: <Circle className="w-5 h-5" /> },
  { label: "Square", value: "square", icon: <Square className="w-5 h-5" /> },
  { label: "Triangle", value: "triangle", icon: <Triangle className="w-5 h-5" /> }
];

export default function Example() {
  return <SgRadioGroup id="icon-only" title="Choose a shape" source={SHAPE_OPTIONS} iconOnly />;
}
```

### 5) Seleção Controlada

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/selecao-controlada.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgRadioGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  const [selectedControlled, setSelectedControlled] = React.useState<string | number | null>("option2");

  return (
    <>
      <SgRadioGroup id="controlled-selection" title="Controlled selection" source={BASIC_OPTIONS} value={selectedControlled ?? undefined} onChange={setSelectedControlled} />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">Value: {selectedControlled === null ? "None" : selectedControlled}</p>
    </>
  );
}
```

### 6) Controle Externo (setValue/getValue)

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/controle-externo-setvalue-getvalue.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, SgButton, SgGrid, type SgRadioGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Uva", value: "grape" }
];

export default function Example() {
  const [externalValue, setExternalValue] = React.useState<string | number | null>("banana");

  return (
    <div className="space-y-4">
      <SgRadioGroup id="external-control" title="Favorite fruit" source={FRUIT_OPTIONS} value={externalValue ?? undefined} onChange={setExternalValue} />
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton onClick={() => setExternalValue("apple")}>Set Apple</SgButton>
        <SgButton onClick={() => setExternalValue("banana")}>Set Banana</SgButton>
        <SgButton onClick={() => setExternalValue("orange")}>Set Orange</SgButton>
        <SgButton onClick={() => setExternalValue(null)}>Clear</SgButton>
      </SgGrid>
      <p className="text-sm text-[rgb(var(--sg-muted))]">Current value: <strong>{externalValue || "None"}</strong></p>
    </div>
  );
}
```

### 7) Com Opção Desabilitada

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/com-opcao-desabilitada.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const PRIORITY_OPTIONS: SgRadioGroupOption[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
  { label: "Urgent", value: "urgent", enabled: false }
];

export default function Example() {
  return <SgRadioGroup id="with-disabled-option" title="Priority level" source={PRIORITY_OPTIONS} />;
}
```

### 8) Grupo Desabilitado

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/grupo-disabled.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const BASIC_OPTIONS: SgRadioGroupOption[] = [
  { label: "Option 1", value: "option1" },
  { label: "Option 2", value: "option2" },
  { label: "Option 3", value: "option3" }
];

export default function Example() {
  return <SgRadioGroup id="disabled-group" title="Options desabilitadas" source={BASIC_OPTIONS} value="option2" enabled={false} />;
}
```

### 9) Somente Leitura

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/read-only.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Uva", value: "grape" }
];

export default function Example() {
  return <SgRadioGroup id="readonly" title="Current configuration (read-only)" source={FRUIT_OPTIONS} value="banana" readOnly />;
}
```

### 10) Obrigatório com Validação

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/obrigatorio-com-validacao.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgRadioGroup, SgButton, type SgRadioGroupOption } from "@seedgrid/fe-components";
import { Mail, Phone, Home } from "lucide-react";

const CONTACT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Email", value: "email", icon: <Mail className="w-4 h-4" /> },
  { label: "Phone", value: "phone", icon: <Phone className="w-4 h-4" /> },
  { label: "In person", value: "in-person", icon: <Home className="w-4 h-4" /> }
];

export default function Example() {
  const { control, handleSubmit } = useForm();

  const onSubmit = (data: unknown) => {
    alert(`Dados do formulario: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SgRadioGroup
        name="preference"
        title="Contact preference *"
        source={CONTACT_OPTIONS}
        control={control}
        required
      />
      <SgButton type="submit">Submit</SgButton>
    </form>
  );
}
```

### 11) Horizontal com Ícones Coloridos

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/horizontal-com-icones-coloridos.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";
import { Sun, Moon, Cloud } from "lucide-react";

const WEATHER_OPTIONS: SgRadioGroupOption[] = [
  { label: "Sun", value: "sun", icon: <Sun className="w-5 h-5 text-yellow-500" /> },
  { label: "Moon", value: "moon", icon: <Moon className="w-5 h-5 text-blue-500" /> },
  { label: "Cloud", value: "cloud", icon: <Cloud className="w-5 h-5 text-gray-500" /> }
];

export default function Example() {
  return <SgRadioGroup id="horizontal-colored" title="Weather condition" source={WEATHER_OPTIONS} orientation="horizontal" />;
}
```

### 12) Estilo de Seleção Destacado (Lista)

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/selection-style-highlight-lista.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";
import { Landmark, Bell, RefreshCw } from "lucide-react";

const LIST_HIGHLIGHT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Reserve", value: "reserve", icon: <Landmark className="w-4 h-4 text-indigo-600" /> },
  { label: "Alert", value: "alert", icon: <Bell className="w-4 h-4 text-rose-600" /> },
  { label: "Refresh", value: "refresh", icon: <RefreshCw className="w-4 h-4 text-emerald-600" /> }
];

export default function Example() {
  const [selectedHighlightStyle, setSelectedHighlightStyle] = React.useState<string | number | null>("reserve");

  return (
    <>
      <SgRadioGroup
        id="highlight-list"
        title="Options"
        source={LIST_HIGHLIGHT_OPTIONS}
        value={selectedHighlightStyle ?? undefined}
        onChange={setSelectedHighlightStyle}
        selectionStyle="highlight"
        className="max-w-xs"
      />
      <p className="mt-2 text-sm text-[rgb(var(--sg-muted))]">
        Value: <strong>{selectedHighlightStyle ?? "None"}</strong>
      </p>
    </>
  );
}
```

### 13) Com GroupBox Customizado

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/com-groupbox-customizado.tsx.sample`

```tsx
import React from "react";
import { SgRadioGroup, type SgRadioGroupOption } from "@seedgrid/fe-components";
import { Heart, Star, ThumbsUp } from "lucide-react";

const OPTIONS_WITH_ICONS: SgRadioGroupOption[] = [
  { label: "Favorito", value: "favorite", icon: <Heart className="w-4 h-4" /> },
  { label: "Importante", value: "important", icon: <Star className="w-4 h-4" /> },
  { label: "Curtir", value: "like", icon: <ThumbsUp className="w-4 h-4" /> }
];

export default function Example() {
  return (
    <SgRadioGroup
      id="custom-groupbox"
      title="Choose with custom style"
      source={OPTIONS_WITH_ICONS}
      groupBoxProps={{
        title: "Preferences",
        className: "border-2 border-[rgb(var(--sg-primary-500))]"
      }}
    />
  );
}
```

### 14) Formulário - Register

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-radio-group/samples/react-hook-form-register.tsx.sample`

```tsx
import React from "react";
import { useForm } from "react-hook-form";
import { SgRadioGroup, SgButton, type SgRadioGroupOption } from "@seedgrid/fe-components";

const FRUIT_OPTIONS: SgRadioGroupOption[] = [
  { label: "Apple", value: "apple" },
  { label: "Banana", value: "banana" },
  { label: "Orange", value: "orange" },
  { label: "Uva", value: "grape" }
];

export default function Example() {
  const { register, handleSubmit } = useForm();

  const onSubmit = (data: unknown) => {
    alert(`Dados do formulario: ${JSON.stringify(data, null, 2)}`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <SgRadioGroup
        name="fruit"
        title="Choose your fruit"
        source={FRUIT_OPTIONS}
        register={register}
      />
      <SgButton type="submit">Submit</SgButton>
    </form>
  );
}
```

## SgMultiSelect

Página: `sg-multi-select/page.tsx` (9 exemplo(s) com código na página; abaixo 9).

### 1) Básico (fechado / aberto, com e sem seleção)

Clique no campo para abrir. Marque várias opções; a lista continua aberta.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [empty, setEmpty] = React.useState<SgMultiSelectOptionValue[]>([]);
  const [preselected, setPreselected] = React.useState<SgMultiSelectOptionValue[]>(["e1", "e2", "e4"]);
  return (
    <>
      <SgMultiSelect
        id="ms-empty"
        label="Empresas"
        placeholder="Selecione as empresas"
        options={COMPANIES}
        value={empty}
        onChange={setEmpty}
      />
      <SgMultiSelect
        id="ms-preselected"
        label="Empresas (com seleção)"
        placeholder="Selecione as empresas"
        options={COMPANIES}
        value={preselected}
        onChange={setPreselected}
      />
    </>
  );
}
```

### 2) Com busca

searchable habilita um campo de busca no topo do dropdown.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/com-busca.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [searchable, setSearchable] = React.useState<SgMultiSelectOptionValue[]>(["e1"]);
  return (
    <SgMultiSelect
      id="ms-searchable"
      label="Empresas"
      placeholder="Selecione as empresas"
      options={COMPANIES}
      value={searchable}
      onChange={setSearchable}
      searchable
    />
  );
}
```

### 3) Limpável e com limite

clearable adiciona o botão de limpar; maxSelected restringe o número de itens.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/limpavel-e-com-limite.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [capped, setCapped] = React.useState<SgMultiSelectOptionValue[]>([]);
  return (
    <>
      <SgMultiSelect
        id="ms-capped"
        label="Empresas (máx. 2)"
        placeholder="Selecione até 2 empresas"
        options={COMPANIES}
        value={capped}
        onChange={setCapped}
        clearable
        maxSelected={2}
      />
      <SgButton size="sm" appearance="outline" onClick={() => setCapped([])}>
        Limpar
      </SgButton>
    </>
  );
}
```

### 4) Desabilitado

Com enabled=false o campo não abre nem altera a seleção.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/desabilitado.tsx.sample`

```tsx
import { SgMultiSelect } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  return (
    <SgMultiSelect
      id="ms-disabled"
      label="Empresas"
      placeholder="Selecione as empresas"
      options={COMPANIES}
      value={["e1", "e3"]}
      enabled={false}
    />
  );
}
```

### 5) Rótulo curto (chipLabel)

Cada opção pode ter chipLabel: o campo fechado resume a seleção com o texto curto (ex.: "1, 3") e a lista continua com o label completo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/rotulo-curto.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

// `label` aparece na lista (e é o que a busca procura); `chipLabel` é o texto curto do item
// já selecionado. Sem `chipLabel`, vale o `label`.
const BRANCHES = [
  { label: "1 - Matriz São Paulo", chipLabel: "1", value: 1 },
  { label: "2 - Filial Campinas", chipLabel: "2", value: 2 },
  { label: "3 - Filial Centro", chipLabel: "3", value: 3 },
  { label: "4 - Filial Ribeirão Preto", chipLabel: "4", value: 4 },
  { label: "5 - Depósito Jundiaí", chipLabel: "5", value: 5 }
];

export default function App() {
  const [branches, setBranches] = React.useState<SgMultiSelectOptionValue[]>([1, 3]);
  return (
    <SgMultiSelect
      id="ms-chip-label"
      label="Filiais"
      placeholder="Selecione as empresas"
      options={BRANCHES}
      value={branches}
      onChange={setBranches}
      searchable
    />
  );
}
```

### 6) Valor controlado

Com value, o pai manda: o campo só muda quando o value muda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/valor-controlado.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const TOPICS = [
  { label: "São Paulo", value: "sp" },
  { label: "Campinas", value: "cps" },
  { label: "Santos", value: "sts" }
];

export default function App() {
  const [controlled, setControlled] = React.useState<SgMultiSelectOptionValue[]>(["sp"]);
  return (
    <>
      <SgMultiSelect
        id="ms-controlled"
        label="Cidades"
        options={TOPICS}
        value={controlled}
        onChange={setControlled}
      />
      <SgButton size="sm" appearance="outline" onClick={() => setControlled(TOPICS.map((o) => o.value))}>
        Selecionar todas
      </SgButton>
      <SgButton size="sm" appearance="outline" onClick={() => setControlled([])}>
        Limpar
      </SgButton>
    </>
  );
}
```

### 7) Dentro de um formulário

name + control: o valor do campo no formulário é a lista de valores marcados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const FORM_OPTIONS = [
  { label: "Urgente", value: "urgente" },
  { label: "Financeiro", value: "fin" },
  { label: "Suporte", value: "sup" }
];

export default function App() {
  const { control, handleSubmit } = useForm<{ tags: SgMultiSelectOptionValue[] }>({ defaultValues: { tags: [] } });
  const [submitted, setSubmitted] = React.useState("");
  return (
    <form onSubmit={handleSubmit((values) => setSubmitted(values.tags.join(", ")))}>
      <SgMultiSelect
        id="ms-form"
        name="tags"
        control={control}
        label="Tags"
        options={FORM_OPTIONS}
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p>Enviado: {submitted}</p> : null}
    </form>
  );
}
```

### 8) Limite do resumo (summaryThreshold)

Por padrão o campo lista até 2 rótulos e depois mostra só a quantidade; summaryThreshold aumenta esse limite.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/limite-do-resumo.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelect, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [summary, setSummary] = React.useState<SgMultiSelectOptionValue[]>(["e1", "e2", "e4"]);
  return (
    <SgMultiSelect
      id="ms-summary"
      label="Empresas"
      placeholder="Selecione as empresas"
      summaryThreshold={4}
      options={COMPANIES}
      value={summary}
      onChange={setSummary}
    />
  );
}
```

### 9) Opção desabilitada e texto da busca

Uma opção com enabled false aparece desabilitada e não pode ser marcada; searchPlaceholder troca o texto do campo de busca.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select/samples/opcao-desabilitada-e-texto-da-busca.tsx.sample`

```tsx
import { SgMultiSelect } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6", enabled: false }
];

export default function App() {
  return (
    <SgMultiSelect
      id="ms-disabled-option"
      label="Empresas"
      placeholder="Selecione as empresas"
      searchable
      searchPlaceholder="Buscar empresa..."
      options={COMPANIES}
    />
  );
}
```

## SgMultiSelectChips

Página: `sg-multi-select-chips/page.tsx` (7 exemplo(s) com código na página; abaixo 7).

### 1) Básico (vazio / com chips)

Clique no campo para abrir. Cada item selecionado vira um chip com botão de remover.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [empty, setEmpty] = React.useState<SgMultiSelectOptionValue[]>([]);
  const [preselected, setPreselected] = React.useState<SgMultiSelectOptionValue[]>(["e1", "e2", "e4"]);
  return (
    <>
      <SgMultiSelectChips
        id="msc-empty"
        label="Empresas"
        placeholder="Selecione as empresas"
        options={COMPANIES}
        value={empty}
        onChange={setEmpty}
      />
      <SgMultiSelectChips
        id="msc-preselected"
        label="Empresas (com seleção)"
        placeholder="Selecione as empresas"
        options={COMPANIES}
        value={preselected}
        onChange={setPreselected}
      />
    </>
  );
}
```

### 2) Com busca

searchable habilita um campo de busca no topo do dropdown.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/com-busca.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [searchable, setSearchable] = React.useState<SgMultiSelectOptionValue[]>(["e1"]);
  return (
    <SgMultiSelectChips
      id="msc-searchable"
      label="Empresas"
      placeholder="Selecione as empresas"
      options={COMPANIES}
      value={searchable}
      onChange={setSearchable}
      searchable
    />
  );
}
```

### 3) Limpável e com limite

clearable adiciona o botão de limpar; maxSelected restringe o número de itens.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/limpavel-e-com-limite.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  const [capped, setCapped] = React.useState<SgMultiSelectOptionValue[]>([]);
  return (
    <>
      <SgMultiSelectChips
        id="msc-capped"
        label="Empresas (máx. 3)"
        placeholder="Selecione até 3 empresas"
        options={COMPANIES}
        value={capped}
        onChange={setCapped}
        clearable
        maxSelected={3}
      />
      <SgButton size="sm" appearance="outline" onClick={() => setCapped([])}>
        Limpar
      </SgButton>
    </>
  );
}
```

### 4) Desabilitado

Com enabled=false o campo não abre, nem remove chips.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/desabilitado.tsx.sample`

```tsx
import { SgMultiSelectChips } from "@seedgrid/fe-components";

const COMPANIES = [
  { label: "Empresa 1", value: "e1" },
  { label: "Empresa 2", value: "e2" },
  { label: "Empresa 3", value: "e3" },
  { label: "Empresa 4", value: "e4" },
  { label: "Empresa 5", value: "e5" },
  { label: "Empresa 6", value: "e6" }
];

export default function App() {
  return (
    <SgMultiSelectChips
      id="msc-disabled"
      label="Empresas"
      placeholder="Selecione as empresas"
      options={COMPANIES}
      value={["e1", "e3"]}
      enabled={false}
    />
  );
}
```

### 5) Rótulo curto (chipLabel)

Cada opção pode ter chipLabel: o chip mostra o texto curto (ex.: só o código) e a lista continua com o label completo. Passe o mouse no chip para ver o nome.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/rotulo-curto.tsx.sample`

```tsx
import * as React from "react";
import { SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

// `label` aparece na lista (e é o que a busca procura); `chipLabel` é o texto curto do item
// já selecionado. Sem `chipLabel`, vale o `label`.
const BRANCHES = [
  { label: "1 - Matriz São Paulo", chipLabel: "1", value: 1 },
  { label: "2 - Filial Campinas", chipLabel: "2", value: 2 },
  { label: "3 - Filial Centro", chipLabel: "3", value: 3 },
  { label: "4 - Filial Ribeirão Preto", chipLabel: "4", value: 4 },
  { label: "5 - Depósito Jundiaí", chipLabel: "5", value: 5 }
];

export default function App() {
  const [branches, setBranches] = React.useState<SgMultiSelectOptionValue[]>([1, 3]);
  return (
    <SgMultiSelectChips
      id="msc-chip-label"
      label="Filiais"
      placeholder="Selecione as empresas"
      options={BRANCHES}
      value={branches}
      onChange={setBranches}
      searchable
    />
  );
}
```

### 6) Valor controlado

Com value, o pai manda: o campo só muda quando o value muda.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/valor-controlado.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const TOPICS = [
  { label: "Flutter", value: "flutter" },
  { label: "React", value: "react" },
  { label: "Quarkus", value: "quarkus" }
];

export default function App() {
  const [controlled, setControlled] = React.useState<SgMultiSelectOptionValue[]>(["flutter"]);
  return (
    <>
      <SgMultiSelectChips
        id="msc-controlled"
        label="Frameworks"
        options={TOPICS}
        value={controlled}
        onChange={setControlled}
      />
      <SgButton size="sm" appearance="outline" onClick={() => setControlled(TOPICS.map((o) => o.value))}>
        Selecionar todas
      </SgButton>
      <SgButton size="sm" appearance="outline" onClick={() => setControlled([])}>
        Limpar
      </SgButton>
    </>
  );
}
```

### 7) Erro e formulário

required só acrescenta o asterisco ao rótulo; com name + control o campo guarda a lista de valores marcados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-multi-select-chips/samples/erro-e-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgMultiSelectChips, type SgMultiSelectOptionValue } from "@seedgrid/fe-components";

const FORM_OPTIONS = [
  { label: "Vendas", value: "vendas" },
  { label: "Compras", value: "compras" },
  { label: "Estoque", value: "estoque" }
];

export default function App() {
  const { control, handleSubmit } = useForm<{ areas: SgMultiSelectOptionValue[] }>({ defaultValues: { areas: [] } });
  const [submitted, setSubmitted] = React.useState("");
  return (
    <form onSubmit={handleSubmit((values) => setSubmitted(values.areas.join(", ")))}>
      <SgMultiSelectChips
        id="msc-form"
        name="areas"
        control={control}
        label="Áreas"
        required
        options={FORM_OPTIONS}
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? <p>Enviado: {submitted}</p> : null}
    </form>
  );
}
```

## SgOrderList

Página: `sg-order-list/page.tsx` (8 exemplo(s) com código na página; abaixo 8).

### 1) Básico (controles internos)

Selecione itens e use os botões Topo, Subir, Descer e Base; arrastar também reordena.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/basico-controles-internos.tsx.sample`

```tsx
import React from "react";
import { Bell, Heart, Landmark, RefreshCw, Star } from "lucide-react";
import { SgOrderList, type SgOrderListItem } from "@seedgrid/fe-components";

const PRODUCT_ITEMS: SgOrderListItem[] = [
  { label: "Notebook", value: "notebook", icon: <Landmark className="h-4 w-4" /> },
  { label: "Mouse", value: "mouse", icon: <RefreshCw className="h-4 w-4" /> },
  { label: "Teclado", value: "keyboard", icon: <Bell className="h-4 w-4" /> },
  { label: "Monitor", value: "monitor", icon: <Star className="h-4 w-4" /> },
  { label: "Webcam", value: "webcam", icon: <Heart className="h-4 w-4" /> }
];

export default function Example() {
  const [basicItems, setBasicItems] = React.useState<SgOrderListItem[]>(PRODUCT_ITEMS);

  return (
    <>
      <SgOrderList id="order-basic" title="Produtos" source={PRODUCT_ITEMS} value={basicItems} onChange={setBasicItems} />
      <p className="text-sm text-[rgb(var(--sg-muted))]">
        Ordem atual: <strong>{basicItems.map((item) => item.label).join(" > ")}</strong>
      </p>
    </>
  );
}
```

### 2) Seleção múltipla + controles externos

Com selectionMode multiple e showControls false, botões externos movem os itens selecionados e limpam a seleção.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/selecao-multipla-controles-externos-ref.tsx.sample`

```tsx
import React from "react";
import { SgOrderList, type SgOrderListItem, type SgOrderListRef, SgButton, SgGrid } from "@seedgrid/fe-components";

const PIPELINE_STEPS: SgOrderListItem[] = [
  { label: "Prospecção", value: "lead" },
  { label: "Qualificação", value: "qualify" },
  { label: "Proposta", value: "proposal" },
  { label: "Negociação", value: "negotiation" },
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
        <SgButton onClick={() => pipelineRef.current?.moveTop()}>Mover para o topo</SgButton>
        <SgButton onClick={() => pipelineRef.current?.moveUp()}>Subir</SgButton>
        <SgButton onClick={() => pipelineRef.current?.moveDown()}>Descer</SgButton>
        <SgButton onClick={() => pipelineRef.current?.moveBottom()}>Mover para a base</SgButton>
        <SgButton onClick={() => pipelineRef.current?.clearSelection()}>Limpar seleção</SgButton>
      </SgGrid>
    </div>
  );
}
```

### 3) Drag and drop sem botões

Com showControls false e draggable, a ordem muda arrastando os itens, sem botões.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/drag-and-drop-sem-botoes.tsx.sample`

```tsx
import React from "react";
import { SgOrderList, type SgOrderListItem } from "@seedgrid/fe-components";

const TEAM_ITEMS: SgOrderListItem[] = [
  { label: "Ana - Produto", value: "ana" },
  { label: "Bruno - Design", value: "bruno" },
  { label: "Carla - Frontend", value: "carla" },
  { label: "Diego - Backend", value: "diego" },
  { label: "Elaine - QA", value: "elaine" }
];

export default function Example() {
  const [teamItems, setTeamItems] = React.useState<SgOrderListItem[]>(TEAM_ITEMS);

  return (
    <>
      <SgOrderList
        id="order-drag"
        title="Time de atendimento"
        source={TEAM_ITEMS}
        value={teamItems}
        onChange={setTeamItems}
        showControls={false}
        draggable
      />
      <p className="text-xs text-muted-foreground">Dica: arraste os itens para reordenar, sem usar os botões.</p>
    </>
  );
}
```

### 4) Item personalizado e item desabilitado

itemTemplate personaliza o conteúdo de cada linha; um item com enabled false aparece desabilitado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/item-template-customizado-e-item-desabilitado.tsx.sample`

```tsx
import React from "react";
import { SgGrid, SgOrderList, type SgOrderListItem } from "@seedgrid/fe-components";

const BACKLOG_ITEMS: SgOrderListItem[] = [
  { label: "Implementar filtros", value: "filtros", data: { effort: "M", priority: "Alta" } },
  { label: "Ajustar layout mobile", value: "mobile", data: { effort: "S", priority: "Média" } },
  { label: "Refatorar API de pedidos", value: "api", data: { effort: "L", priority: "Alta" } },
  { label: "Atualizar testes E2E", value: "e2e", data: { effort: "M", priority: "Baixa" }, enabled: false }
];

export default function Example() {
  const [backlogItems, setBacklogItems] = React.useState<SgOrderListItem[]>(BACKLOG_ITEMS);

  return (
    <SgOrderList
      id="order-template"
      title="Backlog da sprint"
      source={BACKLOG_ITEMS}
      value={backlogItems}
      onChange={setBacklogItems}
      controlsPosition="right"
      itemTemplate={(item) => {
        const meta = item.data as { effort: string; priority: string } | undefined;
        return (
          <SgGrid columns={{ base: 1, sm: 2 }} gap={8} className="w-full">
            <span className="font-medium">{item.label}</span>
            <span className="text-xs text-[rgb(var(--sg-muted))]">
              {`Prioridade: ${meta?.priority ?? "-"} | Esforço: ${meta?.effort ?? "-"}`}
            </span>
          </SgGrid>
        );
      }}
    />
  );
}
```

### 5) Ordem controlada por estado externo

O pai controla a ordem pelo estado: value e onChange permitem restaurar, inverter e ordenar por fora.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/ordem-controlada-por-estado-externo.tsx.sample`

```tsx
import React from "react";
import { Bell, Heart, Landmark, RefreshCw, Star } from "lucide-react";
import { SgOrderList, type SgOrderListItem, SgButton, SgGrid } from "@seedgrid/fe-components";

const PRODUCT_ITEMS: SgOrderListItem[] = [
  { label: "Notebook", value: "notebook", icon: <Landmark className="h-4 w-4" /> },
  { label: "Mouse", value: "mouse", icon: <RefreshCw className="h-4 w-4" /> },
  { label: "Teclado", value: "keyboard", icon: <Bell className="h-4 w-4" /> },
  { label: "Monitor", value: "monitor", icon: <Star className="h-4 w-4" /> },
  { label: "Webcam", value: "webcam", icon: <Heart className="h-4 w-4" /> }
];

export default function Example() {
  const [controlledItems, setControlledItems] = React.useState<SgOrderListItem[]>(PRODUCT_ITEMS);

  return (
    <div className="space-y-4">
      <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
        <SgButton onClick={() => setControlledItems(PRODUCT_ITEMS)}>Restaurar</SgButton>
        <SgButton onClick={() => setControlledItems((prev) => [...prev].reverse())}>Inverter</SgButton>
        <SgButton onClick={() => setControlledItems((prev) => [...prev].sort((a, b) => a.label.localeCompare(b.label)))}>
          Ordenar A-Z
        </SgButton>
      </SgGrid>
      <SgOrderList
        id="order-controlled"
        title="Produtos (controlado)"
        source={PRODUCT_ITEMS}
        value={controlledItems}
        onChange={setControlledItems}
      />
    </div>
  );
}
```

### 6) Seleção única e controles à direita

selectionMode single permite um item por vez e controlsPosition right move os botões para a direita.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/selecao-unica-e-controles-a-direita.tsx.sample`

```tsx
import { SgOrderList, type SgOrderListItem } from "@seedgrid/fe-components";

const TASK_ITEMS: SgOrderListItem[] = [
  { label: "Escrever o plano", value: 1 },
  { label: "Revisar com o time", value: 2 },
  { label: "Publicar", value: 3 },
  { label: "Arquivado", value: 4, enabled: false },
  { label: "Comemorar", value: 5 }
];

export default function Example() {
  return (
    <SgOrderList
      id="order-single"
      title="Prioridades"
      source={TASK_ITEMS}
      selectionMode="single"
      controlsPosition="right"
    />
  );
}
```

### 7) Dentro de um formulário

Ao enviar, o formulário recebe a lista na ordem atual.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgOrderList, type SgOrderListItem } from "@seedgrid/fe-components";

const RANKING_ITEMS: SgOrderListItem[] = [
  { label: "Ouro", value: "ouro" },
  { label: "Prata", value: "prata" },
  { label: "Bronze", value: "bronze" }
];

export default function Example() {
  const [rankingItems, setRankingItems] = React.useState<SgOrderListItem[]>(RANKING_ITEMS);
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        setSubmitted(rankingItems.map((item) => item.label).join(" > "));
      }}
    >
      <SgOrderList
        id="order-form"
        title="Ranking"
        source={RANKING_ITEMS}
        value={rankingItems}
        onChange={setRankingItems}
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? (
        <p className="text-sm">
          Enviado: <strong>{submitted}</strong>
        </p>
      ) : null}
    </form>
  );
}
```

### 8) Seleção e lista por código

Seleciona a 3ª etapa por valor (setSelection), move a seleção para o topo (moveTop) e inverte a lista (setItems), sem usar os botões do componente.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-order-list/samples/selecao-e-lista-por-codigo.tsx.sample`

```tsx
import React from "react";
import { SgOrderList, type SgOrderListItem, type SgOrderListRef, SgButton, SgGrid } from "@seedgrid/fe-components";

const PIPELINE_STEPS: SgOrderListItem[] = [
  { label: "Prospecção", value: "lead" },
  { label: "Qualificação", value: "qualify" },
  { label: "Proposta", value: "proposal" },
  { label: "Negociação", value: "negotiation" },
  { label: "Fechamento", value: "close" }
];

export default function Example() {
  const codeRef = React.useRef<SgOrderListRef>(null);

  return (
    <div className="space-y-4">
      <SgOrderList
        ref={codeRef}
        id="order-code"
        title="Controlada"
        source={PIPELINE_STEPS}
      />
      <SgGrid columns={{ base: 1, md: 3 }} gap={8}>
        <SgButton onClick={() => codeRef.current?.setSelection(["proposal"])}>Selecionar a 3ª</SgButton>
        <SgButton onClick={() => codeRef.current?.moveTop()}>Mover para o topo</SgButton>
        <SgButton onClick={() => codeRef.current?.setItems([...(codeRef.current?.getItems() ?? [])].reverse())}>Inverter</SgButton>
      </SgGrid>
    </div>
  );
}
```

## SgPickList

Página: `sg-pick-list/page.tsx` (8 exemplo(s) com código na página; abaixo 8).

### 1) Básico

Mova itens entre origem e destino; onChange entrega as duas listas e o tipo da mudança.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgPickList, type SgPickListItem } from "@seedgrid/fe-components";

const ROADMAP_SOURCE: SgPickListItem[] = [
  { label: "Authentication", value: "auth" },
  { label: "Dashboard", value: "dashboard" },
  { label: "Notifications", value: "notifications" },
  { label: "Audit logs", value: "audit" },
  { label: "Billing", value: "billing" }
];

export default function Example() {
  const [basicValue, setBasicValue] = React.useState({ source: ROADMAP_SOURCE, target: [] as SgPickListItem[] });

  return (
    <>
      <SgPickList
        id="pick-basic"
        title="Roadmap planning"
        source={ROADMAP_SOURCE}
        target={[]}
        value={basicValue}
        onChange={(event) => setBasicValue({ source: event.source, target: event.target })}
      />
      <p className="text-sm text-[rgb(var(--sg-muted))]">
        Estado atual: source [{basicValue.source.length}] | target [{basicValue.target.length}]
      </p>
    </>
  );
}
```

### 2) Com Filtros

showSourceFilter e showTargetFilter adicionam busca em cada lista; sourceHeader e targetHeader trocam os cabeçalhos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/com-filtros.tsx.sample`

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

### 3) Somente transferência (sem ordenação)

Sem os botões de ordenar e sem arrastar: os itens só mudam de lista.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/somente-transferencia-sem-ordenacao.tsx.sample`

```tsx
import React from "react";
import { Bell, Landmark, RefreshCw, Star } from "lucide-react";
import { SgPickList, type SgPickListItem } from "@seedgrid/fe-components";

export default function Example() {
  const [transferOnlyValue, setTransferOnlyValue] = React.useState({
    source: [
      { label: "Backlog", value: "backlog", icon: <Landmark className="h-4 w-4" /> },
      { label: "In progress", value: "in-progress", icon: <RefreshCw className="h-4 w-4" /> },
      { label: "Review", value: "review", icon: <Bell className="h-4 w-4" /> }
    ] as SgPickListItem[],
    target: [
      { label: "Done", value: "done", icon: <Star className="h-4 w-4" /> }
    ] as SgPickListItem[]
  });

  return (
    <>
      <SgPickList
        id="pick-transfer-only"
        title="Transfer only"
        source={transferOnlyValue.source}
        target={transferOnlyValue.target}
        value={transferOnlyValue}
        onChange={(event) => setTransferOnlyValue({ source: event.source, target: event.target })}
        showSourceControls={false}
        showTargetControls={false}
        draggable={false}
      />
      <p className="text-xs text-muted-foreground">
        Exemplo para cenarios em que voce so precisa mover itens entre listas.
      </p>
    </>
  );
}
```

### 4) Reordenação com controles de lista

Arraste os itens ou use os controles de lista para reordenar dentro de cada lado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/reordenacao-com-controles-de-lista.tsx.sample`

```tsx
import React from "react";
import { SgPickList, type SgPickListItem } from "@seedgrid/fe-components";

export default function Example() {
  const [reorderValue, setReorderValue] = React.useState({
    source: [
      { label: "Task A", value: "task-a" },
      { label: "Task B", value: "task-b" },
      { label: "Task C", value: "task-c" }
    ] as SgPickListItem[],
    target: [
      { label: "Done X", value: "done-x" },
      { label: "Done Y", value: "done-y" }
    ] as SgPickListItem[]
  });

  return (
    <>
      <p className="text-sm text-muted-foreground">Dica: arraste itens entre listas ou dentro da mesma lista para reordenar.</p>
      <SgPickList
        id="pick-reorder"
        title="Sprint board"
        source={reorderValue.source}
        target={reorderValue.target}
        value={reorderValue}
        onChange={(event) => setReorderValue({ source: event.source, target: event.target })}
        showSourceControls
        showTargetControls
        draggable
      />
    </>
  );
}
```

### 5) Controles externos por ref

Os botões de mover ficam fora do componente e chamam moveToTarget, moveAllToTarget, moveToSource e moveAllToSource.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/controles-externos-por-ref.tsx.sample`

```tsx
import React from "react";
import { SgPickList, type SgPickListItem, type SgPickListRef, SgButton, SgGrid } from "@seedgrid/fe-components";

export default function Example() {
  const pickListRef = React.useRef<SgPickListRef>(null);
  const [externalValue, setExternalValue] = React.useState({
    source: [
      { label: "Email", value: "email" },
      { label: "SMS", value: "sms" },
      { label: "Push", value: "push" }
    ] as SgPickListItem[],
    target: [] as SgPickListItem[]
  });

  return (
    <div className="space-y-4">
      <SgPickList
        ref={pickListRef}
        id="pick-ref"
        title="Channels"
        source={externalValue.source}
        target={externalValue.target}
        value={externalValue}
        onChange={(event) => setExternalValue({ source: event.source, target: event.target })}
        showTransferControls={false}
        selectionMode="multiple"
      />
      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton onClick={() => pickListRef.current?.moveToTarget()}>Move &gt;</SgButton>
        <SgButton onClick={() => pickListRef.current?.moveAllToTarget()}>Move &gt;&gt;</SgButton>
        <SgButton onClick={() => pickListRef.current?.moveToSource()}>Move &lt;</SgButton>
        <SgButton onClick={() => pickListRef.current?.moveAllToSource()}>Move &lt;&lt;</SgButton>
      </SgGrid>
    </div>
  );
}
```

### 6) Item template customizado

itemTemplate recebe o item e o estado e desenha cada linha como você quiser.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/item-template-customizado.tsx.sample`

```tsx
import React from "react";
import { SgPickList, type SgPickListItem, SgGrid } from "@seedgrid/fe-components";

export default function Example() {
  const [templateValue, setTemplateValue] = React.useState({
    source: [
      { label: "Frontend", value: "frontend", data: { owner: "Ana", effort: "M" } },
      { label: "Backend", value: "backend", data: { owner: "Bruno", effort: "L" } },
      { label: "QA", value: "qa", data: { owner: "Carla", effort: "S" }, enabled: false }
    ] as SgPickListItem[],
    target: [] as SgPickListItem[]
  });

  return (
    <SgPickList
      id="pick-template"
      title="Team capacity"
      source={templateValue.source}
      target={templateValue.target}
      value={templateValue}
      onChange={(event) => setTemplateValue({ source: event.source, target: event.target })}
      itemTemplate={(item) => {
        const meta = item.data as { owner: string; effort: string } | undefined;
        return (
          <SgGrid columns={{ base: 1, sm: 2 }} gap={8} className="w-full">
            <span className="font-medium">{item.label}</span>
            <span className="text-xs text-[rgb(var(--sg-muted))]">
              {"Owner: " + (meta?.owner ?? "-") + " | Effort: " + (meta?.effort ?? "-")}
            </span>
          </SgGrid>
        );
      }}
    />
  );
}
```

### 7) Dentro de um formulário

name + control: o valor do formulário são as duas listas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import React from "react";
import { SgPickList, type SgPickListItem, type SgPickListValue, SgButton } from "@seedgrid/fe-components";
import { useForm } from "react-hook-form";

const TEAM_SOURCE: SgPickListItem[] = [
  { label: "Ana", value: "ana" },
  { label: "Bruno", value: "bruno" },
  { label: "Carla", value: "carla" }
];

export default function Example() {
  const { control, handleSubmit } = useForm<{ equipe: SgPickListValue }>();
  const [submitted, setSubmitted] = React.useState("");

  return (
    <form
      className="space-y-3"
      onSubmit={handleSubmit((values) => setSubmitted((values.equipe?.target ?? []).map((item) => item.label).join(", ")))}
    >
      <SgPickList
        id="pick-form"
        name="equipe"
        control={control}
        title="Equipe"
        source={TEAM_SOURCE}
        target={[]}
      />
      <SgButton type="submit">Enviar</SgButton>
      {submitted ? (
        <p className="text-sm">
          Enviado: <strong>{submitted}</strong>
        </p>
      ) : null}
    </form>
  );
}
```

### 8) Filtro por início e seleção única

filterMatchMode startsWith filtra pelo começo do texto e selectionMode single permite marcar um item por vez.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-pick-list/samples/filtro-por-inicio-e-selecao-unica.tsx.sample`

```tsx
import { SgPickList, type SgPickListItem } from "@seedgrid/fe-components";

const CITIES: SgPickListItem[] = [
  { label: "Berlin", value: "berlin" },
  { label: "Boston", value: "boston" },
  { label: "Lisbon", value: "lisbon" },
  { label: "Madrid", value: "madrid" },
  { label: "Sao Paulo", value: "sao-paulo" }
];

export default function Example() {
  return (
    <SgPickList
      id="pick-starts-with"
      title="Cidades"
      source={CITIES}
      target={[]}
      showSourceFilter
      showTargetFilter
      filterMatchMode="startsWith"
      selectionMode="single"
    />
  );
}
```

## SgPeriodSelector

Página: `sg-period-selector/page.tsx` (2 exemplo(s) com código na página; abaixo 2).

### Idioma e data de referência

locale troca rótulos e grupos (pt-BR, en-US, es, pt-PT, fr). referenceDate fixa o "hoje" usado para resolver os presets.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-period-selector/samples/idioma-e-data-de-referencia.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgPeriodSelector } from "@seedgrid/fe-components";

import type { ResolvedPeriod } from "@seedgrid/fe-components";

export default function Example() {
  const [period, setPeriod] = React.useState<ResolvedPeriod | null>(null);

  return (
    <div className="w-96">
      <SgPeriodSelector
        id="ps-english"
        label="Period"
        locale="en-US"
        referenceDate={new Date(2024, 1, 29)}
        onChange={setPeriod}
      />
      <pre className="mt-2 rounded border border-border bg-foreground/5 p-2 text-xs">
        {period ? `${period.label}: ${period.startDate} to ${period.endDate}` : "No period chosen"}
      </pre>
    </div>
  );
}
```

### Dentro de um formulário

name + control: o formulário guarda o texto do preset (por exemplo THIS_MONTH).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-period-selector/samples/dentro-de-um-formulario.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgPeriodSelector, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  const [enviado, setEnviado] = React.useState("");
  const { control, handleSubmit } = useForm<{ periodo?: string }>({});

  return (
    <form onSubmit={handleSubmit((values) => setEnviado(String(values.periodo)))}>
      <SgStack gap={12} align="start">
        <SgPeriodSelector id="periodo-form" name="periodo" control={control} label="Período do relatório" />
        <SgButton type="submit">Enviar</SgButton>
        {enviado ? <p className="text-sm">Enviado: {enviado}</p> : null}
      </SgStack>
    </form>
  );
}
```

## SgYearPartSelector

Página: `sg-year-part-selector/page.tsx` (1 exemplo(s) com código na página; abaixo 1).

### Valor controlado

Com value, o pai manda: escolher emite onChange e o campo só muda quando o value muda. Fatia que não existe no recorte cai na primeira.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-year-part-selector/samples/valor-controlado.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgYearPartSelector, YearPartKind, type YearPartValue } from "@seedgrid/fe-components";

// Com value o pai manda: escolher emite onChange e o campo só muda quando o value muda.
// Uma fatia que não existe no recorte cai na primeira.
export default function Example() {
  const [controlled, setControlled] = React.useState<YearPartValue>({
    year: 2024,
    kind: YearPartKind.QUARTER,
    part: 1
  });

  return (
    <div className="w-full max-w-xl">
      <SgYearPartSelector
        id="yps-controlled"
        label="Recorte do ano"
        locale="pt-BR"
        value={controlled}
        onChange={(resolved) => setControlled(resolved.value)}
      />
      <div className="mt-2 flex flex-wrap gap-2">
        <SgButton
          appearance="outline"
          onClick={() => setControlled({ year: 2024, kind: YearPartKind.QUARTER, part: 1 })}
        >
          1º trimestre de 2024
        </SgButton>
        <SgButton
          appearance="outline"
          onClick={() => setControlled({ year: 2023, kind: YearPartKind.BIMESTER, part: 2 })}
        >
          2º bimestre de 2023
        </SgButton>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Valor: {controlled.year} - {controlled.kind.toLowerCase()} {controlled.part}
      </p>
    </div>
  );
}
```

## SgToggleSwitch

Página: `sg-toggle-switch/page.tsx` (9 exemplo(s) com código na página; abaixo 9).

### 1) Básico

Exemplo simples controlado por estado; clique no rótulo ou na chave (Tab foca e Espaço alterna).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(false);

  return (
    <div>
      <SgToggleSwitch
        id="demo-basic"
        label="Ativar notificações"
        checked={value}
        onChange={setValue}
      />
      <p>Valor atual: {String(value)}</p>
    </div>
  );
}
```

### 2) Com ícones (on/off)

Variação visual com ícones dentro do thumb para indicar ligado e desligado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/com-icones-on-off.tsx.sample`

```tsx
import * as React from "react";
import { Check, X } from "lucide-react";
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(true);

  return (
    <div>
      <SgToggleSwitch
        id="demo-icons"
        label="Status da conta"
        checked={value}
        onChange={setValue}
        onIcon={<Check size={12} />}
        offIcon={<X size={12} />}
      />
      <p>Valor atual: {String(value)}</p>
    </div>
  );
}
```

### 3) Atualização remota

Ao alterar a chave, simulamos uma atualização remota para representar um fluxo comum de persistência.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/remote-simulacao-de-update.tsx.sample`

```tsx
import * as React from "react";
import { Check, X } from "lucide-react";
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [log, setLog] = React.useState<string[]>([]);

  const handleRemoteToggle = (nextValue: boolean) => {
    setValue(nextValue);
    setLoading(true);
    setTimeout(() => {
      setLog((prev) => ["value=" + String(nextValue), ...prev].slice(0, 8));
      setLoading(false);
    }, 450);
  };

  return (
    <div>
      <SgToggleSwitch
        id="demo-remote"
        label={loading ? "Salvando..." : "Publicar automaticamente"}
        checked={value}
        onChange={handleRemoteToggle}
        enabled={!loading}
        onIcon={<Check size={12} />}
        offIcon={<X size={12} />}
      />
      <div>{log.map((entry, index) => <div key={index}>{entry}</div>)}</div>
    </div>
  );
}
```

### 4) Controlado externamente + captura do valor

Valor controlado por estado externo e captura via onChange.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/controlado-externamente-captura-do-valor.tsx.sample`

```tsx
import * as React from "react";
import { Check, X } from "lucide-react";
import { SgButton, SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(false);
  const [captured, setCaptured] = React.useState("(sem evento)");

  return (
    <div>
      <SgToggleSwitch
        id="demo-external"
        label="Permitir sincronização"
        checked={value}
        onChange={(next) => {
          setValue(next);
          setCaptured("onChange -> " + String(next));
        }}
        onIcon={<Check size={12} />}
        offIcon={<X size={12} />}
      />

      <SgButton appearance="outline" size="sm" onClick={() => setValue(true)}>Setar true</SgButton>
      <SgButton appearance="outline" size="sm" onClick={() => setValue(false)}>Setar false</SgButton>
      <SgButton appearance="outline" size="sm" onClick={() => setValue((prev) => !prev)}>Toggle externo</SgButton>
      <SgButton appearance="outline" size="sm" onClick={() => setCaptured("captura manual -> " + String(value))}>Capturar agora</SgButton>

      <p>capturado: {captured}</p>
    </div>
  );
}
```

### 5) Dentro de um formulário

Ligado ao formulário por name + control; o valor sai no envio.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/react-hook-form.tsx.sample`

```tsx
import * as React from "react";
import { Check, X } from "lucide-react";
import { useForm, type FieldValues } from "react-hook-form";
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  const [submitResult, setSubmitResult] = React.useState("-");
  const { register, control, handleSubmit, watch } = useForm<FieldValues>({
    defaultValues: {
      notifications: false,
      active: true
    } as FieldValues
  });

  return (
    <form onSubmit={handleSubmit((data) => setSubmitResult(JSON.stringify(data)))}>
      <SgToggleSwitch
        id="demo-rhf-register"
        name="notifications"
        label="Receber notificações por email"
        register={register}
      />

      <SgToggleSwitch
        id="demo-rhf-control"
        name="active"
        label="Conta ativa"
        control={control}
        onIcon={<Check size={12} />}
        offIcon={<X size={12} />}
      />

      <button type="submit">Enviar</button>
      <p>watch.notifications: {String(watch("notifications"))}</p>
      <p>watch.active: {String(watch("active"))}</p>
      <p>Último submit: {submitResult}</p>
    </form>
  );
}
```

### 6) Desabilitado e somente leitura

Demonstra os estados enabled: false e readOnly.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/estados-disabled-read-only.tsx.sample`

```tsx
import * as React from "react";
import { Check, X } from "lucide-react";
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div>
      <SgToggleSwitch
        id="demo-disabled"
        label="Disabled"
        checked
        enabled={false}
        onIcon={<Check size={12} />}
        offIcon={<X size={12} />}
      />

      <SgToggleSwitch
        id="demo-readonly"
        label="ReadOnly"
        checked={false}
        readOnly
        onIcon={<Check size={12} />}
        offIcon={<X size={12} />}
      />
    </div>
  );
}
```

### 7) Validação

required valida ao sair do campo (validateOnBlur) ou a cada mudança (validateOnBlur: false).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/validacao.tsx.sample`

```tsx
import { SgStack, SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack gap={12} align="start">
      <SgToggleSwitch
        id="termos"
        label="Aceito os termos"
        required
        requiredMessage="Aceite os termos para continuar"
      />
      <SgToggleSwitch
        id="regra"
        label="Não pode ligar"
        validateOnBlur={false}
        validation={(checked) => (checked ? "Esta chave deve ficar desligada" : null)}
      />
    </SgStack>
  );
}
```

### 8) Erro externo e largura

error mostra uma mensagem vinda de fora; width limita a largura do componente.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/erro-externo-e-largura.tsx.sample`

```tsx
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgToggleSwitch
      id="erro"
      label="Aceito os termos"
      error="Aceite os termos para continuar"
      width={280}
    />
  );
}
```

### 9) Estado inicial (defaultChecked)

defaultChecked define o estado inicial; depois disso a chave controla a si mesma (modo não controlado).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toggle-switch/samples/estado-inicial-defaultchecked.tsx.sample`

```tsx
import { SgToggleSwitch } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="rounded-md border border-border p-4">
      <SgToggleSwitch id="demo-default" label="Receber novidades" defaultChecked />
    </div>
  );
}
```

## SgRating

Página: `sg-rating/page.tsx` (8 exemplo(s) com código na página; abaixo 8).

### 1) Básico

Exemplo controlado com estado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(0);

  return (
    <div className="space-y-2">
      <SgRating
        value={value}
        onChange={setValue}
        style={{ border: "1px solid rgba(59, 130, 246, 0.25)", borderRadius: 12, padding: 12 }}
      />
      <p className="text-sm text-muted-foreground">
        Current value: <strong>{value}</strong>
      </p>
    </div>
  );
}
```

### 2) Meia estrela + tooltip

Permite clicar nas metades e exibir valor no hover.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/meia-estrela-tooltip.tsx.sample`

```tsx
import * as React from "react";
import { SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(2.5);
  const [hover, setHover] = React.useState<number | null>(null);

  return (
    <div className="space-y-2">
      <SgRating
        label="Hover and click half stars"
        value={value}
        allowHalf
        showTooltip
        onChange={setValue}
        onHover={setHover}
      />
      <p className="text-sm text-muted-foreground">
        Selected: <strong>{value}</strong> | Hover: <strong>{hover ?? "none"}</strong>
      </p>
    </div>
  );
}
```

### 3) Read-only e desabilitado

Visualização sem interação e estado desabilitado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/read-only-e-desabilitado.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgRating } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={16}>
      <SgRating label="Read-only" value={3.5} allowHalf readOnly />
      <SgRating label="Desabilitado" value={2} enabled={false} />
    </SgGrid>
  );
}
```

### 4) Tamanhos e quantidade de estrelas

Controle de size e stars.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/tamanhos-e-quantidade-de-estrelas.tsx.sample`

```tsx
import * as React from "react";
import { SgGrid, SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [smValue, setSmValue] = React.useState(3);
  const [lgValue, setLgValue] = React.useState(4);
  const [manyValue, setManyValue] = React.useState(7);

  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={16}>
      <SgRating label="sm / 5 estrelas" size="sm" value={smValue} onChange={setSmValue} />
      <SgRating label="lg / 5 estrelas" size="lg" value={lgValue} onChange={setLgValue} />
      <SgRating label="10 estrelas" stars={10} size="sm" value={manyValue} onChange={setManyValue} />
    </SgGrid>
  );
}
```

### 5) Cores e ícones customizados

Troca de cores e ícones de preenchido/vazio.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/cores-e-icones-customizados.tsx.sample`

```tsx
import * as React from "react";
import { Flame, Heart, ThumbsUp } from "lucide-react";
import { SgGrid, SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [heartValue, setHeartValue] = React.useState(4);
  const [likeValue, setLikeValue] = React.useState(3);
  const [fireValue, setFireValue] = React.useState(5);

  return (
    <SgGrid columns={{ base: 1, md: 2 }} gap={16}>
      <SgRating
        label="Heart"
        value={heartValue}
        color="#ec4899"
        emptyColor="#f9a8d4"
        onIcon={<Heart size={24} fill="currentColor" />}
        offIcon={<Heart size={24} />}
        onChange={setHeartValue}
      />

      <SgRating
        label="Likes"
        value={likeValue}
        color="#2563eb"
        emptyColor="#93c5fd"
        onIcon={<ThumbsUp size={24} fill="currentColor" />}
        offIcon={<ThumbsUp size={24} />}
        onChange={setLikeValue}
      />

      <SgRating
        label="Fire"
        value={fireValue}
        color="#f97316"
        emptyColor="#fdba74"
        onIcon={<Flame size={24} fill="currentColor" />}
        offIcon={<Flame size={24} />}
        onChange={setFireValue}
      />
    </SgGrid>
  );
}
```

### 6) Callbacks

Exemplo com onChange e onHover + log de eventos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/callbacks.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgGrid, SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(3);
  const [hover, setHover] = React.useState<number | null>(null);
  const [logs, setLogs] = React.useState<string[]>([]);

  const pushLog = React.useCallback((msg: string) => {
    setLogs((prev) => [msg, ...prev].slice(0, 8));
  }, []);

  return (
    <div className="space-y-3">
      <SgRating
        label="Callbacks"
        value={value}
        allowHalf
        onChange={(next) => {
          setValue(next);
          pushLog("onChange -> " + String(next));
        }}
        onHover={setHover}
      />

      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(0)}>
          Reset
        </SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(5)}>
          Max
        </SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setLogs([])}>
          Clear log
        </SgButton>
      </SgGrid>

      <p className="text-sm text-muted-foreground">
        Selected: <strong>{value}</strong> | Hover: <strong>{hover ?? "none"}</strong>
      </p>

      <div className="h-28 overflow-y-auto rounded border border-border bg-foreground/5 p-2 font-mono text-xs">
        {logs.length === 0 ? "No events" : logs.map((entry, index) => <div key={index}>{entry}</div>)}
      </div>
    </div>
  );
}
```

### 7) Dentro de um formulário

Uso com control/name e submit.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/react-hook-form.tsx.sample`

```tsx
import * as React from "react";
import { useForm, type FieldValues } from "react-hook-form";
import { SgButton, SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [submitResult, setSubmitResult] = React.useState("-");
  const { control, handleSubmit, watch } = useForm<FieldValues>({
    defaultValues: {
      productRating: 4,
      movieRating: 2.5
    }
  });

  return (
    <form onSubmit={handleSubmit((data) => setSubmitResult(JSON.stringify(data)))} className="space-y-4">
      <SgRating label="Rate the product" name="productRating" control={control} />
      <SgRating label="Rate the movie" name="movieRating" control={control} allowHalf />
      <SgButton type="submit" size="sm">Submit rating</SgButton>
      <p className="text-xs text-muted-foreground">
        watch.productRating: <strong>{String(watch("productRating"))}</strong>
        {" | "}
        watch.movieRating: <strong>{String(watch("movieRating"))}</strong>
      </p>
      <p className="text-xs text-muted-foreground">Last submit: {submitResult}</p>
    </form>
  );
}
```

### 8) Campo obrigatório

Exemplo com required e requiredMessage.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-rating/samples/campo-obrigatorio.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgGrid, SgRating } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(0);

  return (
    <div className="space-y-3">
      <SgRating
        label="Required rating"
        value={value}
        required
        requiredMessage="Provide a rating before continuing"
        onChange={setValue}
      />

      <SgGrid columns={{ base: 2, md: 4 }} gap={8}>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(0)}>Clear</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(1)}>Rate 1</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(5)}>Rate 5</SgButton>
      </SgGrid>

      <p className="text-sm text-muted-foreground">
        Current value: <strong>{value}</strong>
      </p>
    </div>
  );
}
```

## SgSlider

Página: `sg-slider/page.tsx` (7 exemplo(s) com código na página; abaixo 7).

### 1) Básico

Define minValue e maxValue com um valor inicial via defaultValue.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgSlider } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(50);

  return (
    <div className="max-w-sm space-y-2">
      <SgSlider
        id="slider-basic"
        minValue={0}
        maxValue={100}
        defaultValue={50}
        onChange={setValue}
      />
      <p className="text-sm text-muted-foreground">
        Valor atual: <span className="font-semibold text-foreground">{value}</span>
      </p>
    </div>
  );
}
```

### 2) Controle externo

O valor pode ser definido externamente pela prop value.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/controle-externo.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgSlider } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(35);

  return (
    <div className="max-w-sm space-y-3">
      <SgSlider
        id="slider-controlled"
        minValue={0}
        maxValue={100}
        value={value}
        onChange={setValue}
      />
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" appearance="outline" onClick={() => setValue(0)}>Min</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(50)}>Meio</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(100)}>Max</SgButton>
      </div>
      <p className="text-sm text-muted-foreground">
        Valor controlado: <span className="font-semibold text-foreground">{value}</span>
      </p>
    </div>
  );
}
```

### 3) Passo e largura

Mostra step com width numérica e width em string CSS.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/step-e-width.tsx.sample`

```tsx
import React from "react";
import { SgSlider } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(25);

  return (
    <div className="space-y-3">
      <SgSlider
        id="slider-step-width-number"
        minValue={0}
        maxValue={60}
        step={5}
        width={320}
        value={value}
        onChange={setValue}
      />
      <SgSlider
        id="slider-step-width-string"
        minValue={-20}
        maxValue={20}
        step={2}
        width="18rem"
        defaultValue={4}
      />
      <p className="text-sm text-muted-foreground">
        Valor com step 5: <span className="font-semibold text-foreground">{value}</span>
      </p>
    </div>
  );
}
```

### 4) ariaLabel e desabilitado

Mostra acessibilidade (ariaLabel) e estado desabilitado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/aria-label-e-desabilitado.tsx.sample`

```tsx
import { SgSlider } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgSlider
        id="slider-aria-class"
        minValue={0}
        maxValue={100}
        defaultValue={40}
        width="20rem"
        ariaLabel="Nível de prioridade"
      />
      <SgSlider
        id="slider-disabled"
        minValue={0}
        maxValue={100}
        value={65}
        enabled={false}
        ariaLabel="Slider desabilitado"
        width="20rem"
      />
    </div>
  );
}
```

### 5) className e inputProps

Aplica className e passa atributos nativos de input e eventos extras via inputProps (recursos de CSS e DOM, só no React).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/class-name-e-input-props.tsx.sample`

```tsx
import React from "react";
import { SgSlider } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(70);
  const [focusCount, setFocusCount] = React.useState(0);

  return (
    <div className="space-y-2">
      <p id="slider-input-props-help" className="text-sm text-muted-foreground">
        Use Tab para focar o slider.
      </p>
      <SgSlider
        id="slider-input-props"
        minValue={0}
        maxValue={100}
        value={value}
        ariaLabel="Volume de notificações"
        className="accent-[#c56a2d]"
        onChange={setValue}
        inputProps={{
          name: "notificationVolume",
          title: "Volume de notificações",
          "aria-describedby": "slider-input-props-help",
          onFocus: () => setFocusCount((prev) => prev + 1)
        }}
      />
      <p className="text-sm text-muted-foreground">
        Valor: <span className="font-semibold text-foreground">{value}</span> | Focos:{" "}
        <span className="font-semibold text-foreground">{focusCount}</span>
      </p>
    </div>
  );
}
```

### 6) Mensagem de erro

O texto de error aparece abaixo do slider e marca o campo como inválido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/mensagem-de-erro.tsx.sample`

```tsx
"use client";

import { SgSlider } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="max-w-sm">
      <SgSlider id="slider-error" minValue={0} maxValue={10} defaultValue={9} error="Valor alto demais" />
    </div>
  );
}
```

### 7) Dentro de um formulário

name + control: o formulário guarda o valor escolhido.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-slider/samples/dentro-de-um-formulario.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgSlider, SgStack } from "@seedgrid/fe-components";

export default function Example() {
  const [enviado, setEnviado] = React.useState("");
  const { control, handleSubmit } = useForm<{ brilho: number }>({ defaultValues: { brilho: 40 } });

  return (
    <form onSubmit={handleSubmit((values) => setEnviado(String(values.brilho)))}>
      <SgStack gap={12} align="start">
        <SgSlider id="brilho" name="brilho" control={control} minValue={0} maxValue={100} step={10} />
        <SgButton type="submit">Enviar</SgButton>
        {enviado ? <p className="text-sm">Enviado: {enviado}</p> : null}
      </SgStack>
    </form>
  );
}
```

## SgStepperInput

Página: `sg-stepper-input/page.tsx` (6 exemplo(s) com código na página; abaixo 6).

### 1) Básico

Ajuste por setas com minValue, maxValue e step.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-stepper-input/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(12);

  return (
    <div className="space-y-2">
      <SgStepperInput
        id="stepper-basic"
        minValue={0}
        maxValue={40}
        step={2}
        defaultValue={12}
        width={210}
        onChange={setValue}
      />
      <p>Valor atual: {value}</p>
    </div>
  );
}
```

### 2) Controle externo

O valor é controlado pela prop value; os botões alteram o número de fora do campo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-stepper-input/samples/controle-externo.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  const [value, setValue] = React.useState(18);

  return (
    <div className="space-y-3">
      <SgStepperInput
        id="stepper-controlled"
        minValue={10}
        maxValue={30}
        step={1}
        value={value}
        width={210}
        onChange={setValue}
      />
      <div className="flex flex-wrap gap-2">
        <SgButton size="sm" appearance="outline" onClick={() => setValue(10)}>10</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(20)}>20</SgButton>
        <SgButton size="sm" appearance="outline" onClick={() => setValue(30)}>30</SgButton>
      </div>
      <p>Valor controlado: {value}</p>
    </div>
  );
}
```

### 3) Somente leitura e desabilitado

readOnly bloqueia a edição, enabled: false desabilita o campo e error mostra a mensagem de erro.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-stepper-input/samples/read-only-e-disabled.tsx.sample`

```tsx
import React from "react";
import { SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgStepperInput id="stepper-readonly" minValue={0} maxValue={10} value={7} readOnly />
      <SgStepperInput id="stepper-disabled" minValue={0} maxValue={10} value={4} enabled={false} />
      <SgStepperInput id="stepper-error" minValue={0} maxValue={10} error="Escolha ao menos 1" />
    </div>
  );
}
```

### 4) Passo e limites

step define o incremento (aceita decimais); no limite o botão fica desabilitado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-stepper-input/samples/passo-e-limites.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStack, SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack gap={12} align="start">
      <SgStepperInput id="de-cinco" minValue={0} maxValue={50} step={5} width={160} />
      <SgStepperInput id="meio" minValue={0} maxValue={5} step={0.5} defaultValue={2.5} width={160} />
    </SgStack>
  );
}
```

### 5) Dentro de um formulário

name + control: o formulário guarda um número.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-stepper-input/samples/dentro-de-um-formulario.tsx.sample`

```tsx
import * as React from "react";
import { useForm } from "react-hook-form";
import { SgButton, SgStack, SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  const [enviado, setEnviado] = React.useState("");
  const { control, handleSubmit } = useForm<{ qtd: number }>({ defaultValues: { qtd: 0 } });

  return (
    <form onSubmit={handleSubmit((values) => setEnviado(String(values.qtd)))}>
      <SgStack gap={12} align="start">
        <SgStepperInput id="qtd" name="qtd" control={control} minValue={0} maxValue={9} width={160} />
        <SgButton type="submit">Enviar</SgButton>
        {enviado ? <p className="text-sm">Enviado: {enviado}</p> : null}
      </SgStack>
    </form>
  );
}
```

### 6) Rótulo de acessibilidade (ariaLabel)

ariaLabel dá um nome acessível ao campo quando não há rótulo visível; leitores de tela anunciam esse texto.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-stepper-input/samples/rotulo-de-acessibilidade-arialabel.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgStack, SgStepperInput } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgStack gap={8} align="start">
      <SgStepperInput
        id="ingressos"
        ariaLabel="Quantidade de ingressos"
        minValue={1}
        maxValue={10}
        defaultValue={2}
        width={160}
      />
      <p className="text-sm text-muted-foreground">ariaLabel: Quantidade de ingressos</p>
    </SgStack>
  );
}
```
