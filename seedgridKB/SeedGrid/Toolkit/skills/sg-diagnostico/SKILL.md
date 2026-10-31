---
name: sg-diagnostico
description: Diagnostica um plano ou briefing livre (prosa, tabelas, sem ids de tarefa) contra o formato da sg-plan-goal e propõe a versão adequada ao lado, sem apagar o original - ids P<plano>.F<fase>.T<tarefa>, aidlc no cabeçalho, fases, hipóteses viradas em tarefas de prova, perguntas ao dono como decisões .D<n>, blocos /goal. Use quando pedirem para "adequar", "converter para o formato goal" ou "ver o que falta para virar /goal" num plano que já existe, e quando o dono trouxer um briefing escrito em outra ferramenta (por exemplo ChatGPT, que não conhece o SeedGrid) para validar contra o que o ecossistema já oferece.
metadata:
  toolkit: seedgrid-ai
---

# Adequar um plano livre ao formato goal (modo "adequar plano")

Para um plano que **já existe** e não está no formato da `sg-plan-goal` (briefing de outra ferramenta, plano de produto em prosa, rascunho). Não é para planejar do zero: as decisões do dono que o plano já traz **não se perdem nem se refazem**.

**Quem executa:** o `arquiteto`. O coordenador aciona o `arquiteto` com o caminho do plano e repassa as perguntas dele ao dono; quem grava o arquivo final é o coordenador.

## Briefing de outra ferramenta (caso comum)

O dono elabora a ideia numa ferramenta que **não conhece o SeedGrid** e traz o texto para checar. O briefing quase sempre assume coisas que o ecossistema já resolve, ou resolve de outro jeito. Antes de adequar, o `arquiteto` **classifica cada item do briefing, citando a nota da KB**, em quatro grupos:

1. **O ecossistema já oferece** (extension, tela, componente): diga qual e a nota.
2. **Adaptar**: oferece parte; diga a lacuna.
3. **Domínio do produto**: o que só este produto desenvolve.
4. **Componente ou extension nova**: o que falta no ecossistema (vira demanda, não implementação).

O que o briefing assumiu e **diverge** do ecossistema (por exemplo, modelo de tenancy) vira **decisão do dono** com a recomendação, não é resolvido em silêncio. Só depois siga os passos abaixo. Contrato de extension: só pela KB (HO-08); depois de escrito, o coordenador **lê o plano entregue e roda o `controle.mjs status`** antes de apresentá-lo.

## Passos

1. **Diagnosticar** (só leitura): `node .ai/skills/sg-diagnostico/scripts/diagnostico.mjs <plano.md>`. Mostra o que falta (`aidlc:`, ids falantes, `depende-de`, `escreve`, `Aceite`, blocos `/goal`) e o que o plano já traz para virar tarefa (hipóteses, fases da "Ordem de execução", decisões abertas e resolvidas). `--json` para máquina.
2. **Gerar o esqueleto ao lado** (nunca sobre o original): `node .ai/skills/sg-diagnostico/scripts/diagnostico.mjs <plano.md> --saida <novo.md> [--plano <numero>]`. O script recusa sobrescrever arquivo existente e o próprio plano. O esqueleto traz: cabeçalho com `aidlc:` do `.ai/toolkit-lock.json`; **Fase 0** com as decisões (`[?]` as abertas, com `Pergunta:` e `Recomendacao:`; `[x]` as já resolvidas pelo dono, com a origem em `Evidencia:`) e uma tarefa de prova por hipótese; uma fase por linha da "Ordem de execução"; a fase `FIM`; bloco `/goal` por fase e do plano inteiro.
3. **Preencher o que ficou `<definir>`** a partir do plano original: `escreve` (arquivos e módulos), `Aceite`, `Testes` (os guardiões previstos), quebra de cada fase em tarefas, princípios do dono (copie, não reescreva). Contrato de extension só pela **KB** (`.ai/brain/`): o que a KB responde fecha a hipótese citando a nota; o que não responde vira demanda em `docs/ai/demands/` (HO-08), não leitura do fonte.
4. **Conferir**: `node .ai/skills/sg-plan-goal/scripts/controle.mjs <novo.md> status` sem aviso e `pendencias` listando as perguntas ao dono.
5. **Entregar** ao dono com a lista de perguntas (plano, fase, tarefa e **título**) e a recomendação de cada uma. O original fica intacto; arquivá-lo ou trocá-lo é decisão do dono.

## Regras

- **Nunca apague nem sobrescreva o original.** A versão adequada tem outro nome.
- **Decisão já tomada pelo dono não vira pergunta**: entra como `[x]` com a origem.
- **Não invente** `escreve`, `Aceite` nem prazo: se o plano não diz, deixe `<definir>` e pergunte.
- O script é heurístico: reconhece tabelas `| H1 | ... |` (hipóteses), `| Fase | Conteúdo | ... |` (ordem de execução) e a seção "Em aberto" (blocos `Bloqueia`, `Pedem confirmação`, `Resolvidas`). Plano sem essas seções recebe o esqueleto mínimo; monte as fases à mão.
