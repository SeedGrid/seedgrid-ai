---
tags: [seedgrid, produto, pulse, servidor, operacao, lixeira, retencao]
fonte: seedgrid-products/seedgrid-pulse/backend (docs/LIXEIRA-mensagens-e-contas.md, README.md)
branch: main
commit: 9dcbdad
analisado-em: 2026-10-16
---

# Pulse (servidor) — operação

Lixeira, retenção, auditoria, observabilidade e escala. Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral]] · variáveis: [[SeedGrid/Produtos/Pulse/Servidor/Configuracao|Configuração]].

## Princípios

- O **histórico de entregas é prova**: por padrão **nunca é apagado sozinho**.
- Apagar é **sempre ação humana**, com permission própria, confirmação na UI e **audit** (quem, o quê, quantos).
- A chave de servidor **não apaga nada** (401): toda exclusão tem um autor.

## Lixeira de mensagens

- **Só mensagens `pending`** podem ir para a lixeira (mensagens entregues/processadas são histórico; só saem com a exclusão da conta).
- Na UI: **Mensagens**, filtro de status **"Na lixeira"**. Mover (`PULSE_MESSAGE_DELETE`), restaurar (volta a `pending`) e limpar de vez (`PULSE_MESSAGE_PURGE`, apaga também as entregas por destinatário).
- API: `POST /api/v1/messages/trash` · `/trash/restore` · `/trash/purge`, lote de até **1000** ids (`400 BATCH_TOO_LARGE`), resposta `{requested, affected, skipped}`.
- Mensagem na lixeira não é entregue, não expira por TTL e some das listas padrão.
- **Descartar** (tela Pendências, `PULSE_BACKLOG_DISCARD`) e **Lixeira** coexistem como ações distintas; só a lixeira tem restaurar e limpar de vez.
- Tarefas `delivered` sem `result` e sem prazo de execução (as anteriores ao Pulse 0.3.0, ou quando `resultTimeoutSeconds` não foi usado) só saem por **descarte**; veja [[SeedGrid/Produtos/Pulse/Protocolo-e-API#Prazo de execução (resultTimeoutSeconds)|Prazo de execução]].

## Lixeira de contas

- A lixeirinha da lista de contas pede confirmação e leva a conta para `pending_delete` (`PULSE_ACCOUNT_DELETE`). A conta **deixa de autenticar** e suas conexões são derrubadas.
- **Lixeira de contas** (menu): restaurar (volta ao status anterior) ou **apagar definitivamente** (`PULSE_ACCOUNT_PURGE`), que remove a conta, suas chaves e **todas as suas mensagens** em cascata. O diálogo mostra antes quantas chaves e mensagens saem (`GET /accounts/{id}/deletion-summary`).
- O apagar definitivo **não é uma transação única**: mensagens primeiro, conta por último. Se falhar no meio, a conta continua na lixeira e dá para repetir.

## Retenção e limpeza automática

| Variável | Padrão | Efeito |
|---|---|---|
| `DELIVERY_CLEANUP_RETENTION_DAYS` | `0` | Dias que uma mensagem **final** (`completed`/`dead_letter`/`expired`) é mantida. `0` = **nunca apaga**. |
| `DELIVERY_TRASH_AUTO_CLEAN_DAYS` | `0` | Dias na lixeira antes de apagar sozinho. `0` = só manual. Cada limpeza vai ao audit como `system:pulse`. |

As duas **não se sobrepõem**: a primeira atua no histórico (estados finais), a segunda na lixeira (`trashed`). Mensagens `pending` e `delivered` nunca são limpas pela retenção. A obsoleta `DELIVERY_CLEANUP_RETENTION_SECONDS` só vale se a de dias não existir. Ambas são editáveis em **Configurações**, sem redeploy.

> **Mudança de comportamento (2026-10-15):** o padrão era 7 dias e `0` apagava tudo. Ambientes que definem a variável explicitamente (EasyPanel) mantêm o valor definido.

Sem consumidor, uma `pending` não fica para sempre: o TTL (`DELIVERY_TTL_SECONDS`, 1 dia) a expira.

## Ordem das listas e paginação

As telas listam **da mais recente para a mais antiga** (quem acabou de publicar vê a sua primeira): contas por `created_at`, mensagens por `published_at` e entregas por destinatário por `delivered_at`, todas **com desempate por id**. A paginação é 1-based (`page`, `pageSize`; a Auditoria usa `page`/`size` e o backend dela é base 0, convertido pela UI). Até o Pulse 0.2.1 a lista de contas ordenava sem desempate, e contas criadas no mesmo segundo repetiam ou sumiam entre páginas (corrigido no 0.2.2). O **replay** e as pendências devidas continuam em ordem cronológica (do mais antigo ao mais novo), porque entregar na ordem de publicação é o comportamento certo (Confirmado em `delivery/repo.rs`).

## Auditoria

Toda operação destrutiva (mover para lixeira, restaurar, limpar; contas e mensagens) grava em `audit_log` o autor (claim `sub` do JWT, e-mail na descrição), a ação e as contagens, **somente se algo mudou**. Visível em **Segurança → Auditoria** (escopo por `company_id`).

## Observabilidade

| O quê | Onde |
|---|---|
| Liveness / readiness | `GET /health` · `GET /ready` (200 `READY` / 503 `NOT_READY`, com store, broker e presença) |
| Métricas | `GET /metrics` (JSON) · `GET /metrics/prometheus` |
| Dashboards | Prometheus + Grafana no compose (`SeedGrid Pulse Overview`) |
| Telas | dashboard, conexões, backlog, DLQ, mensagens, entregas por destinatário |

Métricas úteis: `publish_requests_total`, `delivery_attempts_total`, `delivery_success_total`, `delivery_dead_letter_total`, `delivery_expired_total`, `delivery_result_timeout_total` (prazo de execução estourado), `ack_total`, `ws_connections_opened_total`/`_closed_total`, latências `publish_to_deliver_*` e `deliver_to_ack_*`.

## Escala (várias réplicas)

- Estado durável no **Postgres** (`DELIVERY_STORE_BACKEND=postgres`).
- Entrega entre instâncias via **broker pub/sub** (`BROKER_PROVIDER`) e presença em Redis (`PRESENCE_BACKEND=redis`): ver [[SeedGrid/Produtos/Pulse/Servidor/Providers|Providers]].
- Revogação de credencial atravessa o broker (tópico `pulse.revocations`) e derruba as conexões em **todas** as instâncias.
- Limites de emissão de token são **por instância**: com N réplicas o efetivo é até N vezes.

## Diagnóstico rápido

| Sintoma | Verifique |
|---|---|
| Publicou e ninguém recebeu | `accountId`/conta ativa; `channel` e `event` batem com o `subscribe`; `user` do destino = `subject` da conexão; entrega fica `pending` até alguém conectar |
| 403 ao publicar | está usando chave `client` ou a chave de servidor; use a `project` |
| WebSocket 401 | credencial ausente/revogada; token `pct_` vencido antes de conectar |
| Conexão fecha com `4403` | chave/conta revogada: não reconecte com a mesma credencial |
| `connect-tokens` 503 | falta `SEEDGRID_PULSE_CONNECT_TOKEN_SECRET` |
| E-mail/2FA por e-mail não chega | `SECURITY_MAILER_USERNAME`/`_PASSWORD` ausentes (só loga) |
| Histórico "sumiu" | retenção definida no ambiente (`DELIVERY_CLEANUP_RETENTION_*`) |
| Réplica B não recebe o que A publicou | broker `memory` em produção multi-réplica |

Testes e CI: `cargo test` (unitários e e2e); com Docker/Podman, `cargo test redis_ -- --ignored`, `postgres_ -- --ignored` e `--test trash_integration -- --ignored --test-threads=1` sobem Postgres/Redis via testcontainers.
