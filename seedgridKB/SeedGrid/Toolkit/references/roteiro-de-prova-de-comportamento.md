---
description: "Roteiro mínimo de prova de comportamento no navegador (12 passos medidos), que classe de mudança exige quais passos, quem executa e como o resultado entra no pedido de publicação; vale para as libs e para o aceite do produto."
---
# Roteiro de prova de comportamento

Teste estático (`tsc`, vitest, `check-padroes-tela`) lê código e **não usa a tela**: um botão que duplica o registro passa em todos. Este roteiro prova o **comportamento** (cliques, Enter, erro, tela estreita, build de produção) antes de publicar. Ele nasceu do levantamento dos defeitos que o dono achou usando o produto: só o Salvar que duplica era pego por regra de código; o resto só aparece medindo ou clicando.

## Quando usar

- **AIDLC das libs (boilerplate, fe-components, extension com tela):** antes de pedir ao dono o "pode" de publicar. A classe da mudança (abaixo) diz se o roteiro é obrigatório e quais passos.
- **AIDLC de produto:** o roteiro inteiro roda como **aceite automático antes da entrega do projeto completo**, sem o dono. O dono só vê as telas do UX e o pedido de "pode" do push na `main`, que chega com o resultado.
- Extension Java sem tela: a prova equivalente é o teste de integração com banco real e o guardião da regra (por exemplo `*GuardianIT`), não este roteiro.

## Quem executa e como

- Quem **executa** é o papel `frontend-tester`, em **cópia descartável** do commit a publicar (por exemplo `git archive`), com **banco novo e backend local**, nunca produção, e em **build de produção** (o CSS de produção chega em outra ordem; o cartão do 2FA largo só aparecia lá).
- Quem pediu a publicação **corrige sozinho o que falhar e repete**, sem o dono. O `frontend-tester` não corrige código.
- Cada passo tem um **critério medido**: contar requisições e registros, medir largura, não só olhar a tela.
- Cada passo termina em **PROVADO** (medido, com a evidência), **VISTO** (observado, sem medir) ou **NÃO TESTADO (motivo)**. "Passou" sem medida não vale como PROVADO.

## O que o diff toca decide a classe (sem julgamento do agente)

| O diff toca | Classe | Passos do roteiro |
|---|---|---|
| Pin de dependência (`pom.xml`, `package.json`, lockfile) | **Bloqueia** | login (passo 2), uma gravação (1 e 3) e o fluxo que a dependência muda |
| Tela de gravação (`*_edit`, formulário, botão de gravação, exclusão) | **Bloqueia** | 1, 2, 3, 4 e 6 nas telas tocadas |
| `data.ts`, `Shell`, menu, topbar | **Bloqueia** | 5 e 6 |
| Autenticação, troca de senha, 2FA, `auth/*` | **Bloqueia** | 2, 3, 7 e 12 |
| Sino e notificações | **Bloqueia** | 8 |
| Signup, cadastro de empresa | **Bloqueia** | 9 e 10 |
| Assinatura, plano, nome do produto | **Bloqueia** | 11 |
| Arquivo gerenciado ou copiado do boilerplate para o produto | **Bloqueia** | rodar `check-padroes-tela --dir <destino>` e os passos da área tocada |
| Só texto, estilo ou documentação (nenhum dos arquivos acima) | **Só avisa** | nenhum; o pedido diz "roteiro não rodado: só texto/estilo" |
| Entrega completa de um produto novo (AIDLC de produto) | **Bloqueia** | **os 12 passos**, antes da entrega |

**Na dúvida, bloqueia.** O agente não reclassifica para baixo por conta própria: a classe sai dos arquivos que o diff toca. Mudança que parece estilo mas mexe em comportamento (por exemplo, ordem do menu) é da classe do arquivo, não da aparência.

## Os 12 passos

