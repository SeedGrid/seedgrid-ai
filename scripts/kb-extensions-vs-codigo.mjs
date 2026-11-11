#!/usr/bin/env node
// Conferência permanente: catálogos de Extensions (Quarkus/Java) x código do seedgrid-platform.
//
// O `kb-catalogs.mjs --check` compara o catálogo com as NOTAS; este script compara o catálogo com o CÓDIGO.
//   - propriedades: `@ConfigMapping`/`@WithName`/`@WithParentName`/Map (<nome>), `@ConfigProperty(name=...)` e
//     leituras literais (`getOptionalValue("seedgrid....")`) x linhas Quarkus do Catalogo-de-propriedades.md
//   - enums: enums Java públicos (nome e valores) x Catalogo-de-enums.md (linhas Quarkus)
// Rust e front ficam de fora (Rust adiado até a paridade com o Java; front tem outra fonte).
//
// Uso:
//   node scripts/kb-extensions-vs-codigo.mjs [--platform <pasta>] [--catalogos <pasta>] [--baseline <arquivo>]
//                                            [--so propriedades|enums] [--gerar-baseline]
//   --platform   raiz do seedgrid-platform (padrão: $SEEDGRID_PLATFORM ou ../seedgrid-platform)
//   --catalogos  pasta com Catalogo-de-propriedades.md e Catalogo-de-enums.md (padrão: seedgridKB/SeedGrid/Extensions)
//   --baseline   falsos positivos conhecidos (padrão: scripts/kb-extensions-vs-codigo.baseline.json)
//   --gerar-baseline  imprime um baseline com as divergências de hoje (revise o `motivo` de cada uma antes de gravar)
// Saída: 0 sem divergência fora do baseline; 1 com divergência; 2 entrada ausente.

import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : undefined);
const flag = (n) => argv.includes(`--${n}`);

const platform = path.resolve(opt('platform') ?? process.env.SEEDGRID_PLATFORM ?? path.join(root, '..', 'seedgrid-platform'));
const catDir = path.resolve(opt('catalogos') ?? path.join(root, 'seedgridKB', 'SeedGrid', 'Extensions'));
const baselineFile = path.resolve(opt('baseline') ?? path.join(root, 'scripts', 'kb-extensions-vs-codigo.baseline.json'));
const so = opt('so');

// ───────────────────────── Java: varredura ─────────────────────────

