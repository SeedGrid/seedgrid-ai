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
const B2B = { ...BASE, modelo: 'login-tenancy-b2b', extensoes: [] as string[], selfEnter: 'nao', auditoria: 'postgres', armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'filesystem', apikeysUso: 'Integracoes internas', billingProvider: 'stripe', trialDias: 14, planos: 'Basico,Pro' };
const SUB = { ...B2B, modelo: 'subdomain-tenancy' };
const MODULAR = { ...BASE, modelo: 'modular', selfEnter: 'nao', extensoes: ['apikeys'], apikeysUso: 'x' };

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
  const { destino, saida } = await gerar({ ...B2B, extensoes: ['exchange'], selfEnter: 'sim', selfEnterEscopo: 'ambos', selfEnterModo: 'convite', auditoria: 'mongodb', armazenamentoAvatar: 'minio', armazenamentoBackup: 'minio' });
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
  assert.deepEqual(Object.keys(compose.services), ['postgres', 'mailpit', 'minio', 'mongodb', 'mockoon']);
  assert.ok(ler(destino, 'backend/pom.xml').includes('<artifactId>seedgrid-exchange</artifactId>'));
});

test('auditoria Postgres + filesystem: sem mongodb e sem minio, pom sem o SDK do minio', async () => {
  const { destino, saida } = await gerar(B2B);
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  const compose = parse(ler(destino, 'docker-compose.yml')) as { services: Record<string, unknown> };
  assert.deepEqual(Object.keys(compose.services), ['postgres', 'mailpit', 'mockoon']);
  const e = env(ler(destino, 'backend/dev.env'));
  assert.equal(e.SEEDGRID_AUDIT_PERSISTENCE_STRATEGY, 'jpa');
  assert.equal(e.SEEDGRID_AUDIT_MONGODB_URI, undefined);
  assert.equal(e.SEEDGRID_BACKUP_STORAGE, 'filesystem');
  assert.equal(e.SEEDGRID_BACKUP_MINIO_BUCKET, undefined);
  assert.ok(!ler(destino, 'backend/pom.xml').includes('<artifactId>minio</artifactId>'));
});

test('auditoria Postgres desliga o health do MongoDB (o /q/health/ready nunca daria 200 esperando localhost:27017); com MongoDB nao desliga', async () => {
  const pg = await gerar(B2B);
  assert.equal(pg.saida.ok, true, (pg.saida.erros ?? []).join('\n'));
  const props = ler(pg.destino, 'backend/src/main/resources/application.properties').split(/\r?\n/);
  assert.equal(props.filter((l) => l === 'quarkus.mongodb.health.enabled=false').length, 1, 'a linha entra uma vez');
  const mongo = await gerar({ ...B2B, auditoria: 'mongodb' });
  assert.equal(mongo.saida.ok, true, (mongo.saida.erros ?? []).join('\n'));
  const propsMongo = ler(mongo.destino, 'backend/src/main/resources/application.properties').split(/\r?\n/);
  assert.ok(!propsMongo.includes('quarkus.mongodb.health.enabled=false'));
});

