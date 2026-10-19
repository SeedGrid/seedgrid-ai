---
name: sg-branch-status
description: Lista as branches e os worktrees do repositório que já foram mergeados (inclusive por squash) ou estão sem dono, e limpa o que o dono autorizar. Use no início de toda tarefa não trivial e ao concluir uma tarefa; evita branch, branch remota e worktree esquecidos.
metadata:
  toolkit: seedgrid-ai
---

# Branches e worktrees: o que sobrou

Squash não deixa ancestralidade, então `git branch --merged` não enxerga uma branch que já entrou por squash. O script compara o **conteúdo**: a branch está mergeada se cada arquivo que ela alterou já tem no destino o mesmo conteúdo (ou foi apagado). O destino é a `develop`; sem `develop`, a `main`.

## Passos

1. **Relatório** (não altera nada): `node .ai/skills/sg-branch-status/scripts/branch-status.mjs`. Opções: `--json`, `--base <branch>`, `--days <n>` (padrão 14; dias sem commit para virar "sem dono").
2. **Classificação:** `MERGEADA` (já está no destino), `SEM DONO` (não mergeada e parada) e `EM USO` (commit recente ou checkout/worktree ativo). Worktrees com pasta ausente ou cuja branch já foi mergeada aparecem como órfãos.
3. **Reportar ao usuário** o que sobrou, em uma lista curta, e propor a limpeza.
4. **Limpar** só com a confirmação do usuário: `node .ai/skills/sg-branch-status/scripts/branch-status.mjs --delete <branch>` apaga a branch **local, a remota e o worktree** de uma branch mergeada. `--dry-run` mostra o que faria. Para worktree órfão sem pasta, `git worktree prune`.

## Limites

- O script **recusa** apagar `main`, `develop`, o destino e a branch com checkout.
- Branch **não mergeada** só é apagada com `--force`, e só quando o usuário mandar. "Sem dono" não é autorização: pergunte.
- Worktree com mudanças não é removido sozinho; reporte ao usuário.
- Ao concluir uma tarefa, a própria branch da tarefa entra por squash na `develop` e some (local, remota e worktree): rode o relatório para conferir que nada ficou.