/** Remove comentários mantendo strings. */
function semComentarios(src) {
  let out = '';
  let i = 0;
  while (i < src.length) {
    const c = src[i];
    if (c === '"') {
      let j = i + 1;
      while (j < src.length && src[j] !== '"') j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
    } else if (c === "'") {
      let j = i + 1;
      while (j < src.length && src[j] !== "'") j += src[j] === '\\' ? 2 : 1;
      out += src.slice(i, j + 1);
      i = j + 1;
    } else if (c === '/' && src[i + 1] === '/') {
      while (i < src.length && src[i] !== '\n') i++;
    } else if (c === '/' && src[i + 1] === '*') {
      const f = src.indexOf('*/', i + 2);
      i = f < 0 ? src.length : f + 2;
      out += ' ';
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/** Quebra um corpo em declarações: { head, body|null } (body = texto entre chaves, sem elas). */
function declaracoes(text) {
  const res = [];
  let i = 0;
  let ini = 0;
  let par = 0;
  while (i < text.length) {
    const c = text[i];
    if (c === '"' || c === "'") {
      let j = i + 1;
      while (j < text.length && text[j] !== c) j += text[j] === '\\' ? 2 : 1;
      i = j + 1;
      continue;
    }
    if (c === '(') par++;
    else if (c === ')') par--;
    else if (par === 0 && c === ';') {
      res.push({ head: text.slice(ini, i).trim(), body: null });
      ini = i + 1;
    } else if (par === 0 && c === '{') {
      let depth = 1;
      let j = i + 1;
      while (j < text.length && depth > 0) {
        const d = text[j];
        if (d === '"' || d === "'") {
          let k = j + 1;
          while (k < text.length && text[k] !== d) k += text[k] === '\\' ? 2 : 1;
          j = k + 1;
          continue;
        }
        if (d === '{') depth++;
        else if (d === '}') depth--;
        j++;
      }
      res.push({ head: text.slice(ini, i).trim(), body: text.slice(i + 1, j - 1) });
      i = j;
      ini = j;
      continue;
    }
    i++;
  }
  return res;
}

const TIPO_RE = /\b(class|record|interface|enum)\s+(\w+)/;

/** Árvore de tipos de um corpo: { tipos: [{kind,name,head,publico,membros,tipos,valores}] } */
function parseCorpo(text, pai) {
  const tipos = [];
  const membros = [];
  for (const d of declaracoes(text)) {
    const sem = d.head.replace(/@\w+(?:\s*\((?:[^()"]|"(?:[^"\\]|\\.)*"|\([^()]*\))*\))?/g, ' ');
    const m = TIPO_RE.exec(sem);
    if (m && d.body !== null && !/[=]/.test(sem.slice(0, m.index))) {
      const t = { kind: m[1], name: m[2], head: d.head, pai, tipos: [], membros: [], valores: [] };
      const mods = sem.slice(0, m.index);
      t.publico = /\bpublic\b/.test(mods) || (pai && pai.kind === 'interface' && !/\bprivate\b/.test(mods));
      t.privado = /\bprivate\b/.test(mods);
      if (m[1] === 'enum') {
        const decls = declaracoes(d.body);
        // valores = primeira "declaração" até o primeiro ';' de topo; o resto são membros/tipos aninhados
        let corpo = d.body;
        let resto = '';
        let par = 0;
        let cut = -1;
        for (let i = 0; i < corpo.length; i++) {
          const c = corpo[i];
          if (c === '"') { let j = i + 1; while (j < corpo.length && corpo[j] !== '"') j += corpo[j] === '\\' ? 2 : 1; i = j; continue; }
          if (c === '(' || c === '{') par++;
          else if (c === ')' || c === '}') par--;
          else if (c === ';' && par === 0) { cut = i; break; }
        }
        const lista = cut < 0 ? corpo : corpo.slice(0, cut);
        resto = cut < 0 ? '' : corpo.slice(cut + 1);
        let p2 = 0;
        let atual = '';
        const itens = [];
        for (let i = 0; i < lista.length; i++) {
          const c = lista[i];
          if (c === '"') { let j = i + 1; while (j < lista.length && lista[j] !== '"') j += lista[j] === '\\' ? 2 : 1; atual += lista.slice(i, j + 1); i = j; continue; }
          if (c === '(' || c === '{') p2++;
          else if (c === ')' || c === '}') p2--;
          if (c === ',' && p2 === 0) { itens.push(atual); atual = ''; } else atual += c;
        }
        itens.push(atual);
        for (const it of itens) {
          const v = /^\s*(?:@\w+(?:\([^)]*\))?\s*)*([A-Z_][A-Z0-9_]*)\b/.exec(it);
          if (v) t.valores.push(v[1]);
        }
        void decls;
        const sub = parseCorpo(resto, t);
        t.tipos = sub.tipos;
      } else {
        const sub = parseCorpo(d.body, t);
        t.tipos = sub.tipos;
        t.membros = sub.membros;
      }
      tipos.push(t);
    } else if (d.body === null) {
      membros.push(d.head);
    }
  }
  return { tipos, membros };
}

function kebab(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

function achaTipo(nome, ctx, globais) {
  for (let t = ctx; t; t = t.pai) {
    const f = t.tipos.find((x) => x.name === nome);
    if (f) return f;
  }
  return globais.get(nome);
}

function propriedadesDe(tipo, prefixo, ctx, globais, out, pilha = new Set()) {
  if (pilha.has(tipo)) return;
  pilha.add(tipo);
  for (const head of tipo.membros) {
    if (/\b(default|static)\b/.test(head.replace(/@[\w.]+(?:\([^)]*\))?/g, ''))) continue;
    const mm = /^((?:@[\w.]+(?:\s*\((?:[^()"]|"(?:[^"\\]|\\.)*")*\))?\s*)*)([\w.<>,?\[\]\s]+?)\s+(\w+)\s*\(\s*\)\s*$/s.exec(head);
    if (!mm) continue;
    const [, anot, tipoRet, nomeM] = mm;
    const withName = /@(?:[\w.]+\.)?WithName\s*\(\s*"([^"]+)"/.exec(anot);
    const parent = /@(?:[\w.]+\.)?WithParentName/.test(anot);
    const unnamedKey = /@(?:[\w.]+\.)?WithUnnamedKey/.test(anot);
    const seg = parent ? '' : (withName ? withName[1] : kebab(nomeM));
    let base = seg ? (prefixo ? `${prefixo}.${seg}` : seg) : prefixo;
    let tp = tipoRet.replace(/\s+/g, ' ').trim();
    const mapa = /^(?:java\.util\.)?Map<\s*[\w.]+\s*,\s*(.+)>$/.exec(tp);
    if (mapa) {
      tp = mapa[1].trim();
      if (!unnamedKey) base += '.<nome>';
    }
    let inner = tp;
    for (let n = 0; n < 4; n++) {
      const w = /^(?:java\.util\.)?(?:Optional|List|Set|Collection)<(.+)>$/.exec(inner);
      if (!w) break;
      inner = w[1].trim();
    }
    const grupo = /^[A-Z]\w*(?:\.[A-Z]\w*)*$/.test(inner) ? achaTipo(inner.split('.').pop(), tipo, globais) : undefined;
    if (grupo && grupo.kind === 'interface') propriedadesDe(grupo, base, grupo, globais, out, pilha);
    else out.add(base);
  }
  pilha.delete(tipo);
}

function listaJava(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'target' || e.name === '.git') continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (/^(test|it)$/.test(e.name) && f.includes(`${path.sep}src${path.sep}`)) continue;
      listaJava(f, out);
    } else if (e.name.endsWith('.java')) out.push(f);
  }
  return out;
}

function listaRecursos(dir, out = []) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name === 'target' || e.name === '.git' || e.name === 'test' || e.name.startsWith('integration-tests')) continue;
    const f = path.join(dir, e.name);
    if (e.isDirectory()) listaRecursos(f, out);
    else if (/\.properties$/.test(e.name) && f.includes(`${path.sep}src${path.sep}main${path.sep}`)) out.push(f);
  }
  return out;
}

function todosTipos(arvore, acc = []) {
  for (const t of arvore) { acc.push(t); todosTipos(t.tipos, acc); }
  return acc;
}

function qualificado(t) {
  const partes = [];
  for (let x = t; x; x = x.pai) partes.unshift(x.name);
  return partes.join('.');
}

function varreCodigo() {
  const javaDir = path.join(platform, 'java');
  const props = new Map(); // nome -> Set(extension)
  const enums = []; // { ext, nome, valores, publico }
  const exts = readdirSync(javaDir).filter((d) => /^seedgrid-quarkus-(ext|lib)-/.test(d));
  for (const d of exts) {
    const ext = d.replace(/^seedgrid-quarkus-(?:ext|lib)-/, '');
    const arquivos = listaJava(path.join(javaDir, d));
    const parseados = arquivos.map((f) => {
      const src = semComentarios(readFileSync(f, 'utf8'));
      return { f, src, arvore: parseCorpo(src.replace(/^\s*(package|import)\s[^;]*;/gm, ''), null) };
    });
    for (const f of listaRecursos(path.join(javaDir, d))) {
      const txt = readFileSync(f, 'utf8');
      for (const m of txt.matchAll(/^\s*(seedgrid\.[a-z0-9.-]+)\s*=/gm)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
      for (const m of txt.matchAll(/\$\{(seedgrid\.[a-z0-9.-]+)[:}]/g)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
    }
    const globais = new Map();
    for (const p of parseados) for (const t of p.arvore.tipos) if (t.kind === 'interface') globais.set(t.name, t);
    for (const p of parseados) {
      for (const t of todosTipos(p.arvore.tipos)) {
        const cm = /@(?:[\w.]+\.)?ConfigMapping\s*\(([^)]*)\)/.exec(t.head);
        if (t.kind === 'interface' && cm) {
          const pf = /prefix\s*=\s*"([^"]*)"/.exec(cm[1]);
          if (pf) {
            const out = new Set();
            propriedadesDe(t, pf[1], t, globais, out);
            for (const n of out) if (n.startsWith('seedgrid.') && !n.endsWith('.')) (props.get(n) ?? props.set(n, new Set()).get(n)).add(ext);
          }
        }
        if (t.kind === 'enum' && !t.privado) enums.push({ ext, nome: qualificado(t), valores: t.valores, publico: !!t.publico && (!t.pai || t.pai.publico !== false) });
      }
      for (const m of p.src.matchAll(/@ConfigProperty\s*\(\s*name\s*=\s*"(seedgrid\.[^"$]+)"/g)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
      for (const m of p.src.matchAll(/static\s+final\s+String\s+\w+\s*=\s*"(seedgrid\.[a-z0-9.-]*[a-z0-9])"/g)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
      for (const m of p.src.matchAll(/\{(seedgrid\.[a-z0-9.-]+)[:}]/g)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
      for (const m of p.src.matchAll(/@IfBuild(?:Property|Profile)?\s*\(\s*name\s*=\s*"(seedgrid\.[^"$]+)"/g)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
      for (const m of p.src.matchAll(/(?:getOptionalValue|getValue|getConfigValue)\s*\(\s*"(seedgrid\.[^"$]+)"/g)) (props.get(m[1]) ?? props.set(m[1], new Set()).get(m[1])).add(ext);
    }
  }
  return { props, enums };
}

// ───────────────────────── Catálogos ─────────────────────────

const limpa = (s) => s.replace(/`/g, '').replace(/\\</g, '<').replace(/\\>/g, '>').replace(/\\\|/g, '|').trim();
const celulas = (linha) => linha.replace(/^\|/, '').replace(/\|\s*$/, '').split(/(?<!\\)\|/).map((c) => c.trim());

/** Normaliza a célula "Propriedade": tira env/emoji/[opcional], `{x}` vira `<x>` e `{a,b}` expande. */
function expande(cel) {
  const n = cel
    .replace(/\s*\(env [^)]*\)/g, '')
    .replace(/[\u{1F300}-\u{1FAFF}☀-➿]/gu, '')
    .replace(/\[\.?<[^\]]*>\]/g, '')
    .replace(/\[\.?[^\]]*\]/g, (m) => (/^\[-?\w/.test(m) || /^\[\./.test(m) ? '' : m))
    .trim();
  const alt = /^(.*?)\s+\/\s+(\.[\w.-]+)$/.exec(n); // "a.b-file / .b" = duas propriedades
  if (alt) return [alt[1], alt[1].replace(/\.[^.]+$/, '') + alt[2]];
  const m = /\{([^{}]*,[^{}]*)\}/.exec(n);
  if (m) return m[1].split(',').flatMap((v) => expande(n.replace(m[0], v.trim())));
  return [n.replace(/\{([^{}]*)\}/g, '<$1>')];
}

function catalogoPropriedades() {
  const f = path.join(catDir, 'Catalogo-de-propriedades.md');
  if (!existsSync(f)) { console.error(`não encontrado: ${f}`); process.exit(2); }
  const out = new Map(); // nome -> ext
  let emQuarkus = false;
  let ext = '';
  for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
    if (/^## /.test(l)) emQuarkus = /^## Quarkus/.test(l);
    else if (/^### /.test(l)) ext = l.slice(4).trim();
    else if (emQuarkus && l.startsWith('|')) {
      for (const nome of expande(limpa(celulas(l)[0] ?? ''))) if (/^seedgrid\./.test(nome)) out.set(nome, ext);
    }
  }
  return out;
}

function catalogoEnums() {
  const f = path.join(catDir, 'Catalogo-de-enums.md');
  if (!existsSync(f)) { console.error(`não encontrado: ${f}`); process.exit(2); }
  const out = []; // { nome, ext, valores, truncado }
  for (const l of readFileSync(f, 'utf8').split(/\r?\n/)) {
    if (!l.startsWith('|')) continue;
    const c = celulas(l);
    if (c[1] !== 'Quarkus') continue;
    const v = limpa(c[3] ?? '');
    out.push({ nome: limpa(c[0]), ext: c[2], valores: v.replace(/…|\.\.\./g, '').split(/\s*,\s*/).filter(Boolean), truncado: /…|\.\.\./.test(v) });
  }
  return out;
}

// ───────────────────────── Comparação ─────────────────────────

const norm = (n) => n.replace(/<[^>]*>/g, '*');
const globRe = (g) => new RegExp('^' + g.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.+') + '$');
const casa = (a, b) => norm(a) === norm(b) || globRe(norm(a)).test(norm(b)) || globRe(norm(b)).test(norm(a));

function baselineDe() {
  if (!existsSync(baselineFile)) return { propriedades: { codigoSemCatalogo: [], catalogoSemCodigo: [] }, enums: { codigoSemCatalogo: [], catalogoSemCodigo: [], valoresDiferem: [] } };
  return JSON.parse(readFileSync(baselineFile, 'utf8'));
}
const baseRe = (g) => new RegExp('^' + g.split('*').map((x) => x.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
const noBaseline = (lista, nome) => (lista ?? []).some((b) => baseRe(b.padrao).test(nome));

const divergencias = { propriedades: { codigoSemCatalogo: [], catalogoSemCodigo: [] }, enums: { codigoSemCatalogo: [], catalogoSemCodigo: [], valoresDiferem: [] } };

if (!existsSync(path.join(platform, 'java'))) {
  console.error(`seedgrid-platform não encontrado em ${platform} (use --platform ou SEEDGRID_PLATFORM)`);
  process.exit(2);
}
const codigo = varreCodigo();

if (so !== 'enums') {
  const cat = catalogoPropriedades();
  for (const [nome, exts] of [...codigo.props].sort()) {
    if (![...cat.keys()].some((c) => casa(c, nome))) divergencias.propriedades.codigoSemCatalogo.push(`${nome}  (código: ${[...exts].join(', ')})`.replace(/\s+\(código.*$/, '') + `\t${[...exts].join(',')}`);
  }
  for (const [nome, ext] of [...cat].sort()) {
    if (![...codigo.props.keys()].some((c) => casa(c, nome))) divergencias.propriedades.catalogoSemCodigo.push(`${nome}\t${ext}`);
  }
}

if (so !== 'propriedades') {
  const cat = catalogoEnums();
  const ultimo = (n) => n.split('.').pop();
  const igual = (a, b) => a.length === b.length && a.every((v) => b.includes(v));
  for (const e of codigo.enums.filter((x) => x.publico)) {
    const candidatos = cat.filter((c) => c.ext === e.ext && (c.nome === e.nome || ultimo(c.nome) === ultimo(e.nome)));
    if (!candidatos.length) { divergencias.enums.codigoSemCatalogo.push(`${e.ext}:${e.nome}`); continue; }
    const ok = candidatos.some((c) => (c.truncado ? c.valores.every((v) => e.valores.includes(v)) : igual(c.valores, e.valores)));
    if (!ok) divergencias.enums.valoresDiferem.push(`${e.ext}:${e.nome}\tcódigo=${e.valores.join(',')}\tcatálogo=${candidatos.map((c) => c.valores.join(',')).join(' | ')}`);
  }
  for (const c of cat) {
    if (!codigo.enums.some((e) => e.ext === c.ext && (e.nome === c.nome || ultimo(e.nome) === ultimo(c.nome)))) divergencias.enums.catalogoSemCodigo.push(`${c.ext}:${c.nome}`);
  }
}

if (flag('gerar-baseline')) {
  const mk = (l) => l.map((x) => ({ padrao: x.split('\t')[0].replace(/\s+\(código.*$/, ''), motivo: 'REVISAR' }));
  console.log(JSON.stringify({
    propriedades: { codigoSemCatalogo: mk(divergencias.propriedades.codigoSemCatalogo), catalogoSemCodigo: mk(divergencias.propriedades.catalogoSemCodigo) },
    enums: { codigoSemCatalogo: mk(divergencias.enums.codigoSemCatalogo), catalogoSemCodigo: mk(divergencias.enums.catalogoSemCodigo), valoresDiferem: mk(divergencias.enums.valoresDiferem) },
  }, null, 2));
  process.exit(0);
}

const base = baselineDe();
let total = 0;
let ignoradas = 0;
const secoes = [
  ['propriedades', 'codigoSemCatalogo', 'Propriedade no código e fora do catálogo'],
  ['propriedades', 'catalogoSemCodigo', 'Propriedade no catálogo e sem leitura no código'],
  ['enums', 'codigoSemCatalogo', 'Enum público no código e fora do catálogo'],
  ['enums', 'catalogoSemCodigo', 'Enum no catálogo e inexistente no código'],
  ['enums', 'valoresDiferem', 'Enum com valores diferentes entre código e catálogo'],
];
for (const [grupo, tipo, titulo] of secoes) {
  const lista = divergencias[grupo][tipo];
  const novas = lista.filter((x) => !noBaseline(base[grupo]?.[tipo], x.split('\t')[0].replace(/\s+\(código.*$/, '')));
  ignoradas += lista.length - novas.length;
  total += novas.length;
  console.log(`${titulo} [${grupo}]: ${novas.length}${lista.length !== novas.length ? ` (+${lista.length - novas.length} no baseline)` : ''}`);
  for (const n of novas) console.log(`  - ${n.replace(/\t/g, '  ')}`);
}
console.log(`${total} divergência(s) no total${ignoradas ? `, ${ignoradas} aceita(s) pelo baseline` : ''}`);
process.exit(total ? 1 : 0);
