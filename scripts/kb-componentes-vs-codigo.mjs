#!/usr/bin/env node
// Compara as páginas de API de componentes da KB (React e Flutter) com o código real:
//   - manifesto do MCP (props do contrato, vindas do React) e generated-props.json (React);
//   - construtor Dart (extras do Flutter e props que o código tem e a KB não mostra).
// Acusa por componente: props removidas (na KB, não no código), novas (no código, não na KB),
// tipo/padrão/obrigatoriedade divergente, extra do Flutter inexistente no construtor Dart,
// extra novo do construtor sem linha na KB e legado (`disabled`, `rules`, `SgRules`).
// Sai com código 1 se houver divergência. Criado na P156.F0.T1.
//
// Uso:
//   node scripts/kb-componentes-vs-codigo.mjs [Componente] [opções]
//     --plataforma flutter|react|ambas   (padrão: ambas)
//     --manifesto <arquivo>              manifesto do Flutter (padrão: <platform>/java/seedgrid-components-mcp/flutter/seedgrid-flutter-components.manifest.json)
//     --manifesto-react <arquivo>        manifesto do React (padrão: .../seedgrid-components.manifest.json)
//     --props-react <arquivo>            generated-props.json (padrão: <platform>/front/seedgrid-fe-components/packages/seedgrid-fe-components/src/ai-meta/generated-props.json)
//     --flutter <pasta>                  raiz do seedgrid-fe-flutter (padrão: <platform>/front/seedgrid-fe-flutter)
//     --platform <pasta>                 raiz do seedgrid-platform (padrão: $SEEDGRID_PLATFORM ou ../seedgrid-platform)
//     --kb <pasta>                       pasta SeedGrid-components da KB (padrão: seedgridKB/SeedGrid/SeedGrid-components)
//     --exemplos                         também acusa SgRules/rules:/disabled: nos Exemplos*.md
//     --resumo                           só os totais por componente
//     --json                             saída em JSON
// Linha com `legado-ok` (comentário HTML) ou que explica a mudança ("removid", "substituíd") não conta como legado.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : undefined);
const VALUE_OPTS = new Set(['plataforma', 'manifesto', 'manifesto-react', 'props-react', 'flutter', 'platform', 'kb']);
const positional = argv.filter((a, i) => !a.startsWith('--') && !(i > 0 && argv[i - 1].startsWith('--') && VALUE_OPTS.has(argv[i - 1].slice(2))));
const only = positional[0];

const platform = path.resolve(opt('platform') ?? process.env.SEEDGRID_PLATFORM ?? path.join(root, '..', 'seedgrid-platform'));
const mcp = path.join(platform, 'java', 'seedgrid-components-mcp');
const fFlutterManifest = path.resolve(opt('manifesto') ?? path.join(mcp, 'flutter', 'seedgrid-flutter-components.manifest.json'));
const fReactManifest = path.resolve(opt('manifesto-react') ?? path.join(mcp, 'seedgrid-components.manifest.json'));
const flutterRoot = path.resolve(opt('flutter') ?? path.join(platform, 'front', 'seedgrid-fe-flutter'));
const fGenProps = path.resolve(opt('props-react') ?? path.join(platform, 'front', 'seedgrid-fe-components', 'packages', 'seedgrid-fe-components', 'src', 'ai-meta', 'generated-props.json'));
const kb = path.resolve(opt('kb') ?? path.join(root, 'seedgridKB', 'SeedGrid', 'SeedGrid-components'));
const plat = opt('plataforma') ?? 'ambas';
const doFlutter = plat === 'flutter' || plat === 'ambas';
const doReact = plat === 'react' || plat === 'ambas';

