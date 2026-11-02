---
name: sg-docs-index
description: Gera e confere docs/ai/INDEX.md, o índice geral de planos, demandas, decisões (ADR), handoffs, relatórios, especificações e análises do projeto, com as demandas abertas em destaque no topo. Use sempre que criar, renomear ou mudar o status de um documento em docs/ai, e antes de fechar uma mudança.
metadata:
  toolkit: seedgrid-ai
---

# Índice geral de docs/ai

`docs/ai/INDEX.md` é o mapa de tudo o que a IA registra no projeto. Ele é **gerado** a partir dos nomes e dos cabeçalhos dos arquivos; nunca se edita à mão. Quem abre o projeto lê o topo: as **demandas abertas** são as únicas que cobram ação de alguém.

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
- **Pastas:** `plans`, `demands`, `adrs`, `handoffs` (ou `handoff`), `reports`, `specs`, `analises`; qualquer outra pasta entra como "Outros". Todas as subpastas são lidas.
- **Demanda aberta:** `status` começando por `aberta`, `pendente` ou `em-andamento`. Fechada: `respondida`, `fechada`, `recusada`, `cancelada`, `concluída`, `confirmada`, `atendida`. Status fora disso conta como aberta, com aviso.

## O que reprova (`exit 1`)

- Id repetido entre planos, entre demandas ou entre ADRs.
- `--check` com o `INDEX.md` desatualizado.

## O que só avisa

- Plano que cita uma demanda sem arquivo em `demands/`; demanda cujo plano não existe.
- Documento sem `aidlc:` no cabeçalho (formato antigo).
- Status de demanda que o script não reconhece.

## Relação com as outras skills

- `sg-adr` continua mantendo `adrs/INDEX.md` (índice só das decisões, com `--numerar` e `--renomear`); o índice geral lista as ADRs ao lado dos demais documentos.
- `sg-validate-change` roda o `--check` deste índice ao fechar uma mudança.
