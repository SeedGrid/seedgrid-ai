# Backend do modelo "modular"

API Quarkus 3.30.6 com `seedgrid-security` e `seedgrid-audit-postgresql`.

## Do clone ao backend rodando

```bash
# 1. PostgreSQL de desenvolvimento (porta 5440) e Mailpit (SMTP 1025, UI 8025)
#    O sg-new-product gera o docker-compose.yml na raiz do produto: docker compose up -d

# 2. Chaves JWT: cada clone gera o seu par; NAO vao para o repositorio
cd src/main/resources/keys
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem
openssl rsa -in private.pem -pubout -out public.pem
cd ../../../..

# 3. Configuracao local (nao versionada)
cp dev.env.example dev.env      # preencha tudo que estiver TROQUE-ME

# 4. Subir
./run.sh                        # mvn quarkus:dev lendo dev.env e .env
```

## Primeiro administrador

No primeiro boot, com `SEEDGRID_SECURITY_FIRST_ADMIN_USER_*` preenchido, a security cria o
administrador e envia o e-mail de boas-vindas (o link aponta para o front, `/auth/welcome`).
O usuário só entra depois de **confirmar o e-mail**, e na primeira entrada a troca de senha é
obrigatória. Em desenvolvimento o e-mail chega no Mailpit (`http://localhost:8025`).

## Migrations

- `security` e `audit`: das próprias extensions (`classpath:db/migration/security|audit`).
- Do produto: `src/main/resources/db/migration/app/` (a partir de `V3000`).

## Verificação

```bash
mvn -Dgpg.skip=true verify      # inclui BackendStartsGuardianTest (sobe o backend com Postgres real)
```

O teste usa Testcontainers (Docker ou Podman) e gera um par RSA temporário; nada é lido de `keys/`.

## Rotas úteis

`POST /public/auth/login` · `GET /public/auth/confirm-email?token=` · `GET /me/profile` ·
`GET /me/permissions` · `GET /q/health` · `GET /q/openapi`
