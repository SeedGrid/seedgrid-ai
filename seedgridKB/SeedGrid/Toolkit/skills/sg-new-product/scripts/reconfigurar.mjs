// Reconfiguracao de um produto ja criado: muda as respostas (adicionar ou remover modulo, escopo, armazenamento...) e
// aplica SO a diferenca, sem sobrescrever o que o dev editou. Sem dependencias.
//
// Como funciona (tres vias, por arquivo versionado):
//   antigo = hash que o scaffold gravou no .seedgrid/manifesto.json
//   atual  = hash do arquivo agora na pasta do produto
//   novo   = hash do que o scaffold geraria com as respostas novas (gerado numa pasta temporaria, com os MESMOS segredos)
//   novo == antigo           a matriz nao mudou o arquivo: nada a fazer
//   atual == novo            ja aplicado
//   atual == antigo          o dev nao mexeu: aplica o novo (cria, atualiza ou remove)
//   senao                    CONFLITO: o arquivo fica como esta e a skill avisa
// Os arquivos de ambiente (dev.env, .env, .env.local) nao sao versionados e tem valores do dev: mescla por variavel
// (adiciona, atualiza ou remove so o que a matriz mudou e o dev nao alterou). Valores nunca saem na saida.
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, rmdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { carregar } from './matriz.mjs';
import { hashArquivo, scaffold } from './scaffold-produto.mjs';

const ARQUIVOS_ENV = ['backend/dev.env', '.env', 'frontend/.env.local', 'admin/.env.local'];
const MANIFESTO = '.seedgrid/manifesto.json';
const MARCA_RECONF = '# --- Adicionado pela reconfiguracao do sg-new-product ---';

function lerEnv(arquivo) {
  const m = new Map();
  if (!existsSync(arquivo)) return m;
  for (const l of readFileSync(arquivo, 'utf8').split(/\r?\n/)) {
    const x = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(l);
    if (x) m.set(x[1], x[2]);
  }
  return m;
}

// variavel de ambiente -> nome do segredo, para toda variavel da matriz cujo valor e exatamente ${segredo:NOME}
function variaveisDeSegredo(matriz) {
  const mapa = new Map();
  const visitar = (o) => {
    if (!o || typeof o !== 'object') return;
    for (const [k, v] of Object.entries(o)) {
      if (typeof v === 'string') {
        const x = /^\$\{segredo:([A-Z0-9_]+)\}$/.exec(v);
        if (x && /^[A-Z][A-Z0-9_]*$/.test(k)) mapa.set(k, x[1]);
      } else visitar(v);
    }
  };
  visitar(matriz);
  return mapa;
}

// Os segredos que o produto ja tem, lidos dos arquivos locais, para a nova geracao nao trocar nenhum.
function sementesDe(destino, matriz) {
  const s = {};
  const dev = lerEnv(join(destino, 'backend/dev.env'));
  for (const [chave, nome] of variaveisDeSegredo(matriz)) if (dev.has(chave)) s[nome] = dev.get(chave);
  for (const [k, v] of lerEnv(join(destino, '.env'))) if (matriz.segredos?.[k]) s[k] = v;
  return s;
}

function planoVersionados(destino, antigo, novo) {
  const plano = [];
  for (const rel of [...new Set([...Object.keys(antigo), ...Object.keys(novo)])].sort()) {
    const o = antigo[rel];
    const n = novo[rel];
    if (n === o) continue;
    const p = join(destino, rel);
    const c = existsSync(p) ? hashArquivo(p) : undefined;
    if (c === n) plano.push({ rel, acao: 'ja-aplicado' });
    else if (c === o) plano.push({ rel, acao: n === undefined ? 'remover' : o === undefined ? 'criar' : 'atualizar' });
    else if (n === undefined) plano.push({ rel, acao: 'conflito', motivo: 'a matriz tiraria este arquivo, mas ele foi alterado por voce' });
    else if (o === undefined) plano.push({ rel, acao: 'conflito', motivo: 'o arquivo ja existe com outro conteudo' });
    else plano.push({ rel, acao: 'conflito', motivo: 'o arquivo foi alterado por voce e a matriz tambem o mudou' });
  }
  return plano;
}

