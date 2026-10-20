import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';
import { parse } from 'yaml';

const TOOLKIT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit');
const SKILL = join(TOOLKIT, 'skills/sg-new-product');
const BOILERPLATES = join(TOOLKIT, 'boilerplates');
type Saida = { ok: boolean; erros?: string[]; criados: string[]; notas: string[]; pendencias: string[]; adicionadas: string[]; extensoes: string[] };
const { scaffold } = (await import(pathToFileURL(join(SKILL, 'scripts/scaffold-produto.mjs')).href)) as {
  scaffold: (o: { respostas: Record<string, unknown>; destino: string; boilerplates: string }) => Promise<Saida>;
};

const BASE = { nome: 'Portal Chaves', slug: 'portal-chaves', pacote: 'br.com.acme.portal', dominioFront: 'app.acme.com.br', dominioAdmin: 'admin.acme.com.br', emailRemetente: 'noreply@acme.com.br', emailAdmin: 'dono@acme.com.br' };
const B2B = { ...BASE, modelo: 'login-tenancy-b2b', extensoes: [] as string[], selfEnter: 'nao', auditoria: 'postgres', armazenamento: 'filesystem', apikeysUso: 'Integracoes internas', billingProvider: 'stripe', trialDias: 14, planos: 'Basico,Pro' };
const SUB = { ...B2B, modelo: 'subdomain-tenancy' };
const OUTRO = { ...BASE, modelo: 'outro', extensoes: ['apikeys'], selfEnter: 'nao', apikeysUso: 'x' };

const dirs: string[] = [];
const novaPasta = () => { const d = mkdtempSync(join(tmpdir(), 'sg-scaffold-')); dirs.push(d); return d; };
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

async function gerar(respostas: Record<string, unknown>) {
  const destino = novaPasta();
  const saida = await scaffold({ respostas, destino, boilerplates: BOILERPLATES });
  return { destino, saida };
}
const ler = (d: string, rel: string) => readFileSync(join(d, rel), 'utf8');
const env = (txt: string) => Object.fromEntries(txt.split(/\r?\n/).filter((l) => /^[A-Z][A-Z0-9_]*=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));
function arquivos(raiz: string, dir = raiz): string[] {
  return readdirSync(dir).sort().flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(raiz, p) : [relative(raiz, p).split(sep).join('/')];
  });
}
// O que vai para o git: tudo menos os arquivos que o proprio .gitignore do produto ignora.
const IGNORADOS = (rel: string) => rel === 'backend/dev.env' || rel === '.env' || /\.env\.local$/.test(rel) || rel.endsWith('.pem');
const versionados = (raiz: string) => arquivos(raiz).filter((r) => !IGNORADOS(r));
const hashArvore = (raiz: string) => {
  const h = createHash('sha256');
  for (const r of versionados(raiz)) h.update(r).update('\0').update(readFileSync(join(raiz, r))).update('\0');
  return h.digest('hex');
};

test('login-tenancy B2B completo: arquivos, auditoria Mongo, MinIO e self-enter por convite', async () => {
  const { destino, saida } = await gerar({ ...B2B, extensoes: ['exchange'], selfEnter: 'sim', selfEnterModo: 'convite', auditoria: 'mongodb', armazenamento: 'minio' });
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  for (const f of ['produto.json', 'docker-compose.yml', '.env', '.env.example', '.gitignore', 'backend/pom.xml', 'backend/dev.env', 'backend/dev.env.example', 'frontend/.env.example', 'admin/.env.example', '.github/workflows/publicar.yml', 'docs/ai/plans/.gitkeep', 'docs/ai/decisions/.gitkeep', 'docs/ai/handoffs/.gitkeep', 'docs/ai/reports/.gitkeep', 'docs/ai/demands/.gitkeep']) assert.ok(existsSync(join(destino, f)), f);
  const e = env(ler(destino, 'backend/dev.env'));
  const raiz = env(ler(destino, '.env'));
  assert.equal(e.SEEDGRID_AUDIT_PERSISTENCE_STRATEGY, 'MONGODB');
  assert.ok(e.SEEDGRID_AUDIT_MONGODB_URI?.includes(`admin:${raiz.MONGO_ROOT_PASSWORD}@localhost:27017`));
  assert.equal(e.SEEDGRID_BACKUP_MINIO_SECRET_KEY, raiz.MINIO_ROOT_PASSWORD);
  assert.equal(e.SEEDGRID_SECURITY_AVATAR_MINIO_SECRET_KEY, raiz.MINIO_ROOT_PASSWORD);
  assert.equal(e.SEEDGRID_DB_PASSWORD, raiz.POSTGRES_PASSWORD);
  assert.equal(e.SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'true');
  assert.equal(e.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'true');
  assert.equal(e.SEEDGRID_SECURITY_SELF_ENTER_PUBLIC_ENABLED, 'false');
  const compose = parse(ler(destino, 'docker-compose.yml')) as { services: Record<string, unknown> };
  assert.deepEqual(Object.keys(compose.services), ['postgres', 'mailhog', 'minio', 'mongodb']);
  assert.ok(ler(destino, 'backend/pom.xml').includes('<artifactId>seedgrid-exchange</artifactId>'));
});