test('self-enter desligado, convite+cadastro (ambos) e cadastro publico', async () => {
  const off = env(ler((await gerar(B2B)).destino, 'backend/dev.env'));
  assert.equal(off.SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'false');
  assert.equal(off.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'false');
  const ambos = env(ler((await gerar({ ...B2B, selfEnter: 'sim', selfEnterEscopo: 'ambos', selfEnterModo: 'ambos' })).destino, 'backend/dev.env'));
  assert.equal(ambos.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'true');
  assert.equal(ambos.SEEDGRID_SECURITY_SELF_ENTER_PUBLIC_ENABLED, 'true');
  const pub = env(ler((await gerar({ ...B2B, selfEnter: 'sim', selfEnterEscopo: 'ambos', selfEnterModo: 'cadastro-publico' })).destino, 'backend/dev.env'));
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

test('modelo modular: boilerplate proprio com security + audit de base, apikeys opcional, sem admin, sem tenancy', async () => {
  const { destino, saida } = await gerar(MODULAR);
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  assert.deepEqual(saida.adicionadas, []);
  assert.deepEqual([...saida.extensoes].sort(), ['apikeys', 'audit', 'security']);
  const pom = ler(destino, 'backend/pom.xml');
  assert.ok(pom.includes('<artifactId>portal-chaves-api</artifactId>'));
  assert.ok(pom.includes('<artifactId>seedgrid-security</artifactId>') && pom.includes('<artifactId>seedgrid-apikeys</artifactId>'));
  for (const x of ['login-tenancy', 'subdomain-tenancy', 'billing', 'backup', 'business-days']) assert.ok(!pom.includes(`<artifactId>seedgrid-${x}`), `modular nao traz ${x}`);
  // A extension apikeys migra sozinha (historico proprio, ApiKeysFlywayCustomizer); listar a pasta dela no Flyway do host roda a V600 duas vezes ("sg_api_keys already exists", achado do E2E de 2026-10-29).
  const props = ler(destino, 'backend/src/main/resources/application.properties');
  assert.match(props, /quarkus\.flyway\.locations=classpath:db\/migration\/app$/m);
  assert.doesNotMatch(props, /db\/migration\/apikeys/);
  // O embeddable Address do cities fica fora da unidade de persistencia sem este pacote (WARN "Could not find a suitable persistence unit", que a verificacao de subida trata como defeito).
  assert.match(props, /quarkus\.hibernate-orm\.packages=.*br\.com\.seedgrid\.cities\.embeddables/);
  assert.ok(existsSync(join(destino, 'frontend/package.json')));
  assert.ok(!existsSync(join(destino, 'admin')), 'o modelo modular nao tem admin web');
  const prod = JSON.parse(ler(destino, 'produto.json'));
  assert.deepEqual(prod.servicos.map((s: { nome: string }) => s.nome), ['backend', 'frontend']);
  assert.ok(!prod.dominioAdmin);
  const e = env(ler(destino, 'backend/dev.env'));
  assert.ok(e.SEEDGRID_SECURITY_ENCRYPTION_KEY);
  assert.equal(e.SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'false');
  assert.ok(!saida.pendencias.some((p) => /Modelo modular nao tem boilerplate/.test(p)));
});

test('modelo modular: sem opcionais fica so com security + audit; opcional nao verificado e recusado', async () => {
  const { saida } = await gerar({ ...MODULAR, extensoes: [], apikeysUso: undefined });
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  assert.deepEqual([...saida.extensoes].sort(), ['audit', 'security']);
  const { saida: s2 } = await gerar({ ...MODULAR, extensoes: ['billing'], apikeysUso: undefined });
  assert.equal(s2.ok, false);
  assert.ok((s2.erros ?? []).some((x) => /billing/.test(x)), (s2.erros ?? []).join('\n'));
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
  const r = { ...B2B, extensoes: ['exchange', 'business-days'], selfEnter: 'sim', selfEnterEscopo: 'ambos', selfEnterModo: 'ambos', auditoria: 'mongodb', armazenamentoAvatar: 'minio', armazenamentoBackup: 'minio' };
  const a = await gerar(r);
  const b = await gerar(r);
  assert.equal(hashArvore(a.destino), hashArvore(b.destino));
  assert.deepEqual(versionados(a.destino), versionados(b.destino));
  assert.notEqual(env(ler(a.destino, 'backend/dev.env')).SEEDGRID_SECURITY_ENCRYPTION_KEY, env(ler(b.destino, 'backend/dev.env')).SEEDGRID_SECURITY_ENCRYPTION_KEY);
  assert.notEqual(ler(a.destino, 'backend/src/main/resources/keys/private.pem'), ler(b.destino, 'backend/src/main/resources/keys/private.pem'));
});

test('segredos: o par do JWT em arquivo bate com o do dev.env e nada de segredo vai para o que e versionado', async () => {
  const { destino } = await gerar({ ...B2B, selfEnter: 'sim', selfEnterEscopo: 'ambos', selfEnterModo: 'convite', auditoria: 'mongodb', armazenamentoAvatar: 'minio', armazenamentoBackup: 'minio' });
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
  const { destino } = await gerar({ ...B2B, auditoria: 'mongodb', armazenamentoAvatar: 'minio', armazenamentoBackup: 'minio' });
  const texto = ler(destino, 'docker-compose.yml');
  const usadas = [...texto.matchAll(/\$\{([A-Z_]+)\}/g)].map((m) => m[1]!);
  const definidas = env(ler(destino, '.env'));
  for (const v of usadas) assert.ok(definidas[v], `variavel ${v} sem valor no .env`);
  const wf = parse(ler(destino, '.github/workflows/publicar.yml')) as { jobs: Record<string, unknown> };
  assert.ok(Object.keys(wf.jobs).length >= 3);
  const docker = spawnSync('docker', ['compose', 'version'], { encoding: 'utf8' });
  if (docker.status === 0) execFileSync('docker', ['compose', '--env-file', join(destino, '.env'), '-f', join(destino, 'docker-compose.yml'), 'config', '-q']);
});

test('e-mail de desenvolvimento: Mailpit local no compose, sem autenticacao, remetentes por extension no dev.env', async () => {
  const b2b = await gerar(B2B);
  const compose = ler(b2b.destino, 'docker-compose.yml');
  assert.match(compose, /image: axllent\/mailpit:v\d+\.\d+\.\d+/);
  assert.doesNotMatch(compose, /mailhog/i);
  assert.match(compose, /:8025"/);
  const e = env(ler(b2b.destino, 'backend/dev.env'));
  assert.equal(e.SECURITY_MAILER_HOST, 'localhost');
  assert.match(e.SECURITY_MAILER_FROM!, /<security@eu-dev\.com\.br>$/);
  assert.match(e.SEEDGRID_BACKUP_MAILER_FROM!, /<backup@eu-dev\.com\.br>$/);
  assert.equal(e.SECURITY_MAILER_USERNAME, 'security@eu-dev.com.br');
  assert.equal(e.SECURITY_MAILER_PASSWORD, '12345678');
  assert.equal(e.SEEDGRID_BACKUP_MAILER_PASSWORD, '12345678');
  assert.match(compose, /MP_SMTP_AUTH_ACCEPT_ANY: "1"/);
  assert.equal(env(ler(b2b.destino, 'backend/dev.env.example')).SECURITY_MAILER_PASSWORD, 'change-me');
  const sub = await gerar(SUB);
  assert.match(env(ler(sub.destino, 'backend/dev.env')).SEEDGRID_SUBDOMAIN_TENANCY_MAILER_FROM!, /<subdomain\.tenancy@eu-dev\.com\.br>$/);
  assert.match(ler(sub.destino, 'docker-compose.yml'), /:8026:8025"/);
});

test('escopo do self-enter: desligado tira as telas do front e do admin; so no front tira so do admin; so no admin tira so do front', async () => {
  const tem = (d: string, rel: string) => existsSync(join(d, rel));
  const nao = await gerar(B2B); // selfEnter 'nao'
  for (const rel of ['frontend/app/security/self-enter', 'frontend/app/api/self-enter', 'admin/app/security/self-enter', 'admin/app/api/admin/self-enter']) assert.ok(!tem(nao.destino, rel), `${rel} devia ter sido removido`);
  assert.ok(!ler(nao.destino, 'frontend/app/data.ts').includes('/security/self-enter'));
  assert.ok(!ler(nao.destino, 'admin/app/components/Shell.tsx').includes('"/security/self-enter":'));
  assert.ok(nao.saida.notas.some((n) => /self-enter@admin: removido admin\/app\/security\/self-enter/.test(n)));

  const base = { ...B2B, selfEnter: 'sim', selfEnterModo: 'convite' };
  const ambos = await gerar({ ...base, selfEnterEscopo: 'ambos' });
  assert.ok(tem(ambos.destino, 'frontend/app/security/self-enter') && tem(ambos.destino, 'admin/app/security/self-enter'));

  const soFront = await gerar({ ...base, selfEnterEscopo: 'front' });
  assert.ok(tem(soFront.destino, 'frontend/app/security/self-enter'), 'front mantem');
  assert.ok(!tem(soFront.destino, 'admin/app/security/self-enter'), 'admin perde');
  assert.ok(!ler(soFront.destino, 'admin/app/data.ts').includes('/security/self-enter'));

  const soAdmin = await gerar({ ...base, selfEnterEscopo: 'admin' });
  assert.ok(tem(soAdmin.destino, 'admin/app/security/self-enter'), 'admin mantem');
  assert.ok(!tem(soAdmin.destino, 'frontend/app/security/self-enter'), 'front perde');
  assert.ok(!tem(soAdmin.destino, 'frontend/app/auth/self-enter'), 'front perde a pagina publica');
  assert.ok(soAdmin.saida.pendencias.some((p) => /frontend\.base-url/.test(p)), 'avisa do link do convite');
});

test('receitas de remocao: toda receita aponta para caminhos que existem nos boilerplates', async () => {
  const { carregar } = (await import(pathToFileURL(join(SKILL, 'scripts/matriz.mjs')).href)) as { carregar: () => { modulosFront: { modulos: Record<string, { escopos: Record<string, { apagar: string[]; linhas?: { arquivo: string; contem: string }[]; blocos?: { arquivo: string; contem: string }[] }> }> } } };
  const { modulosFront } = carregar();
  for (const bp of ['login-tenancy-b2b', 'subdomain-tenancy']) {
    for (const [mod, def] of Object.entries(modulosFront.modulos)) {
      for (const [escopo, rec] of Object.entries(def.escopos)) {
        const raiz = join(BOILERPLATES, bp, escopo);
        for (const rel of rec.apagar) assert.ok(existsSync(join(raiz, rel)), `${bp}/${escopo}/${rel} (${mod}) nao existe`);
        for (const { arquivo, contem } of [...(rec.linhas ?? []), ...(rec.blocos ?? [])]) {
          const f = join(raiz, arquivo);
          assert.ok(existsSync(f) && readFileSync(f, 'utf8').includes(contem), `${bp}/${escopo}/${arquivo}: trecho nao encontrado (${contem})`);
        }
      }
    }
  }
});

test('armazenamento por finalidade: avatar e backup escolhem destinos diferentes, cada um com as suas variaveis', async () => {
  const todas = (e: Record<string, string>, pref: string) => Object.keys(e).filter((k) => k.startsWith(pref));
  // avatar em S3 (credencial externa), backup no sistema de arquivos
  const a = await gerar({ ...B2B, armazenamentoAvatar: 's3', armazenamentoBackup: 'filesystem' });
  const e = env(ler(a.destino, 'backend/dev.env'));
  assert.equal(e.SEEDGRID_SECURITY_AVATAR_STORAGE, 's3');
  assert.equal(e.SEEDGRID_SECURITY_AVATAR_S3_BUCKET, 'portal-chaves-avatars');
  assert.equal(e.SEEDGRID_SECURITY_AVATAR_S3_ACCESS_KEY, 'change-me');
  assert.equal(e.SEEDGRID_BACKUP_STORAGE, 'filesystem');
  assert.equal(e.SEEDGRID_BACKUP_FILESYSTEM_BASE, './data/arquivos');
  assert.deepEqual(todas(e, 'SEEDGRID_BACKUP_MINIO_'), [], 'sem variaveis de MinIO quando ninguem usa');
  assert.ok(!/minio/.test(ler(a.destino, 'docker-compose.yml')), 'sem servico MinIO no compose');
  assert.ok(!ler(a.destino, 'backend/pom.xml').includes('io.minio'), 'sem a dependencia do MinIO');
  assert.ok(a.saida.pendencias.some((p) => /Avatar em Amazon S3/.test(p) && /guia-credenciais\.md#s3/.test(p)));
  assert.ok(!a.saida.pendencias.some((p) => /^Backup/.test(p)));
  // so o backup em MinIO: o compose sobe o MinIO e a dependencia fica
  const b = await gerar({ ...B2B, armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'minio' });
  assert.match(ler(b.destino, 'docker-compose.yml'), /minio:/);
  assert.ok(ler(b.destino, 'backend/pom.xml').includes('io.minio'));
  assert.equal(env(ler(b.destino, 'backend/dev.env')).SEEDGRID_BACKUP_STORAGE, 'minio');
  assert.equal(env(ler(b.destino, 'backend/dev.env')).SEEDGRID_SECURITY_AVATAR_STORAGE, 'filesystem');
  // os sete providers resolvem para as suas chaves
  for (const [prov, chave] of [['azure-blob', 'AZURE_BLOB_CONNECTION_STRING'], ['gcs', 'GCS_PROJECT_ID'], ['google-drive', 'GOOGLE_DRIVE_ROOT_FOLDER_ID'], ['onedrive', 'ONEDRIVE_CLIENT_ID']] as const) {
    const x = await gerar({ ...B2B, armazenamentoAvatar: prov, armazenamentoBackup: prov });
    const ex = env(ler(x.destino, 'backend/dev.env'));
    assert.equal(ex.SEEDGRID_SECURITY_AVATAR_STORAGE, prov);
    assert.ok(`SEEDGRID_SECURITY_AVATAR_${chave}` in ex && `SEEDGRID_BACKUP_${chave}` in ex, prov);
    assert.ok(x.saida.pendencias.length >= 2, `${prov}: pendencia de avatar e de backup`);
  }
});

test('o guia de credenciais existe e cada pendencia de armazenamento aponta para uma secao dele', async () => {
  const guia = readFileSync(join(SKILL, 'assets/guia-credenciais.md'), 'utf8');
  for (const ancora of ['filesystem', 'minio', 's3', 'azure-blob', 'gcs', 'google-drive', 'onedrive']) assert.match(guia, new RegExp(`^## ${ancora}( |$)`, 'm'), ancora);
  assert.match(guia, /Procedimento do fornecedor, n.o da KB/);
});

test('subdomain-tenancy: tenants de exemplo viram arquivo hosts, produto.json e pendencia; login-tenancy nao os tem', async () => {
  const padrao = await gerar(SUB);
  const hosts = ler(padrao.destino, 'tenants-exemplo.hosts');
  assert.match(hosts, /^127\.0\.0\.1 acme\.localhost$/m);
  assert.match(hosts, /^127\.0\.0\.1 beta\.localhost$/m);
  assert.deepEqual(JSON.parse(ler(padrao.destino, 'produto.json')).tenantsExemplo, ['acme', 'beta']);
  assert.ok(padrao.saida.pendencias.some((p) => /http:\/\/acme\.localhost:3000/.test(p) && /signup/.test(p) && /administrador/.test(p)));
  assert.equal(env(ler(padrao.destino, 'frontend/.env.local')).SEEDGRID_TENANCY_DOMAIN, 'localhost');
  const meus = await gerar({ ...SUB, tenantsExemplo: 'lazim,joao,felipe' });
  assert.match(ler(meus.destino, 'tenants-exemplo.hosts'), /^127\.0\.0\.1 felipe\.localhost$/m);
  const ruim = await scaffold({ respostas: { ...SUB, tenantsExemplo: 'Acme,beta' }, destino: novaPasta(), boilerplates: BOILERPLATES });
  assert.equal(ruim.ok, false);
  assert.match((ruim.erros ?? []).join(' '), /tenantsExemplo/);
  const login = await gerar(B2B);
  assert.ok(!existsSync(join(login.destino, 'tenants-exemplo.hosts')));
  const naoPergunta = await scaffold({ respostas: { ...B2B, tenantsExemplo: 'acme' }, destino: novaPasta(), boilerplates: BOILERPLATES });
  assert.equal(naoPergunta.ok, false, 'login-tenancy nao aceita tenantsExemplo');
});

test('telas dispensadas e extension ausente: so as telas saem; ai-pricing e exchange ausentes tiram as telas do admin, presentes as mantem', async () => {
  const tem = (d: string, rel: string) => existsSync(join(d, rel));
  // padrao: ai-pricing e exchange nao vem no modelo, entao o admin nao carrega as telas deles
  const padrao = await gerar(B2B);
  for (const rel of ['admin/app/ai', 'admin/app/settings', 'admin/app/api/admin/ai', 'admin/app/configuracao/cambio', 'admin/app/configuracao/moedas', 'admin/app/api/exchange']) assert.ok(!tem(padrao.destino, rel), `${rel} devia ter saido`);
  assert.ok(!ler(padrao.destino, 'admin/app/data.ts').includes('/ai/price-approvals'));
  assert.ok(!ler(padrao.destino, 'admin/app/data.ts').includes('/configuracao/cambio'));
  assert.ok(tem(padrao.destino, 'admin/app/apikeys') && tem(padrao.destino, 'admin/app/security/audit'), 'o que nao foi dispensado fica');
  // escolhendo as extensions, as telas ficam
  const com = await gerar({ ...B2B, extensoes: ['ai-pricing', 'exchange'] });
  assert.ok(tem(com.destino, 'admin/app/ai') && tem(com.destino, 'admin/app/configuracao/cambio'));
  assert.ok(ler(com.destino, 'admin/app/data.ts').includes('/ai/price-approvals'));
  // telas dispensadas
  const sem = await gerar({ ...B2B, telasDispensadas: ['api-keys@admin', 'audit@frontend', 'backup@admin'] });
  assert.ok(!tem(sem.destino, 'admin/app/apikeys') && !tem(sem.destino, 'frontend/app/security/audit') && !tem(sem.destino, 'admin/app/exports'));
  assert.ok(tem(sem.destino, 'frontend/app/security/apikeys') && tem(sem.destino, 'admin/app/security/audit'), 'os outros escopos ficam');
  assert.ok(!ler(sem.destino, 'admin/app/data.ts').includes('Backup / Export'), 'grupo do menu inteiro sai');
  assert.ok(ler(sem.destino, 'admin/app/data.ts').includes('"/security"'), 'o menu de seguranca continua');
  const ruim = await scaffold({ respostas: { ...B2B, telasDispensadas: ['billing@admin'] }, destino: novaPasta(), boilerplates: BOILERPLATES });
  assert.equal(ruim.ok, false);
});

test('o data.ts do admin continua sintaticamente balanceado depois de remover blocos de menu', async () => {
  const x = await gerar({ ...B2B, telasDispensadas: ['api-keys@admin', 'audit@admin', 'backup@admin'], extensoes: [] });
  for (const rel of ['admin/app/data.ts', 'frontend/app/data.ts']) {
    const t = ler(x.destino, rel);
    const conta = (c: string) => t.split(c).length - 1;
    assert.equal(conta('{'), conta('}'), `${rel}: chaves`);
    assert.equal(conta('['), conta(']'), `${rel}: colchetes`);
  }
});

test('o pom declara o SDK do provider de nuvem escolhido (optional na filemanagement), e so dele', async () => {
  const SDK: Record<string, string[]> = {
    s3: ['software.amazon.awssdk'],
    'azure-blob': ['azure-storage-blob'],
    gcs: ['google-cloud-storage'],
    'google-drive': ['google-api-services-drive', 'google-api-client', 'google-auth-library-oauth2-http'],
    onedrive: ['microsoft-graph', 'azure-identity'],
  };
  const todos = [...new Set(Object.values(SDK).flat())];
  for (const [prov, esperados] of Object.entries(SDK)) {
    for (const modelo of ['login-tenancy-b2b', 'subdomain-tenancy']) {
      const { destino } = await gerar({ ...B2B, modelo, armazenamentoAvatar: prov, armazenamentoBackup: prov });
      const pom = readFileSync(join(destino, 'backend/pom.xml'), 'utf8');
      for (const e of esperados) assert.ok(pom.includes(e), `${modelo}/${prov}: falta ${e}`);
      // como avatar e backup usam o mesmo provider, o SDK entra uma vez so
      for (const e of esperados) assert.equal(pom.split(`<artifactId>${e}</artifactId>`).length - 1 <= 1, true, `${prov}: ${e} duplicado`);
      for (const e of todos.filter((x) => !esperados.includes(x))) assert.ok(!pom.includes(e), `${modelo}/${prov}: ${e} nao devia entrar`);
    }
  }
  // filesystem e minio nao precisam de SDK extra alem do que o boilerplate ja traz
  const fs = await gerar({ ...B2B, armazenamentoAvatar: 'filesystem', armazenamentoBackup: 'filesystem' });
  const pomFs = readFileSync(join(fs.destino, 'backend/pom.xml'), 'utf8');
  for (const e of todos) assert.ok(!pomFs.includes(e), `filesystem: ${e} nao devia entrar`);
});

test('o quadro de portas lista toda porta publicada do docker-compose gerado, com docs/COMO-RODAR.md e o campo portas', async () => {
  const combinacoes = [
    B2B,
    { ...B2B, extensoes: ['exchange'], auditoria: 'mongodb', armazenamentoAvatar: 'minio', armazenamentoBackup: 'minio' },
    SUB,
  ];
  for (const r of combinacoes) {
    const { destino, saida } = await gerar(r);
    assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
    const compose = parse(ler(destino, 'docker-compose.yml')) as { services: Record<string, { ports?: string[] }> };
    const publicadas = Object.entries(compose.services).flatMap(([nome, s]) => (s.ports ?? []).map((p) => ({ nome, host: Number(String(p).split(':').slice(-2)[0]) })));
    const portas = (saida as unknown as { portas: { servicos: { servico: string; portaHost: number }[]; apps: { porta: number }[] } }).portas;
    assert.ok(publicadas.length > 0);
    for (const p of publicadas) assert.ok(portas.servicos.some((s) => s.servico === p.nome && s.portaHost === p.host), `${r.modelo}: ${p.nome}:${p.host} fora do quadro`);
    assert.equal(portas.servicos.length, publicadas.length);
    assert.deepEqual(portas.apps.map((a) => a.porta), [8080, 3000, 3001]);
    const md = ler(destino, 'docs/COMO-RODAR.md');
    for (const p of publicadas) assert.ok(md.includes(`| ${p.nome} | ${p.host} |`), `${r.modelo}: COMO-RODAR sem ${p.nome}`);
  }
});

test('o produto traz o back falso (Mockoon): arquivo valido, servico no compose com perfil mock e dados ficticios', async () => {
  for (const r of [B2B, SUB, MODULAR]) {
    const { destino, saida } = await gerar(r);
    assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
    const arq = `mocks/${r.slug}.mockoon.json`;
    assert.ok(saida.criados.includes(arq), `${r.modelo}: falta ${arq}`);
    const env = JSON.parse(ler(destino, arq)) as { port: number; routes: { method: string; endpoint: string; uuid: string; responses: { body: string; statusCode: number }[] }[]; rootChildren: unknown[] };
    assert.equal(env.port, 3100);
    assert.equal(env.rootChildren.length, env.routes.length);
    const chaves = env.routes.map((x) => `${x.method} ${x.endpoint}`);
    assert.equal(new Set(chaves).size, chaves.length, 'rotas duplicadas');
    assert.equal(new Set(env.routes.map((x) => x.uuid)).size, env.routes.length, 'uuid repetido');
    assert.ok(chaves.includes('post public/auth/login') && chaves.includes('get me/permissions'));
    for (const x of env.routes) for (const rs of x.responses) if (rs.body) JSON.parse(rs.body); // todo corpo e JSON valido
    const login = JSON.parse(env.routes.find((x) => x.endpoint === 'public/auth/login')!.responses[0]!.body) as { status: string; token: string };
    assert.equal(login.status, 'OK');
    assert.equal(JSON.parse(Buffer.from(login.token.split('.')[1]!, 'base64url').toString('utf8')).audience, 'client');
    assert.equal(chaves.includes('get me/security/users'), r.modelo !== 'modular');
    const compose = parse(ler(destino, 'docker-compose.yml')) as { services: Record<string, { image: string; profiles?: string[]; ports?: string[] }> };
    const m = compose.services.mockoon!;
    assert.ok(m.image.startsWith('mockoon/cli:9.'), 'imagem fixada');
    assert.deepEqual(m.profiles, ['mock']);
    assert.deepEqual(m.ports, ['127.0.0.1:3100:3100']);
    const doProduto = ler(destino, arq);
    assert.ok(!/@(gmail|hotmail)|[0-9]{3}\.[0-9]{3}\.[0-9]{3}-[0-9]{2}/.test(doProduto), 'dado que parece real no mock');
  }
});

const { conferirReadme, marcadoresPendentes } = (await import(pathToFileURL(join(SKILL, 'scripts/readme-produto.mjs')).href)) as {
  conferirReadme: (t: string, o?: { permitirMarcadores?: boolean }) => string[];
  marcadoresPendentes: (t: string) => string[];
};

test('todo produto nasce com README.md so do dominio do host: secoes, C4 ate C3 em Mermaid e marcadores para a skill preencher', async () => {
  for (const r of [B2B, SUB, MODULAR]) {
    const { destino, saida } = await gerar(r);
    assert.equal(saida.ok, true, `${r.modelo}: ${saida.erros?.join('; ')}`);
    assert.ok(saida.criados.includes('README.md'), `${r.modelo}: README.md nao foi gerado`);
    const md = ler(destino, 'README.md');
    assert.deepEqual(conferirReadme(md, { permitirMarcadores: true }), [], `${r.modelo}: README incompleto`);
    for (const t of ['C4Context', 'C4Container', 'C4Component']) assert.ok(md.includes(t), `${r.modelo}: sem ${t}`);
    assert.ok(marcadoresPendentes(md).length >= 3, `${r.modelo}: esperava marcadores para a skill preencher`);
    assert.ok(md.includes('docs/COMO-RODAR.md'), `${r.modelo}: README nao aponta para o COMO-RODAR`);
    for (const e of saida.extensoes) assert.ok(md.includes(`seedgrid-${e}`), `${r.modelo}: C3 sem a extension ${e}`);
    // dominio do host: nao repete o que a extension faz (so o nome e o caminho da KB)
    assert.ok(!/POST \/|GET \/|@Sg[A-Z]/.test(md), `${r.modelo}: README descreve internals de extension`);
  }
});

test('o guardiao do README reprova README sem secao, sem diagrama ou com marcador sem preencher', () => {
  assert.ok(conferirReadme('# x\n').length >= 3);
  const completo = ['## Visão', '## Como funciona', '### Contexto (C1)', '```mermaid', '```', '### Contêineres (C2)', '### Componentes do backend (C3)', '## Fluxos principais', '## Como rodar'].join('\n');
  assert.deepEqual(conferirReadme(completo), []);
  assert.deepEqual(conferirReadme(completo + '\n<!-- sg:preencher: algo -->'), ['marcador sem preencher: algo']);
});

test('modelo modular: privacy e resilience liberados (vem pela security); privacy traz as chaves no dev.env', async () => {
  const { destino, saida } = await gerar({ ...MODULAR, extensoes: ['apikeys', 'privacy', 'resilience'] });
  assert.equal(saida.ok, true, (saida.erros ?? []).join('\n'));
  assert.deepEqual([...saida.extensoes].sort(), ['apikeys', 'audit', 'privacy', 'resilience', 'security']);
  const e = env(ler(destino, 'backend/dev.env'));
  assert.equal(e.SEEDGRID_PRIVACY_ENCRYPTION_ENABLED, 'true');
  assert.ok(e.SEEDGRID_PRIVACY_CRYPTO_KEY && !e.SEEDGRID_PRIVACY_CRYPTO_KEY.startsWith('GERE'));
});

test('modelo modular: entidades de apikeys e privacy entram em quarkus.hibernate-orm.packages', async () => {
  const { destino } = await gerar({ ...MODULAR, extensoes: ['apikeys', 'privacy'] });
  const props = ler(destino, 'backend/src/main/resources/application.properties');
  assert.match(props, /^quarkus\.hibernate-orm\.packages=.*br\.com\.seedgrid\.privacy.*br\.com\.seedgrid\.apikeys\.entities/m);
  const { destino: d2 } = await gerar({ ...MODULAR, extensoes: [], apikeysUso: undefined });
  const p2 = ler(d2, 'backend/src/main/resources/application.properties');
  assert.ok(!p2.includes('apikeys.entities'));
  assert.ok(p2.includes('br.com.seedgrid.privacy'), 'a security traz o privacy: o pacote vem na base');
});

test('modelo modular: front com as telas da base e o menu do usuario (Meu perfil, Temas, Sair); API Keys so com apikeys', async () => {
  const com = await gerar({ ...MODULAR, extensoes: ['apikeys'] });
  for (const rel of ['perfil/page.tsx', 'temas/page.tsx', 'security/users/user_list/page.tsx', 'security/roles/role_list/page.tsx', 'security/audit/page.tsx', 'security/two-factor/page.tsx', 'security/apikeys/apikey_list/page.tsx', 'api/security/apikeys/route.ts']) {
    assert.ok(existsSync(join(com.destino, 'frontend/app', rel)), `${rel} deve existir`);
  }
  const shell = ler(com.destino, 'frontend/app/components/Shell.tsx');
  for (const item of ['Meu perfil', 'Temas', 'Sair']) assert.ok(shell.includes(`label: "${item}"`), item);
  assert.ok(ler(com.destino, 'frontend/app/data.ts').includes('/security/apikeys/apikey_list'));
  const sem = await gerar({ ...MODULAR, extensoes: [], apikeysUso: undefined });
  assert.ok(!existsSync(join(sem.destino, 'frontend/app/security/apikeys')));
  assert.ok(!existsSync(join(sem.destino, 'frontend/app/api/security/apikeys')));
  assert.ok(!ler(sem.destino, 'frontend/app/data.ts').includes('apikey_list'));
  assert.ok(existsSync(join(sem.destino, 'frontend/app/security/users/user_list/page.tsx')) && existsSync(join(sem.destino, 'frontend/app/perfil/page.tsx')));
});

test('modelo modular: com apikeys vem o perfil de integracao de exemplo (sem ele nao ha role para criar chave); sem apikeys sai', async () => {
  const com = await gerar({ ...MODULAR, extensoes: ['apikeys'] });
  const m = 'backend/src/main/resources/db/migration/app/';
  assert.ok(existsSync(join(com.destino, m, 'V3001__integration_role_example.sql')) && existsSync(join(com.destino, m, 'V3002__integration_permissions_release.sql')));
  const sem = await gerar({ ...MODULAR, extensoes: [], apikeysUso: undefined });
  assert.ok(!existsSync(join(sem.destino, m, 'V3001__integration_role_example.sql')) && !existsSync(join(sem.destino, m, 'V3002__integration_permissions_release.sql')));
  assert.ok(existsSync(join(sem.destino, m, 'V3000__host_baseline.sql')));
});

test('modelo modular: self-enter e config do security; ligado traz as telas de convite e as flags, desligado remove tudo', async () => {
  const sim = await gerar({ ...MODULAR, selfEnter: 'sim', selfEnterModo: 'convite' });
  assert.equal(sim.saida.ok, true, (sim.saida.erros ?? []).join('\n'));
  for (const rel of ['security/self-enter', 'auth/self-enter', 'api/security/self-enter']) assert.ok(existsSync(join(sim.destino, 'frontend/app', rel)), rel);
  assert.ok(ler(sim.destino, 'frontend/app/data.ts').includes('/security/self-enter'));
  const e = env(ler(sim.destino, 'backend/dev.env'));
  assert.equal(e.SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'true');
  assert.equal(e.SEEDGRID_SECURITY_SELF_ENTER_INVITE_ENABLED, 'true');
  const nao = await gerar({ ...MODULAR, selfEnter: 'nao' });
  for (const rel of ['security/self-enter', 'auth/self-enter', 'api/security/self-enter']) assert.ok(!existsSync(join(nao.destino, 'frontend/app', rel)), rel);
  assert.ok(!ler(nao.destino, 'frontend/app/data.ts').includes('/security/self-enter'));
  assert.equal(env(ler(nao.destino, 'backend/dev.env')).SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'false');
});

test('cities (cidades e estados do Brasil): dependencia direta no pom em cada modelo, ausente sem a opcao e determinismo', async () => {
  for (const [nome, base] of [['login-tenancy-b2b', B2B], ['subdomain-tenancy', SUB], ['modular', MODULAR]] as const) {
    const sem = await gerar({ ...base, extensoes: base.extensoes.filter((x) => x !== 'cities') });
    assert.equal(sem.saida.ok, true, `${nome} sem cities: ${(sem.saida.erros ?? []).join('\n')}`);
    assert.ok(!ler(sem.destino, 'backend/pom.xml').includes('<artifactId>seedgrid-cities</artifactId>'), `${nome}: sem a opcao a cities nao e declarada`);

    const com1 = await gerar({ ...base, extensoes: [...base.extensoes, 'cities'] });
    const com2 = await gerar({ ...base, extensoes: [...base.extensoes, 'cities'] });
    assert.equal(com1.saida.ok, true, `${nome} com cities: ${(com1.saida.erros ?? []).join('\n')}`);
    const pom = ler(com1.destino, 'backend/pom.xml');
    assert.equal(pom.split('<artifactId>seedgrid-cities</artifactId>').length - 1, 1, `${nome}: uma unica dependencia seedgrid-cities`);
    assert.ok(/<artifactId>seedgrid-cities<\/artifactId>\s*<version>2026\.10\.22<\/version>/.test(pom), `${nome}: versao da cities`);
    assert.ok(com1.saida.extensoes.includes('cities'), `${nome}: cities nas extensions resolvidas`);
    // dados de referencia: nenhuma migration de cidade copiada para o host (a extension migra sozinha)
    assert.ok(!arquivos(com1.destino).some((f) => /migration.*cit(y|ies)/i.test(f)), `${nome}: o host nao carrega migration da cities`);
  }
  const a = await gerar({ ...SUB, extensoes: ['cities'] });
  const b = await gerar({ ...SUB, extensoes: ['cities'] });
  assert.equal(readFileSync(join(a.destino, 'backend/pom.xml'), 'utf8'), readFileSync(join(b.destino, 'backend/pom.xml'), 'utf8'));
});
