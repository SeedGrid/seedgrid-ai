---
tags: [seedgrid, produto, pulse, exemplos]
fonte: seedgrid-products/seedgrid-pulse/examples
branch: main
commit: 9dcbdad
analisado-em: 2026-10-16
---

# Pulse — exemplos executáveis

Quatro aplicações de exemplo com **a mesma tela e o mesmo roteiro**; só muda a linguagem. Em todas, publisher e subscriber são **independentes** (cada um com sua chave, conexão, SDK e painel): copie para o seu projeto só o lado que precisa. Voltar: [[SeedGrid/Produtos/Pulse/Visao-geral|Visão geral]] · SDKs: [[SeedGrid/Produtos/Pulse/SDKs|SDKs]].

| Exemplo | Pasta | Publisher | Subscriber | Como rodar |
|---|---|---|---|---|
| Delphi XE6 (VCL) | `examples/delphi-vcl` | `IPulsePublisher` (REST) | `IPulseSubscriber` Indy, auto-ack | abrir o projeto no Delphi |
| Flutter (Android) | `examples/flutter` | `seedgrid_pulse_publisher` | `seedgrid_pulse_subscriber` | `flutter run` (`--dart-define=PULSE_BASE_URL=…`) |
| React (Vite) | `examples/react` | `@seedgrid/pulse-publisher-next` via backend de apoio | `@seedgrid/pulse-subscriber-react` | `npm install` · `npm start` |
| Angular | `examples/angular` | `@seedgrid/pulse-publisher-next` via backend de apoio | `@seedgrid/pulse-subscriber-angular` | `npm install` · `npm start` (API de apoio em `8787` + `ng serve` em `4200`) · `npm test` |

## O que a tela faz

- **Publisher:** Conectar (só prepara URL + chave; HTTP é stateless) · Desconectar · Publicar (canal, evento, destino conta/grupo/usuário, JSON).
- **Subscriber:** Conectar · Desconectar · Inscrever · Desinscrever, com a lista de inscrições ativas e o log de mensagens recebidas.
- Roteiro de ponta a ponta: conectar os dois, inscrever-se em `orders`, publicar em `orders` para a **conta inteira** — a mensagem aparece no log do subscriber.

## Duas chaves, dois papéis

- Chave **`client`** conecta, assina e recebe; **não publica** (403).
- Chave **`project`** publica; **não conecta** (403 no handshake).
- Após conectar, `subscribe` e mensagens trafegam no mesmo socket, sem reenviar a chave.
- As telas trazem **chaves de demonstração** pré-preenchidas (sobrescrevíveis por variável de ambiente / `--dart-define`). A chave `project` é credencial de servidor: não a distribua em app de usuário final.

## Receber só de um usuário

O **usuário vem da credencial**, não do `subscribe`. Com o campo **Usuário** preenchido (`usr_1`, `usr_2`), a tela conecta com um **token curto** emitido para esse usuário; `usr_2` não recebe o que foi publicado para `usr_1`. Vazio, conecta com a chave `client` como *serviço* (só mensagens da conta inteira ou de grupos). Para trocar de usuário, desconecte.

## O "backend do produto" nos exemplos web

O SDK de publicação para Node é **server-only**, então React e Angular trazem um backend mínimo (`/api/publish` e `/api/connect-token`) que usa `createPulsePublisher` e `issueConnectToken`; o navegador só chama esse backend e o WebSocket vai direto ao Pulse com o token. **No seu produto** a chave fica em variável de ambiente no servidor e o `subject` vem da **sessão** do usuário, nunca do request.

## Limitações conhecidas

- O SDK Angular não tem `unsubscribe`, lista de inscrições nem `autoAck`; o exemplo Angular faz isso na própria tela (envia a união das inscrições e, para desinscrever, reconecta só com o que sobrou). Os exemplos Delphi, Flutter e React usam os recursos nativos do SDK.
- O exemplo Flutter para repassar a outra pessoa pode ser empacotado com os SDKs copiados em `sdk/subscriber` e `sdk/publisher` (dependências `path:`), sem precisar do monorepo.
