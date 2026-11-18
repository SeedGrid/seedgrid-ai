---
tags: [seedgrid, front, component, feedback-e-exibicao]
fonte: front/seedgrid-fe-components/apps/showcase/src/app/components
branch: main
commit: 0f304bb
analisado-em: 2026-11-09
description: "Exemplos TSX (React) de Feedback e exibição, validados contra a API real do @seedgrid/fe-components. Para os exemplos Dart do mesmo grupo, veja a pasta flutter/."
plataforma: react
---

# Exemplos — feedback e exibição — React

> **Plataforma: React** (`@seedgrid/fe-components`). Equivalente em **Flutter**: [[SeedGrid/SeedGrid-components/flutter/feedback-e-exibicao/Exemplos|Exemplos — Feedback e exibição (Flutter)]]. Escolha entre as duas plataformas e placar de paridade: [[SeedGrid/SeedGrid-components/Plataformas|Plataformas: React × Flutter]].

Todos os exemplos do showcase de cada componente, na ordem e com os títulos da página, cada bloco copiado 1:1 do `samples/*.tsx.sample` correspondente (seedgrid-fe-components `0f304bb`, conferência de 2026-11-09). A linha `Fonte:` de cada bloco aponta o arquivo. Os blocos foram gerados por script a partir dos `.sample` e comparados com eles texto a texto; **não foram compilados nesta rodada**. Classes utilitárias (`flex`, `gap-3` etc.) são Tailwind do app de exemplo. O Playground de cada página é interativo e não tem `.sample`, por isso não aparece aqui.

API: [[SeedGrid/SeedGrid-components/feedback-e-exibicao/API|API de feedback e exibição]] · Visão geral: [[SeedGrid/SeedGrid-components/feedback-e-exibicao/Visao-geral|Feedback e exibição]].

## SgAvatar e SgAvatarGroup

### Básico

Iniciais (`label`), ícone e imagem.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/basico.tsx.sample`

```tsx
import React from "react";
import { User } from "lucide-react";
import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar label="P" />
      <SgAvatar icon={<User />} severity="secondary" />
      <SgAvatar src="https://i.pravatar.cc/150?img=32" alt="Amy Elsner" />
    </div>
  );
}
```

### Forma e tamanho

Combinações de shape e size.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/shape-e-tamanho.tsx.sample`

```tsx
import React from "react";
import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar label="C" shape="circle" />
      <SgAvatar label="S" shape="square" />
      <SgAvatar label="XS" size="xs" />
      <SgAvatar label="LG" size="lg" />
      <SgAvatar src="https://i.pravatar.cc/150?img=47" shape="square" />
    </div>
  );
}
```

### Severidade e cores personalizadas

Preset por severity e override de cores.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/severity-e-cores-customizadas.tsx.sample`

```tsx
import React from "react";
import { Camera } from "lucide-react";
import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar label="P" severity="primary" />
      <SgAvatar label="S" severity="success" />
      <SgAvatar label="D" severity="danger" />
      <SgAvatar icon={<Camera />} severity="custom" customColors={{ bg: "#7c3aed", fg: "#ffffff", border: "#5b21b6", ring: "rgba(124,58,237,0.35)" }} />
    </div>
  );
}
```

### Grupo de avatares

O segundo grupo mostra 3 avatares e `+3` (`total={6}`), com o contador em `moreSeverity="secondary"`. Note que `size="sm"` é repetido em cada filho porque o grupo só o aplica ao contador.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/avatar-group.tsx.sample`

```tsx
import React from "react";
import { Users } from "lucide-react";
import { SgAvatar, SgAvatarGroup } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <SgAvatarGroup>
        <SgAvatar src="https://i.pravatar.cc/150?img=32" />
        <SgAvatar src="https://i.pravatar.cc/150?img=47" />
        <SgAvatar src="https://i.pravatar.cc/150?img=12" />
        <SgAvatar src="https://i.pravatar.cc/150?img=56" />
      </SgAvatarGroup>
      <SgAvatarGroup max={3} total={6} size="sm" moreSeverity="secondary">
        <SgAvatar icon={<Users />} severity="info" size="sm" />
        <SgAvatar label="AL" severity="success" size="sm" />
        <SgAvatar label="BK" severity="warning" size="sm" />
        <SgAvatar label="CM" severity="danger" size="sm" />
      </SgAvatarGroup>
    </div>
  );
}
```

### Iniciais, ícone e fallback

Do nome saem até 2 iniciais; sem nada, aparece "?".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/iniciais-icone-e-fallback.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgAvatar } from "@seedgrid/fe-components";

import { CircleHelp, User } from "lucide-react";
import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar label="Maria Silva" />
      <SgAvatar label="joao" />
      <SgAvatar icon={<User />} severity="info" />
      <SgAvatar />
      <SgAvatar fallback={<CircleHelp />} severity="neutral" />
    </div>
  );
}
```

### Imagem com fallback

Se a imagem falhar, o avatar cai para as iniciais e chama onImageError.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/imagem-com-fallback.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgAvatar } from "@seedgrid/fe-components";

import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar
        src="https://endereco.invalido.exemplo/foto.png"
        label="Carlos Dias"
        onImageError={() => console.log("Imagem indisponível")}
      />
    </div>
  );
}
```

### Clicável e desabilitado

Com onClick o avatar fica interativo; com enabled: false ele deixa de responder aos cliques.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-avatar/samples/clicavel-e-desabilitado.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgAvatar } from "@seedgrid/fe-components";

import * as React from "react";
import { SgAvatar } from "@seedgrid/fe-components";

export default function Example() {
  const [clicks, setClicks] = React.useState(0);

  return (
    <div className="flex flex-wrap items-center gap-4">
      <SgAvatar
        label="Ana Lima"
        title="Abrir perfil"
        onClick={() => setClicks((c) => c + 1)}
      />
      <SgAvatar label="Bia Souza" enabled={false} onClick={() => {}} />
      <span className="text-sm">Cliques: {clicks}</span>
    </div>
  );
}
```

## SgBadge

### Básico

Exemplos simples de uso.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadge value="Admin" style={{ minWidth: 88, justifyContent: "center" }} />
      <SgBadge value="Pending" severity="warning" badgeStyle="soft" />
      <SgBadge value="Paid" severity="success" badgeStyle="solid" />
    </>
  );
}
```

### Variantes

Solid, soft, outline e ghost.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/variants.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadge value="Solid" badgeStyle="solid" />
      <SgBadge value="Soft" badgeStyle="soft" severity="secondary" />
      <SgBadge value="Outline" badgeStyle="outline" severity="info" />
      <SgBadge value="Ghost" badgeStyle="ghost" severity="neutral" />
    </>
  );
}
```

### Tamanhos

XS, SM, MD e LG.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/sizes.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadge value="XS" size="xs" />
      <SgBadge value="SM" size="sm" />
      <SgBadge value="MD" size="md" />
      <SgBadge value="LG" size="lg" />
    </>
  );
}
```

### Contador e dot

`max` gera `99+`; `dot` com `pulse`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/counter.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadge value={3} severity="danger" />
      <SgBadge value={120} max={99} severity="danger" />
      <SgBadge dot severity="success" />
      <SgBadge dot severity="success" pulse />
    </>
  );
}
```

### Ações

`autoRemove` oculta o badge sozinho; sem ele, o pai controla a visibilidade em `onRemove`.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/actions.tsx.sample`

```tsx
import React from "react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  const [visible, setVisible] = React.useState(true);
  return (
    <>
      <SgBadge value="Remover auto" removable autoRemove onRemove={() => alert("onRemove")} />
      {visible ? (
        <SgBadge
          value="Remover manual"
          removable
          autoRemove={false}
          onRemove={() => {
            alert("onRemove");
            setVisible(false);
          }}
        />
      ) : null}
    </>
  );
}
```

