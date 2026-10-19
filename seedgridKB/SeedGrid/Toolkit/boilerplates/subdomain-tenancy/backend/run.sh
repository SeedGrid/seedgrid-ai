#!/bin/bash

# Carrega variaveis de ambiente de dev.env e, DEPOIS, de .env (que vence).
#
# `export $(... | xargs)` quebra em qualquer valor com espaco (ex.: SECURITY_MAILER_FROM
# "SeedGrid App <...>") — por isso a leitura e' linha a linha, sem word-split via xargs.
#
# dev.env  = SEU arquivo local, gitignored. Nasce de `cp dev.env.example dev.env`.
# .env     = gitignored tambem; opcional, lido por ULTIMO, entao sobrescreve o dev.env.
#            Util para separar os segredos do resto da config.
carregar_env() {
    local arquivo="$1"
    local line key value
    [ -f "$arquivo" ] || return 0

    set -a
    while IFS= read -r line || [ -n "$line" ]; do
        line="${line%$'\r'}"
        case "$line" in
            ''|'#'*) continue ;;
        esac
        key="${line%%=*}"
        value="${line#*=}"
        # Espaco sobrando no fim da linha vira parte do valor (ex.: FROM "Nome <a@b> " e' rejeitado
        # pelo Vert.x como endereco invalido). Valor que precisa de espaco no fim vai entre aspas.
        value="${value%"${value##*[![:space:]]}"}"
        case "$value" in
            \"*\"|\'*\') value="${value:1:${#value}-2}" ;;
        esac
        export "$key=$value"
    done < "$arquivo"
    set +a
}

carregar_env dev.env
carregar_env .env

# Run Quarkus in dev mode
mvn quarkus:dev
