# Checklist de revisão

## Correção
- Condições de borda: vazio, nulo, limites numéricos, listas grandes, fuso horário, codificação de texto.
- Caminhos de erro: exceções engolidas, retornos ignorados, mensagens que escondem a causa.
- Estado: mutações compartilhadas, ordem de inicialização, cache inválido.
- Concorrência: condições de corrida, transações, idempotência em reprocessamento.

## Segurança
- Entrada não confiável chegando a SQL, shell, caminhos de arquivo, HTML ou desserialização.
- Autorização verificada no servidor para cada operação, não apenas na interface.
- Segredos em código, logs, mensagens de erro ou arquivos versionados.
- Dados pessoais expostos além do necessário.

## Contratos e compatibilidade
- APIs públicas, eventos, esquemas e formatos de arquivo alterados sem versionamento ou migração.
- Migrações de banco reversíveis ou com plano de recuperação.

## Testes
- O comportamento novo tem teste que falharia sem a mudança?
- Casos de erro e de borda cobertos na medida do risco.

## Manutenção
- Duplicação de lógica existente no projeto.
- Nomes e estrutura coerentes com o restante do código.