### Severidades

Cada severidade e cada estilo (solid, soft, outline, ghost).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/severidades.tsx.sample`

```tsx
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {(["primary", "secondary", "success", "warning", "danger", "info", "neutral", "custom"] as const).map((severity) => (
        <SgBadge key={severity} value={severity} severity={severity} />
      ))}
      {(["solid", "soft", "outline", "ghost"] as const).map((badgeStyle) => (
        <SgBadge key={badgeStyle} value={badgeStyle} badgeStyle={badgeStyle} severity="danger" />
      ))}
    </div>
  );
}
```

### Forma e ícones

rounded: false, leftIcon e rightIcon.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/forma-e-icones.tsx.sample`

```tsx
import { ArrowRight, Star } from "lucide-react";
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgBadge value="quadrado" rounded={false} />
      <SgBadge value="favorito" leftIcon={<Star size={12} />} />
      <SgBadge value="próximo" rightIcon={<ArrowRight size={12} />} />
    </div>
  );
}
```

### Clicável e removível

Com onClick o selo vira botão; removable mostra o x e autoRemove o esconde.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/clicavel-e-removivel.tsx.sample`

```tsx
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <SgBadge value="Clique" badgeStyle="outline" onClick={() => alert("onClick")} />
      <SgBadge value="Desabilitado" badgeStyle="outline" enabled={false} onClick={() => {}} />
      <SgBadge
        value="tag"
        badgeStyle="soft"
        removable
        autoRemove
        onRemove={() => alert("onRemove")}
      />
    </div>
  );
}
```

### Cores personalizadas

customColors define fundo, texto e borda do selo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge/samples/cores-personalizadas.tsx.sample`

```tsx
import { SgBadge } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgBadge
      value="Roxo"
      customColors={{ bg: "#7c3aed", fg: "#ffffff", border: "#6d28d9" }}
    />
  );
}
```

## SgBadgeOverlay

### Básico

Exemplos simples com número e ponto.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge-overlay/samples/basico.tsx.sample`

```tsx
import React from "react";
import { SgBadge, SgBadgeOverlay } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgBadgeOverlay badge={<SgBadge value={7} severity="danger" size="xs" />} style={{ borderRadius: 12, padding: 2 }}>
        <span className="inline-flex size-10 items-center justify-center rounded-lg border">Bell</span>
      </SgBadgeOverlay>
      <SgBadgeOverlay badge={<SgBadge dot severity="success" />}>
        <span className="inline-flex size-10 items-center justify-center rounded-lg border">Check</span>
      </SgBadgeOverlay>
    </>
  );
}
```

### Posicionamento

Exemplos com diferentes posições.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge-overlay/samples/placements.tsx.sample`

```tsx
import React from "react";
import { SgBadge, SgBadgeOverlay } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      {(["top-left", "top-right", "bottom-left", "bottom-right", "left", "right", "top", "bottom"] as const).map((placement) => (
        <SgBadgeOverlay key={placement} placement={placement} badge={<SgBadge value={placement} size="xs" />}>
          <span className="inline-flex h-10 w-16 items-center justify-center rounded-lg border border-border bg-background text-xs" />
        </SgBadgeOverlay>
      ))}
    </>
  );
}
```

### Contador no canto do avatar

Contador sobre o canto do avatar; o padrão é top-right.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge-overlay/samples/avatar.tsx.sample`

```tsx
import React from "react";
import { SgAvatar, SgBadge, SgBadgeOverlay } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgBadgeOverlay badge={<SgBadge value={3} size="sm" severity="danger" />}>
      <SgAvatar label="Ana Lima" />
    </SgBadgeOverlay>
  );
}
```

### Ponto de status

Ponto de status no canto inferior direito.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge-overlay/samples/status.tsx.sample`

```tsx
import React from "react";
import { SgAvatar, SgBadge, SgBadgeOverlay } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgBadgeOverlay placement="bottom-right" badge={<SgBadge dot severity="success" />}>
      <SgAvatar label="Bia Souza" severity="info" />
    </SgBadgeOverlay>
  );
}
```

### Em um botão

Contador com limite máximo sobre um botão.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-badge-overlay/samples/botao.tsx.sample`

```tsx
import React from "react";
import { SgBadge, SgBadgeOverlay, SgButton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <SgBadgeOverlay badge={<SgBadge value={12} max={9} size="xs" severity="danger" />}>
      <SgButton appearance="outline">Mensagens</SgButton>
    </SgBadgeOverlay>
  );
}
```

## SgSkeleton

### Formas básicas

Variantes principais: "text", "rectangle", "rounded", "square" e "circle".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/basic-shapes.tsx.sample`

```tsx
import * as React from "react";
import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
      <SgSkeleton shape="text" />
      <SgSkeleton shape="rectangle" height={48} />
      <SgSkeleton shape="rounded" height={48} />
      <SgSkeleton shape="square" size={56} />
      <SgSkeleton shape="circle" size={56} />
    </div>
  );
}
```

### Larguras de texto

Use a forma text com larguras diferentes para simular linhas reais.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/text-widths.tsx.sample`

```tsx
import * as React from "react";
import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="max-w-md space-y-2">
      <SgSkeleton shape="text" width="100%" />
      <SgSkeleton shape="text" width="86%" />
      <SgSkeleton shape="text" width="72%" />
      <SgSkeleton shape="text" width="52%" />
    </div>
  );
}
```

### Animação

Escolha entre "wave", "pulse" ou "none".

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/animation.tsx.sample`

```tsx
import * as React from "react";
import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">wave</p>
        <SgSkeleton animation="wave" height={56} />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">pulse</p>
        <SgSkeleton animation="pulse" height={56} />
      </div>
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground">none</p>
        <SgSkeleton animation="none" height={56} />
      </div>
    </div>
  );
}
```

### Placeholder de card

Exemplo de carregamento para um card (imagem + título + texto).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/card-placeholder.tsx.sample`

```tsx
import * as React from "react";
import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="w-full max-w-sm rounded-xl border border-border p-4">
      <SgSkeleton shape="rounded" height={160} />
      <div className="mt-4 space-y-2">
        <SgSkeleton shape="text" width="60%" />
        <SgSkeleton shape="text" />
        <SgSkeleton shape="text" width="82%" />
      </div>
    </div>
  );
}
```

### Lista e tabela

Composições comuns de placeholder para telas de dados.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/list-and-table.tsx.sample`

```tsx
import * as React from "react";
import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <SgSkeleton shape="circle" size={40} />
            <div className="flex-1 space-y-2">
              <SgSkeleton shape="text" width="55%" />
              <SgSkeleton shape="text" width="35%" />
            </div>
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-lg border border-border">
        <div className="grid grid-cols-[1fr_120px_120px] gap-3 border-b border-border p-3">
          <SgSkeleton shape="text" width="80%" />
          <SgSkeleton shape="text" width="70%" />
          <SgSkeleton shape="text" width="70%" />
        </div>
        {Array.from({ length: 5 }).map((_, idx) => (
          <div key={idx} className="grid grid-cols-[1fr_120px_120px] gap-3 border-b border-border p-3 last:border-b-0">
            <SgSkeleton shape="text" width={`${60 + ((idx % 3) * 10)}%`} />
            <SgSkeleton shape="text" width="55%" />
            <SgSkeleton shape="text" width="45%" />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Dimensões em texto

Aceita número (px) ou "50%", "2rem", "1.5em"; size define largura e altura juntas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-skeleton/samples/text-dimensions.tsx.sample`

