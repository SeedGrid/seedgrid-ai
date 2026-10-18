---
name: sg-adr
description: Registra uma decisão de arquitetura ou de comportamento como ADR em docs/ai/decisions/, com cabeçalho (quem decidiu, data, consultados, domínio) e índice gerado da mais nova para a mais antiga. Use quando uma decisão mudar comportamento, propriedade de configuração, contrato ou arquitetura, durante ou depois de executar um plano, ou quando o usuário pedir para registrar ou consultar o porquê de algo.
metadata:
  toolkit: seedgrid-ai
---

# Registrar e consultar decisões (ADR)

ADR é a memória do **porquê**. É curta, permanente e versionada. Não confunda com plano: o plano é temporário e, depois de concluído, não serve de fonte para decidir nada.

## Quando criar

Crie uma ADR quando a decisão: muda um comportamento observável; cria, remove ou altera uma propriedade de configuração; altera um contrato (API, evento, esquema de dados); escolhe entre abordagens com impacto arquitetural; ou contraria uma regra do projeto. Não crie ADR para ajuste trivial nem para decisão de uma linha de código.

## Passos

1. **Listar as decisões.** Escreva cada uma em uma frase e **mostre ao usuário** para confirmar: você propõe, quem decide é o usuário. Ao registrar, repita a decisão em uma frase (decisão registrada errada só aparece quando alguém relê).
2. **Domínio.** Escolha na lista `docs/ai/decisions/dominios.txt` (um domínio por linha). Se o arquivo não existir, proponha 5 a 10 domínios do projeto (por exemplo `seguranca`, `dados`, `api`, `configuracao`, `processo`), confirme e crie. Domínio novo só com confirmação do usuário.
3. **Criar o arquivo** `docs/ai/decisions/AAAA-MM-DD-slug.md` a partir do modelo `.ai/templates/decisao-arquitetura.md`: cabeçalho completo (`titulo`, `data`, `status`, `decidido-por`, `consultados`, `dominio`, `modulos`, `origem`) e as seções Contexto, Decisão, Alternativas e Consequências. Comece com `status: proposta` e mude para `aceita` quando o usuário confirmar.
4. **Substituição.** Se a decisão troca outra, não edite a antiga: crie a nova com `substitui: [arquivo-antigo.md]` e apenas marque a antiga como `status: substituida` e `substituida-por`.
5. **Índice.** Rode `node .ai/skills/sg-adr/scripts/adr-index.mjs`. Ele valida o cabeçalho e gera `docs/ai/decisions/INDEX.md` em ordem decrescente de data. Nunca edite o `INDEX.md` à mão; use `--check` para conferir se está em dia.
6. **Entregar** listando as ADRs criadas e o que ficou como `proposta`.

## Consultar

Para saber por que algo foi feito: leia `docs/ai/decisions/INDEX.md`, filtre pelo domínio ou pelo módulo e abra só as ADRs relevantes (`grep -l "dominio: .*seguranca" docs/ai/decisions/*.md`). Se a ADR estiver `substituida`, siga o `substituida-por`. Não use planos concluídos para responder "por quê".

## Regras

- ADR aceita não se edita; erro de digitação óbvio pode ser corrigido, mudança de decisão gera outra ADR.
- Uma decisão por ADR. Nada de segredo, token ou dado pessoal.
- `docs/ai/decisions/` é sempre versionada.
