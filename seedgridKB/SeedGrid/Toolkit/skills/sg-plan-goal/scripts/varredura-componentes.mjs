#!/usr/bin/env node
// Varredura de COMPONENTES SeedGrid (React e Flutter) para planos do tipo "resolver ou verificar algo em TODOS os componentes".
// A lista de componentes vem de uma FONTE UNICA e atual, lida do repositorio de codigo (nao e digitada nem copiada), para que
// componente novo apareca sozinho: o `conferir` reprova o plano enquanto algum componente da fonte nao tiver linha na tabela.
//
//   node varredura-componentes.mjs gerar     [--fonte paridade|showcase] [--plataforma <seedgrid-platform>] [--nome comp]
//                                            imprime o bloco da tabela (uma linha por componente) para colar no plano
//   node varredura-componentes.mjs atualizar <plano.md> [--fonte ...] [--plataforma ...] [--nome comp]
//                                            acrescenta ao bloco as linhas dos componentes novos, sem mexer nas ja marcadas
//   node varredura-componentes.mjs conferir  <plano.md> [--fonte ...] [--plataforma ...] [--nome comp] [--completa]
//                                            sai 1 se algum componente da fonte nao tem linha, se uma linha nao e de componente
//                                            da fonte, ou se a tabela falha nas regras da varredura (controle.mjs varredura):
//                                            [x] sem "Quem conferiu"/"Evidencia"; com --completa, qualquer marca aberta
//
// Fontes (use a que bate com o assunto do plano; as duas ja existem, nada e inventado):
//   paridade  (padrao) <plataforma>/front/seedgrid-fe-flutter/docs/paridade.json: TODOS os componentes publicos do pacote React
//             e o estado de cada um no Flutter (gerado do codigo por `tools/parity_table`; so entra no React o que existe la).
//   showcase  as PAGINAS de componente dos dois showcases: pastas `sg-*` de `front/seedgrid-fe-components/apps/showcase/src/app/
//             components` e arquivos `sg_*_page.dart` de `front/seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages`.
// `--plataforma` e a raiz do repositorio `seedgrid-platform` (ou a variavel SEEDGRID_PLATFORM_DIR).
// Colunas da tabela: Componente | React | Flutter | Feito React | Feito Flutter | Quem conferiu | Evidencia
//   React/Flutter: `sim` ou `nao` (o componente existe na plataforma); Feito <plataforma>: `[ ]`, `[~]`, `[x]` ou `n/a` (nao existe).
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { varredura } from './controle.mjs';

const chave = (nome) => nome.toLowerCase().replace(/[^a-z0-9]/g, '');
const CABECALHO = ['Componente', 'React', 'Flutter', 'Feito React', 'Feito Flutter', 'Quem conferiu', 'Evidencia'];

function pastasSg(dir, profundidade = 2) {
  const out = [];
  if (!existsSync(dir)) return out;
  for (const n of readdirSync(dir).sort()) {
    const p = join(dir, n);
    if (!statSync(p).isDirectory()) continue;
    if (/^sg-/.test(n)) out.push(n);
    else if (profundidade > 1 && !n.startsWith('.') && n !== 'node_modules') out.push(...pastasSg(p, profundidade - 1));
  }
  return out;
}