const lerJson = (f) => {
  if (!existsSync(f)) { console.error(`não encontrado: ${f}`); process.exit(2); }
  return JSON.parse(readFileSync(f, 'utf8').replace(/^﻿/, ''));
};
const norm = (s) => String(s ?? '').replace(/\\\|/g, '|').replace(/`/g, '').replace(/\s+/g, ' ').trim();
const normTipo = (s) => norm(s).replace(/\?$/, '').replace(/\s/g, '').replace(/^(int|double)$/, 'num');
const chave = (s) => String(s ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
const HTML_REACT = new Set(['className', 'style', 'children', 'ref', 'key']);
const cells = (l) => l.split(/(?<!\\)\|/).slice(1, -1).map((c) => c.trim());
const isLegadoOk = (l) => /legado-ok|removid|substitu[ií]d|n[ãa]o existe mais|antigo/i.test(l);
const GRUPOS_IGNORADOS = new Set(['flutter', 'fundamentos', 'modulos', 'pacotes']);

// ---------- leitura da KB ----------
function paginasApi(base, ehFlutter) {
  const out = [];
  if (!existsSync(base)) return out;
  for (const d of readdirSync(base, { withFileTypes: true })) {
    if (!d.isDirectory()) continue;
    if (!ehFlutter && GRUPOS_IGNORADOS.has(d.name)) continue;
    const f = path.join(base, d.name, 'API.md');
    if (existsSync(f)) out.push({ grupo: d.name, arquivo: f });
  }
  return out;
}

function lerSecoes(arquivo, ehFlutter) {
  const linhas = readFileSync(arquivo, 'utf8').split(/\r?\n/);
  const secoes = [];
  let cur = null;
  let emProps = false;
  linhas.forEach((l, i) => {
    const h2 = l.match(/^## (.*)$/);
    if (h2 && !/^## (Sg\w+)/.test(l)) { cur = null; emProps = false; return; }
    const h = l.match(/^## (Sg\w+)/);
    if (h) { cur = { nome: h[1], inicio: i + 1, linhas: [], props: new Map(), arquivoDart: null }; secoes.push(cur); emProps = false; return; }
    if (!cur) return;
    cur.linhas.push({ n: i + 1, t: l });
    if (/^#{1,6} /.test(l)) emProps = ehFlutter ? new RegExp(`^### Props de ${cur.nome}\\b`).test(l) : /^### Props\s*$/.test(l);
    if (!ehFlutter && /^\|\s*Prop\s*\|/.test(l)) emProps = true;
    const a = l.match(/^- Arquivo: `([^`]+)`/);
    if (a) cur.arquivoDart = a[1];
    if (!emProps) return;
    const c = cells(l);
    if (ehFlutter && c.length >= 6 && /^`[\w.]+`$/.test(c[0])) {
      cur.props.set(norm(c[0]), { tipo: c[1], padrao: norm(c[2]), obrig: /^sim/i.test(norm(c[3])), origem: norm(c[4]), n: i + 1 });
    } else if (!ehFlutter && c.length >= 5 && /^`[\w.]+`$/.test(c[0])) {
      cur.props.set(norm(c[0]), { tipo: c[1], padrao: norm(c[2]), obrig: /^sim/i.test(norm(c[3])), origem: 'React', n: i + 1 });
    }
  });
  return secoes;
}

// ---------- leitura do código Dart ----------
function achaArquivoDart(nome, relativo) {
  if (relativo) {
    const f = path.join(flutterRoot, relativo);
    if (existsSync(f)) return f;
  }
  const base = path.join(flutterRoot, 'packages', 'seedgrid_components', 'lib', 'src');
  const pilha = [base];
  const re = new RegExp(`\\bclass\\s+${nome}\\b`);
  while (pilha.length) {
    const d = pilha.pop();
    if (!existsSync(d)) continue;
    for (const e of readdirSync(d, { withFileTypes: true })) {
      const p = path.join(d, e.name);
      if (e.isDirectory()) { if (e.name !== 'generated') pilha.push(p); } else if (e.name.endsWith('.dart') && re.test(readFileSync(p, 'utf8'))) return p;
    }
  }
  return null;
}

function parametrosDart(texto, classe) {
  const m = new RegExp(`\\bclass\\s+${classe}\\b`).exec(texto);
  if (!m) return null;
  const re = new RegExp(`\\b(?:const\\s+|factory\\s+)?${classe}\\s*\\(`, 'g');
  re.lastIndex = m.index;
  const c = re.exec(texto);
  if (!c) return null;
  let i = c.index + c[0].length, prof = 1;
  const ini = i;
  while (i < texto.length && prof > 0) { const ch = texto[i]; if (ch === '(') prof++; else if (ch === ')') prof--; i++; }
  const corpo = texto.slice(ini, i - 1).replace(/\/\/.*$/gm, '');
  const nomes = new Map(); // nome -> padrão do construtor (ou null)
  const padraoDe = (nome) => {
    const r = new RegExp(`\\b(?:this|super)\\.${nome}\\s*=\\s*`).exec(corpo);
    if (!r) return null;
    let j = r.index + r[0].length, pr = 0;
    const b = j;
    while (j < corpo.length) {
      const ch = corpo[j];
      if ('([{<'.includes(ch)) pr++;
      else if (')]}>'.includes(ch)) { if (pr === 0) break; pr--; } else if (ch === ',' && pr === 0) break;
      j++;
    }
    return corpo.slice(b, j).trim();
  };
  for (const p of corpo.matchAll(/\b(?:this|super)\.(\w+)/g)) nomes.set(p[1], padraoDe(p[1]));
  // parâmetros normais (sem this.): `Tipo nome` / `required Tipo nome`
  for (const p of corpo.matchAll(/(?:^|[,{(])\s*(?:required\s+)?[\w<>?,.\s()]*?\s(\w+)\s*(?:=[^,]*)?(?=,|$|\})/g)) if (p[1] && !/^(required|final|const|this|super)$/.test(p[1]) && !nomes.has(p[1])) nomes.set(p[1], null);
  return nomes;
}

// ---------- verificação ----------
const resultado = new Map(); // componente -> { plataforma, grupo, itens: [{tipo, texto}] }
const add = (comp, plataformaNome, grupo, tipo, texto) => {
  const k = `${plataformaNome}:${comp}`;
  if (!resultado.has(k)) resultado.set(k, { componente: comp, plataforma: plataformaNome, grupo, itens: [] });
  resultado.get(k).itens.push({ tipo, texto });
};
const garante = (comp, plataformaNome, grupo) => {
  const k = `${plataformaNome}:${comp}`;
  if (!resultado.has(k)) resultado.set(k, { componente: comp, plataforma: plataformaNome, grupo, itens: [] });
};
const naKb = { flutter: new Set(), react: new Set() };

function verificaLegado(secao, ehFlutter, comp, plataformaNome, grupo) {
  for (const { n, t } of secao.linhas) {
    if (isLegadoOk(t)) continue;
    if (/\bSgRules\b/.test(t)) add(comp, plataformaNome, grupo, 'legado', `linha ${n}: SgRules`);
    const c = cells(t);
    const prop = c.length >= 5 && /^`[\w.]+`$/.test(c[0]) ? norm(c[0]) : null;
    if (prop === 'rules' && ehFlutter) add(comp, plataformaNome, grupo, 'legado', `linha ${n}: prop rules`);
    if (prop === 'disabled') add(comp, plataformaNome, grupo, 'legado', `linha ${n}: prop disabled (use enabled)`);
    if (ehFlutter && !prop) {
      if (/\bdisabled\b/.test(t)) add(comp, plataformaNome, grupo, 'legado', `linha ${n}: disabled`);
      if (/\brules\b\s*:|`rules`|\brules=/.test(t)) add(comp, plataformaNome, grupo, 'legado', `linha ${n}: rules`);
    }
  }
}

if (doFlutter) {
  const man = new Map();
  for (const c of lerJson(fFlutterManifest).components) man.set(c.exportName, (c.sgMeta?.props ?? c.props ?? []));
  for (const { grupo, arquivo } of paginasApi(path.join(kb, 'flutter'), true)) {
    for (const s of lerSecoes(arquivo, true)) {
      if (only && s.nome !== only) continue;
      naKb.flutter.add(s.nome);
      garante(s.nome, 'flutter', grupo);
      verificaLegado(s, true, s.nome, 'flutter', grupo);
      const mp = man.get(s.nome);
      const dartFile = achaArquivoDart(s.nome, s.arquivoDart);
      const dartTexto = dartFile ? readFileSync(dartFile, 'utf8') : null;
      const params = dartTexto ? parametrosDart(dartTexto, s.nome) : null;
      if (!mp) add(s.nome, 'flutter', grupo, 'sem-manifesto', 'componente da KB sem entrada no manifesto do Flutter');
      const nomesManifesto = new Set((mp ?? []).map((p) => p.name));
      for (const [nome, r] of s.props) {
        if (r.origem === 'React') {
          if (mp && !nomesManifesto.has(nome)) add(s.nome, 'flutter', grupo, 'removida', `${nome} (linha ${r.n}): na KB como prop do contrato, fora do manifesto`);
        } else if (params) {
          if (!params.has(nome)) add(s.nome, 'flutter', grupo, 'extra-inexistente', `${nome} (linha ${r.n}): extra do Flutter que o construtor Dart não tem`);
        } else if (!dartFile) add(s.nome, 'flutter', grupo, 'dart-nao-encontrado', `classe ${s.nome} não encontrada no código Dart`);
      }
      for (const p of mp ?? []) {
        const r = s.props.get(p.name);
        if (!r) { add(s.nome, 'flutter', grupo, 'nova', `${p.name} (${p.type}): no manifesto, sem linha na KB`); continue; }
        if (p.typeExact !== false && !p.values && normTipo(p.type) !== normTipo(r.tipo)) add(s.nome, 'flutter', grupo, 'tipo', `${p.name} (linha ${r.n}): manifesto ${norm(p.type)} × KB ${norm(r.tipo)}`);
        if (!!p.required !== r.obrig) add(s.nome, 'flutter', grupo, 'obrigatoria', `${p.name} (linha ${r.n}): manifesto required=${!!p.required} × KB ${r.obrig ? 'sim' : 'não'}`);
      }
      if (params) {
        // padrão: vale o do construtor Dart (o do manifesto é o do React); † = vem do contrato, não do construtor
        for (const [nome, r] of s.props) {
          if (!params.has(nome) || r.padrao.endsWith('†')) continue;
          const dd = params.get(nome), dk = r.padrao;
          if (dd !== null && chave(dd) !== chave(dk) && !chave(dk).includes(chave(dd)) && !chave(dd).includes(chave(dk))) add(s.nome, 'flutter', grupo, 'padrao', `${nome} (linha ${r.n}): construtor ${dd} × KB ${dk}`);
          if (dd === null && dk !== '—' && !/^(null|\(sem padr)/i.test(dk)) add(s.nome, 'flutter', grupo, 'padrao', `${nome} (linha ${r.n}): construtor sem padrão × KB ${dk}`);
        }
        const omitidas = new Set(['key', 'className', 'style']);
        for (const n of (mp ? params.keys() : [])) if (!s.props.has(n) && !nomesManifesto.has(n) && !omitidas.has(n)) add(s.nome, 'flutter', grupo, 'extra-nova', `${n}: parâmetro do construtor Dart sem linha na KB`);
      }
    }
  }
  if (only === undefined || !naKb.flutter.has(only)) {
    if (only === undefined) for (const n of man.keys()) if (!naKb.flutter.has(n)) { garante(n, 'flutter', '?'); add(n, 'flutter', '?', 'sem-secao', 'no manifesto do Flutter, sem seção na KB'); }
  }
}

if (doReact) {
  const gen = lerJson(fGenProps);
  const manR = new Set(lerJson(fReactManifest).components.map((c) => c.exportName));
  for (const { grupo, arquivo } of paginasApi(kb, false)) {
    for (const s of lerSecoes(arquivo, false)) {
      if (only && s.nome !== only) continue;
      naKb.react.add(s.nome);
      garante(s.nome, 'react', grupo);
      verificaLegado(s, false, s.nome, 'react', grupo);
      const gp = gen[s.nome];
      if (!gp) { if (!manR.has(s.nome)) add(s.nome, 'react', grupo, 'sem-manifesto', 'componente da KB fora do generated-props.json e do manifesto do React'); continue; }
      const nomes = new Set(gp.map((p) => p.name));
      // generated-props.json é lossy (ex.: `elevation` do SgButton existe no .tsx e não consta lá): só `disabled` é removida segura (`rules` do React continua no .tsx);
      // o resto é 'conferir' (aviso, não conta) e deve ser lido no .tsx
      for (const [nome, r] of s.props) if (!nomes.has(nome) && !HTML_REACT.has(nome)) add(s.nome, 'react', grupo, nome === 'disabled' ? 'removida' : 'conferir', `${nome} (linha ${r.n}): na KB, fora do generated-props.json${nome === 'disabled' ? '' : ' (conferir no .tsx)'}`);
      for (const p of gp) {
        const r = s.props.get(p.name);
        if (!r) { add(s.nome, 'react', grupo, 'nova', `${p.name} (${p.type}): em generated-props.json, sem linha na KB`); continue; }
        if (!!p.required !== r.obrig) add(s.nome, 'react', grupo, 'obrigatoria', `${p.name} (linha ${r.n}): generated-props required=${!!p.required} × KB ${r.obrig ? 'sim' : 'não'}`);
      }
    }
  }
}

// ---------- exemplos ----------
const exemplos = [];
if (flag('exemplos')) {
  const arqs = [];
  const varre = (d) => { if (!existsSync(d)) return; for (const e of readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) varre(p); else if (/^Exemplos.*\.md$/.test(e.name)) arqs.push(p); } };
  varre(kb);
  for (const f of arqs) {
    const ehFl = f.includes(`${path.sep}flutter${path.sep}`);
    readFileSync(f, 'utf8').split(/\r?\n/).forEach((l, i) => {
      if (isLegadoOk(l)) return;
      if (/\bSgRules\b/.test(l) || (ehFl && (/\brules\s*:/.test(l) || /\bdisabled\s*:/.test(l)))) exemplos.push(`${path.relative(kb, f)}:${i + 1}: ${l.trim().slice(0, 100)}`);
    });
  }
}

// ---------- saída ----------
const lista = [...resultado.values()].sort((a, b) => a.componente.localeCompare(b.componente) || a.plataforma.localeCompare(b.plataforma));
const comDiv = lista.filter((x) => x.itens.length);
// 'sem-manifesto' e 'conferir' são avisos (SgForm e SgFormController são só do Flutter e não estão no manifesto); não conta
const contam = (x) => x.itens.filter((i) => !['sem-manifesto', 'conferir'].includes(i.tipo)).length;
const total = comDiv.reduce((s, x) => s + contam(x), 0) + exemplos.length;
if (only && !lista.length) { console.error(`componente não encontrado nas páginas de API da KB: ${only}`); process.exit(2); }

if (flag('json')) {
  console.log(JSON.stringify({ componentes: lista.length, divergencias: total, itens: comDiv, exemplos }, null, 2));
} else {
  for (const x of lista) {
    if (!x.itens.length) { if (only) console.log(`${x.componente} (${x.plataforma}, ${x.grupo}): ok`); continue; }
    const av = x.itens.length - contam(x);
    if (!contam(x) && !only) continue; // só avisos: não lista (use o nome do componente para vê-los)
    console.log(`${x.componente} (${x.plataforma}, ${x.grupo}): ${contam(x)} divergência(s)${av ? `, ${av} aviso(s)` : ''}`);
    if (!flag('resumo')) for (const it of x.itens) console.log(`  [${it.tipo}] ${it.texto}`);
  }
  if (exemplos.length) { console.log(`Exemplos com legado: ${exemplos.length}`); if (!flag('resumo')) exemplos.forEach((e) => console.log(`  ${e}`)); }
  const comProblema = comDiv.filter((x) => contam(x)).length;
  const avisos = comDiv.reduce((s, x) => s + x.itens.length - contam(x), 0);
  console.log(`${lista.length} componente(s) conferido(s), ${comProblema} com divergência, ${total} divergência(s) no total, ${avisos} aviso(s) (conferir/sem-manifesto)`);
}
process.exit(total ? 1 : 0);
