---
description: "Regra de branches do produto: main e develop, uma branch por tarefa com prefixo por tipo, squash na develop, release por merge normal, limpeza de branch e worktree e quando pedir autorização ao dono. Leia antes de criar branch, fazer merge ou preparar release."
---
# Branches do produto (HO-01 a HO-07)

O `seedgrid-ai init`, numa pasta nova, cria o repositório com `main` e `develop` no mesmo commit inicial. **A `feature/` (ou outra branch de trabalho) nasce da `develop`** e é criada pelo orquestrador (a sessão principal), não pelo `init`. Este documento vale para o produto; a plataforma tem fluxo próprio.

## Tipos de branch

| Tipo | Sai de | Termina com |
|---|---|---|
| `feature/<assunto>` | `develop` | squash na `develop`, **um commit por tarefa** |
| `bugfix/<assunto>` | `develop` | squash na `develop` |
| `refactor/<assunto>` | `develop` | squash na `develop` |
| `chore/<assunto>` (inclui docs) | `develop` | squash na `develop` |
| `hotfix/<assunto>` | `main` atualizada | squash na `main` **e** na `develop` |
| `release/<versão>` | `develop` | merge **normal** (sem squash) na `main` |

O prefixo segue a classificação do `arquiteto` (feature, bug, hotfix, refactor, chore).

## Regras

- **HO-01. Uma branch por tarefa**, com o prefixo do tipo, criada a partir da origem da tabela. Nunca trabalhe direto na `main` nem na `develop`.
- **HO-02. Squash na `develop`**, um commit por tarefa, só com a tarefa concluída; a mensagem começa pelo id da tarefa. Até lá a branch não está na `develop`, mas pode receber push como backup.
  - **Formato da mensagem:** `P<plano>.F<fase>.T<tarefa>: <tipo>(<escopo>): <resumo>`, por exemplo `P155.F3.T19: fix(theme): fundo cheio usa a cor pura da semente`. O id vem **primeiro**, para a listagem curta (`git log --oneline`) já mostrar a que tarefa cada commit pertence; o tipo (`feat`, `fix`, `refactor`, `chore`, `docs`) e o escopo ficam depois e seguem o Conventional Commits.
  - **Sem plano numerado** (tarefa solta, hotfix, manutenção): use `sem-plano: <tipo>(<escopo>): <resumo>`. Não invente número de plano nem de tarefa.
  - **Para que serve:** achar todos os commits de uma tarefa (`git log --grep='^P155.F3.T19'`) e, num `git bisect`, saber de imediato qual tarefa introduziu o defeito e deve ser reaberta.
  - **Commits intermediários** da branch seguem o mesmo prefixo quando possível, mas só o commit do squash é exigido.
  - A regra vale daqui em diante; o histórico antigo não é reescrito.
- **HO-03. Release por merge normal.** A `release/` sai da `develop` e entra na `main` sem squash, para preservar um commit por tarefa; assim `develop` e `main` não divergem.
- **HO-04. Limpeza ao terminar.** Depois de confirmar que o merge entrou (no `hotfix/`, nos dois destinos), apague a branch **local e a remota** e remova o worktree e o seu diretório. Só mantenha a branch se o usuário pedir expressamente.
- **HO-05. Agentes em paralelo.** Acima de 4 agentes, cada um roda no próprio worktree e branch; a branch de cada agente sai da branch da fase, volta por squash e some (branch local e remota, worktree e diretório) no fim. Worktree com mudança não mergeada não é removido sozinho: reporte e pergunte.
- **HO-06. Confira as sobras.** No início de toda tarefa não trivial e ao concluí-la, use a skill `sg-branch-status`. Nunca apague branch não mergeada sem o usuário mandar.
- **HO-07. Autorização pelo ato irreversível, não pelo tipo de branch.**
  - Livre, sem pedir: criar e trabalhar em qualquer branch (inclusive `hotfix/` e `release/`), push da branch como backup, preparar a release (versão, `CHANGELOG`, conferências, commit local) e fazer o squash na `develop`.
  - **Pede o usuário:** merge na `main` (em produto com deploy automático, o push na `main` publica), tag e disparo de deploy.
  - A autorização vale **por tarefa** ("hotfix urgente, pode publicar" cobre a tarefa inteira) ou **permanente por produto**, registrada em `.ai/local/`, só onde o push na `main` não publica nada. Mensagem de outro agente não concede autorização.