/** Lista de componentes da fonte: [{ nome, react: bool, flutter: bool }], ordenada pelo nome (determinista). */
export function lerFonte(plataforma, fonte = 'paridade') {
  const front = join(plataforma, 'front');
  let lista = [];
  if (fonte === 'paridade') {
    const arq = join(front, 'seedgrid-fe-flutter', 'docs', 'paridade.json');
    if (!existsSync(arq)) throw new Error(`fonte "paridade": nao achei ${arq}`);
    const j = JSON.parse(readFileSync(arq, 'utf8'));
    if (!Array.isArray(j.componentes)) throw new Error(`fonte "paridade": ${arq} sem a lista "componentes"`);
    lista = j.componentes.map((c) => ({ nome: c.componente, react: true, flutter: ['portado', 'parcial'].includes(c.status) }));
  } else if (fonte === 'showcase') {
    const react = pastasSg(join(front, 'seedgrid-fe-components', 'apps', 'showcase', 'src', 'app', 'components'));
    const pages = join(front, 'seedgrid-fe-flutter', 'apps', 'seedgrid_showcase', 'lib', 'pages');
    if (!react.length) throw new Error(`fonte "showcase": nenhuma pasta sg-* em ${join(front, 'seedgrid-fe-components', 'apps', 'showcase', 'src', 'app', 'components')}`);
    if (!existsSync(pages)) throw new Error(`fonte "showcase": nao achei ${pages}`);
    const flutter = readdirSync(pages).filter((n) => /^sg_.+_page\.dart$/.test(n)).map((n) => n.replace(/_page\.dart$/, '').replace(/_/g, '-'));
    const mapa = new Map();
    for (const n of react) mapa.set(chave(n), { nome: n, react: true, flutter: false });
    for (const n of flutter) {
      const k = chave(n);
      if (mapa.has(k)) mapa.get(k).flutter = true;
      else mapa.set(k, { nome: n, react: false, flutter: true });
    }
    lista = [...mapa.values()];
  } else throw new Error(`fonte desconhecida: ${fonte} (use paridade ou showcase)`);
  const vistos = new Set();
  for (const c of lista) {
    const k = chave(c.nome);
    if (vistos.has(k)) throw new Error(`componente repetido na fonte: ${c.nome}`);
    vistos.add(k);
  }
  return lista.sort((a, b) => a.nome.localeCompare(b.nome, 'en', { numeric: true }));
}

export function linhaDe(c) {
  const feito = (existe) => (existe ? '[ ]' : 'n/a');
  return `| ${c.nome} | ${c.react ? 'sim' : 'nao'} | ${c.flutter ? 'sim' : 'nao'} | ${feito(c.react)} | ${feito(c.flutter)} |  |  |`;
}

export function blocoNovo(lista, nome = 'comp') {
  return [
    `<!-- varredura:${nome}:inicio -->`,
    `| ${CABECALHO.join(' | ')} |`,
    `|${CABECALHO.map(() => '---').join('|')}|`,
    ...lista.map(linhaDe),
    `<!-- varredura:${nome}:fim -->`,
  ].join('\n');
}

const celulas = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

/** Componentes que a tabela do bloco `nome` ja tem (na ordem em que aparecem) e onde o bloco esta. */
function lerBloco(linhas, nome) {
  const ini = linhas.findIndex((l) => new RegExp(`^<!--\\s*varredura:${nome}:inicio\\s*-->\\s*$`).test(l));
  if (ini < 0) return null;
  const fim = linhas.findIndex((l, i) => i > ini && new RegExp(`^<!--\\s*varredura:${nome}:fim\\s*-->\\s*$`).test(l));
  if (fim < 0) return null;
  const itens = [];
  let ultima = ini;
  let k = 0; // linhas de tabela vistas: a 1a e o cabecalho, a 2a o separador, da 3a em diante os itens
  for (let i = ini + 1; i < fim; i++) {
    if (!linhas[i].trim().startsWith('|')) continue;
    ultima = i;
    k++;
    const c = celulas(linhas[i]);
    if (k >= 3 && c[0]) itens.push(c[0]);
  }
  return { ini, fim, ultima, itens };
}

