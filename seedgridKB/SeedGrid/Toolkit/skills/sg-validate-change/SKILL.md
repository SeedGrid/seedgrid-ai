---
name: sg-validate-change
description: Valida uma mudança de código executando build, testes e verificações ligadas aos critérios de aceite, e registra evidências em um relatório. Use antes de declarar uma tarefa concluída ou após correções de revisão.
metadata:
  toolkit: seedgrid-ai
---

# Validar mudança

Comprove com evidências executadas que a mudança funciona; não declare sucesso sem verificar.

## Passos

1. **Critérios.** Liste os critérios de aceite. Se não existirem, derive-os do objetivo e informe isso.
2. **Comandos do projeto.** Descubra como compilar, testar e executar: consulte `.ai/local/` (se existir), README, scripts de build (`package.json`, `pom.xml`, `build.gradle`, `Makefile` etc.). Não invente comandos.
3. **Mapeamento.** Associe cada critério a uma verificação concreta (teste automatizado, comando, inspeção do comportamento).
4. **Execução.** Rode, nesta ordem quando aplicável: verificação de tipos/compilação, lint, testes afetados, suíte relevante, build. Exercite o comportamento alterado quando possível.
5. **Registro.** Preencha o modelo [assets/relatorio-validacao.md](assets/relatorio-validacao.md) com comandos, resultados e evidências resumidas.

## Regras

- Diferencie "passou", "falhou" e "não executado (motivo)". Nunca converta um "não executado" em "passou".
- Não execute ações que publiquem ou alterem serviços externos (deploy, envio de e-mail, pagamentos, push) sem autorização explícita.
- Se uma verificação falhar, devolva a evidência ao implementador em vez de corrigir por conta própria, salvo instrução contrária.
- Testes instáveis: repita uma vez e relate a instabilidade, sem ocultá-la.

## Saída

O relatório de validação preenchido, com conclusão "Aprovado", "Reprovado" ou "Aprovado com ressalvas".
