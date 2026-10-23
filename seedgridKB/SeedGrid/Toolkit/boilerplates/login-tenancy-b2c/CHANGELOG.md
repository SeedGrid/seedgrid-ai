# Changelog — login-tenancy-b2c

## 2026-10-22 / 2026-10-23
- Criado como variante B2C (pessoa física) do `login-tenancy-b2b`: signup `POST /public/signup/personal` (CPF opcional; obrigatório com `seedgrid.login-tenancy.signup.personal-document-required=true`), login social por `SEEDGRID_SOCIAL_PROVIDERS`, uma conta = uma pessoa.
- Telas de usuários, convites, perfis, `select-company` e `/api/self-enter` removidas de propósito; `self-enter`, convites e conta secundária desligados no `application.properties`.
- Planos de demonstração: trial, `GRATIS` (R$ 0) e `PREMIUM` (R$ 29,90, com excedente); sem limite de empresas.
- Bateria E2E do backend (`B2c*E2ETest`) e do navegador (`e2e-web/`, Playwright, 13 testes). Ver `e2e-web/COBERTURA.md`.
- Ambiente local de e-mail: Mailpit (substitui o Mailhog) no `docker-compose.yml`.