```tsx
"use client";

import { SgSkeleton } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-2">
      <SgSkeleton width="50%" height="2rem" />
      <SgSkeleton size="3rem" shape="circle" />
      <SgSkeleton width={200} height={24} borderRadius={4} />
    </div>
  );
}
```

## SgToaster e `toast`

### Configuração básica

Monte um `SgToaster` e dispare com `toast.*`; `toast.dismiss()` fecha todos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/base-setup.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Mensagem básica")}>toast.message</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Sucesso!")}>
          toast.success
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.dismiss()}>
          toast.dismiss
        </SgButton>
      </div>
    </div>
  );
}
```

### Tipos de toast

Use métodos específicos por severidade.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/toast-types.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Mensagem neutra")}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Tudo certo")}>
          success
        </SgButton>
        <SgButton severity="info" onClick={() => toast.info("Informação importante")}>
          info
        </SgButton>
        <SgButton severity="warning" onClick={() => toast.warning("Atenção ao fluxo")}>
          warning
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Falha ao salvar")}>
          error
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.loading("Processando...")}>
          loading
        </SgButton>
      </div>
    </div>
  );
}
```

### Loading por id (atualiza o mesmo toast)

Guarde o id retornado e reutilize-o para trocar de estado sem criar outro toast.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/loading-by-id-update-same-toast.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgToaster, toast, type SgToastId } from "@seedgrid/fe-components";

export default function Example() {
  const [loadingId, setLoadingId] = React.useState<SgToastId | null>(null);

  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          onClick={() => {
            const id = toast.loading("Exportando relatório...");
            setLoadingId(id);
          }}
        >
          Start loading
        </SgButton>
        <SgButton
          severity="success"
          onClick={() => {
            if (!loadingId) return;
            toast.success("Export concluído", { id: loadingId });
            setLoadingId(null);
          }}
        >
          Finish with success
        </SgButton>
        <SgButton
          severity="danger"
          onClick={() => {
            if (!loadingId) return;
            toast.error("Falha ao exportar", { id: loadingId });
            setLoadingId(null);
          }}
        >
          Finish with error
        </SgButton>
      </div>
    </div>
  );
}
```

### toast.promise

Loading → sucesso/erro no mesmo toast; o erro é relançado (por isso o `try/catch`).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/toast-promise.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  async function runDemo() {
    const task = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (Math.random() < 0.35) {
        throw new Error("Erro aleatório da demo");
      }
      return { id: "ORD-2026-001" };
    };

    try {
      await toast.promise(task, {
        loading: "Salvando pedido...",
        success: (value) => `Pedido salvo: ${value.id}`,
        error: (error) => `Falha: ${error instanceof Error ? error.message : "erro"}`
      });
    } catch {
      // a notificação já foi tratada pelo helper
    }
  }

  return (
    <div className="space-y-3">
      <SgToaster />
      <SgButton onClick={runDemo}>Run promise demo</SgButton>
    </div>
  );
}
```

### Ações e toast personalizado

Use action para CTA rápida e custom para renderização livre.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/actions-and-custom-toast.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap gap-2">
        <SgButton
          severity="warning"
          onClick={() =>
            toast.warning("Item arquivado", {
              description: "Você pode desfazer esta ação.",
              action: {
                label: "Undo",
                onClick: () => toast.success("Ação desfeita")
              }
            })
          }
        >
          Toast with action
        </SgButton>

        <SgButton
          appearance="outline"
          onClick={() =>
            toast.custom(
              (id) => (
                <div className="w-full max-w-[280px] rounded-md border border-[#c56a2d]/50 bg-[#fff7f1] p-3">
                  <div className="text-sm font-semibold text-[#8f4b1f]">Custom toast</div>
                  <p className="mt-1 text-xs text-[#6b4b33]">Conteúdo livre renderizado via toast.custom(...)</p>
                  <div className="mt-2 flex gap-2">
                    <SgButton size="sm" onClick={() => toast.dismiss(id)}>
                      Close
                    </SgButton>
                  </div>
                </div>
              ),
              { duration: 8000, closeButton: false }
            )
          }
        >
          Custom toast
        </SgButton>
      </div>
    </div>
  );
}
```

### Opções por toast

`description`, `duration`, `closeButton`, `className` e `style` por chamada.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/options-per-toast.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <SgButton
        onClick={() =>
          toast.info("Toast com opções", {
            description: "10s de duração, sem closeButton e com estilo customizado.",
            duration: 10000,
            closeButton: false,
            className: "border-[#c56a2d]",
            style: {
              background: "#fff7f1",
              color: "#5b3b23"
            }
          })
        }
      >
        Trigger toast with options
      </SgButton>
    </div>
  );
}
```

### Transparência

Exemplo focado apenas em transparência (80%).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/transparency.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster transparency={80} />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Default")}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Success")}>
          success
        </SgButton>
        <SgButton severity="info" onClick={() => toast.info("Info")}>
          info
        </SgButton>
        <SgButton severity="warning" onClick={() => toast.warning("Warning")}>
          warning
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Error")}>
          error
        </SgButton>
      </div>
    </div>
  );
}
```

### Cores personalizadas

Exemplo focado apenas em cores personalizadas por tipo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/custom-colors.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster
        customColors={{
          default: { bg: "#1f2937", fg: "#f9fafb", border: "#6b7280" },
          success: { bg: "#065f46", fg: "#ecfeff", border: "#10b981" },
          info: { bg: "#1e3a8a", fg: "#dbeafe", border: "#60a5fa" },
          warning: { bg: "#78350f", fg: "#fef3c7", border: "#f59e0b" },
          error: { bg: "#7f1d1d", fg: "#fee2e2", border: "#ef4444" },
          loading: { bg: "#312e81", fg: "#e0e7ff", border: "#818cf8" }
        }}
      />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Default")}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Success")}>
          success
        </SgButton>
        <SgButton severity="info" onClick={() => toast.info("Info")}>
          info
        </SgButton>
        <SgButton severity="warning" onClick={() => toast.warning("Warning")}>
          warning
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Error")}>
          error
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.loading("Loading")}>
          loading
        </SgButton>
      </div>
    </div>
  );
}
```

### Cantos arredondados

rounded é true por padrão (rounded-md). Defina rounded como false para cantos retos - aplica ao toaster inteiro. Alterne ao vivo no Playground acima.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/rounded.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      {/* rounded is true by default (rounded-md); set false for square corners */}
      <SgToaster rounded={false} />

      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Square toast")}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Saved")}>
          success
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Failed")}>
          error
        </SgButton>
      </div>
    </div>
  );
}
```

### Fechar por código (dismissSgToast)

toast.dismiss é açúcar para dismissSgToast, que também é exportado direto. Com id fecha aquele toast; sem id, todos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/dismiss-one.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgToaster, dismissSgToast, toast, type SgToastId } from "@seedgrid/fe-components";

export default function Example() {
  const [id, setId] = React.useState<SgToastId | null>(null);

  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap gap-2">
        <SgButton
          onClick={() => setId(toast.info("Fica aberto até alguém fechar", { duration: 0 }))}
        >
          Abrir toast
        </SgButton>
        <SgButton
          appearance="outline"
          onClick={() => {
            if (!id) return;
            dismissSgToast(id);
            setId(null);
          }}
        >
          dismissSgToast(id)
        </SgButton>
      </div>
      <p className="text-sm text-muted-foreground">
        Guarde o id devolvido por toast() para poder fechar aquele toast específico depois — é o
        mesmo id que toast.update() usa.
      </p>
    </div>
  );
}
```

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/dismiss-all.tsx.sample`

```tsx
"use client";

