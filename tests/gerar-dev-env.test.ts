import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SCRIPT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-dev-env/scripts/gerar-dev-env.mjs');
type Rel = { gerados: Record<string, string[]>; copiados: number; mantidos: number; pendencias: string[]; embutidos: string[] };
const { gerar, tipoDoSegredo, garantirGitignore } = (await import(pathToFileURL(SCRIPT).href)) as {
  gerar: (o: { exemplo: string; existente?: string | null; forcar?: boolean }) => { texto: string; relatorio: Rel };
  tipoDoSegredo: (n: string) => string | null;
  garantirGitignore: (pasta: string, nome: string) => boolean;
};

const EXEMPLO = [
  '# banco',
  'POSTGRES_PASSWORD=change-me',
  'SEEDGRID_DB_URL=jdbc:postgresql://localhost:5440/app',
  'SEEDGRID_ADMIN_PASSWORD=',
  'SEEDGRID_ADMIN_EMAIL=dono@acme.com.br',
  'JWT_PRIVATE=<chave privada em base64>',
  'JWT_PUBLIC=<chave publica em base64>',
  'SEEDGRID_CRYPTO_ENCRYPTION_KEY=change-me',
  'SEEDGRID_BILLING_STRIPE_APIKEY=${externo}',
  'SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET=change-me',
  'FOO=change-me',
  'SEEDGRID_AUDIT_MONGODB_URI=mongodb://admin:change-me@localhost:27017/?tls=false',
  'QUARKUS_HTTP_PORT=8080',
  '',
].join('\n');

const dirs: string[] = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), 'sg-dev-env-')); dirs.push(d); return d; };
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });
const env = (t: string) => Object.fromEntries(t.split('\n').filter((l) => /^[A-Z_0-9]+=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));

test('o tipo do segredo vem do nome da variavel', () => {
  assert.equal(tipoDoSegredo('POSTGRES_PASSWORD'), 'senha');
  assert.equal(tipoDoSegredo('SEEDGRID_ADMIN_PASSWORD'), 'politica-admin');
  assert.equal(tipoDoSegredo('JWT_PRIVATE'), 'rsa-privada-b64');
  assert.equal(tipoDoSegredo('JWT_PUBLIC'), 'rsa-publica-b64');
  assert.equal(tipoDoSegredo('SEEDGRID_CRYPTO_ENCRYPTION_KEY'), 'base64-32');
  assert.equal(tipoDoSegredo('SEEDGRID_BILLING_STRIPE_APIKEY'), 'externo');
  assert.equal(tipoDoSegredo('FOO'), null);
  assert.equal(tipoDoSegredo('QUARKUS_HTTP_PORT'), null);
});

test('gera segredos novos, copia o resto e deixa o externo em branco como pendencia', () => {
  const { texto, relatorio } = gerar({ exemplo: EXEMPLO });
  const e = env(texto);
  assert.equal(e.POSTGRES_PASSWORD!.length, 32);
  assert.notEqual(e.POSTGRES_PASSWORD, 'change-me');
  assert.match(e.SEEDGRID_ADMIN_PASSWORD!, /^(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%&*?]).{8,}$/);
  assert.doesNotMatch(e.SEEDGRID_ADMIN_PASSWORD!, /(.)\1/);
  assert.equal(e.SEEDGRID_ADMIN_EMAIL, 'dono@acme.com.br');
  assert.equal(e.SEEDGRID_DB_URL, 'jdbc:postgresql://localhost:5440/app');
  assert.equal(e.QUARKUS_HTTP_PORT, '8080');
  assert.equal(e.SEEDGRID_BILLING_STRIPE_APIKEY, '');
  assert.equal(e.SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET, '');
  assert.deepEqual(relatorio.pendencias.sort(), ['SEEDGRID_BILLING_STRIPE_APIKEY', 'SEEDGRID_BILLING_STRIPE_WEBHOOKSECRET']);
  assert.equal(e.FOO, 'change-me', 'nome fora do padrao fica como esta');
  assert.deepEqual(relatorio.embutidos, ['SEEDGRID_AUDIT_MONGODB_URI'], 'placeholder dentro de URL vira aviso, nao e reescrito');
  assert.match(e.SEEDGRID_AUDIT_MONGODB_URI!, /change-me/);
  assert.equal(Buffer.from(e.SEEDGRID_CRYPTO_ENCRYPTION_KEY!, 'base64').length, 32);
  assert.ok(texto.includes('# banco'), 'comentarios preservados');
});