test('auditoria Postgres + filesystem: sem mongodb e sem minio, pom sem o SDK do minio', async () => {
  const { destino, saida } = await gerar(B2B);
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  const compose = parse(ler(destino, 'docker-compose.yml')) as { services: Record<string, unknown> };
  assert.deepEqual(Object.keys(compose.services), ['postgres', 'mailhog']);
  const e = env(ler(destino, 'backend/dev.env'));
  assert.equal(e.SEEDGRID_AUDIT_PERSISTENCE_STRATEGY, 'jpa');
  assert.equal(e.SEEDGRID_AUDIT_MONGODB_URI, undefined);
  assert.equal(e.SEEDGRID_BACKUP_STORAGE, 'filesystem');
  assert.equal(e.SEEDGRID_BACKUP_MINIO_BUCKET, undefined);
  assert.ok(!ler(destino, 'backend/pom.xml').includes('<artifactId>minio</artifactId>'));
});

test('self-enter desligado, convite+cadastro (ambos) e cadastro publico', async () => {
  const off = env(ler((await gerar(B2B)).destino, 'backend/dev.env'));
  assert.equal(off.SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'false');
  assert.equal(off.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'false');
  const ambos = env(ler((await gerar({ ...B2B, selfEnter: 'sim', selfEnterModo: 'ambos' })).destino, 'backend/dev.env'));
  assert.equal(ambos.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'true');
  assert.equal(ambos.SEEDGRID_SECURITY_SELF_ENTER_PUBLIC_ENABLED, 'true');
  const pub = env(ler((await gerar({ ...B2B, selfEnter: 'sim', selfEnterModo: 'cadastro-publico' })).destino, 'backend/dev.env'));
  assert.equal(pub.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'false');
  assert.equal(pub.SEEDGRID_SECURITY_SELF_ENTER_PUBLIC_ENABLED, 'true');
});

test('subdomain-tenancy: banco master, porta e artefato proprios', async () => {
  const { destino, saida } = await gerar(SUB);
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  const e = env(ler(destino, 'backend/dev.env'));
  const raiz = env(ler(destino, '.env'));
  assert.equal(e.SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_URL, 'jdbc:postgresql://localhost:5441/portal_chaves_master');
  assert.equal(e.SEEDGRID_SUBDOMAIN_TENANCY_MASTER_DB_PASSWORD, raiz.POSTGRES_PASSWORD);
  assert.equal(e.SEEDGRID_SUBDOMAIN_TENANCY_TENANT_DB_PASSWORD, raiz.POSTGRES_PASSWORD);
  assert.ok(ler(destino, 'docker-compose.yml').includes('127.0.0.1:5441:5432'));
  assert.ok(ler(destino, 'backend/pom.xml').includes('<artifactId>portal-chaves-api</artifactId>'));
  assert.ok(ler(destino, 'frontend/.env.example').includes('SEEDGRID_TENANCY_DOMAIN=localhost'));
});

test('modelo outro: security entra por dependencia do apikeys, sem esqueleto e com pendencia', async () => {
  const { destino, saida } = await gerar(OUTRO);
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  assert.deepEqual(saida.adicionadas, ['security']);
  assert.ok(saida.extensoes.includes('security'));
  assert.ok(!existsSync(join(destino, 'backend/pom.xml')));
  assert.ok(existsSync(join(destino, 'backend/dev.env')));
  assert.ok(env(ler(destino, 'backend/dev.env')).SEEDGRID_SECURITY_ENCRYPTION_KEY);
  assert.ok(saida.pendencias.some((p) => /Modelo outro/.test(p)));
});

test('B2C e recusado e nada e gravado', async () => {
  const { destino, saida } = await gerar({ ...B2B, modelo: 'login-tenancy-b2c' });
  assert.equal(saida.ok, false);
  assert.ok(saida.erros!.some((e) => /indisponivel/.test(e)));
  assert.deepEqual(readdirSync(destino), []);
});

