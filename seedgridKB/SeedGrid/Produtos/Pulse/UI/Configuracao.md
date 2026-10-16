---
tags: [seedgrid, produto, pulse, ui, configuracao, variaveis]
fonte: seedgrid-products/seedgrid-pulse/frontend/seedgrid-pulse-ui (.env.example, src/app/layout.tsx)
branch: main
commit: 862d936
analisado-em: 2026-10-16
---

# Pulse UI — variáveis de ambiente

Variáveis da **UI**. As do servidor estão em [[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Configuração do servidor]]. Lidas em **runtime** (layout `force-dynamic`): no EasyPanel são env do container, sem rebuild. Visão geral: [[SeedGrid/Produtos/Pulse/UI/Visao-geral|Pulse UI]].

## Conexão com o Pulse

| Variável | Padrão | Descrição |
|---|---|---|
| `SEEDGRID_PULSE_SERVER_BASE_URL` | `http://127.0.0.1:18080` (exemplo do `.env.example`) | Base URL da API Pulse **alcançável pelo navegador**. Única informação de conexão entregue ao client. Fallback legado: `NEXT_PUBLIC_PULSE_BASE_URL`. |
| `SEEDGRID_PULSE_INTERNAL_BASE_URL` | = a anterior | Base URL usada pelo **servidor da UI** nos proxies (`/api/security/*`, `/api/pulse/messages`). Só precisa quando difere (containers na mesma rede, ex.: `http://seedgrid-pulse:8080`). |

Não existe credencial aqui: nem usuário/senha nem chave. As telas autenticam com o JWT do operador logado.

## Aparência e idioma

| Variável | Padrão | Descrição |
|---|---|---|
| `SEEDGRID_PULSE_DEFAULT_THEME_SEED` | `#16803D` | Cor semente do tema. Legado: `NEXT_PUBLIC_DEFAULT_THEME_SEED`. |
| `SEEDGRID_PULSE_DEFAULT_THEME_MODE` | `light` | `light` ou `dark`. Legado: `NEXT_PUBLIC_DEFAULT_THEME_MODE`. |
| `SEEDGRID_PULSE_UI_DEFAULT_LOCALE` | `pt-BR` | Idioma padrão: `en`, `pt-BR`, `pt-PT`, `fr`, `es`. Legado: `NEXT_PUBLIC_PULSE_UI_DEFAULT_LOCALE`. |

Os nomes `NEXT_PUBLIC_*` antigos seguem aceitos como fallback para imagens antigas; prefira os `SEEDGRID_PULSE_*`.

## Auto-refresh (polling, em segundos)

Padrão de todos: **30**.

| Variável | Tela |
|---|---|
| `NEXT_PUBLIC_DASHBOARD_REFRESH_SECONDS` | dashboard |
| `NEXT_PUBLIC_CONNECTIONS_REFRESH_SECONDS` | conexões |
| `NEXT_PUBLIC_MESSAGES_REFRESH_SECONDS` | mensagens |
| `NEXT_PUBLIC_BACKLOG_REFRESH_SECONDS` | backlog |
| `NEXT_PUBLIC_DELIVERIES_REFRESH_SECONDS` | entregas |
| `NEXT_PUBLIC_DLQ_REFRESH_SECONDS` | DLQ |

> **Não confirmado se mudar estes valores tem efeito.** A UI lê cada uma com `process.env[nome]` dinâmico (`src/lib/ui-refresh.ts`); em componente client o Next só substitui acessos estáticos (`process.env.NEXT_PUBLIC_X`) no build. Se o intervalo não mudar após definir a variável, o padrão de 30 s está valendo. Tratar como pendência a verificar antes de contar com este ajuste.

## Exemplo mínimo de produção

```env
SEEDGRID_PULSE_SERVER_BASE_URL=https://pulse.<seu-dominio>
SEEDGRID_PULSE_INTERNAL_BASE_URL=http://seedgrid-pulse:8080
SEEDGRID_PULSE_UI_DEFAULT_LOCALE=pt-BR
```

No servidor correspondente: `CORS_ALLOWED_ORIGINS=https://pulse-ui.<seu-dominio>`.

## O que NÃO colocar na UI

- `SEEDGRID_PULSE_SERVER_KEY` (chave de servidor) — a UI não a usa e ela não publica.
- Qualquer chave `project` ou `client`.
- Usuário/senha de operador em ENV (removido; o login é pela tela).