test('o par RSA do JWT e coerente: a publica sai da privada', async () => {
  const { createPrivateKey, createPublicKey } = await import('node:crypto');
  const e = env(gerar({ exemplo: EXEMPLO }).texto);
  const priv = createPrivateKey({ key: Buffer.from(e.JWT_PRIVATE!, 'base64'), format: 'der', type: 'pkcs8' });
  const pub = createPublicKey({ key: Buffer.from(e.JWT_PUBLIC!, 'base64'), format: 'der', type: 'spki' });
  assert.equal(createPublicKey(priv).export({ type: 'spki', format: 'der' }).toString('base64'), pub.export({ type: 'spki', format: 'der' }).toString('base64'));
});

test('duas geracoes diferem so nos segredos (o resto e identico)', () => {
  const a = env(gerar({ exemplo: EXEMPLO }).texto);
  const b = env(gerar({ exemplo: EXEMPLO }).texto);
  assert.notEqual(a.POSTGRES_PASSWORD, b.POSTGRES_PASSWORD);
  assert.equal(a.SEEDGRID_DB_URL, b.SEEDGRID_DB_URL);
  assert.equal(a.QUARKUS_HTTP_PORT, b.QUARKUS_HTTP_PORT);
});

test('dev.env existente: so acrescenta o que falta, nunca troca valor nem apaga o que e do usuario', () => {
  const existente = 'POSTGRES_PASSWORD=minha-senha\nSEEDGRID_BILLING_STRIPE_APIKEY=sk_test_abc\nMINHA_VAR=1\n';
  const { texto, relatorio } = gerar({ exemplo: EXEMPLO, existente });
  const e = env(texto);
  assert.equal(e.POSTGRES_PASSWORD, 'minha-senha');
  assert.equal(e.SEEDGRID_BILLING_STRIPE_APIKEY, 'sk_test_abc');
  assert.equal(e.MINHA_VAR, '1');
  assert.equal(e.SEEDGRID_ADMIN_PASSWORD!.length >= 8, true, 'o que faltava foi gerado');
  assert.ok(!relatorio.pendencias.includes('SEEDGRID_BILLING_STRIPE_APIKEY'), 'chave ja preenchida nao e pendencia');
});

test('--forcar refaz os segredos', () => {
  const existente = 'POSTGRES_PASSWORD=minha-senha\n';
  const e = env(gerar({ exemplo: EXEMPLO, existente, forcar: true }).texto);
  assert.notEqual(e.POSTGRES_PASSWORD, 'minha-senha');
});

test('garante dev.env no .gitignore, sem duplicar', () => {
  const d = tmp();
  writeFileSync(join(d, '.gitignore'), 'node_modules/\n');
  assert.equal(garantirGitignore(d, 'dev.env'), true);
  assert.equal(garantirGitignore(d, 'dev.env'), false);
  assert.match(readFileSync(join(d, '.gitignore'), 'utf8'), /^dev\.env$/m);
});

test('na linha de comando: acha o exemplo em backend/, grava ao lado, nao imprime segredo', () => {
  const d = tmp();
  mkdirSync(join(d, 'backend'));
  writeFileSync(join(d, 'backend', 'dev.env.example'), EXEMPLO);
  const r = spawnSync(process.execPath, [SCRIPT, '--destino', d], { encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr);
  assert.ok(existsSync(join(d, 'backend', 'dev.env')));
  const segredo = env(readFileSync(join(d, 'backend', 'dev.env'), 'utf8')).POSTGRES_PASSWORD!;
  assert.ok(!r.stdout.includes(segredo), 'o relato nao pode conter o segredo');
  assert.match(r.stdout, /PENDENTE/);
  assert.match(readFileSync(join(d, 'backend', '.gitignore'), 'utf8'), /^dev\.env$/m);
});

test('sem exemplo: erro claro e saida 2', () => {
  const d = tmp();
  const r = spawnSync(process.execPath, [SCRIPT, '--destino', d], { encoding: 'utf8' });
  assert.equal(r.status, 2);
  assert.match(r.stderr, /dev\.env\.example/);
});
