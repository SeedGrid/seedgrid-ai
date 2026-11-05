---
name: sg-docs-index
description: Gera e confere docs/ai/INDEX.md, o índice geral de planos, demandas, decisões (ADR), handoffs, relatórios, especificações e análises do projeto, com layout fixo (a mesma ordem de seções em todo produto; a seção sem documento diz "Nenhum"). Use sempre que criar, renomear ou mudar o status de um documento em docs/ai, e antes de fechar uma mudança.
metadata:
  toolkit: seedgrid-ai
---

# Índice geral de docs/ai

`docs/ai/INDEX.md` é o mapa de tudo o que a IA registra no projeto. Ele é **gerado** a partir dos nomes e dos cabeçalhos dos arquivos; nunca se edita à mão. Quem abre o projeto lê o **Resumo** (a contagem por tipo) e, logo abaixo, as **demandas abertas**, que são as únicas que cobram ação de alguém.

## Layout fixo (igual em todo produto)

A ordem das seções **não depende do conteúdo**: todo `INDEX.md` tem as mesmas seções, na mesma ordem, e a que não tem documento mostra `_Nenhum._` (assim, ninguém confunde "não existe" com "não foi registrado"):

1. **Resumo**: tabela com a contagem de cada tipo e o total.
2. **Demandas abertas (cobram ação de alguém)**
3. **Planos**
4. **Decisões (ADR)**
5. **Handoffs** (pastas `handoff` e `handoffs`)
6. **Relatórios**
7. **Especificações**
8. **Análises**
9. **Demandas respondidas**
10. **Outros**: uma subseção (`###`) por pasta fora do padrão, e `_Nenhum._` se não houver.

Em cada seção a tabela é `Id | Título | Status | Data | Plano.Fase`, ordenada pelo id.

## Quando rodar

- Criou, renomeou, apagou ou mudou o `status:` de qualquer documento em `docs/ai/` (plano, demanda, ADR, handoff, relatório, especificação, análise).
- Antes de fechar uma mudança: o `--check` precisa passar.
- Ao criar o produto com `sg-new-product`: o primeiro índice já nasce junto.

## Como

```bash
node <pasta-das-skills>/sg-docs-index/scripts/docs-index.mjs            # grava docs/ai/INDEX.md
node <pasta-das-skills>/sg-docs-index/scripts/docs-index.mjs --check    # só confere (não grava)
node <pasta-das-skills>/sg-docs-index/scripts/docs-index.mjs --stdout   # mostra sem gravar
```

`<pasta-das-skills>` é onde o seu adaptador instalou as skills (por exemplo `.agents/skills` ou `.ai/skills`). Outro caminho para o índice: `--dir <pasta>`.

## O que o script entende

- **Id** pelo nome do arquivo: `P<plano>-...` (plano), `P<plano>.F<fase>.DEM<n>-...` (demanda), `ADR<n>-...` (decisão; sem o prefixo, usa o `numero:` do cabeçalho), `P<plano>.F<fase>.T<n>-...` (análise e afins).
- **Título** do `titulo:` do cabeçalho ou, na falta, do primeiro `# ` do corpo. **Status**, **data**, **plano** e **fase** do cabeçalho; a data cai para a do nome do arquivo.
- **Pastas:** `plans`, `demands`, `adrs`, `handoffs` (ou `handoff`), `reports`, `specs`, `analises`; qualquer outra pasta entra em "Outros", numa subseção própria. Todas as subpastas são lidas.
- **Demanda aberta:** `status` começando por `aberta`, `pendente` ou `em-andamento`. Fechada: `respondida`, `fechada`, `recusada`, `cancelada`, `concluída`, `confirmada`, `atendida`. Status fora disso conta como aberta, com aviso.

## O que reprova (`exit 1`)

- Id repetido entre planos, entre demandas ou entre ADRs.
- Plano `proposto` com tarefa `[~]` ou `[x]`: o status acompanha a execução; mude para `em-andamento`.
- `--check` com o `INDEX.md` desatualizado.

## O que só avisa

- Plano que cita uma demanda sem arquivo em `demands/`; demanda cujo plano não existe.
- Documento sem `aidlc:` no cabeçalho (formato antigo).
- Status de demanda que o script não reconhece.
- Plano `concluido` com tarefa ainda aberta (`[ ]`, `[~]`, `[?]`).

## Relação com as outras skills

- `sg-adr` continua mantendo `adrs/INDEX.md` (índice só das decisões, com `--numerar` e `--renomear`); o índice geral lista as ADRs ao lado dos demais documentos.
- `sg-validate-change` roda o `--check` deste índice ao fechar uma mudança.
