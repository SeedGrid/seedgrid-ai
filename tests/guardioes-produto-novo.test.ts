// GUARDIOES do fluxo de produto novo (T2.4). Protegem regras permanentes: se um destes testes falhar, a regra foi
// quebrada. Nao "conserte" o teste: mude o codigo, ou registre a nova decisao (ADR) e atualize o guardiao no mesmo commit.
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const TOOLKIT = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit');
const SKILL = join(TOOLKIT, 'skills/sg-new-product');
const BOILERPLATES = join(TOOLKIT, 'boilerplates');
const lib = (await import(pathToFileURL(join(SKILL, 'scripts/matriz.mjs')).href)) as {
  carregar: () => { matriz: { perguntas: { id: string; chave?: string; opcoes?: { id: string; disponivel?: boolean }[] }[] }; catalogo: unknown };
  resolver: (m: unknown, c: unknown, r: Record<string, unknown>) => { erros: string[] };
};
const { scaffold } = (await import(pathToFileURL(join(SKILL, 'scripts/scaffold-produto.mjs')).href)) as {
  scaffold: (o: { respostas: Record<string, unknown>; destino: string; boilerplates: string }) => Promise<{ ok: boolean; erros?: string[] }>;
};

const BASE = { nome: 'Portal Chaves', slug: 'portal-chaves', pacote: 'br.com.acme.portal', dominioFront: 'app.acme.com.br', dominioAdmin: 'admin.acme.com.br', emailRemetente: 'noreply@acme.com.br', emailAdmin: 'dono@acme.com.br' };
const COMPLETA = { ...BASE, extensoes: [] as string[], selfEnter: 'nao', auditoria: 'postgres', armazenamento: 'filesystem', apikeysUso: 'x', billingProvider: 'stripe', trialDias: 14, planos: 'Basico' };

function arquivos(raiz: string, dir = raiz): string[] {
  return readdirSync(dir).sort().flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? arquivos(raiz, p) : [relative(raiz, p).split(sep).join('/')];
  });
}

test('GUARDIAO determinismo da matriz: toda combinacao valida resolve sem erro e igual em duas execucoes', () => {
  const { matriz, catalogo } = lib.carregar();
  const modelos = matriz.perguntas.find((p) => p.id === 'modelo')!.opcoes!.filter((o) => o.disponivel !== false).map((o) => o.id);
  let combinacoes = 0;
  for (const modelo of modelos) for (const selfEnter of ['nao', 'sim']) for (const auditoria of ['postgres', 'mongodb']) for (const armazenamento of ['filesystem', 'minio']) {
    const extras = modelo === 'outro' ? ['security', 'audit', 'backup', 'apikeys', 'billing'] : ['exchange', 'cache'];
    const r = { ...COMPLETA, modelo, extensoes: extras, selfEnter, ...(selfEnter === 'sim' ? { selfEnterModo: 'convite' } : {}), auditoria, armazenamento };
    const a = lib.resolver(matriz, catalogo, r);
    const b = lib.resolver(matriz, catalogo, JSON.parse(JSON.stringify(r)));
    assert.deepEqual(a.erros, [], `${modelo}/${selfEnter}/${auditoria}/${armazenamento}`);
    assert.deepEqual(a, b);
    combinacoes++;
  }
  assert.equal(combinacoes, modelos.length * 8);
});

test('GUARDIAO nenhum segredo no pacote: o que o npm empacota nao tem arquivo de ambiente, chave ou backup', () => {
  const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
  const r = spawnSync(npm, ['pack', '--dry-run', '--ignore-scripts', '--json'], { cwd: process.cwd(), encoding: 'utf8', shell: process.platform === 'win32' });
  assert.equal(r.status, 0, r.stderr);
  const json = JSON.parse(r.stdout.slice(r.stdout.indexOf('['))) as { files: { path: string }[] }[];
  const caminhos = json[0]!.files.map((f) => f.path);
  assert.ok(caminhos.some((c) => c.includes('boilerplates/login-tenancy/backend/dev.env.example')), 'boilerplate deve estar no pacote');
  const proibido = /(^|\/)(dev\.env|dev_old\.env|\.env|\.env\.[^/]*|[^/]*\.pem|[^/]*\.bak|[^/]*\.key|[^/]*\.p12|[^/]*\.jks)$/i;
  const ruins = caminhos.filter((c) => proibido.test(c) && !/\.(example|sample|template)$/.test(c));
  assert.deepEqual(ruins, []);
});

test('GUARDIAO produto sem referencia ao work: nada do produto gerado cita o work, a plataforma ou caminho absoluto', async () => {
  const destino = mkdtempSync(join(tmpdir(), 'sg-guardiao-'));
  try {
    const r = await scaffold({ respostas: { ...COMPLETA, modelo: 'login-tenancy-b2b' }, destino, boilerplates: BOILERPLATES });
    assert.equal(r.ok, true, (r.erros ?? []).join('\n'));
    const texto = /\.(md|json|ya?ml|properties|xml|java|ts|tsx|mjs|js|txt|example|env|sh|tpl|html|css)$/i;
    const achados: string[] = [];
    for (const f of arquivos(destino)) {
      if (f === 'backend/dev.env' || f === '.env' || f.endsWith('.pem') || !texto.test(f) || f.includes('node_modules')) continue;
      const conteudo = readFileSync(join(destino, f), 'utf8');
      if (/seedgrid-platform-work|seedgrid-ia-dev|seedgridKB-dev|D:\\empreendedorismo|\/d\/empreendedorismo/i.test(conteudo)) achados.push(f);
    }
    assert.deepEqual(achados, []);
  } finally {
    rmSync(destino, { recursive: true, force: true });
  }
});
