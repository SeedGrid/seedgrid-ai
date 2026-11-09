import assert from 'node:assert/strict';
import { chmodSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SKILL = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-new-product');
type Res = { ok: boolean; mudou: boolean; gravado: boolean; permissao: boolean; linhas: string[]; instrucao?: string };
const h = (await import(pathToFileURL(join(SKILL, 'scripts/hosts.mjs')).href)) as {
  caminhoHosts: (o: { platform: string; env: Record<string, string> }) => string;
  hostsDoProduto: (p: Record<string, unknown>) => string[];
  aplicarBloco: (t: string, slug: string, hosts: string[], o?: { eol?: string; platform?: string }) => string;
  removerBloco: (t: string, slug: string) => string;
  instrucaoElevacao: (o: { platform: string; caminho: string; linhas: string[] }) => string;
  sincronizarHosts: (o: { caminho: string; slug: string; hosts: string[]; remover?: boolean; gravar?: boolean; platform?: string }) => Res;
};

// Nunca o hosts real: todo teste usa um arquivo temporario injetado.
const temp = (conteudo: string) => { const c = join(mkdtempSync(join(tmpdir(), 'sg-hosts-')), 'hosts'); writeFileSync(c, conteudo, 'utf8'); return c; };
const HOSTS = ['display.seedgrid.com.br', 'display-admin.seedgrid.com.br', 'acme.display.seedgrid.com.br'];
const ORIGINAL_CRLF = '# arquivo do sistema\r\n127.0.0.1 localhost\r\n::1 localhost\r\n';

test('caminho do hosts por plataforma, sem C:\\ fixo (usa SystemRoot)', () => {
  assert.equal(h.caminhoHosts({ platform: 'win32', env: { SystemRoot: 'D:\\Win' } }), 'D:\\Win\\System32\\drivers\\etc\\hosts');
  assert.equal(h.caminhoHosts({ platform: 'linux', env: {} }), '/etc/hosts');
  assert.equal(h.caminhoHosts({ platform: 'darwin', env: {} }), '/etc/hosts');
});

test('bloco criado ao fim, com marcas, preservando CRLF e as linhas de fora', () => {
  const novo = h.aplicarBloco(ORIGINAL_CRLF, 'display', HOSTS);
  assert.ok(novo.startsWith(ORIGINAL_CRLF));
  assert.equal(novo.slice(ORIGINAL_CRLF.length), ['# seedgrid:display inicio', ...HOSTS.map((x) => `127.0.0.1 ${x}`), '# seedgrid:display fim', ''].join('\r\n'));
  assert.ok(!/(^|[^\r])\n/.test(novo), 'nenhum LF solto num arquivo CRLF');
});

test('arquivo sem fim de linha no fim recebe o separador antes do bloco; LF e preservado', () => {
  const novo = h.aplicarBloco('127.0.0.1 localhost', 'display', ['a.test'], { eol: '\n' });
  assert.equal(novo, '127.0.0.1 localhost\n# seedgrid:display inicio\n127.0.0.1 a.test\n# seedgrid:display fim\n');
  const lf = h.aplicarBloco('# x\n127.0.0.1 localhost\n', 'display', ['a.test']);
  assert.ok(!lf.includes('\r'));
});

test('rodar de novo substitui o bloco no lugar, sem duplicar e sem tocar no que vem depois', () => {
  const com = h.aplicarBloco(ORIGINAL_CRLF, 'display', HOSTS) + '10.0.0.5 outro\r\n';
  const de = h.aplicarBloco(com, 'display', ['display.seedgrid.com.br']);
  assert.equal(de.split('# seedgrid:display inicio').length - 1, 1);
  assert.equal(de, ORIGINAL_CRLF + '# seedgrid:display inicio\r\n127.0.0.1 display.seedgrid.com.br\r\n# seedgrid:display fim\r\n10.0.0.5 outro\r\n');
  assert.equal(h.aplicarBloco(de, 'display', ['display.seedgrid.com.br']), de, 'idempotente');
});

test('blocos de outros produtos ficam intactos; remover tira so o do slug', () => {
  const dois = h.aplicarBloco(h.aplicarBloco(ORIGINAL_CRLF, 'report', ['report.test']), 'display', HOSTS);
  const sem = h.removerBloco(dois, 'display');
  assert.equal(sem, h.aplicarBloco(ORIGINAL_CRLF, 'report', ['report.test']));
  assert.equal(h.removerBloco(ORIGINAL_CRLF, 'display'), ORIGINAL_CRLF, 'sem bloco, nada muda');
  assert.equal(h.removerBloco(h.aplicarBloco(ORIGINAL_CRLF, 'display', HOSTS), 'display'), ORIGINAL_CRLF);
});

test('bloco incompleto ou duplicado e recusado sem alterar nada', () => {
  assert.throws(() => h.aplicarBloco('# seedgrid:display inicio\r\n127.0.0.1 a\r\n', 'display', ['b']), /incompleto ou duplicado/);
  assert.throws(() => h.aplicarBloco('x', 'Display Ruim', ['b']), /slug invalido/);
});

test('subdomain-tenancy inclui o tenant de exemplo; login-tenancy e modular nao', () => {
  assert.deepEqual(h.hostsDoProduto({ slug: 'display', modelo: 'subdomain-tenancy', dominio: 'display.seedgrid.com.br', dominioAdmin: 'display-admin.seedgrid.com.br' }), HOSTS);
  assert.deepEqual(h.hostsDoProduto({ slug: 'report', modelo: 'login-tenancy', dominio: 'report.seedgrid.com.br', dominioAdmin: 'report-admin.seedgrid.com.br' }), ['report.seedgrid.com.br', 'report-admin.seedgrid.com.br']);
  assert.deepEqual(h.hostsDoProduto({ slug: 'm', modelo: 'modular', dominio: 'm.acme.com.br' }), ['m.acme.com.br']);
  assert.equal(h.hostsDoProduto({ slug: 'display', modelo: 'subdomain-tenancy', dominio: 'display.seedgrid.com.br', tenantsExemplo: ['lck'] }).at(-1), 'lck.display.seedgrid.com.br');
});

test('arquivo: sem gravar so mostra; com gravar escreve, preserva CRLF e remove', () => {
  const c = temp(ORIGINAL_CRLF);
  const seco = h.sincronizarHosts({ caminho: c, slug: 'display', hosts: HOSTS });
  assert.equal(seco.gravado, false);
  assert.equal(seco.mudou, true);
  assert.equal(readFileSync(c, 'utf8'), ORIGINAL_CRLF);
  const r = h.sincronizarHosts({ caminho: c, slug: 'display', hosts: HOSTS, gravar: true });
  assert.equal(r.gravado, true);
  const txt = readFileSync(c, 'utf8');
  assert.ok(txt.startsWith(ORIGINAL_CRLF) && txt.includes('127.0.0.1 acme.display.seedgrid.com.br'));
  assert.equal(h.sincronizarHosts({ caminho: c, slug: 'display', hosts: HOSTS, gravar: true }).gravado, false, 'ja esta assim: nao regrava');
  const fora = h.sincronizarHosts({ caminho: c, slug: 'display', hosts: [], remover: true, gravar: true });
  assert.equal(fora.gravado, true);
  assert.equal(readFileSync(c, 'utf8'), ORIGINAL_CRLF);
});

test('permissao negada nao falha em silencio: devolve as linhas e como aplicar com elevacao', () => {
  const c = temp(ORIGINAL_CRLF);
  chmodSync(c, 0o444);
  let podeEscrever = true;
  try { writeFileSync(c, ORIGINAL_CRLF); } catch { podeEscrever = false; }
  if (!podeEscrever) { // so onde o somente-leitura vale (nao root); em Windows o chmod vale para o atributo
    const r = h.sincronizarHosts({ caminho: c, slug: 'display', hosts: HOSTS, gravar: true });
    assert.equal(r.ok, false);
    assert.equal(r.permissao, true);
    assert.match(r.instrucao ?? '', /127\.0\.0\.1 display\.seedgrid\.com\.br/);
  }
  const win = h.instrucaoElevacao({ platform: 'win32', caminho: 'C:\\Windows\\System32\\drivers\\etc\\hosts', linhas: ['127.0.0.1 a.test'] });
  assert.match(win, /administrador/);
  assert.match(win, /127\.0\.0\.1 a\.test/);
  assert.match(h.instrucaoElevacao({ platform: 'linux', caminho: '/etc/hosts', linhas: ['127.0.0.1 a.test'] }), /sudo/);
});