| # | Passo | Critério medido |
|---|---|---|
| 1 | **Cliques repetidos em Salvar.** Criar com 5 cliques seguidos (empresa, usuário, perfil, chave de API, plano no admin) e editar com 5 cliques | criação = **1 registro** e 1 POST; edição = **1 PUT/PATCH**, todos 200 |
| 2 | **Enter repetido** em login, esqueci a senha, troca de senha (perfil e obrigatória) e desativar 2FA, e nas telas de edição | 1 requisição por envio (5 Enters = 1). Nas telas de edição o Enter pode não enviar nada (0 requisições): isso é aceito, não é duplicação |
| 3 | **Erro 400, 409 e 422** em cada tela de gravação | o botão volta ao normal **e** a mensagem fica **visível e fixa** (aviso, não só toast que some) |
| 4 | **Resposta que não é JSON** (simular 502, 524 ou timeout) | nenhum "Salvando..." eterno e nenhum HTML bruto na tela; mensagem legível; "Tentar de novo" refaz a requisição |
| 5 | **Menu**: Empresas e Segurança por último; grupo Segurança presente no front e no admin; menu do usuário com Meu perfil, Minha assinatura, Configurações (quando o produto tem) e Sair | ordem e itens conferidos no navegador |
| 6 | **390 px**: barra superior, gaveta e rolagem, em **página de título longo** (por exemplo `/security/two-factor`) e na tela com mensagem longa do 2FA | `scrollWidth` = 390; nada cortado; "Modo escuro" dentro da tela |
| 7 | **Telas `auth/*` a 1920 e 390 px** | cartão centralizado, largura de até 420 px, textos com acento |
| 8 | **Sino**: abrir e **clicar** na notificação de backup concluído | o download acontece (contar a requisição `GET .../download`, 200 `application/zip`); backup expirado dá 410 com mensagem legível; `backup.failed` abre a tela de backup |
| 9 | **Signup real** (o fluxo da tela, não fixture) com subdomínio em maiúscula e com espaço; depois **editar a empresa criada pelo signup** mudando só o telefone | o subdomínio vira minúsculo, e o Salvar da edição responde 200 |
| 10 | **Cadastro de empresa**: sem "Tipo de pessoa"; CNPJ válido preenche razão social e endereço; CNPJ repetido avisa | os três comportamentos observados e medidos |
| 11 | **Assinatura**: plano sem preço não é assinável; nenhuma tela do cliente cita "Report" nem instrução de administrador; página de sucesso com o nome do produto | textos conferidos nas páginas `/assinatura/*` e `/auth/*` |
| 12 | **Troca de senha e 2FA**, incluindo senha errada | aviso de erro visível; ativar e desativar o 2FA funcionam |

Host inválido (`_`, `master`, tamanho, ponto, outro domínio) devolve 400 "Domínio de acesso inválido" nas rotas de auth, signup e self-enter, e 503 só quando o backend está fora; conferir quando o diff toca `tenant-host` (é o passo 2 e 9 para o `subdomain-tenancy`).

## Formato do resultado no pedido de publicação

O pedido de "pode" leva uma tabela curta, nesta ordem:

| Passo | Resultado | Evidência |
|---|---|---|
| 1 Salvar 5×, 6 telas | PROVADO | 1 POST em cada; commit `abc1234` |
| 8 Sino, clicar em backup | NÃO TESTADO (sem MinIO) | n/a |

- **Commit testado** (o hash exato) e a classe da mudança (Bloqueia ou Só avisa).
- **O que não foi provado** e por quê, sem esconder. Pedido de "pode" **sem** esta tabela é devolvido ao agente pela doc, sem passar pelo dono.
- O dono só é chamado quando um passo não pode ser provado e precisa da aceitação dele, ou quando o defeito exige decisão de produto.

## Limites

- Não substitui o `revisor` (lê o diff) nem o `qa` (cria teste automatizado); roda depois deles.
- Não toca produção, não publica, não envia mensagem nem pagamento real.
- Não cobre MinIO, e-mail real nem pagamento real sem o ambiente de teste correspondente: esses passos viram "NÃO TESTADO (motivo)".
- O que der para automatizar (Playwright) pode virar script repetível sob demanda, fora do `npm test`; o resto segue manual com esta lista.
