# Frontend

App do cliente copiado de `login-tenancy/frontend`, preservando versões e lockfile.
O domínio identifica o tenant; o BFF o valida e encaminha em `X-Forwarded-Host`.
Cookies HttpOnly ficam no host do cliente, sem compartilhamento entre subdomínios.

```bash
cp .env.example .env.local
pnpm install --frozen-lockfile
pnpm dev
```

Cadastre a empresa em `http://localhost:3002/auth/signup`, incluindo seu subdomínio.
Confirme o código recebido por e-mail. Após o provisionamento, acesse
`http://cliente.localhost:3002/login` (substitua `cliente` pelo nome cadastrado).
Caso o navegador não resolva `*.localhost`, adicione o host do cliente ao arquivo
hosts apontando para `127.0.0.1`.

No deploy, configure `SEEDGRID_TENANCY_DOMAIN` com o mesmo sufixo do backend e faça
o proxy preservar o `Host` original. O BFF ignora `X-Forwarded-Host` enviado pelo navegador.

```bash
pnpm exec tsc --noEmit
pnpm build
```