import { SgButton, SgToaster, dismissSgToast, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.success("Salvo", { duration: 0 })}>Empilhar toast</SgButton>
        <SgButton appearance="outline" onClick={() => dismissSgToast()}>
          dismissSgToast()
        </SgButton>
      </div>
      <p className="text-sm text-muted-foreground">
        Sem id, fecha todos de uma vez. Útil ao trocar de rota ou de contexto, para não carregar
        feedback de uma tela para a seguinte.
      </p>
    </div>
  );
}
```

### Observar a fila (subscribeSgToasts)

Recebe a lista de toasts abertos a cada mudança e devolve a função que cancela a inscrição. Ele já chama o listener uma vez com a lista atual, então não é preciso ler o estado inicial em outro lugar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/subscribe-effect.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgToaster, subscribeSgToasts, toast } from "@seedgrid/fe-components";

export default function Example() {
  const [total, setTotal] = React.useState(0);

  // O retorno de subscribeSgToasts e' a propria funcao de limpeza, entao ele pode ser
  // devolvido direto do efeito: a inscricao morre junto com o componente.
  React.useEffect(() => subscribeSgToasts((toasts) => setTotal(toasts.length)), []);

  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => toast.message("Mais um", { duration: 0 })}>Abrir toast</SgButton>
        <span className="text-sm text-muted-foreground">{total} toast(s) abertos</span>
      </div>
    </div>
  );
}
```

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toaster/samples/subscribe.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgToaster, subscribeSgToasts, toast } from "@seedgrid/fe-components";

export default function Example() {
  const [total, setTotal] = React.useState(0);
  const [ouvindo, setOuvindo] = React.useState(false);
  const pararRef = React.useRef<(() => void) | null>(null);

  function ouvir() {
    if (pararRef.current) return;
    // subscribeSgToasts devolve a funcao que cancela a inscricao, e ja chama o listener
    // uma vez com a lista atual — nao e' preciso ler o estado inicial em outro lugar.
    pararRef.current = subscribeSgToasts((toasts) => setTotal(toasts.length));
    setOuvindo(true);
  }

  function parar() {
    pararRef.current?.();
    pararRef.current = null;
    setOuvindo(false);
  }

  return (
    <div className="space-y-3">
      <SgToaster />
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => toast.message("Mais um", { duration: 0 })}>Abrir toast</SgButton>
        <SgButton appearance="outline" onClick={ouvindo ? parar : ouvir}>
          {ouvindo ? "Cancelar inscrição" : "subscribeSgToasts"}
        </SgButton>
        <span className="text-sm text-muted-foreground">
          {ouvindo ? `${total} toast(s) abertos` : "sem inscrição ativa"}
        </span>
      </div>
    </div>
  );
}
```

## SgToastHost

### O que é o SgToastHost

Versão inteligente do SgToaster com suporte a prioridade entre múltiplas instâncias na árvore React.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/o-que-e-o-sg-toast-host.tsx.sample`

```tsx
"use client";

import { SgToastHost } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border p-4">
        <div className="text-sm font-semibold">layout.tsx</div>
        <p className="text-sm text-muted-foreground">Host global montado no layout da aplicação.</p>
        <div className="mt-3 rounded-md border border-dashed border-border p-3">
          <SgToastHost position="top-right" />
          <span className="text-xs text-muted-foreground">SgToastHost do layout</span>
        </div>
      </div>

      <div className="rounded-md border border-border p-4">
        <div className="text-sm font-semibold">page.tsx</div>
        <p className="text-sm text-muted-foreground">
          Quando outro host é montado mais fundo na árvore React, ele assume a renderização dos toasts.
        </p>
        <div className="mt-3 rounded-md border border-dashed border-border p-3">
          <SgToastHost position="bottom-right" />
          <span className="text-xs text-muted-foreground">SgToastHost da página</span>
        </div>
      </div>
    </div>
  );
}
```

### Configuração básica

Neste showcase, o SgToastHost já está montado na página. Em um app real, monte-o uma vez na raiz.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/base-setup.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost position="top-right" />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Mensagem básica")}>toast.message</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Sucesso!")}>
          toast.success
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.dismiss()}>
          toast.dismiss
        </SgButton>
      </div>
    </div>
  );
}
```

### Prioridade: layout vs página

Dois hosts montados: o mais profundo/último montado (`bottom-right`) renderiza os toasts.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/prioridade-layout-vs-pagina.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="rounded-md border border-border p-4">
        <div className="text-sm font-semibold">Layout host</div>
        <SgToastHost position="top-right" />
      </div>

      <div className="rounded-md border border-border bg-muted/20 p-4">
        <div className="text-sm font-semibold">Page host</div>
        <p className="mb-3 text-sm text-muted-foreground">
          Enquanto este host estiver montado, ele tem prioridade sobre o host do layout.
        </p>
        <SgToastHost position="bottom-right" />
        <SgButton onClick={() => toast.info("Toast renderizado pelo host mais profundo")}>
          Disparar toast
        </SgButton>
      </div>
    </div>
  );
}
```

### Tipos de toast

Use métodos específicos por severidade.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/toast-types.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Mensagem neutra")}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Tudo certo")}>
          success
        </SgButton>
        <SgButton severity="info" onClick={() => toast.info("Informação importante")}>
          info
        </SgButton>
        <SgButton severity="warning" onClick={() => toast.warning("Atenção ao fluxo")}>
          warning
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Falha ao salvar")}>
          error
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.loading("Processando...")}>
          loading
        </SgButton>
      </div>
    </div>
  );
}
```

### Loading por id (atualiza o mesmo toast)

Guarde o id retornado e reutilize-o para trocar de estado sem criar outro toast.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/loading-by-id-update-same-toast.tsx.sample`

```tsx
"use client";

import React from "react";
import { SgButton, SgToastHost, toast, type SgToastId } from "@seedgrid/fe-components";

export default function Example() {
  const [loadingId, setLoadingId] = React.useState<SgToastId | null>(null);

  return (
    <div className="space-y-3">
      <SgToastHost />
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          onClick={() => {
            const id = toast.loading("Exportando relatório...");
            setLoadingId(id);
          }}
        >
          Start loading
        </SgButton>
        <SgButton
          severity="success"
          onClick={() => {
            if (!loadingId) return;
            toast.success("Export concluído", { id: loadingId });
            setLoadingId(null);
          }}
        >
          Finish with success
        </SgButton>
        <SgButton
          severity="danger"
          onClick={() => {
            if (!loadingId) return;
            toast.error("Falha ao exportar", { id: loadingId });
            setLoadingId(null);
          }}
        >
          Finish with error
        </SgButton>
      </div>
    </div>
  );
}
```

### toast.promise

