#!/usr/bin/env node
// Entradas do arquivo hosts para testar o produto localmente (dominioFront, dominioAdmin e, no subdomain-tenancy,
// um tenant de exemplo, tudo -> 127.0.0.1). Edita o arquivo do sistema SO dentro de um bloco delimitado por marcas:
//   # seedgrid:<slug> inicio   ...   # seedgrid:<slug> fim
// Rodar de novo substitui o bloco (nunca duplica); --remover tira o bloco. Linhas fora do bloco e o fim de linha do
// arquivo (CRLF no Windows) ficam intactos. Sem --sim so MOSTRA o que seria gravado; sem permissao (EACCES/EPERM) imprime
// as linhas e como aplicar com elevacao. Logica pura (montar/substituir/remover sobre uma string) + camada fina de arquivo.
//   node hosts.mjs --destino <pasta do produto> [--sim] [--remover] [--arquivo <hosts de teste>] [--json]
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { posix, resolve, win32 } from 'node:path';
import { fileURLToPath } from 'node:url';

export const TENANT_EXEMPLO = 'acme';

export function caminhoHosts({ platform = process.platform, env = process.env } = {}) {
  if (platform === 'win32') return win32.join(env.SystemRoot || env.windir || `${env.SystemDrive || 'C:'}/Windows`, 'System32', 'drivers', 'etc', 'hosts');
  return posix.join('/etc', 'hosts');
}

const slugOk = (slug) => typeof slug === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(slug);
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
export const marcaInicio = (slug) => `# seedgrid:${slug} inicio`;
export const marcaFim = (slug) => `# seedgrid:${slug} fim`;

/** Hosts do produto (a partir do produto.json): front, admin (se houver) e, so no subdomain-tenancy, um tenant de exemplo. */
export function hostsDoProduto(produto) {
  const lista = [];
  if (produto.dominio) lista.push(produto.dominio);
  if (produto.dominioAdmin) lista.push(produto.dominioAdmin);
  if (produto.modelo === 'subdomain-tenancy' && produto.dominio) lista.push(`${produto.tenantsExemplo?.[0] ?? TENANT_EXEMPLO}.${produto.dominio}`);
  return [...new Set(lista)];
}

export function detectarEol(texto, platform = process.platform) {
  if (texto.includes('\r\n')) return '\r\n';
  if (texto.includes('\n')) return '\n';
  return platform === 'win32' ? '\r\n' : '\n';
}

/** Linhas do bloco (sem fim de linha), com as marcas. */
export function montarBloco(slug, hosts) {
  if (!slugOk(slug)) throw new Error(`slug invalido para as marcas do hosts: ${JSON.stringify(slug)}`);
  return [marcaInicio(slug), ...hosts.map((h) => `127.0.0.1 ${h}`), marcaFim(slug)];
}

function regexBloco(slug) {
  return new RegExp(`^${esc(marcaInicio(slug))}[ \\t]*\\r?\\n(?:[\\s\\S]*?\\r?\\n)?${esc(marcaFim(slug))}[ \\t]*(\\r?\\n|$)`, 'm');
}

function conferirMarcas(texto, slug) {
  const ini = texto.split(/\r?\n/).filter((l) => l.trim() === marcaInicio(slug)).length;
  const fim = texto.split(/\r?\n/).filter((l) => l.trim() === marcaFim(slug)).length;
  if (ini > 1 || fim > 1 || ini !== fim) throw new Error(`bloco "${marcaInicio(slug)}" incompleto ou duplicado no arquivo hosts: corrija a mao antes (nada foi alterado)`);
  return ini === 1;
}

/** Substitui o bloco do slug no lugar (ou o acrescenta ao fim). Nada fora do bloco muda. */
export function aplicarBloco(texto, slug, hosts, { eol, platform } = {}) {
  const fim = eol ?? detectarEol(texto, platform);
  const bloco = montarBloco(slug, hosts).join(fim);
  if (conferirMarcas(texto, slug)) {
    return texto.replace(regexBloco(slug), (_, term) => bloco + term);
  }
  const base = texto === '' || texto.endsWith('\n') ? texto : texto + fim;
  return base + bloco + fim;
}

/** Remove o bloco do slug (inclusive as marcas); sem bloco, devolve o texto igual. */
export function removerBloco(texto, slug) {
  if (!conferirMarcas(texto, slug)) return texto;
  return texto.replace(regexBloco(slug), '');
}

export function instrucaoElevacao({ platform = process.platform, caminho, linhas, remover = false }) {
  const como = platform === 'win32'
    ? `Abra o terminal (PowerShell ou Prompt) como administrador e rode de novo o mesmo comando com --sim, ou cole as linhas no arquivo ${caminho} com um editor aberto como administrador.`
    : `Rode de novo o mesmo comando com sudo (sudo node ... --sim --arquivo ${caminho}), ou edite ${caminho} com sudo.`;
  return [`Sem permissao para gravar ${caminho}.`, remover ? 'Para remover, apague do arquivo o bloco entre as marcas:' : 'Linhas que precisam estar no arquivo:', ...linhas.map((l) => `  ${l}`), como].join('\n');
}

/** Camada fina: le, calcula e (so com gravar) escreve o arquivo no caminho INJETADO. Nunca decide o caminho sozinha. */
export function sincronizarHosts({ caminho, slug, hosts = [], remover = false, gravar = false, platform = process.platform }) {
  const atual = existsSync(caminho) ? readFileSync(caminho, 'utf8') : '';
  const novo = remover ? removerBloco(atual, slug) : aplicarBloco(atual, slug, hosts, { platform });
  const linhas = remover ? [marcaInicio(slug), marcaFim(slug)] : montarBloco(slug, hosts);
  const res = { ok: true, caminho, linhas, mudou: novo !== atual, gravado: false, permissao: false };
  if (!gravar || !res.mudou) return res;
  try {
    writeFileSync(caminho, novo, 'utf8');
    res.gravado = true;
  } catch (e) {
    if (e?.code === 'EACCES' || e?.code === 'EPERM') {
      return { ...res, ok: false, permissao: true, instrucao: instrucaoElevacao({ platform, caminho, linhas, remover }) };
    }
    throw e;
  }
  return res;
}

const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };

function main() {
  const destino = resolve(arg('destino') ?? process.cwd());
  const arqProduto = resolve(destino, 'produto.json');
  if (!existsSync(arqProduto)) { console.error(`produto.json nao encontrado em ${destino}`); return 2; }
  const produto = JSON.parse(readFileSync(arqProduto, 'utf8'));
  const remover = process.argv.includes('--remover');
  const sim = process.argv.includes('--sim');
  const caminho = resolve(arg('arquivo') ?? caminhoHosts());
  const r = sincronizarHosts({ caminho, slug: produto.slug, hosts: hostsDoProduto(produto), remover, gravar: sim });
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); return r.ok ? 0 : 3; }
  console.log(`${remover ? 'Bloco a remover de' : 'Linhas que serao gravadas em'} ${caminho}:`);
  for (const l of r.linhas) console.log(`  ${l}`);
  if (r.permissao) { console.error(r.instrucao); return 3; }
  if (!sim) { console.log('Nada foi gravado. Confirme com o usuario e rode de novo com --sim.'); return 0; }
  console.log(r.gravado ? (remover ? 'Bloco removido.' : 'Bloco gravado (substitui o anterior, sem duplicar).') : 'Nada a mudar: o arquivo ja esta assim.');
  return 0;
}
if (process.argv[1] && fileURLToPath(import.meta.url) === resolve(process.argv[1])) process.exit(main());