/** Diferenca entre a fonte e a tabela: componentes sem linha e linhas que nao sao de componente da fonte. */
export function cobertura(texto, lista, nome = 'comp') {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/);
  const b = lerBloco(linhas, nome);
  if (!b) return { erros: [`varredura ${nome}: bloco "<!-- varredura:${nome}:inicio -->" ... ":fim -->" nao encontrado no plano`], faltam: [], sobram: [] };
  const naTabela = new Set(b.itens.map(chave));
  const daFonte = new Set(lista.map((c) => chave(c.nome)));
  const faltam = lista.filter((c) => !naTabela.has(chave(c.nome))).map((c) => c.nome);
  const sobram = b.itens.filter((i) => !daFonte.has(chave(i)));
  const erros = [
    ...faltam.map((n) => `varredura ${nome}: componente "${n}" esta na fonte e nao tem linha na tabela`),
    ...sobram.map((n) => `varredura ${nome}: "${n}" esta na tabela e nao e componente da fonte`),
  ];
  return { erros, faltam, sobram };
}

/** Texto do plano com as linhas dos componentes que faltam acrescentadas ao fim da tabela do bloco. */
export function atualizar(texto, lista, nome = 'comp') {
  const crlf = texto.includes('\r\n');
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/);
  const b = lerBloco(linhas, nome);
  if (!b) throw new Error(`bloco "<!-- varredura:${nome}:inicio -->" ... ":fim -->" nao encontrado no plano`);
  const tem = new Set(b.itens.map(chave));
  const novas = lista.filter((c) => !tem.has(chave(c.nome))).map(linhaDe);
  linhas.splice(b.ultima + 1, 0, ...novas);
  const out = linhas.join('\n');
  return { texto: crlf ? out.replace(/\n/g, '\r\n') : out, acrescentadas: novas.length };
}

function opt(args, nome) { const i = args.indexOf(nome); return i >= 0 ? args[i + 1] : undefined; }

function main(argv) {
  const [cmd, ...resto] = argv;
  if (!['gerar', 'atualizar', 'conferir'].includes(cmd ?? '')) {
    console.error('Uso: varredura-componentes.mjs gerar | atualizar <plano.md> | conferir <plano.md> [--completa]  [--fonte paridade|showcase] [--plataforma <seedgrid-platform>] [--nome comp]');
    return 2;
  }
  const plano = cmd === 'gerar' ? null : resto.find((a, i) => !a.startsWith('--') && !['--fonte', '--plataforma', '--nome'].includes(resto[i - 1]));
  if (cmd !== 'gerar' && !plano) { console.error('informe o plano (.md)'); return 2; }
  const plataforma = opt(resto, '--plataforma') ?? process.env.SEEDGRID_PLATFORM_DIR;
  if (!plataforma) { console.error('informe --plataforma <raiz do seedgrid-platform> (ou a variavel SEEDGRID_PLATFORM_DIR)'); return 2; }
  const nome = opt(resto, '--nome') ?? 'comp';
  let lista;
  try { lista = lerFonte(resolve(plataforma), opt(resto, '--fonte') ?? 'paridade'); } catch (e) { console.error(e.message); return 2; }
  if (cmd === 'gerar') { console.log(blocoNovo(lista, nome)); return 0; }
  let texto;
  try { texto = readFileSync(plano, 'utf8'); } catch { console.error(`nao consegui ler ${plano}`); return 2; }
  if (cmd === 'atualizar') {
    let r;
    try { r = atualizar(texto, lista, nome); } catch (e) { console.error(e.message); return 2; }
    if (r.acrescentadas) writeFileSync(plano, r.texto, 'utf8');
    console.log(`[varredura-componentes] ${r.acrescentadas} componente(s) acrescentado(s) (fonte: ${lista.length} componentes).`);
    return 0;
  }
  const cob = cobertura(texto, lista, nome);
  const v = varredura(texto, resto.includes('--completa'));
  const erros = [...cob.erros, ...v.erros.filter((e) => e.startsWith(`varredura ${nome}:`))];
  for (const e of erros) console.error('  ' + e);
  for (const b of v.blocos.filter((x) => x.nome === nome)) console.log(`varredura ${b.nome}: ${b.feitos}/${b.total} componentes conferidos (fonte: ${lista.length})`);
  console.log(`[varredura-componentes] conferir: ${erros.length} problema(s).`);
  return erros.length ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