Helper de conveniência para o ciclo de loading/sucesso/erro em promises.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/toast-promise.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  async function runDemo() {
    const task = async () => {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      if (Math.random() < 0.35) {
        throw new Error("Erro aleatório da demo");
      }
      return { id: "ORD-2026-001" };
    };

    try {
      await toast.promise(task, {
        loading: "Salvando pedido...",
        success: (value) => `Pedido salvo: ${value.id}`,
        error: (error) => `Falha: ${error instanceof Error ? error.message : "erro"}`
      });
    } catch {
      // a notificação já foi tratada pelo helper
    }
  }

  return (
    <div className="space-y-3">
      <SgToastHost />
      <SgButton onClick={runDemo}>Run promise demo</SgButton>
    </div>
  );
}
```

### Ações e toast personalizado

Use action para CTA rápida e custom para renderização livre.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/actions-and-custom-toast.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost />
      <div className="flex flex-wrap gap-2">
        <SgButton
          severity="warning"
          onClick={() =>
            toast.warning("Item arquivado", {
              description: "Você pode desfazer esta ação.",
              action: {
                label: "Undo",
                onClick: () => toast.success("Ação desfeita")
              }
            })
          }
        >
          Toast with action
        </SgButton>

        <SgButton
          appearance="outline"
          onClick={() =>
            toast.custom(
              (id) => (
                <div className="w-full max-w-[280px] rounded-md border border-[#c56a2d]/50 bg-[#fff7f1] p-3">
                  <div className="text-sm font-semibold text-[#8f4b1f]">Custom toast</div>
                  <p className="mt-1 text-xs text-[#6b4b33]">Conteúdo livre renderizado via toast.custom(...)</p>
                  <div className="mt-2 flex gap-2">
                    <SgButton size="sm" onClick={() => toast.dismiss(id)}>
                      Close
                    </SgButton>
                  </div>
                </div>
              ),
              { duration: 8000, closeButton: false }
            )
          }
        >
          Custom toast
        </SgButton>
      </div>
    </div>
  );
}
```

### Opções por toast

Cada toast aceita duration, closeButton, className e style.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/options-per-toast.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost />
      <SgButton
        onClick={() =>
          toast.info("Toast com opções", {
            description: "10s de duração, sem closeButton e com estilo customizado.",
            duration: 10000,
            closeButton: false,
            className: "border-[#c56a2d]",
            style: {
              background: "#fff7f1",
              color: "#5b3b23"
            }
          })
        }
      >
        Trigger toast with options
      </SgButton>
    </div>
  );
}
```

### Transparência

Exemplo focado apenas em transparência (80%).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/transparency.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

const style = { opacity: 0.2 };

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Default", { style })}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Success", { style })}>
          success
        </SgButton>
        <SgButton severity="info" onClick={() => toast.info("Info", { style })}>
          info
        </SgButton>
        <SgButton severity="warning" onClick={() => toast.warning("Warning", { style })}>
          warning
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Error", { style })}>
          error
        </SgButton>
      </div>
    </div>
  );
}
```

### Cores personalizadas

Exemplo focado apenas em cores personalizadas por tipo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/custom-colors.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, toast } from "@seedgrid/fe-components";

const styles = {
  default: { backgroundColor: "#1f2937", color: "#f9fafb", borderColor: "#6b7280" },
  success: { backgroundColor: "#065f46", color: "#ecfeff", borderColor: "#10b981" },
  info: { backgroundColor: "#1e3a8a", color: "#dbeafe", borderColor: "#60a5fa" },
  warning: { backgroundColor: "#78350f", color: "#fef3c7", borderColor: "#f59e0b" },
  error: { backgroundColor: "#7f1d1d", color: "#fee2e2", borderColor: "#ef4444" },
  loading: { backgroundColor: "#312e81", color: "#e0e7ff", borderColor: "#818cf8" }
};

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost />
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => toast.message("Default", { style: styles.default })}>default</SgButton>
        <SgButton severity="success" onClick={() => toast.success("Success", { style: styles.success })}>
          success
        </SgButton>
        <SgButton severity="info" onClick={() => toast.info("Info", { style: styles.info })}>
          info
        </SgButton>
        <SgButton severity="warning" onClick={() => toast.warning("Warning", { style: styles.warning })}>
          warning
        </SgButton>
        <SgButton severity="danger" onClick={() => toast.error("Error", { style: styles.error })}>
          error
        </SgButton>
        <SgButton appearance="outline" onClick={() => toast.loading("Loading", { style: styles.loading })}>
          loading
        </SgButton>
      </div>
    </div>
  );
}
```

### Posicionamento

Aceita as mesmas 6 posições do SgToaster.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-toast-host/samples/posicionamento.tsx.sample`

```tsx
"use client";

import { SgButton, SgToastHost, SgStack, toast } from "@seedgrid/fe-components";

const positions = [
  "top-left",
  "top-center",
  "top-right",
  "bottom-left",
  "bottom-center",
  "bottom-right"
] as const;

export default function Example() {
  return (
    <div className="space-y-3">
      <SgToastHost position="bottom-right" />
      <SgStack direction="row" wrap gap={8}>
        {positions.map((position) => (
          <SgButton key={position} onClick={() => toast.info(`position: ${position}`)} className="text-xs">
            {position}
          </SgButton>
        ))}
      </SgStack>
    </div>
  );
}
```

## SgWhistler e `sgWhistle`

### Configuração básica

O `SgWhistler` fica no fluxo, dentro do container tracejado.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/base-setup.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>

      <div className="flex flex-wrap gap-2">
        <SgButton
          onClick={() =>
            sgWhistle.show({
              title: "Base example",
              message: "A default whistle rendered inside the host."
            })
          }
        >
          sgWhistle.show
        </SgButton>
        <SgButton
          severity="success"
          onClick={() =>
            sgWhistle.success({
              title: "Saved",
              message: "The feedback remained inside the layout flow."
            })
          }
        >
          sgWhistle.success
        </SgButton>
        <SgButton appearance="outline" onClick={() => sgWhistle.dismiss()}>
          Clear
        </SgButton>
      </div>
    </div>
  );
}
```

### Cantos arredondados

rounded é true por padrão (rounded-lg). Defina rounded como false para cantos retos. Dispare um whistle para comparar os dois stacks.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/rounded.tsx.sample`

```tsx
"use client";

import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <SgButton onClick={() => sgWhistle.info({ title: "Rounded", message: "Compare the corners below." })}>
          whistle
        </SgButton>
        <SgButton appearance="outline" onClick={() => sgWhistle.dismiss()}>
          clear
        </SgButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* rounded is true by default */}
        <SgWhistler max={3} />
        {/* set rounded={false} for square corners */}
        <SgWhistler max={3} rounded={false} />
      </div>
    </div>
  );
}
```

### Severidades e comportamento do stack

O serviço expõe métodos de conveniência por severidade, enquanto props do host como max, newestOnTop e gap controlam o stack.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/severities-and-stack.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle, type SgWhistleSeverity } from "@seedgrid/fe-components";

