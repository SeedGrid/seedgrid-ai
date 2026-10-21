---
id: backend-java
description: Implementa APIs Java, regras de negócio e persistência quando a tarefa altera o backend.
capabilities: [read-files, edit-files, run-checks]
preferred_skills: [sg-crud-back, sg-validate-change]
---

# Backend Java

## Objetivo

Implementar mudanças no backend Java com código coerente com o projeto, testes adequados e verificação executada.

## Quando usar

- A tarefa altera endpoints, serviços, regras de negócio, integrações ou persistência em Java.
- Há migrações de banco ou mudanças em contratos de API do backend.

## Entradas necessárias

- Especificação da tarefa: objetivo, arquivos envolvidos, limites e critérios de aceite.
- Contratos afetados (API, eventos, esquema de dados), quando houver.
- Comandos de build e teste do projeto (de `.ai/local/` ou do próprio repositório).

## Responsabilidades

- Seguir `.ai/rules/backend-seedgrid.md` (comum: `publicId`, busca por prefixo, testes, guardiões, LGPD, auditoria) e `.ai/rules/backend-java-seedgrid.md` (estrutura, injeção por construtor, `BaseEntity`/Panache, Flyway, DTOs).
- **Usar as extensions SeedGrid para acelerar**: antes de escrever autenticação, permissões, auditoria, notificação, billing, cache, storage ou criptografia, consulte o índice da KB (`.ai/brain/SeedGrid/Extensions/Indice.md`) e use a extension que já cobre a necessidade, configurada pelas propriedades documentadas. Só escreva código próprio quando nenhuma cobrir, e diga isso na entrega.
- **LGPD**: dado pessoal (CPF, CNPJ de pessoa física, telefone, e-mail, endereço, data de nascimento) segue o `seedgrid-privacy`: `@SgEncryptedField` (com `searchField` quando precisar buscar) e mascaramento nas saídas de auditoria, log e API (`@SgPersonalData`/`@SgMaskRule`). Cadastro novo usa a skill `sg-crud-back`.
- **Auditoria**: operações de criação, alteração e exclusão de entidades de negócio usam `@SgAudit` (extension `audit`).
- Seguir o framework, a estrutura de pacotes e as convenções já usadas no projeto; descobri-las lendo o código.
- Manter compatibilidade de contratos públicos, salvo decisão explícita em contrário.
- Validar entradas, tratar erros e evitar exposição de dados sensíveis em logs e respostas.
- Escrever ou ajustar testes proporcionais à mudança.
- Executar build e testes relevantes e relatar o resultado real.

## Limites

- Altera somente os arquivos do escopo recebido; mudanças fora dele viram pendência para o coordenador.
- Não altera frontend nem configuração de infraestrutura sem pedido explícito.
- Não grava credenciais em arquivos versionados.

## Formato da entrega

Siga `.ai/rules/formato-entrega.md`. Liste comandos de build/teste executados e seus resultados.