test('respostas invalidas sao recusadas com mensagem e sem gravar nada', async () => {
  const { destino, saida } = await gerar({ ...B2B, slug: 'Portal Chaves', emailAdmin: 'x', pergunta_extra: 1 });
  assert.equal(saida.ok, false);
  assert.ok(saida.erros!.some((e) => /"slug"/.test(e)) && saida.erros!.some((e) => /"emailAdmin"/.test(e)) && saida.erros!.some((e) => /pergunta_extra/.test(e)));
  assert.deepEqual(readdirSync(destino), []);
});

test('nao sobrescreve um produto existente', async () => {
  const { destino } = await gerar(B2B);
  const segunda = await scaffold({ respostas: B2B, destino, boilerplates: BOILERPLATES });
  assert.equal(segunda.ok, false);
  assert.ok(segunda.erros![0]!.includes('produto.json ja existe'));
});

test('determinismo: mesmas respostas, arvore versionada identica; segredos diferentes a cada produto', async () => {
  const r = { ...B2B, extensoes: ['exchange', 'business-days'], selfEnter: 'sim', selfEnterModo: 'ambos', auditoria: 'mongodb', armazenamento: 'minio' };
  const a = await gerar(r);
  const b = await gerar(r);
  assert.equal(hashArvore(a.destino), hashArvore(b.destino));
  assert.deepEqual(versionados(a.destino), versionados(b.destino));
  assert.notEqual(env(ler(a.destino, 'backend/dev.env')).SEEDGRID_SECURITY_ENCRYPTION_KEY, env(ler(b.destino, 'backend/dev.env')).SEEDGRID_SECURITY_ENCRYPTION_KEY);
  assert.notEqual(ler(a.destino, 'backend/src/main/resources/keys/private.pem'), ler(b.destino, 'backend/src/main/resources/keys/private.pem'));
});

test('segredos: o par do JWT em arquivo bate com o do dev.env e nada de segredo vai para o que e versionado', async () => {
  const { destino } = await gerar({ ...B2B, selfEnter: 'sim', selfEnterModo: 'convite', auditoria: 'mongodb', armazenamento: 'minio' });
  const e = env(ler(destino, 'backend/dev.env'));
  const pem = ler(destino, 'backend/src/main/resources/keys/public.pem').replace(/-----[A-Z ]+-----|\s/g, '');
  assert.equal(pem, e.SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64);
  assert.equal(e.MP_JWT_VERIFY_PUBLICKEY, e.SEEDGRID_SECURITY_JWT_PUBLIC_KEY_BASE64);
  assert.ok(Buffer.from(e.SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64!, 'base64').length > 1000);
  const senha = e.SEEDGRID_SECURITY_FIRST_ADMIN_USER_INITIAL_PASSWORD!;
  assert.ok(/[A-Z]/.test(senha) && /[a-z]/.test(senha) && /[^A-Za-z0-9]/.test(senha), 'senha do admin precisa atender a politica');
  const ex = env(ler(destino, 'backend/dev.env.example'));
  for (const k of ['SEEDGRID_DB_PASSWORD', 'SEEDGRID_SECURITY_ENCRYPTION_KEY', 'SEEDGRID_PRIVACY_CRYPTO_KEY', 'SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64', 'SEEDGRID_BACKUP_MINIO_SECRET_KEY', 'SEEDGRID_BILLING_STRIPE_APIKEY']) assert.equal(ex[k], 'change-me', k);
  assert.ok(!/PASSWORD=(?!change-me)/.test(ler(destino, '.env.example')));
  const gi = ler(destino, '.gitignore').split(/\r?\n/);
  for (const l of ['dev.env', '.env', '*.pem', 'keys/']) assert.ok(gi.includes(l), l);
  // trava de credenciais sobre o que seria versionado
  const limpo = novaPasta();
  for (const r of versionados(destino)) cpSync(join(destino, r), join(limpo, r), { recursive: true });
  const trava = spawnSync(process.execPath, [resolve(process.cwd(), 'scripts/check-secrets.mjs'), '--dir', limpo], { encoding: 'utf8' });
  assert.equal(trava.status, 0, trava.stdout + trava.stderr);
});