export default function Example() {
  const [newestOnTop, setNewestOnTop] = React.useState(false);

  const fire = React.useCallback((severity: SgWhistleSeverity) => {
    sgWhistle.show({
      severity,
      title: severity,
      message: `Severity ${severity} dispatched to the inline host.`,
      duration: severity === "loading" ? 0 : 5000
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => fire("default")}>default</SgButton>
        <SgButton severity="success" onClick={() => fire("success")}>success</SgButton>
        <SgButton severity="info" onClick={() => fire("info")}>info</SgButton>
        <SgButton severity="warning" onClick={() => fire("warning")}>warning</SgButton>
        <SgButton severity="danger" onClick={() => fire("error")}>error</SgButton>
        <SgButton appearance="outline" onClick={() => fire("loading")}>loading</SgButton>
        <SgButton appearance="outline" onClick={() => setNewestOnTop((value) => !value)}>
          newestOnTop: {String(newestOnTop)}
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler max={3} gap={10} newestOnTop={newestOnTop} />
      </div>
    </div>
  );
}
```

### Ações, estilos de borda e opacidade

Whistles podem expor CTAs rápidas e ênfase visual leve sem precisar de posicionamento em overlay.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/actions-border-opacity.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SgButton
          severity="warning"
          onClick={() =>
            sgWhistle.warning({
              title: "Archived section",
              message: "The action is reversible for a few seconds.",
              borderStyle: "left-accent",
              opacity: 0.96,
              action: {
                label: "Undo",
                onClick: () =>
                  sgWhistle.success({
                    title: "Undo applied",
                    message: "The section returned to the active list.",
                    borderStyle: "soft"
                  })
              }
            })
          }
        >
          Action + undo
        </SgButton>
        <SgButton
          appearance="outline"
          onClick={() =>
            sgWhistle.info({
              title: "Visual emphasis",
              message: "Try borderStyle and opacity together.",
              borderStyle: "full-accent",
              opacity: 0.9
            })
          }
        >
          Accent example
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

### Atualizar por id

`sgWhistle.loading` retorna o id; `sgWhistle.update` reaproveita o mesmo aviso.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/update-by-id.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle, type SgWhistleId } from "@seedgrid/fe-components";

export default function Example() {
  const [id, setId] = React.useState<SgWhistleId | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          onClick={() =>
            setId(
              sgWhistle.loading({
                title: "Synchronizing",
                message: "This whistle will be updated in place.",
                dismissible: false
              })
            )
          }
        >
          Start loading
        </SgButton>
        <SgButton
          severity="success"
          onClick={() =>
            id &&
            sgWhistle.update(id, {
              severity: "success",
              title: "Sync complete",
              message: "The existing whistle id was reused.",
              dismissible: true
            })
          }
        >
          Finish success
        </SgButton>
        <SgButton severity="danger" appearance="outline" onClick={() => id && sgWhistle.dismiss(id)}>
          Dismiss active
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

### sgWhistle.promise

O helper centraliza as transições de estado de loading, sucesso e erro para fluxos assíncronos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/promise.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  const runDemo = React.useCallback(async () => {
    try {
      await sgWhistle.promise(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (Math.random() < 0.35) throw new Error("simulated network error");
          return { protocol: "SG-2026-031" };
        },
        {
          loading: { title: "Submitting report", message: "Waiting for the server..." },
          success: (value) => ({ title: "Report sent", message: `Protocol ${value.protocol} generated.` }),
          error: (error) => ({
            title: "Submission failed",
            message: error instanceof Error ? error.message : "Unknown error"
          })
        }
      );
    } catch {
      // represented by sgWhistle.promise
    }
  }, []);

  return (
    <div className="space-y-4">
      <SgButton onClick={runDemo}>Run promise demo</SgButton>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

### Renderizador personalizado e cores do host

Use sgWhistle.custom para JSX arbitrário e customColors no host para alinhar o stack com o contexto ao redor.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/custom-renderer-and-colors.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

const warmColors = {
  default: { bg: "#fff7ed", fg: "#7c2d12", border: "#fdba74" },
  success: { bg: "#ecfdf5", fg: "#065f46", border: "#34d399" },
  info: { bg: "#eff6ff", fg: "#1d4ed8", border: "#60a5fa" },
  warning: { bg: "#fffbeb", fg: "#92400e", border: "#f59e0b" },
  error: { bg: "#fef2f2", fg: "#b91c1c", border: "#f87171" },
  loading: { bg: "#f5f3ff", fg: "#6d28d9", border: "#a78bfa" }
};

export default function Example() {
  return (
    <div className="space-y-4">
      <SgButton
        onClick={() =>
          sgWhistle.custom(
            (id) => (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Custom renderer</div>
                <p className="text-sm opacity-90">Free-form JSX rendered by sgWhistle.custom(...).</p>
                <SgButton size="sm" onClick={() => sgWhistle.dismiss(id)}>Close</SgButton>
              </div>
            ),
            {
              message: "custom",
              duration: 0,
              dismissible: false,
              borderStyle: "full-accent"
            }
          )
        }
      >
        Custom whistle
      </SgButton>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler customColors={warmColors} />
      </div>
    </div>
  );
}
```

### Fechar por código (dismissSgWhistle)

sgWhistle.dismiss é açúcar para dismissSgWhistle, que também é exportado direto. Com id fecha aquele aviso; sem id, limpa o host.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/dismiss-one.tsx.sample`

```tsx
"use client";

import * as React from "react";
import {
  SgButton,
  SgWhistler,
  dismissSgWhistle,
  sgWhistle,
  type SgWhistleId
} from "@seedgrid/fe-components";

export default function Example() {
  const [id, setId] = React.useState<SgWhistleId | null>(null);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <SgButton
          onClick={() =>
            setId(
              sgWhistle.warning({
                title: "Confira os dados",
                message: "Este aviso não expira sozinho.",
                duration: 0
              })
            )
          }
        >
          Abrir aviso
        </SgButton>
        <SgButton
          appearance="outline"
          onClick={() => {
            if (!id) return;
            dismissSgWhistle(id);
            setId(null);
          }}
        >
          dismissSgWhistle(id)
        </SgButton>
      </div>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/dismiss-all.tsx.sample`

```tsx
"use client";

import { SgButton, SgWhistler, dismissSgWhistle, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <SgButton
          onClick={() => sgWhistle.info({ title: "Mais um aviso", duration: 0 })}
        >
          Empilhar aviso
        </SgButton>
        <SgButton appearance="outline" onClick={() => dismissSgWhistle()}>
          dismissSgWhistle()
        </SgButton>
      </div>
      <p className="text-sm text-muted-foreground">
        Sem id, limpa o host inteiro. Como o whistle fica no fluxo do layout, limpar ao sair da
        tela evita que o aviso de um contexto apareça no seguinte.
      </p>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

### Observar o host (subscribeSgWhistles)

Recebe a lista de whistles do host a cada mudança e devolve a função que cancela a inscrição. Ele já chama o listener uma vez com a lista atual, então não é preciso ler o estado inicial em outro lugar.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/subscribe-effect.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgWhistler, sgWhistle, subscribeSgWhistles } from "@seedgrid/fe-components";

export default function Example() {
  const [total, setTotal] = React.useState(0);

  // O retorno de subscribeSgWhistles e' a propria funcao de limpeza, entao ele pode ser
  // devolvido direto do efeito: a inscricao morre junto com o componente.
  React.useEffect(() => subscribeSgWhistles((whistles) => setTotal(whistles.length)), []);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => sgWhistle.info({ title: "Mais um aviso", duration: 0 })}>
          Abrir aviso
        </SgButton>
        <span className="text-sm text-muted-foreground">{total} aviso(s) no host</span>
      </div>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/subscribe.tsx.sample`

```tsx
"use client";

import * as React from "react";
import { SgButton, SgWhistler, sgWhistle, subscribeSgWhistles } from "@seedgrid/fe-components";

export default function Example() {
  const [total, setTotal] = React.useState(0);
  const [ouvindo, setOuvindo] = React.useState(false);
  const pararRef = React.useRef<(() => void) | null>(null);

  function ouvir() {
    if (pararRef.current) return;
    // subscribeSgWhistles devolve a funcao que cancela a inscricao e ja chama o listener
    // uma vez com a lista atual — nao e' preciso ler o estado inicial em outro lugar.
    pararRef.current = subscribeSgWhistles((whistles) => setTotal(whistles.length));
    setOuvindo(true);
  }

  function parar() {
    pararRef.current?.();
    pararRef.current = null;
    setOuvindo(false);
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton onClick={() => sgWhistle.info({ title: "Mais um aviso", duration: 0 })}>
          Abrir aviso
        </SgButton>
        <SgButton appearance="outline" onClick={ouvindo ? parar : ouvir}>
          {ouvindo ? "Cancelar inscrição" : "subscribeSgWhistles"}
        </SgButton>
        <span className="text-sm text-muted-foreground">
          {ouvindo ? `${total} aviso(s) no host` : "sem inscrição ativa"}
        </span>
      </div>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistler />
      </div>
    </div>
  );
}
```

### Ícone e onClose

icon troca o ícone do aviso; onClose roda quando ele sai da pilha por qualquer motivo.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/icon-on-close.tsx.sample`

```tsx
import React from "react";
import { Pencil } from "lucide-react";
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  const [closedCount, setClosedCount] = React.useState(0);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          severity="warning"
          onClick={() =>
            sgWhistle.warning({
              title: "Draft",
              message: "You have unsaved changes.",
              icon: <Pencil className="h-4 w-4" />,
              duration: 0,
              onClose: () => setClosedCount((value) => value + 1)
            })
          }
        >
          Notice with icon
        </SgButton>
        <span className="text-xs text-muted-foreground">onClose called: {closedCount}</span>
      </div>
      <div className="rounded-xl border border-dashed border-border p-3">
        <SgWhistler max={3} />
      </div>
    </div>
  );
}
```

### Espaçamento entre avisos (gap)

gap define o espaço, em pixels, entre os avisos empilhados. Dispare dois avisos para comparar os dois stacks.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistler/samples/gap.tsx.sample`

```tsx
import { SgButton, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <SgButton
        onClick={() => {
          sgWhistle.info({ message: "First", duration: 4000 });
          sgWhistle.success({ message: "Second", duration: 4000 });
        }}
      >
        Fire 2 notices
      </SgButton>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-2 text-xs text-muted-foreground">gap: 0</p>
          <div className="rounded-xl border border-dashed border-border p-3">
            <SgWhistler max={3} gap={0} />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs text-muted-foreground">gap: 24</p>
          <div className="rounded-xl border border-dashed border-border p-3">
            <SgWhistler max={3} gap={24} />
          </div>
        </div>
      </div>
    </div>
  );
}
```

## SgWhistleHost

### Configuração básica

Monte um SgWhistleHost onde o layout deve revelar mensagens contextuais. Depois dispare whistles de qualquer lugar da página.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/base-setup.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost />
      </div>

      <div className="flex flex-wrap gap-2">
        <SgButton
          onClick={() =>
            sgWhistle.show({
              title: "Base example",
              message: "A default whistle rendered inside the host."
            })
          }
        >
          sgWhistle.show
        </SgButton>
        <SgButton
          severity="success"
          onClick={() =>
            sgWhistle.success({
              title: "Saved",
              message: "The feedback remained inside the layout flow."
            })
          }
        >
          sgWhistle.success
        </SgButton>
        <SgButton appearance="outline" onClick={() => sgWhistle.dismiss()}>
          Clear
        </SgButton>
      </div>
    </div>
  );
}
```

### Severidades e comportamento do stack

O serviço expõe métodos de conveniência por severidade, enquanto props do host como max, newestOnTop e gap controlam o stack.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/severities-and-stack.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle, type SgWhistleSeverity } from "@seedgrid/fe-components";

export default function Example() {
  const [newestOnTop, setNewestOnTop] = React.useState(false);

  const fire = React.useCallback((severity: SgWhistleSeverity) => {
    sgWhistle.show({
      severity,
      title: severity,
      message: `Severity ${severity} dispatched to the inline host.`,
      duration: severity === "loading" ? 0 : 5000
    });
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SgButton onClick={() => fire("default")}>default</SgButton>
        <SgButton severity="success" onClick={() => fire("success")}>success</SgButton>
        <SgButton severity="info" onClick={() => fire("info")}>info</SgButton>
        <SgButton severity="warning" onClick={() => fire("warning")}>warning</SgButton>
        <SgButton severity="danger" onClick={() => fire("error")}>error</SgButton>
        <SgButton appearance="outline" onClick={() => fire("loading")}>loading</SgButton>
        <SgButton appearance="outline" onClick={() => setNewestOnTop((value) => !value)}>
          newestOnTop: {String(newestOnTop)}
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost max={3} gap={10} newestOnTop={newestOnTop} />
      </div>
    </div>
  );
}
```

### Ações, estilos de borda e opacidade

Whistles podem expor CTAs rápidas e ênfase visual leve sem precisar de posicionamento em overlay.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/actions-border-opacity.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <SgButton
          severity="warning"
          onClick={() =>
            sgWhistle.warning({
              title: "Archived section",
              message: "The action is reversible for a few seconds.",
              borderStyle: "left-accent",
              opacity: 0.96,
              action: {
                label: "Undo",
                onClick: () =>
                  sgWhistle.success({
                    title: "Undo applied",
                    message: "The section returned to the active list.",
                    borderStyle: "soft"
                  })
              }
            })
          }
        >
          Action + undo
        </SgButton>
        <SgButton
          appearance="outline"
          onClick={() =>
            sgWhistle.info({
              title: "Visual emphasis",
              message: "Try borderStyle and opacity together.",
              borderStyle: "full-accent",
              opacity: 0.9
            })
          }
        >
          Accent example
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost />
      </div>
    </div>
  );
}
```

### Atualizar por id

Fluxos de loading geralmente são criados uma vez e depois atualizados no lugar conforme a tarefa conclui ou falha.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/update-by-id.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle, type SgWhistleId } from "@seedgrid/fe-components";

export default function Example() {
  const [id, setId] = React.useState<SgWhistleId | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <SgButton
          onClick={() =>
            setId(
              sgWhistle.loading({
                title: "Synchronizing",
                message: "This whistle will be updated in place.",
                dismissible: false
              })
            )
          }
        >
          Start loading
        </SgButton>
        <SgButton
          severity="success"
          onClick={() =>
            id &&
            sgWhistle.update(id, {
              severity: "success",
              title: "Sync complete",
              message: "The existing whistle id was reused.",
              dismissible: true
            })
          }
        >
          Finish success
        </SgButton>
        <SgButton severity="danger" appearance="outline" onClick={() => id && sgWhistle.dismiss(id)}>
          Dismiss active
        </SgButton>
      </div>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost />
      </div>
    </div>
  );
}
```

### sgWhistle.promise

O helper centraliza as transições de estado de loading, sucesso e erro para fluxos assíncronos.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/promise.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  const runDemo = React.useCallback(async () => {
    try {
      await sgWhistle.promise(
        async () => {
          await new Promise((resolve) => setTimeout(resolve, 1200));
          if (Math.random() < 0.35) throw new Error("simulated network error");
          return { protocol: "SG-2026-031" };
        },
        {
          loading: { title: "Submitting report", message: "Waiting for the server..." },
          success: (value) => ({ title: "Report sent", message: `Protocol ${value.protocol} generated.` }),
          error: (error) => ({
            title: "Submission failed",
            message: error instanceof Error ? error.message : "Unknown error"
          })
        }
      );
    } catch {
      // represented by sgWhistle.promise
    }
  }, []);

  return (
    <div className="space-y-4">
      <SgButton onClick={runDemo}>Run promise demo</SgButton>
      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost />
      </div>
    </div>
  );
}
```

