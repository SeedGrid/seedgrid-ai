---
tags: [seedgrid, produto, pulse, realtime]
fonte: seedgrid-products/seedgrid-pulse
branch: main
commit: 9dcbdad
analisado-em: 2026-10-16
---

# SeedGrid Pulse — visão geral

Hub **realtime** da plataforma SeedGrid: um produto (servidor Rust + UI Next.js + SDKs) que qualquer sistema SeedGrid usa para **publicar** eventos/comandos por HTTP e **entregar** a clientes conectados por WebSocket, sem reimplementar WebSocket, replay, retry, presença, backlog e isolamento de destino.

> O Pulse é um **produto** (`seedgrid-products/seedgrid-pulse`), não uma extension de `seedgrid-platform`. Ele *consome* crates da plataforma (security, login-tenancy, audit, apikeys); ver [[SeedGrid/Visao-geral|visão geral da plataforma]].

## O que o Pulse resolve

| Necessidade | Como o Pulse atende |
|---|---|
| Backend precisa avisar usuário/grupo/conta inteira em tempo real | `POST /api/v1/messages` com a chave `project` |
| Navegador/app precisa receber, sem segredo no cliente | **token curto** (`pct_…`) emitido pelo backend do produto |
| Agente instalado na máquina do cliente precisa ficar conectado | chave `client` + WebSocket com reconexão e **replay** |
| Confirmar recebimento e execução | `ack` (recebimento) e `result` (execução, com retry e DLQ) |
| Operar: ver conexões, backlog, falhas, apagar com segurança | UI operacional, métricas Prometheus, lixeira e audit |

## Duas funções: mensagens e tarefas

O Pulse faz dois trabalhos diferentes com o mesmo caminho `publisher → Pulse → subscriber`. Quem publica escolhe o trabalho com o `deliveryMode`:

| | **Mensagem** (envio simples) | **Tarefa** (execução) |
|---|---|---|
| Para que serve | avisar, notificar, atualizar tela: "o pedido mudou" | mandar alguém **fazer** algo e saber se deu certo: "renderize este relatório" |
| `deliveryMode` | `notification` (padrão) ou `acknowledged` | `processed` |
| O que o subscriber devolve | nada (`notification`) ou só o `ack` de recebimento (`acknowledged`) | `ack` e depois o `result`: `success`, `retryable` ou `permanent` |
| Se a execução falhar | não existe execução: não há o que falhar | retry automático e, esgotado o retry, **DLQ**; se o consumidor travar, o prazo de execução (`resultTimeoutSeconds`, Pulse 0.3.0) conta como falha |
| Termina quando | o servidor escreve no socket (`notification`) ou o `ack` chega (`acknowledged`) | `result: success` |
| Pode ir à DLQ | **nunca** | **sim**, e só ela |

Regra prática: se você só precisa que a informação **chegue**, use mensagem. Se precisa que algo seja **executado** e quer ser avisado (e poder reprocessar) quando falhar, use tarefa. Detalhes: [[SeedGrid/Produtos/Pulse/Protocolo-e-API#Delivery modes|Delivery modes]] e [[SeedGrid/Produtos/Pulse/Protocolo-e-API#DLQ: quando uma mensagem vai para lá|DLQ]].

## Peças

| Peça | Onde (no repo) | Tecnologia |
|---|---|---|
| Servidor | `backend/` | Rust, Axum, Postgres, Redis opcional |
| UI operacional | `frontend/seedgrid-pulse-ui/` | Next.js + `@seedgrid/fe-components` |
| SDKs publisher | `components/publishers/` | Java, Next, Dart, PHP, Rust, Delphi |
| SDKs subscriber | `components/subscribers/` | React, Angular, Flutter, Rust, Delphi |
| Exemplos prontos | `examples/` | Delphi VCL, Flutter, React (e Angular) |
| Harness de integração | `integration/seedgrid-pulse-sdk-it/` | contra Pulse real |

Versão do servidor e da UI na análise: **0.3.0** (Confirmado — `backend/Cargo.toml`, `frontend/seedgrid-pulse-ui/package.json`).

## Modelo mental (3 minutos)

```
 backend do produto ──(chave project)──▶  POST /api/v1/messages ─┐
                                                                 ▼
 navegador/app ◀──WebSocket──  Pulse  ◀── conta (fronteira de isolamento)
   (token curto)               │  └─ canal › grupo › usuário › evento
 agente instalado ◀──────────  │
   (chave client)              └─ pendente? fica guardado e é reentregue (replay)
```

- **Conta** é a fronteira: entrega e replay nunca cruzam contas.
- **Credenciais têm papéis distintos** e nunca se substituem — ver [[SeedGrid/Produtos/Pulse/Autenticacao-e-chaves|Autenticação e chaves]].
- **Delivery mode** escolhe o ciclo de vida: `notification` (padrão), `acknowledged`, `processed` — ver [[SeedGrid/Produtos/Pulse/Protocolo-e-API|Protocolo e API]].

## Mapa desta documentação

**Pulse (servidor)** — o backend Rust, com variáveis próprias:
- [[SeedGrid/Produtos/Pulse/Servidor/Instalacao|Instalação e execução]]
- [[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Variáveis de ambiente do servidor]]
- [[SeedGrid/Produtos/Pulse/Servidor/Providers|Providers: Redis, Valkey, Dragonfly, NATS, RabbitMQ, Postgres]]
- [[SeedGrid/Produtos/Pulse/Servidor/Operacao|Operação: lixeira, retenção, auditoria, métricas, escala]]

**Pulse UI** — o painel Next.js, com variáveis próprias:
- [[SeedGrid/Produtos/Pulse/UI/Visao-geral|Visão geral, instalação e deploy]]
- [[SeedGrid/Produtos/Pulse/UI/Configuracao|Variáveis de ambiente da UI]]

**Transversal:**
- [[SeedGrid/Produtos/Pulse/Autenticacao-e-chaves|Autenticação, chaves, token curto e permissions]]
- [[SeedGrid/Produtos/Pulse/Protocolo-e-API|Protocolo realtime e API HTTP]]
- [[SeedGrid/Produtos/Pulse/SDKs|SDKs (publisher e subscriber por linguagem)]]
- [[SeedGrid/Produtos/Pulse/Exemplos|Exemplos executáveis (Delphi, Flutter, React, Angular)]]

## Como usar o Pulse em um projeto SeedGrid (receita curta)

1. Peça à operação do Pulse uma **conta** para o seu produto e as chaves: uma `project` (backend) e, se houver agentes, `client`.
2. Guarde a chave `project` **só no backend** (env/secret). Nunca em código de navegador/mobile.
3. No backend, instale o SDK **publisher** da sua linguagem e publique.
4. Se o cliente é navegador/app: crie uma rota autenticada no backend que chama `issueConnectToken` com o `subject` **da sessão**; o front usa o SDK **subscriber** com `getToken`.
5. Defina `channel`/`event` por convenção do produto (ex.: `orders` / `order.updated`) e use o `publicId` do usuário, nunca e-mail.

## Confiabilidade das informações

Conteúdo extraído de `README.md`, `backend/README.md`, `backend/env.md`, `backend/PROTOCOL.md`, `backend/docs/LIXEIRA-mensagens-e-contas.md`, `backend/src/config.rs`, `backend/migrations/` e dos READMEs dos SDKs. Quando algo vem só de documentação (não relido no código nesta análise), a nota diz.
