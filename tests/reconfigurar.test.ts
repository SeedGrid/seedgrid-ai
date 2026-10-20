import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const TOOLKIT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit');
const SKILL = join(TOOLKIT, 'skills/sg-new-product');
const BOILERPLATES = join(TOOLKIT, 'boilerplates');
type Saida = { ok: boolean; erros?: string[] };
type Plano = { ok: boolean; erros?: string[]; aplicado: boolean; conflitos: number; arquivos: { arquivo: string; acao: string; motivo?: string }[]; env: { arquivo: string; chave: string; acao: string }[] };
const { scaffold } = (await import(pathToFileURL(join(SKILL, 'scripts/scaffold-produto.mjs')).href)) as { scaffold: (o: { respostas: Record<string, unknown>; destino: string; boilerplates: string }) => Promise<Saida> };
const { reconfigurar } = (await import(pathToFileURL(join(SKILL, 'scripts/reconfigurar.mjs')).href)) as { reconfigurar: (o: { respostas: Record<string, unknown>; destino: string; boilerplates: string; aplicar?: boolean }) => Promise<Plano> };

const BASE = { nome: 'Portal Chaves', slug: 'portal-chaves', pacote: 'br.com.acme.portal', dominioFront: 'app.acme.com.br', dominioAdmin: 'admin.acme.com.br', emailRemetente: 'noreply@acme.com.br', emailAdmin: 'dono@acme.com.br' };
const B2B = { ...BASE, modelo: 'login-tenancy-b2b', extensoes: [] as string[], selfEnter: 'nao', auditoria: 'postgres', armazenamento: 'filesystem', apikeysUso: 'Integracoes internas', billingProvider: 'stripe', trialDias: 14, planos: 'Basico,Pro' };
const COM_SELF_ENTER = { ...B2B, selfEnter: 'sim', selfEnterEscopo: 'ambos', selfEnterModo: 'convite' };

const dirs: string[] = [];
const nova = () => { const d = mkdtempSync(join(tmpdir(), 'sg-reconf-test-')); dirs.push(d); return d; };
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

async function criar(respostas: Record<string, unknown>) {
  const destino = nova();
  const r = await scaffold({ respostas, destino, boilerplates: BOILERPLATES });
  assert.ok(r.ok, (r.erros ?? []).join('\n'));
  return destino;
}
const IGNORADO = (rel: string) => rel === 'backend/dev.env' || rel === '.env' || /\.env\.local$/.test(rel) || rel.endsWith('.pem');
function arquivos(raiz: string, dir = raiz): string[] {
  return readdirSync(dir).sort().flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(raiz, p) : [relative(raiz, p).split(sep).join('/')];
  });
}
const hashArvore = (raiz: string) => {
  const h = createHash('sha256');
  for (const r of arquivos(raiz).filter((x) => !IGNORADO(x))) h.update(r).update('\0').update(readFileSync(join(raiz, r))).update('\0');
  return h.digest('hex');
};
const env = (d: string, rel = 'backend/dev.env') => Object.fromEntries(readFileSync(join(d, rel), 'utf8').split(/\r?\n/).filter((l) => /^[A-Z][A-Z0-9_]*=/.test(l)).map((l) => [l.slice(0, l.indexOf('=')), l.slice(l.indexOf('=') + 1)]));

test('adicionar o self-enter depois: a arvore fica igual a de um produto criado ja com ele, e os segredos nao mudam', async () => {
  const produto = await criar(B2B);
  const antes = env(produto);
  assert.ok(!existsSync(join(produto, 'frontend/app/security/self-enter')));
  const simulacao = await reconfigurar({ respostas: COM_SELF_ENTER, destino: produto, boilerplates: BOILERPLATES });
  assert.ok(simulacao.ok && !simulacao.aplicado);
  assert.ok(!existsSync(join(produto, 'frontend/app/security/self-enter')), 'simulacao nao grava');
  assert.ok(simulacao.arquivos.some((a) => a.acao === 'criar' && a.arquivo.startsWith('admin/app/security/self-enter')));

  const aplicado = await reconfigurar({ respostas: COM_SELF_ENTER, destino: produto, boilerplates: BOILERPLATES, aplicar: true });
  assert.ok(aplicado.ok && aplicado.aplicado && aplicado.conflitos === 0, JSON.stringify(aplicado.arquivos.filter((a) => a.acao === 'conflito')));
  const direto = await criar(COM_SELF_ENTER);
  assert.equal(hashArvore(produto), hashArvore(direto), 'arvore versionada igual a de "criar ja com o modulo"');
  const depois = env(produto);
  for (const k of ['SEEDGRID_SECURITY_JWT_PRIVATE_KEY_BASE64', 'SEEDGRID_DB_PASSWORD']) if (antes[k] !== undefined) assert.equal(depois[k], antes[k], `${k} nao pode mudar`);
  assert.equal(readFileSync(join(produto, 'backend/src/main/resources/keys/private.pem'), 'utf8').includes('BEGIN'), true);
  assert.equal(depois.SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'true');
  assert.ok(aplicado.env.some((e) => e.chave === 'SEEDGRID_SECURITY_SELF_ENTER_ENABLED' && e.acao === 'atualizar'));
});