### Renderizador personalizado e cores do host

`sgWhistle.custom` com JSX livre; `customColors` no host.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/custom-renderer-and-colors.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle } from "@seedgrid/fe-components";

const warmColors = {
  default: { bg: "#fff7ed", fg: "#7c2d12", border: "#fdba74" },
  success: { bg: "#ecfdf5", fg: "#065f46", border: "#34d399" },
  info: { bg: "#eff6ff", fg: "#1d4ed8", border: "#60a5fa" },
  warning: { bg: "#fffbeb", fg: "#92400e", border: "#f59e0b" },
  error: { bg: "#fef2f2", fg: "#b91c1c", border: "#f87171" },
  loading: { bg: "#f5f3ff", fg: "#6d28d9", border: "#a78bfa" }
};

export default function Example() {
  return (
    <div className="space-y-4">
      <SgButton
        onClick={() =>
          sgWhistle.custom(
            (id) => (
              <div className="space-y-2">
                <div className="text-sm font-semibold">Custom renderer</div>
                <p className="text-sm opacity-90">Free-form JSX rendered by sgWhistle.custom(...).</p>
                <SgButton size="sm" onClick={() => sgWhistle.dismiss(id)}>Close</SgButton>
              </div>
            ),
            {
              message: "custom",
              duration: 0,
              dismissible: false,
              borderStyle: "full-accent"
            }
          )
        }
      >
        Custom whistle
      </SgButton>

      <div className="rounded-xl border border-dashed border-border p-4">
        <SgWhistleHost customColors={warmColors} />
      </div>
    </div>
  );
}
```

### O host prevalece sobre o SgWhistler solto

A caixa abaixo tem um SgWhistler solto, mas há um SgWhistleHost na página: o solto não desenha nada e cada aviso aparece uma vez só.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/host-prevalece.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, SgWhistler, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  return (
    <>
      <SgWhistleHost />
      <div className="flex flex-wrap items-start gap-4">
        <SgButton onClick={() => sgWhistle.info({ message: "Só aparece no host" })}>Disparar</SgButton>
        <div className="min-w-0 flex-1 rounded-xl border border-dashed border-border p-4">
          <SgWhistler />
        </div>
      </div>
    </>
  );
}
```