function planoEnv(destino, dirAntigo, dirNovo) {
  const itens = [];
  for (const rel of ARQUIVOS_ENV) {
    const atual = join(destino, rel);
    if (!existsSync(atual) || !existsSync(join(dirNovo, rel))) continue;
    const O = lerEnv(join(dirAntigo, rel));
    const N = lerEnv(join(dirNovo, rel));
    const C = lerEnv(atual);
    for (const k of [...new Set([...O.keys(), ...N.keys()])].sort()) {
      if (N.has(k)) {
        if (!C.has(k)) itens.push({ rel, chave: k, acao: 'adicionar', valor: N.get(k) });
        else if (C.get(k) !== N.get(k)) {
          if (O.has(k) && C.get(k) === O.get(k)) itens.push({ rel, chave: k, acao: 'atualizar', valor: N.get(k) });
          else itens.push({ rel, chave: k, acao: 'conflito', motivo: 'o valor foi alterado por voce' });
        }
      } else if (O.has(k) && C.has(k)) {
        if (C.get(k) === O.get(k)) itens.push({ rel, chave: k, acao: 'remover' });
        else itens.push({ rel, chave: k, acao: 'conflito', motivo: 'a matriz tiraria esta variavel, mas voce a alterou' });
      }
    }
  }
  return itens;
}

function aplicarEnv(destino, itens) {
  for (const rel of [...new Set(itens.map((i) => i.rel))]) {
    const meus = itens.filter((i) => i.rel === rel && i.acao !== 'conflito');
    if (!meus.length) continue;
    const p = join(destino, rel);
    const texto = readFileSync(p, 'utf8');
    const fim = texto.includes('\r\n') ? '\r\n' : '\n';
    let linhas = texto.split(/\r?\n/);
    const novas = [];
    for (const i of meus) {
      const re = new RegExp(`^${i.chave}=`);
      if (i.acao === 'remover') linhas = linhas.filter((l) => !re.test(l));
      else if (i.acao === 'atualizar') linhas = linhas.map((l) => (re.test(l) ? `${i.chave}=${i.valor}` : l));
      else novas.push(`${i.chave}=${i.valor}`);
    }
    while (linhas.length && linhas.at(-1) === '') linhas.pop();
    if (novas.length) linhas.push('', MARCA_RECONF, ...novas);
    writeFileSync(p, linhas.join(fim) + fim);
  }
}

function podarVazias(destino, rel) {
  let d = dirname(join(destino, rel));
  const raiz = resolve(destino);
  while (resolve(d) !== raiz && existsSync(d) && readdirSync(d).length === 0) { rmdirSync(d); d = dirname(d); }
}