test('remover o self-enter depois (mudou de ideia): volta a arvore de quem nunca o teve', async () => {
  const produto = await criar(COM_SELF_ENTER);
  const r = await reconfigurar({ respostas: B2B, destino: produto, boilerplates: BOILERPLATES, aplicar: true });
  assert.ok(r.ok && r.aplicado && r.conflitos === 0);
  assert.equal(hashArvore(produto), hashArvore(await criar(B2B)));
  assert.ok(!existsSync(join(produto, 'frontend/app/security/self-enter')));
});

test('escopo: de "ambos" para so o front remove as telas do admin; o inverso as devolve', async () => {
  const produto = await criar(COM_SELF_ENTER);
  const soFront = { ...COM_SELF_ENTER, selfEnterEscopo: 'front' };
  await reconfigurar({ respostas: soFront, destino: produto, boilerplates: BOILERPLATES, aplicar: true });
  assert.ok(existsSync(join(produto, 'frontend/app/security/self-enter')));
  assert.ok(!existsSync(join(produto, 'admin/app/security/self-enter')));
  assert.equal(hashArvore(produto), hashArvore(await criar(soFront)));
  await reconfigurar({ respostas: COM_SELF_ENTER, destino: produto, boilerplates: BOILERPLATES, aplicar: true });
  assert.equal(hashArvore(produto), hashArvore(await criar(COM_SELF_ENTER)));
});

test('arquivo editado pelo dev e conflito: fica como esta e e avisado', async () => {
  const produto = await criar(B2B);
  const menu = join(produto, 'admin/app/data.ts');
  writeFileSync(menu, readFileSync(menu, 'utf8') + '\n// meu ajuste\n');
  const r = await reconfigurar({ respostas: COM_SELF_ENTER, destino: produto, boilerplates: BOILERPLATES, aplicar: true });
  assert.ok(r.ok && r.conflitos >= 1);
  assert.ok(r.arquivos.some((a) => a.arquivo === 'admin/app/data.ts' && a.acao === 'conflito'));
  assert.ok(readFileSync(menu, 'utf8').endsWith('// meu ajuste\n'), 'o ajuste do dev foi preservado');
  assert.ok(existsSync(join(produto, 'admin/app/security/self-enter')), 'o que nao conflita foi aplicado');
});

test('variavel de ambiente alterada pelo dev e preservada; as outras seguem a matriz', async () => {
  const produto = await criar(B2B);
  const dev = join(produto, 'backend/dev.env');
  writeFileSync(dev, readFileSync(dev, 'utf8').replace(/^SECURITY_MAILER_HOST=.*$/m, 'SECURITY_MAILER_HOST=smtp.meu-servidor.com'));
  const r = await reconfigurar({ respostas: COM_SELF_ENTER, destino: produto, boilerplates: BOILERPLATES, aplicar: true });
  assert.ok(r.ok);
  assert.equal(env(produto).SECURITY_MAILER_HOST, 'smtp.meu-servidor.com');
  assert.equal(env(produto).SEEDGRID_SECURITY_SELF_ENTER_ENABLED, 'true');
});

test('sem mudanca de respostas nao ha diferenca; produto sem manifesto e recusado com motivo', async () => {
  const produto = await criar(B2B);
  const r = await reconfigurar({ respostas: B2B, destino: produto, boilerplates: BOILERPLATES });
  assert.ok(r.ok && r.arquivos.length === 0 && r.env.length === 0);
  rmSync(join(produto, '.seedgrid'), { recursive: true });
  const sem = await reconfigurar({ respostas: B2B, destino: produto, boilerplates: BOILERPLATES });
  assert.equal(sem.ok, false);
  assert.match((sem.erros ?? []).join(' '), /manifesto/);
});

test('o manifesto nao tem segredo e a saida da reconfiguracao nunca traz valor de variavel', async () => {
  const produto = await criar(B2B);
  const dev = env(produto);
  const segredos = Object.entries(dev).filter(([k, v]) => /PASSWORD|KEY|SECRET/.test(k) && v.length >= 8).map(([, v]) => v);
  const manifesto = readFileSync(join(produto, '.seedgrid/manifesto.json'), 'utf8');
  for (const s of segredos) assert.ok(!manifesto.includes(s), 'segredo no manifesto');
  const r = await reconfigurar({ respostas: COM_SELF_ENTER, destino: produto, boilerplates: BOILERPLATES });
  const saida = JSON.stringify(r);
  for (const s of segredos) assert.ok(!saida.includes(s), 'segredo na saida');
});
