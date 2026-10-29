---
name: sg-check-secrets
description: "Confere se há credencial (senha, chave, token, par de chaves, arquivo de ambiente) no que vai para o git: no commit (hook pre-commit já instalado pelo init), nos arquivos versionados e no histórico. Use antes de commit ou release, ao ativar a trava num clone, quando suspeitar que um segredo foi versionado ou quando o hook reprovar."
metadata:
  toolkit: seedgrid-ai
---

# Trava de credenciais

Credencial **nunca** entra no repositório, com qualquer nome de arquivo. O script `scripts/check-secrets.mjs` olha o **nome** e o **conteúdo**: renomear `dev.env` para `_dev.env` ou `dev.env.bak` não esconde o segredo.

## O que já protege sozinho
- **Hook de pre-commit** (`.githooks/pre-commit`, versionado): o `seedgrid-ai init` de uma pasta nova o cria no commit inicial e ativa com `git config core.hooksPath .githooks`. Todo commit seguinte passa pela conferência do que está no índice.
- **Release:** a `sg-release` roda esta conferência nos arquivos versionados antes de qualquer alteração.
- **CI do produto gerado:** o workflow de publicação roda a conferência antes de tudo.

## Ativar num clone (o `core.hooksPath` é local, não vem no clone)
```
git config core.hooksPath .githooks
```
Em projeto que já era repositório antes do `init` o hook **não** é instalado sozinho: copie `.githooks/pre-commit` de um produto gerado (ou rode o `init` numa pasta nova e traga o arquivo) e ative com o comando acima.

## Usar à mão
```
node .ai/skills/sg-check-secrets/scripts/check-secrets.mjs --staged      # o que vai para o commit
node .ai/skills/sg-check-secrets/scripts/check-secrets.mjs               # todos os arquivos versionados
node .ai/skills/sg-check-secrets/scripts/check-secrets.mjs --history     # o que ja entrou em QUALQUER commit
```
`--ignore <regex>` (repetível) deixa fora caminhos que o toolkit instala e o dono não escreve (o hook já ignora `.ai/brain/`, `.ai/skills/`, `.ai/rules/`, `.ai/agents/`, `.ai/templates/`, `.ai/references/`, `.agents/` e `.claude/skills|agents/`). Sai com `1` se achar algo.

## Se o hook reprovar
1. **Não use `--no-verify`.** Ele desliga a trava; só com ordem expressa do usuário e dizendo o que foi pulado.
2. Se for **valor de exemplo legítimo**: troque por um marcador (`change-me`, `${VAR}`, `<valor>`) ou ponha a linha em arquivo de teste (`*.test.*`, `*.spec.*`, `src/test/`).
3. Se for **credencial de verdade**: tire do arquivo, leia de variável de ambiente (`dev.env`, que está no `.gitignore`) e **troque a credencial** se ela já saiu da sua máquina (push, cópia, log).
4. Nunca copie nem imprima o valor do segredo na conversa.

## Se um segredo já foi commitado
Apagar no commit seguinte **não adianta**: ele fica no histórico. Rode `--history` para achar o commit, **troque a credencial** (é a única correção que vale) e só então, com o usuário, decida se reescreve o histórico (operação destrutiva: peça autorização).

## Limites
- É heurístico: acha padrões conhecidos (chave privada, AKIA, `ghp_`, `sk_live_`, JWT, URL com senha), atribuições como `senha=valor` e valores longos e aleatórios. Não acha todo segredo; é uma rede, não um cofre.
- Não substitui o cofre do ambiente (segredo de produção mora lá, nunca em arquivo gerado).
- O hook é local: quem usa `--no-verify` ou não ativou o `core.hooksPath` não passa por ele; por isso há também a conferência na release e no CI.