export async function reconfigurar({ respostas, destino, boilerplates, dataDir, aplicar = false }) {
  const arqManifesto = join(destino, MANIFESTO);
  if (!existsSync(arqManifesto)) return { ok: false, erros: [`${MANIFESTO} nao existe: este produto foi criado antes da reconfiguracao existir (ou nao foi criado pelo sg-new-product); mude-o pelo arquiteto`] };
  const manifesto = JSON.parse(readFileSync(arqManifesto, 'utf8'));
  const { matriz } = carregar(dataDir);
  const sementes = sementesDe(destino, matriz);
  const tmp = mkdtempSync(join(tmpdir(), 'sg-reconf-'));
  try {
    const dirNovo = join(tmp, 'novo');
    const dirAntigo = join(tmp, 'antigo');
    mkdirSync(dirNovo);
    mkdirSync(dirAntigo);
    const novo = await scaffold({ respostas, destino: dirNovo, boilerplates, dataDir, sementes });
    if (!novo.ok) return { ok: false, erros: novo.erros };
    const antigoGerado = await scaffold({ respostas: manifesto.respostas, destino: dirAntigo, boilerplates, dataDir, sementes });
    if (!antigoGerado.ok) return { ok: false, erros: ['as respostas com que o produto foi criado ja nao passam na matriz atual; mude pelo arquiteto', ...antigoGerado.erros] };
    const manifestoNovo = JSON.parse(readFileSync(join(dirNovo, MANIFESTO), 'utf8'));

    const arquivos = planoVersionados(destino, manifesto.arquivos, manifestoNovo.arquivos);
    const env = planoEnv(destino, dirAntigo, dirNovo);
    const conflitos = [...arquivos.filter((a) => a.acao === 'conflito'), ...env.filter((a) => a.acao === 'conflito')];
    const resultado = {
      ok: true,
      aplicado: false,
      arquivos: arquivos.map(({ rel, acao, motivo }) => ({ arquivo: rel, acao, ...(motivo ? { motivo } : {}) })),
      env: env.map(({ rel, chave, acao, motivo }) => ({ arquivo: rel, chave, acao, ...(motivo ? { motivo } : {}) })),
      conflitos: conflitos.length,
      pendencias: novo.pendencias,
      notas: novo.notas,
    };
    if (!aplicar) return resultado;

    for (const a of arquivos) {
      const p = join(destino, a.rel);
      if (a.acao === 'criar' || a.acao === 'atualizar') {
        mkdirSync(dirname(p), { recursive: true });
        writeFileSync(p, readFileSync(join(dirNovo, a.rel)));
      } else if (a.acao === 'remover') {
        rmSync(p, { force: true });
        podarVazias(destino, a.rel);
      }
    }
    aplicarEnv(destino, env);
    const arquivosNovo = {};
    for (const rel of [...new Set([...Object.keys(manifesto.arquivos), ...Object.keys(manifestoNovo.arquivos)])].sort()) {
      const conflito = arquivos.some((a) => a.rel === rel && a.acao === 'conflito');
      const h = conflito ? manifesto.arquivos[rel] : manifestoNovo.arquivos[rel];
      if (h !== undefined) arquivosNovo[rel] = h;
    }
    writeFileSync(arqManifesto, JSON.stringify({ schema: 1, respostas, arquivos: arquivosNovo }, null, 2) + '\n');
    return { ...resultado, aplicado: true };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

export async function reconfigurarCli({ arg, aplicar, json }) {
  const arqResp = arg('respostas');
  if (!arqResp) { console.error('uso: node scaffold-produto.mjs --reconfigurar --respostas <novas.json> [--aplicar] [--json]'); return 2; }
  const destino = resolve(arg('destino') ?? process.cwd());
  const boilerplates = resolve(arg('boilerplates') ?? join(destino, '.ai', 'boilerplates'));
  let respostas;
  try { respostas = JSON.parse(readFileSync(arqResp, 'utf8')); } catch (e) { console.error(`respostas ilegiveis: ${e.message}`); return 2; }
  const out = await reconfigurar({ respostas, destino, boilerplates, aplicar });
  if (json) { console.log(JSON.stringify(out, null, 2)); return out.ok ? 0 : 1; }
  if (!out.ok) { console.error('Reconfiguracao recusada, nada foi gravado:'); for (const e of out.erros) console.error(`  - ${e}`); return 1; }
  const por = (lista, acao) => lista.filter((x) => x.acao === acao);
  console.log(out.aplicado ? 'Reconfiguracao aplicada.' : 'Simulacao: nada foi gravado. Confira e rode de novo com --aplicar.');
  for (const [acao, rotulo] of [['criar', 'Criados'], ['atualizar', 'Atualizados'], ['remover', 'Removidos']]) {
    const l = por(out.arquivos, acao);
    if (l.length) { console.log(`${rotulo} (${l.length}):`); for (const x of l.slice(0, 40)) console.log(`  ${x.arquivo}`); if (l.length > 40) console.log(`  ... e mais ${l.length - 40}`); }
  }
  for (const [acao, rotulo] of [['adicionar', 'Variaveis adicionadas'], ['atualizar', 'Variaveis atualizadas'], ['remover', 'Variaveis removidas']]) {
    const l = por(out.env, acao);
    if (l.length) { console.log(`${rotulo} (${l.length}):`); for (const x of l) console.log(`  ${x.arquivo}: ${x.chave}`); }
  }
  if (out.conflitos) {
    console.log(`CONFLITOS (${out.conflitos}) - ficam como estao, revise a mao:`);
    for (const x of [...out.arquivos, ...out.env].filter((y) => y.acao === 'conflito')) console.log(`  ${x.arquivo}${x.chave ? `: ${x.chave}` : ''} - ${x.motivo}`);
  }
  if (!out.arquivos.length && !out.env.length) console.log('Nenhuma diferenca: o produto ja esta como essas respostas pedem.');
  for (const p of out.pendencias ?? []) console.log(`  PENDENTE: ${p}`);
  return 0;
}