test('trial, whatsapp, ai-pricing e business-days mexem no pom, no env e nos testes do boilerplate', async () => {
  const sem = await gerar({ ...B2B, trialDias: 0 });
  const e1 = env(ler(sem.destino, 'backend/dev.env'));
  assert.equal(e1.SEEDGRID_BILLING_TRIAL_ENABLED, 'false');
  assert.equal(e1.SEEDGRID_SECURITY_2F_ALLOWED_METHODS, 'EMAIL,TOTP');
  assert.equal(e1.SEEDGRID_WHATSAPP_API, undefined);
  assert.equal(e1.SEEDGRID_REALTIME_ENABLED, undefined);
  assert.equal(e1.SEEDGRID_AI_PRICING_SOURCE_URL, undefined);
  const pom1 = ler(sem.destino, 'backend/pom.xml');
  for (const a of ['seedgrid-whatsapp-evolution', 'seedgrid-realtime', 'seedgrid-ai-pricing', 'seedgrid-exchange']) assert.ok(!pom1.includes(`<artifactId>${a}</artifactId>`), a);
  assert.ok(pom1.includes('<artifactId>seedgrid-billing-stripe</artifactId>'));
  assert.ok(!existsSync(join(sem.destino, 'backend/src/test/java/br/com/acme/portal/api/audit/DomainAuditTest.java')));
  const com = await gerar({ ...B2B, extensoes: ['ai-pricing', 'exchange', 'whatsapp', 'realtime', 'business-days', 'cache'] });
  const pom2 = ler(com.destino, 'backend/pom.xml');
  for (const a of ['seedgrid-whatsapp-evolution', 'seedgrid-realtime', 'seedgrid-ai-pricing', 'seedgrid-exchange', 'seedgrid-business-days', 'seedgrid-cache-core']) assert.ok(pom2.includes(`<artifactId>${a}</artifactId>`), a);
  assert.ok(existsSync(join(com.destino, 'backend/src/test/java/br/com/acme/portal/api/audit/DomainAuditTest.java')));
  assert.ok(com.saida.pendencias.some((p) => /^cache:/.test(p)) && com.saida.pendencias.some((p) => /^realtime:/.test(p)));
});

test('pacote Java e renomeado: diretorios, package, groupId e nada do pacote antigo', async () => {
  const { destino } = await gerar(B2B);
  const raizSrc = join(destino, 'backend/src');
  const java = arquivos(raizSrc).filter((f) => f.endsWith('.java'));
  assert.ok(java.length > 0);
  assert.ok(!java.some((f) => f.includes('br/com/seedgrid/app')));
  assert.ok(java.some((f) => f.includes('br/com/acme/portal/api')));
  const medidor = java.find((f) => f.includes('billing/AppUsageMeters'))!;
  assert.match(ler(raizSrc, medidor), /^package br\.com\.acme\.portal\.api\.billing;/m);
  const velhos = arquivos(join(destino, 'backend')).filter((f) => /\.(java|xml|properties)$/.test(f) && /br\.com\.seedgrid\.app\b/.test(ler(join(destino, 'backend'), f)));
  assert.deepEqual(velhos, []);
});

test('arquivos binarios e modelos de ponto: PNG decodificado, sem .b64 e sem .template', async () => {
  const { destino } = await gerar(B2B);
  const todos = arquivos(destino);
  assert.ok(!todos.some((f) => f.endsWith('.b64') || f.endsWith('.template')));
  const png = todos.find((f) => f.endsWith('.png'));
  assert.ok(png, 'esperava ao menos um PNG do boilerplate');
  assert.equal(readFileSync(join(destino, png)).subarray(1, 4).toString('latin1'), 'PNG');
  assert.ok(existsSync(join(destino, '.gitattributes')));
});

test('compose e workflow validos: variaveis do compose definidas no .env; docker compose config se houver Docker', async () => {
  const { destino } = await gerar({ ...B2B, auditoria: 'mongodb', armazenamento: 'minio' });
  const texto = ler(destino, 'docker-compose.yml');
  const usadas = [...texto.matchAll(/\$\{([A-Z_]+)\}/g)].map((m) => m[1]!);
  const definidas = env(ler(destino, '.env'));
  for (const v of usadas) assert.ok(definidas[v], `variavel ${v} sem valor no .env`);
  const wf = parse(ler(destino, '.github/workflows/publicar.yml')) as { jobs: Record<string, unknown> };
  assert.ok(Object.keys(wf.jobs).length >= 3);
  const docker = spawnSync('docker', ['compose', 'version'], { encoding: 'utf8' });
  if (docker.status === 0) execFileSync('docker', ['compose', '--env-file', join(destino, '.env'), '-f', join(destino, 'docker-compose.yml'), 'config', '-q']);
});
