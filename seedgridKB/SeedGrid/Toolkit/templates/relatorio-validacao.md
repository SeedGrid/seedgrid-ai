---
description: "Modelo de relatório de validação: o que foi verificado, como, resultado e pendências."
---
# Relatório de validação: <tarefa>

> Modelo do SeedGrid AI Toolkit. Copie para o local de documentação do projeto antes de preencher; não edite o modelo.

- **Data:** AAAA-MM-DD
- **AIDLC:** <contentVersion de `.ai/toolkit-lock.json`, ex.: 0.6.1>
- **Versão/commit avaliado:** <identificador>
- **Ambiente:** <SO, runtime, banco etc.>

## Critérios de aceite
| Critério | Verificação | Resultado | Evidência |
| --- | --- | --- | --- |
| | comando ou inspeção | passou / falhou / não executado | saída resumida ou caminho do log |

## Comandos executados
```text
<comando>
<resultado resumido>
```

## Teste em navegador e emulador
> Preenchida pelo papel `frontend-tester`; apague a seção se a mudança não toca o front. Sem navegador ou emulador disponível, escreva "não executado" e o motivo.

- **Navegador e versão:** <ex.: Chrome 130>
- **Emulador/dispositivo:** <modelo e versão do sistema, ou "não se aplica">
- **Viewports testados:** 360 px, 390 px e <largura de desktop>

### Página, caminho e resultado
| Página | Caminho (passo a passo) | Viewport | Resultado | Evidência |
| --- | --- | --- | --- | --- |
| | ação do usuário, do início ao fim | 360 / 390 / desktop | passou / falhou / não executado | captura, console ou rede |

### Rolagem e âncoras
| Link ou ação | Destino | Resultado (destino visível, sem cobrir, no primeiro clique) | Evidência |
| --- | --- | --- | --- |
| | | | |

### i18n visual
| Idioma | Página | Resultado (sem chave crua, sem corte, acentos íntegros) | Evidência |
| --- | --- | --- | --- |
| | | | |

### Formulário, por ligação
| Formulário ou campo | Ligação (`control` / `register` / sem formulário) | Ação (digitar, apagar, colar, enviar válido e inválido) | Valor na tela x valor enviado | Resultado |
| --- | --- | --- | --- | --- |
| | | | | |

## Regressões verificadas
- Área — como foi verificada — resultado

## Não verificado
- Item — motivo

## Conclusão
Aprovado | Reprovado | Aprovado com ressalvas — justificativa em uma frase.