### Vários hosts

O último host montado é o ativo (aqui, um segundo host com cantos retos); ao sair, o anterior volta.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-whistle-host/samples/varios-hosts.tsx.sample`

```tsx
import React from "react";
import { SgButton, SgWhistleHost, sgWhistle } from "@seedgrid/fe-components";

export default function Example() {
  const [extraHost, setExtraHost] = React.useState(false);

  return (
    <>
      <SgWhistleHost />
      <div className="flex flex-wrap items-center gap-2">
        <SgButton appearance="outline" onClick={() => setExtraHost((value) => !value)}>
          Segundo host (cantos retos): {String(extraHost)}
        </SgButton>
        <SgButton onClick={() => sgWhistle.warning({ message: "Quem está ativo?", duration: 3000 })}>Disparar</SgButton>
      </div>
      {extraHost ? (
        <div className="rounded-xl border border-dashed border-border p-4">
          <SgWhistleHost rounded={false} />
        </div>
      ) : null}
    </>
  );
}
```

## SgNotificationBell

A demonstração usa um `fetcher` e um Pulse simulados em memória (`demo-fetcher.ts` do showcase), sem token nem chave.

### Básico

Clique no sino. Para ver uma notificação nova chegar, use o botão (aqui não há Pulse: a lista também se atualiza ao abrir o sino e no polling de reserva).

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-notification-bell/samples/basico.tsx.sample`

```tsx
import * as React from "react";
import { SgButton, SgNotificationBell, SgRealtimeProvider } from "@seedgrid/fe-components";
import { createDemoFetcher, createDemoPulse, demoPulseToken } from "./demo-fetcher";

// Na aplicacao real, troque o fetcher da demonstracao pelo apiUrl do backend (extension user-notifications) e
// deixe o SgRealtimeProvider pedir o token ao BFF; aqui o Pulse e a caixa vivem em memoria.
const demo = createDemoFetcher();
const pulse = createDemoPulse();

export default function App() {
  return (
    <div className="flex items-center gap-3">
      <SgRealtimeProvider channels={["user-notifications"]} fetchToken={demoPulseToken} connectOptions={{ webSocketImpl: pulse.webSocketImpl }}>
        <SgNotificationBell fetcher={demo} />
      </SgRealtimeProvider>
      <SgButton
        size="sm"
        appearance="outline"
        onClick={() => {
          const id = demo.notify("report.ready", "Novo relatório", "Acabou de ficar pronto.");
          pulse.publish("user-notification.created", { notificationPublicId: id, type: "report.ready" });
        }}
      >
        Simular notificação
      </SgButton>
    </div>
  );
}
```

### Tipos com ícone e ação

types liga cada tipo de notificação a um ícone e à ação de abrir (por exemplo, baixar o relatório). Os callbacks avisam o que o usuário fez.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-notification-bell/samples/tipos.tsx.sample`

```tsx
import * as React from "react";
import { CheckCircle2, FileText } from "lucide-react";
import { SgNotificationBell } from "@seedgrid/fe-components";
import { createDemoFetcher } from "./demo-fetcher";

const demo = createDemoFetcher();

export default function App() {
  const [opened, setOpened] = React.useState("-");

  return (
    <div className="flex items-center gap-3">
      <SgNotificationBell
        fetcher={demo}
        types={{
          "report.ready": { icon: <FileText className="size-4" />, onOpen: (n) => setOpened(`baixar relatório ${n.publicId}`) },
          "backup.finished": { icon: <CheckCircle2 className="size-4" />, onOpen: (n) => setOpened(`baixar backup ${n.publicId}`) }
        }}
        onOpen={(n) => setOpened((prev) => `${prev} (abriu: ${n.title})`)}
        onNotificationDelete={(n) => setOpened(`excluiu: ${n.title}`)}
      />
      <span className="text-xs text-muted-foreground">Último evento: {opened}</span>
    </div>
  );
}
```

### Interruptor Não lidas

O painel abre com o interruptor Não lidas (aqui, com defaultUnreadOnly desligado, em Todas). Ligado, clicar numa notificação a tira da lista e o contador cai na hora; desligado, mostra todas. A escolha não persiste entre recargas.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-notification-bell/samples/interruptor.tsx.sample`

```tsx
import * as React from "react";
import { SgNotificationBell } from "@seedgrid/fe-components";
import { createDemoFetcher } from "./demo-fetcher";

// O painel traz o interruptor "Não lidas": ligado, clicar numa notificação a tira da lista e o contador cai na hora;
// desligado, mostra todas. defaultUnreadOnly={false} faz o painel abrir em "Todas" (a escolha não persiste).
const demo = createDemoFetcher();

export default function App() {
  return (
    <div className="flex items-center gap-3">
      <SgNotificationBell fetcher={demo} defaultUnreadOnly={false} />
    </div>
  );
}
```

### Sem o interruptor

showUnreadToggle=false esconde só o interruptor: o sino continua e o painel lista todas as notificações.

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-notification-bell/samples/sem-interruptor.tsx.sample`

```tsx
import * as React from "react";
import { SgNotificationBell } from "@seedgrid/fe-components";
import { createDemoFetcher } from "./demo-fetcher";

// showUnreadToggle={false} esconde só o interruptor: o sino continua, e o painel lista todas as notificações.
const demo = createDemoFetcher();

export default function App() {
  return (
    <div className="flex items-center gap-3">
      <SgNotificationBell fetcher={demo} showUnreadToggle={false} />
    </div>
  );
}
```

Fonte: `front/seedgrid-fe-components/apps/showcase/src/app/components/sg-notification-bell/samples/uso-real.tsx.sample`

```tsx
import * as React from "react";
import { FileText } from "lucide-react";
import { SgNotificationBell } from "@seedgrid/fe-components";

// Em produção: o BFF da sua app expõe as rotas da extension user-notifications (a apikey nunca vai para o navegador).
export default function App() {
  return (
    <SgNotificationBell
      apiUrl="/api/user-notifications"
      tokenEndpoint="/api/realtime/connect"
      types={{
        "report.ready": {
          icon: <FileText className="size-4" />,
          onOpen: (n) => window.open(`/relatorios/${String(n.payload?.reportExecutionId)}`)
        }
      }}
      onNotification={(n) => console.log("nova notificação", n.title)}
    />
  );
}
```
