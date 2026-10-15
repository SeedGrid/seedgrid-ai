#!/usr/bin/env node
// Gera os catálogos da KB a partir das PRÓPRIAS notas da vault (nenhum TSV, nenhum código-fonte):
//
//   properties  seedgridKB/SeedGrid/Extensions/Catalogo-de-propriedades.md
//   enums       seedgridKB/SeedGrid/Extensions/Catalogo-de-enums.md
//   components  seedgridKB/SeedGrid/SeedGrid-components/Indice.md
//
// Fontes (todas notas da vault):
//   properties  Extensions/<ext>/Configuracao.md (Quarkus) e Configuracao-Rust.md (Rust); front: tabelas de
//               propriedades em SeedGrid-components/modulos/*.md e pacotes/*.md. Entram só as tabelas cujo cabeçalho
//               tem `Propriedade` e `Comportamento` e que estão em seções PÚBLICAS: ficam de fora as seções de
//               frameworks/bibliotecas (quarkus.*, mp.*), testes/exemplos, aliases/obsoletas/renomeações, features,
//               configuração mínima/completa, receitas e dúvidas. Grupo = último heading ### antes da tabela (ou o
//               heading ## quando não há ###), sem a numeração. Finalidade = 1ª frase do Comportamento (≤120 chars).
//   enums       Java: Extensions/<ext>/Enums.md (cada `## Nome`/`### Nome` com tabela `Valor`; "Usado em" vem da tabela
//               Índice da própria nota). Rust: seção `## Enums` de Rust.md / Visao-geral.md (tabela de índice + a
//               seção `### Nome`, ou a coluna de variantes do índice).
//   components  SeedGrid-components/<grupo>/Visao-geral.md (tabelas de componentes/símbolos), <grupo>/API.md
//               (`## Sg...`, tabelas de funções), fundamentos/Visao-geral.md ("Mapa dos utilitários"),
//               pacotes/Visao-geral.md, modulos/fe-*.md e showcase.md.
//
// LIMITAÇÕES (derivar só o que a KB diz, sem inventar):
//   - Enums Rust: as variantes são lidas da prosa/tabelas da nota; quando a nota não lista as variantes de um enum,
//     a coluna Valores fica "—". "Usado em" Rust sem coluna própria vira "definido em <arquivo>".
//   - Índice de componentes: "Exportado" e "Resumo" vêm da coluna "Exportado"/"Para que serve" (ou "Use para") da
//     Visao-geral do grupo; símbolos que só aparecem em tabelas de função da API.md usam a coluna de comportamento
//     quando existe, senão "Função exportada de <arquivo>". Resumos são encurtados (1ª frase, ≤100 chars), então
//     podem diferir de textos curados à mão. Símbolos que existiam só no catálogo antigo, sem linha em nenhuma nota
//     (ex.: o enum interno SgMultiSelectDropdown), não aparecem. Os títulos/ordem dos grupos estão fixos neste script.
//   - Funções "lógicas" (menu-logic etc.) saem uma linha por função (o catálogo antigo as agrupava em 1 linha).
//
// Uso (a partir de seedgrid-ia, sem build):
//   node scripts/kb-catalogs.mjs [--only properties|enums|components] [--write | --check]
//     (sem flag)  imprime um resumo (contagens) do que seria gerado
//     --write     grava os catálogos (preserva o fim de linha do arquivo existente; novo arquivo = LF)
//     --check     sai com código 1 se algum arquivo existente difere do que seria gerado
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const vault = path.join(root, 'seedgridKB');
const extDir = path.join(vault, 'SeedGrid', 'Extensions');
const compDir = path.join(vault, 'SeedGrid', 'SeedGrid-components');
const GENERATOR = 'scripts/kb-catalogs.mjs';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const optIdx = args.indexOf('--only');
const only = optIdx >= 0 ? args[optIdx + 1] : null;
const KINDS = ['properties', 'enums', 'components'];
if (only && !KINDS.includes(only)) {
  console.error(`--only inválido: ${only} (use ${KINDS.join('|')})`);
  process.exit(2);
}

// ---------------------------------------------------------------- utilidades de markdown
const read = (p) => readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const exists = (p) => existsSync(p);
const dirs = (p) => readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort();
const files = (p) => readdirSync(p, { withFileTypes: true }).filter((d) => d.isFile()).map((d) => d.name).sort();
const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

function frontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n/.exec(text);
  const fm = {};
  if (m) for (const l of m[1].split('\n')) { const k = /^([\w-]+):\s*(.*)$/.exec(l); if (k) fm[k[1]] = k[2]; }
  return fm;
}

/** Quebra o texto em linhas anotadas com o heading corrente (ignora ``` ). */
function scan(text) {
  const lines = text.split('\n');
  const out = [];
  let fence = false;
  let h = { 1: '', 2: '', 3: '', 4: '' };
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*```/.test(line)) { fence = !fence; out.push({ line, fence: true, h: { ...h }, i }); continue; }
    if (fence) { out.push({ line, fence: true, h: { ...h }, i }); continue; }
    const m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line);
    if (m) {
      const lvl = m[1].length;
      if (lvl <= 4) { h[lvl] = m[2]; for (let k = lvl + 1; k <= 4; k++) h[k] = ''; }
      out.push({ line, heading: { level: lvl, text: m[2] }, h: { ...h }, i });
      continue;
    }
    out.push({ line, h: { ...h }, i });
  }
  return out;
}

function splitRow(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|') && !s.endsWith('\\|')) s = s.slice(0, -1);
  const cells = [];
  let cur = '';
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '\\' && s[i + 1] === '|') { cur += '|'; i++; continue; }
    if (s[i] === '|') { cells.push(cur.trim()); cur = ''; continue; }
    cur += s[i];
  }
  cells.push(cur.trim());
  return cells;
}

/** Tabelas da nota: { header, rows, h (headings), line }. */
function tables(text) {
  const sc = scan(text);
  const res = [];
  for (let k = 0; k < sc.length; k++) {
    const a = sc[k];
    if (a.fence || !a.line.startsWith('|')) continue;
    const next = sc[k + 1];
    if (!next || next.fence || !/^\|\s*:?-{2,}/.test(next.line)) continue;
    const t = { header: splitRow(a.line), rows: [], h: a.h, line: a.i };
    let j = k + 2;
    while (j < sc.length && !sc[j].fence && sc[j].line.startsWith('|')) { t.rows.push(splitRow(sc[j].line)); j++; }
    res.push(t);
    k = j - 1;
  }
  return res;
}

const stripMd = (s) => s
  .replace(/\[\[([^\]|]*)\|([^\]]*)\]\]/g, '$2')
  .replace(/\[\[([^\]]*)\]\]/g, '$1')
  .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
  .replace(/`/g, '').replace(/\*\*/g, '').replace(/\*(\S[^*]*)\*/g, '$1')
  .replace(/\s+/g, ' ').trim();

function trunc(s, n) {
  if (s.length <= n) return s;
  const cut = s.slice(0, n - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > n * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:(\-–—]+$/, '') + '…';
}

function firstSentence(s, n) {
  const t = stripMd(s);
  const m = /^(.+?[.!?])(?=\s+[A-ZÁÉÍÓÚÂÊÔÃÕÇ(`]|\s*$)/.exec(t);
  let r = m ? m[1] : t;
  r = r.replace(/[.;:]+$/, '');
  return trunc(r, n);
}

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/\n/g, ' ');
const rowOf = (cells) => `| ${cells.map(cell).join(' | ')} |`;
// wikilink cru; dentro de tabela o `|` é escapado por cell()/rowOf()
const link = (target, label) => `[[${target}|${label}]]`;
const colIdx = (header, re) => header.findIndex((c) => re.test(norm(stripMd(c))));

function eolOf(file) {
  if (!exists(file)) return '\n';
  return readFileSync(file, 'utf8').includes('\r\n') ? '\r\n' : '\n';
}

function maxDate(paths) {
  let best = '';
  for (const p of paths) { const d = frontmatter(read(p))['analisado-em']; if (d && d > best) best = d; }
  return best;
}

// ---------------------------------------------------------------- 1) propriedades
const EXCLUDE_SECTION = /framework|bibliotec|teste|exemplo|somente|alias|obsolet|renomea|minima|completa|receita|duvida|lacuna|cabecalho|features?\b|nao-env|nao env|struct/;
const EXCLUDE_SUB = /teste|exemplo|framework|obsolet|somente/;
const stripNum = (s) => stripMd(s).replace(/^\d+(\.\d+)*\.?\s+/, '');

function propTables(file) {
  const out = [];
  for (const t of tables(read(file))) {
    const iProp = colIdx(t.header, /^(propriedade|atributo)/);
    const iBeh = colIdx(t.header, /^(comportamento|observacao)/);
    if (iProp !== 0 || iBeh < 0) continue;
    if (/^observacao/.test(norm(stripMd(t.header[iBeh]))) && !/^atributo/.test(norm(stripMd(t.header[0])))) continue;
    if (EXCLUDE_SECTION.test(norm(stripMd(t.h[2] || '')))) continue;
    if ([t.h[3], t.h[4]].filter(Boolean).some((x) => EXCLUDE_SUB.test(norm(stripMd(x))))) continue;
    if (!t.h[2]) continue;
    const group = stripNum(t.h[4] || t.h[3] || t.h[2]);
    const iType = colIdx(t.header, /^tipo/);
    const iDef = colIdx(t.header, /^padrao/);
    const iPhase = colIdx(t.header, /^(fase|leitura)/);
    for (const r of t.rows) {
      const name = (r[0] || '').trim();
      if (!/[A-Za-z]/.test(name)) continue;
      const bare = stripMd(name).replace(/^🔒\s*/, '');
      if (/^(quarkus|mp)\./.test(bare)) continue;
      const short = (v) => { v = (v || '').trim(); return v.length > 100 ? trunc(stripMd(v), 100) : v; };
      out.push({
        name,
        group,
        type: iType >= 0 ? short(r[iType]) : '—',
        def: iDef >= 0 ? short(r[iDef]) : '—',
        phase: iPhase >= 0 ? stripMd(r[iPhase] || '—') : '—',
        purpose: firstSentence(r[iBeh] || '', 120) || '—',
      });
    }
  }
  return out;
}

function buildProperties() {
  const sections = []; // { platform, ext, rows, note }
  const ORDER = { Quarkus: 0, Rust: 1, Front: 2 };
  const sources = [];
  for (const ext of dirs(extDir)) {
    const q = path.join(extDir, ext, 'Configuracao.md');
    const r = path.join(extDir, ext, 'Configuracao-Rust.md');
    if (exists(q)) { sections.push({ platform: 'Quarkus', ext, rows: propTables(q), note: `SeedGrid/Extensions/${ext}/Configuracao`, label: `${ext}/Configuracao` }); sources.push(q); }
    if (exists(r)) { sections.push({ platform: 'Rust', ext, rows: propTables(r), note: `SeedGrid/Extensions/${ext}/Configuracao-Rust`, label: `${ext}/Configuracao-Rust` }); sources.push(r); }
  }
  for (const sub of ['modulos', 'pacotes']) {
    for (const f of files(path.join(compDir, sub))) {
      if (!f.endsWith('.md') || f === 'Visao-geral.md') continue;
      const p = path.join(compDir, sub, f);
      const rows = propTables(p);
      const base = f.replace(/\.md$/, '');
      if (rows.length) sections.push({ platform: 'Front', ext: base, rows, note: `SeedGrid/SeedGrid-components/${sub}/${base}`, label: `${sub}/${base}` });
      sources.push(p);
    }
  }
  const live = sections.filter((s) => s.rows.length).sort((a, b) => ORDER[a.platform] - ORDER[b.platform] || a.ext.localeCompare(b.ext));
  const total = live.reduce((n, s) => n + s.rows.length, 0);
  const L = [];
  L.push('---', 'tags: [seedgrid, extension, catalogo, configuracao]', `analisado-em: ${maxDate(sources)}`,
    `gerado-por: ${GENERATOR} --only properties`, 'gerado-de: tabelas de propriedades das notas Configuracao, Configuracao-Rust e módulos/pacotes front desta vault', '---', '');
  L.push('# Catálogo de propriedades', '');
  L.push('Tabela geral de **todas as propriedades públicas** de configuração documentadas nas notas `Configuracao` das extensions/libraries (Quarkus), `Configuracao-Rust` dos crates (Rust, variáveis de ambiente e campos de config) e nos módulos/pacotes front. Propriedades de teste e de frameworks (`quarkus.*`, `mp.*`), aliases/obsoletas e exemplos **não** entram aqui — estão nas respectivas notas.', '');
  L.push('- Esta nota é **gerada** (`node scripts/kb-catalogs.mjs --only properties --write`) a partir das próprias notas; não edite à mão — corrija a nota de origem e regenere.');
  L.push('- Detalhes (valores aceitos, obrigatoriedade, relações, origem no código): siga o link da coluna **Nota**.');
  L.push('- "Padrão" `—` = sem valor padrão (ou coluna ausente na tabela de origem); "não confirmado" = não foi possível confirmar no código.');
  L.push('- 🔒 = sensível. "Fase" (Quarkus) / "Leitura" (Rust, front: "Fase") indica quando a propriedade é lida.');
  L.push('- Dica: no Obsidian use `Ctrl+F` nesta nota para achar uma propriedade por parte do nome.', '');
  L.push('## Contagem', '', '| Plataforma | Extension | Propriedades |', '|---|---|---|');
  for (const s of live) L.push(`| ${s.platform} | ${s.ext} | ${s.rows.length} |`);
  L.push(`| **Total** | | **${total}** |`, '');
  const titles = { Quarkus: '## Quarkus (Java) — `application.properties`', Rust: '## Rust — variáveis de ambiente e structs de config', Front: '## Front-end — variáveis de ambiente / config dos módulos' };
  for (const platform of ['Quarkus', 'Rust', 'Front']) {
    const ss = live.filter((s) => s.platform === platform);
    if (!ss.length) continue;
    L.push(titles[platform], '');
    for (const s of ss) {
      L.push(`### ${s.ext}`, '');
      L.push(`| Propriedade | Grupo | Tipo | Padrão | ${platform === 'Rust' ? 'Leitura' : 'Fase'} | Finalidade | Nota |`, '|---|---|---|---|---|---|---|');
      for (const r of s.rows) L.push(rowOf([r.name, r.group, r.type, r.def, r.phase, r.purpose, link(s.note, s.label)]));
      L.push('');
    }
  }
  return { text: L.join('\n').replace(/\n+$/, '\n'), summary: `${total} propriedades em ${live.length} seções (${['Quarkus', 'Rust', 'Front'].map((p) => `${p}: ${live.filter((s) => s.platform === p).reduce((n, s) => n + s.rows.length, 0)}`).join(', ')})` };
}

// ---------------------------------------------------------------- 2) enums
const IDENT = /^[A-Za-z][A-Za-z0-9]*$/;
const STOP = new Set(['Serialize', 'Deserialize', 'Option', 'Some', 'Err', 'Result', 'Vec', 'Arc', 'Box', 'Self', 'Debug', 'Clone', 'FromStr', 'PartialEq', 'Eq']);

/** Tokens entre crases (em ordem), ignorando os que vêm logo depois de "→" (grafia textual da variante). */
function variantTokens(text) {
  text = text
    .replace(/`([A-Za-z]+)`\s*(?:\.\.\.|…)\s*`([A-Za-z]+)`/g, '`$1`, `…`, `$2`')
    .replace(/ \((?![^)]*`(?:[A-Z]{1,3}(?: [A-Z]{1,3})+|…)`)[^)]*\)/g, '');
  const out = [];
  const re = /(→\s*)?`([^`]+)`/g;
  let m;
  while ((m = re.exec(text))) {
    if (m[1]) continue;
    let tok = m[2].trim();
    if (/^[A-Z]{1,3}( [A-Z]{1,3})+$/.test(tok)) { out.push(...tok.split(' ')); continue; }
    tok = tok.replace(/[({<].*$/, '').trim();
    if (tok === '…') { out.push(tok); continue; }
    if (!/^[A-Z]/.test(tok) || !IDENT.test(tok) || STOP.has(tok)) continue;
    out.push(tok);
  }
  const seen = new Set();
  return out.filter((t) => { const k = t.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; });
}

const sentenceOf = (s) => { s = s.replace(/\.\.\./g, '…'); const m = /^(.*?[.!?])(\s+[A-ZÁÉÍÓÚ(`*]|$)/.exec(s); return m ? m[1] : s; };

function sectionBody(sc, pred) {
  // linhas (não-fence) do primeiro heading que satisfaz pred até o próximo heading de nível <= ao dele
  for (let k = 0; k < sc.length; k++) {
    const e = sc[k];
    if (!e.heading || !pred(e.heading)) continue;
    const body = [];
    let j = k + 1;
    while (j < sc.length && !(sc[j].heading && sc[j].heading.level <= e.heading.level)) { body.push(sc[j]); j++; }
    return { heading: e.heading, body };
  }
  return null;
}

function buildEnums() {
  const rows = []; // { name, platform, ext, values, used, anchorNote, anchor }
  const sources = [];
  for (const ext of dirs(extDir)) {
    // ---- Java
    const jf = path.join(extDir, ext, 'Enums.md');
    if (exists(jf)) {
      sources.push(jf);
      const text = read(jf);
      const sc = scan(text);
      const idxRows = new Map();
      for (const t of tables(text)) {
        if (!/^enum$/.test(norm(stripMd(t.header[0] || '')))) continue;
        const iUsed = colIdx(t.header, /^usado em/);
        for (const r of t.rows) {
          const nm = stripMd(r[0] || '').replace(/^#/, '');
          if (!nm) continue;
          idxRows.set(nm, iUsed >= 0 ? r[iUsed] : '');
        }
      }
      for (let k = 0; k < sc.length; k++) {
        const e = sc[k];
        if (!e.heading || e.heading.level < 2 || e.heading.level > 3) continue;
        const name = stripMd(e.heading.text);
        if (!/^[A-Z][A-Za-z0-9_]*(\.[A-Z][A-Za-z0-9_]*)*$/.test(name)) continue;
        // 1ª tabela "Valor" antes do próximo heading
        let j = k + 1;
        const buf = [];
        while (j < sc.length && !sc[j].heading) { buf.push(sc[j]); j++; }
        const tb = tables(buf.map((b) => b.line).join('\n')).find((t) => /^valor/.test(norm(stripMd(t.header[0] || ''))));
        if (!tb) continue;
        const values = tb.rows.map((r) => stripMd(r[0] || '').replace(/\s*\(.*$/, '')).filter((v) => v && v !== '—');
        if (!values.length) continue;
        let display = name;
        let used = idxRows.get(name);
        if (used === undefined) {
          for (const [k2, v] of idxRows) if (k2.endsWith('.' + name)) { used = v; display = k2; break; }
        }
        rows.push({ name: display, platform: 'Quarkus', ext, values: values.join(', '), used: shortUsed(used), note: link(`SeedGrid/Extensions/${ext}/Enums#${name}`, `${ext}/${display}`) });
      }
    }
    // ---- Rust (seção "## Enums" de Rust.md ou Visao-geral.md)
    for (const rf of ['Rust.md', 'Visao-geral.md']) {
      const p = path.join(extDir, ext, rf);
      if (!exists(p)) continue;
      const text = read(p);
      const sc = scan(text);
      const sec = sectionBody(sc, (h) => h.level === 2 && /^Enums$/.test(stripMd(h.text)));
      if (!sec) continue;
      sources.push(p);
      // seções ### dentro de "## Enums"
      const subSections = [];
      let curSub = null;
      for (const b of sec.body) {
        if (b.heading && b.heading.level === 3) { curSub = { title: stripMd(b.heading.text), lines: [] }; subSections.push(curSub); continue; }
        if (b.heading) { curSub = null; continue; }
        if (curSub) curSub.lines.push(b.line);
      }
      const noteBase = `SeedGrid/Extensions/${ext}/${rf.replace('.md', '')}`;
      // índice: tabelas antes do 1º ### e fora de "Internos"
      const firstSubAt = sec.body.findIndex((b) => b.heading && b.heading.level === 3);
      const head = (firstSubAt < 0 ? sec.body : sec.body.slice(0, firstSubAt)).map((b) => b.line).join('\n');
      for (const t of tables(head)) {
        if (!/^enum$/.test(norm(stripMd(t.header[0] || '')))) continue;
        const iUsed = colIdx(t.header, /^usado em/);
        const iFile = colIdx(t.header, /^arquivo/);
        const iVar = colIdx(t.header, /^variantes/);
        for (const r of t.rows) {
          const nameCell = r[0] || '';
          const toks = [...nameCell.matchAll(/`([^`]+)`/g)].map((m) => m[1]);
          const names = [];
          const inline = [];
          if (/^`[^`]+`(\s*,\s*`[^`]+`)+$/.test(nameCell.trim())) names.push(...toks);
          else { names.push(toks[0]); inline.push(...toks.slice(1)); }
          for (const rawName of names) {
            const name = rawName.replace(/<.*$/, '').trim();
            if (!IDENT.test(name)) continue;
            let values = [];
            if (iVar >= 0) values = variantTokens((r[iVar] || '').split(/ — |; /)[0]);
            if (!values.length && inline.length) values = variantTokens(inline.map((x) => '`' + x + '`').join(', '));
            if (!values.length) values = rustValues(name, subSections, sec.body.map((b) => b.line));
            const used = iUsed >= 0 ? shortUsed(r[iUsed]) : (iFile >= 0 && r[iFile] && !/^idem$/i.test(r[iFile].trim()) ? `definido em ${stripMd(r[iFile])}` : '—');
            const sub = subSections.find((s) => subMatches(s.title, name));
            const anchor = sub ? sub.title : 'Enums';
            rows.push({ name, platform: 'Rust', ext, values: values.length ? values.join(', ') : '—', used, note: link(`${noteBase}#${anchor}`, `${ext}/${name}`) });
          }
        }
      }
    }
  }
  // Rust sem "Usado em" próprio: reaproveita o do enum Java homônimo da mesma extension (mesma KB)
  for (const r of rows) {
    if (r.platform !== 'Rust' || r.used !== '—') continue;
    const j = rows.find((x) => x.platform === 'Quarkus' && x.ext === r.ext && (x.name === r.name || x.name.endsWith('.' + r.name)));
    if (j && j.used !== '—') r.used = j.used;
  }
  const plat = (r) => (r.platform === 'Quarkus' ? 0 : 1);
  rows.sort((a, b) => a.ext.localeCompare(b.ext) || plat(a) - plat(b) || a.name.localeCompare(b.name));
  // ordem estável dentro de (ext, plataforma): ordem de leitura (sort do Array é estável)
  const counts = new Map();
  for (const r of rows) counts.set(r.ext, (counts.get(r.ext) || 0) + 1);
  const L = [];
  L.push('---', 'tags: [seedgrid, enum, catalogo]', `analisado-em: ${maxDate(sources)}`, `gerado-por: ${GENERATOR} --only enums`, 'gerado-de: notas Enums (Java) e seção Enums das notas Rust/Visao-geral desta vault', '---', '');
  L.push('# Catálogo de enums', '');
  L.push('Todos os enums públicos documentados, por extension. Cada linha leva à seção do enum na nota `Enums` (Java) ou `Rust`/`Visao-geral` (seção "Enums"), com significado de cada valor, onde é tratado, serialização (JSON, config, banco) e divergências Java × Rust. Valores que existem no enum mas nenhum código trata estão marcados nas notas.', '');
  L.push('Como ler: **Quarkus** = enum Java; **Rust** = enum do crate equivalente (variantes e grafia de serde podem diferir — veja a nota). Esta nota é **gerada** (`node scripts/kb-catalogs.mjs --only enums --write`) a partir das próprias notas; "—" em Valores = a nota não lista as variantes.', '');
  L.push('| Enum | Plataforma | Extension | Valores | Usado em | Nota |', '|---|---|---|---|---|---|');
  for (const r of rows) L.push(rowOf([`\`${r.name}\``, r.platform, r.ext, r.values, r.used, r.note]));
  L.push('', '## Contagem por extension', '', '| Extension | Enums |', '|---|---|');
  for (const [e, n] of [...counts].sort((a, b) => a[0].localeCompare(b[0]))) L.push(`| ${e} | ${n} |`);
  L.push(`| **Total** | **${rows.length}** |`, '');
  const java = rows.filter((r) => r.platform === 'Quarkus').length;
  const noVals = rows.filter((r) => r.values === '—').length;
  return { text: L.join('\n'), summary: `${rows.length} enums (Quarkus: ${java}, Rust: ${rows.length - java}); ${noVals} sem variantes listadas` };
}

function shortUsed(v) {
  if (!v) return '—';
  let s = stripMd(v);
  s = s.replace(/\s*;\s*/g, '; ');
  return trunc(s, 140) || '—';
}

function subMatches(title, name) {
  const t = title.replace(/\s*\(.*\)\s*$/, '');
  return t === name || t.split(/\s*(?:\/|,|\be\b)\s*/).includes(name);
}

function rustValues(name, subs, allLines) {
  const mine = subs.filter((s) => subMatches(s.title, name));
  const sections = mine.length ? mine : subs;
  // 1) tabela com 1ª coluna Variante/Valor em seção própria
  for (const s of mine) {
    const tb = tables(s.lines.join('\n')).find((t) => /^(variante|valor)/.test(norm(stripMd(t.header[0] || ''))));
    if (tb) { const v = variantTokens(tb.rows.map((r) => (r[0] || '').replace(/[({].*$/, '').trim()).join(', ')); if (v.length) return v; }
  }
  // 2) linha que nomeia o enum: "`Name` = ...", "- `Name`: ...", "- **Name**: ..."
  const pat = new RegExp('(?:\\*\\*' + name + '\\*\\*|`' + name + '`)\\s*(?::|=)\\s*(.*)$');
  for (const s of [...sections, { lines: allLines }]) {
    for (const ln of s.lines) {
      const m = pat.exec(ln);
      if (m) { const v = variantTokens(sentenceOf(m[1])); if (v.length) return v; }
    }
  }
  // 3) 1º parágrafo da seção própria
  for (const s of mine) {
    const para = [];
    for (const ln of s.lines) {
      if (!ln.trim()) { if (para.length) break; continue; }
      if (ln.startsWith('|') || ln.startsWith('```')) { if (para.length) break; continue; }
      para.push(ln.replace(/^\s*[-*]\s+/, ''));
    }
    const v = variantTokens(sentenceOf(para.join(' ')));
    if (v.length) return v;
  }
  return [];
}

// ---------------------------------------------------------------- 3) componentes
const GROUPS = [
  ['inputs-texto', 'Inputs de texto e documentos'],
  ['inputs-selecao', 'Inputs de seleção e valores'],
  ['datatable', 'Tabela de dados'],
  ['editor', 'Editor de texto rico'],
  ['buttons', 'Botões'],
  ['feedback-e-exibicao', 'Feedback e exibição'],
  ['layout', 'Layout e containers'],
  ['navegacao-e-overlay', 'Navegação, overlay e wizard'],
  ['gadgets', 'Gadgets (relógio, calendário, gauges, QR)'],
  ['digits', 'Dígitos animados'],
  ['providers', 'Providers (ambiente/persistência e realtime)'],
  ['fundamentos', 'Fundamentos do @seedgrid/fe-components'],
  ['pacotes', 'Pacotes de apoio'],
  ['modulos', 'Módulos de tela @seedgrid/fe-*'],
  ['showcase', 'Showcase'],
];
const SYMBOL_HEAD = /^(componente|simbolo|funcao|hook|arquivo|use para|nome)/;
const SG = '[[SeedGrid/SeedGrid-components/';

const summ = (s) => firstSentence(s || '', 100) || '—';

function nameTokens(c) {
  const t = c.trim();
  const toks = [...t.matchAll(/`([^`]+)`/g)].map((m) => m[1].trim());
  if (!toks.length) return [stripMd(t)].filter(Boolean);
  const rest = t.replace(/`[^`]+`/g, '').replace(/\([^)]*\)/g, '').replace(/[\s,+]/g, '');
  if (rest === '') return toks.flatMap((x) => (/^\w+\(s\)$/.test(x) ? [x.replace('(s)', ''), x.replace('(s)', 's')] : [x]));
  return [stripMd(t.replace(/\s*\(.*?\)\s*$/, ''))];
}

function groupSymbols(g) {
  const dirp = path.join(compDir, g);
  const vg = path.join(dirp, 'Visao-geral.md');
  const api = path.join(dirp, 'API.md');
  const syms = new Map(); // name -> {exp, summary}
  const add = (name, exp, summary) => {
    name = name.trim();
    if (!name || syms.has(name)) return;
    syms.set(name, { exp, summary });
  };
  const apiText = exists(api) ? read(api) : '';
  const vgText = exists(vg) ? read(vg) : '';
  // (a) tabelas da Visao-geral
  for (const t of tables(vgText)) {
    const i0 = norm(stripMd(t.header[0] || ''));
    if (!/^(componente|simbolo)/.test(i0)) continue;
    const iExp = colIdx(t.header, /^exportado/);
    const iSum = colIdx(t.header, /^(para que serve|use para)/);
    if (iSum < 0 && iExp < 0) continue;
    if (colIdx(t.header, /^origem/) >= 0 && iSum < 0) continue; // tabela "Símbolo | Origem | Exportado": tratada em (c)
    for (const r of t.rows) {
      const expRaw = iExp >= 0 ? norm(stripMd(r[iExp] || '')) : 'sim';
      const exp = expRaw.startsWith('nao') ? 'não' : 'sim';
      const sum = iSum >= 0 ? r[iSum] : '';
      const toks = nameTokens(r[0] || '').filter((x) => !/^tipos?\b/i.test(x));
      for (const n of toks) add(n, exp, summ(sum));
    }
  }
  // (b) `## Sg*` na API (componentes sem linha na Visao-geral)
  for (const e of scan(apiText)) {
    if (!e.heading || e.heading.level !== 2) continue;
    const m = e.heading.text.match(/^`?(Sg[A-Za-z0-9]+)`?(\s|$)/);
    if (m) add(m[1], 'sim', '—');
  }
  // (c) tabelas de função da API (cabeçalho "Função")
  for (const t of tables(apiText)) {
    if (norm(stripMd(t.header[0] || '')) !== 'funcao') continue;
    const hs = [t.h[2], t.h[3], t.h[4]].filter(Boolean).join(' ');
    if (/intern|nao exportad/.test(norm(hs))) continue;
    const iBeh = colIdx(t.header, /^(comportamento|o que faz|descricao)/);
    const src = (t.h[3] || t.h[2] || '').match(/`(src\/[^`]+)`/);
    for (const r of t.rows) {
      const n = stripMd(r[0] || '');
      if (!IDENT.test(n)) continue;
      const sum = iBeh >= 0 ? summ(r[iBeh]) : `Função exportada${src ? ' de ' + src[1] : ''}`;
      add(n, 'sim', sum);
    }
  }
  // (d) funções/objetos imperativos documentados em heading próprio (ex.: ### `toast`) e listas "Funções exportadas"
  const scA = scan(apiText);
  for (let k = 0; k < scA.length; k++) {
    const e = scA[k];
    if (!e.heading || e.heading.level < 2 || e.heading.level > 3) continue;
    const hm = /^`([a-z][A-Za-z0-9]*)`(\s*\(.*\))?$/.exec(e.heading.text.trim());
    if (hm) add(hm[1], 'sim', summ(e.heading.level === 3 && e.h[2] ? e.h[2] : e.heading.text));
    if (/^funcoes( utilitarias)? exportadas?$/.test(norm(stripMd(e.heading.text)))) {
      for (let j = k + 1; j < scA.length && !scA[j].heading; j++) {
        const bm = /^- `([A-Za-z_]\w*)[^`]*`\s*(?:—|-)\s*(.*)$/.exec(scA[j].line);
        if (bm) add(bm[1], 'sim', summ(bm[2]));
      }
    }
  }
  // fallback: grupos de 1 componente sem tabela (datatable/editor): import da API
  if (!syms.size) {
    const m = /import\s*\{([^}]*)\}\s*from\s*"@seedgrid\/fe-components"/.exec(apiText);
    if (m) for (const id of m[1].split(',').map((x) => x.trim()).filter((x) => x && !x.startsWith('type '))) add(id, 'sim', '—');
  }
  // completa resumos faltantes com o 1º parágrafo da Visao-geral (apenas se o grupo tem 1 símbolo)
  const missing = [...syms.values()].filter((v) => v.summary === '—');
  if (missing.length) {
    const para = firstParagraph(vgText);
    for (const v of missing) {
      if (syms.size === 1 && para) v.summary = summ(para);
    }
  }
  return syms;
}

function firstParagraph(text) {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
  const sc = scan(body);
  let seenH1 = false;
  const para = [];
  for (const e of sc) {
    if (e.fence) continue;
    if (e.heading) { if (e.heading.level === 1) { seenH1 = true; continue; } if (seenH1 && !para.length) { if (e.heading.level === 2) continue; } if (para.length) break; continue; }
    if (!seenH1) continue;
    const l = e.line.trim();
    if (!l) { if (para.length) break; continue; }
    if (l.startsWith('|') || l.startsWith('>') || l.startsWith('- ') || l.startsWith('```')) { if (para.length) break; continue; }
    if (!para.length && (/^(Relacionados|Backend|Voltar|Veja)\b/.test(l) || (l.includes('[[') && l.replace(/\[\[[^\]]*\]\]/g, '').replace(/[\s·,.:;()-]/g, '').length < 40))) continue;
    para.push(l);
  }
  return para.join(' ');
}

function buildComponents() {
  const fundVG = path.join(compDir, 'fundamentos', 'Visao-geral.md');
  const fm = frontmatter(read(fundVG));
  const fundText = read(fundVG);
  const verRow = tables(fundText).flatMap((t) => t.rows).find((r) => /^vers/i.test(norm(stripMd(r[0] || ''))));
  const version = verRow ? stripMd(verRow[1]) : '';
  const groupsOut = [];
  const sources = [fundVG];
  for (const [g, title] of GROUPS) {
    const rows = [];
    const dirp = path.join(compDir, g);
    const noteLinks = [];
    if (g === 'showcase') {
      const p = path.join(compDir, 'showcase.md');
      sources.push(p);
      rows.push({ name: 'apps/showcase', exp: 'não', sum: summ(firstParagraph(read(p))), note: link('SeedGrid/SeedGrid-components/showcase', 'showcase') });
      noteLinks.push(link('SeedGrid/SeedGrid-components/showcase', 'Showcase'));
    } else if (g === 'fundamentos') {
      for (const t of tables(fundText)) {
        if (norm(stripMd(t.header[0] || '')) !== 'arquivo') continue;
        const iExp = colIdx(t.header, /^exportado/);
        const iRole = colIdx(t.header, /^papel/);
        for (const r of t.rows) {
          const n = stripMd(r[0] || '').replace(/^src\//, '');
          const expRaw = norm(stripMd(r[iExp] || ''));
          rows.push({ name: n, exp: expRaw.startsWith('nao') ? 'não' : 'sim', sum: summ(r[iRole]), note: link('SeedGrid/SeedGrid-components/fundamentos/API', 'API') });
        }
      }
      for (const f of ['Visao-geral', 'API', 'Exemplos']) if (exists(path.join(dirp, f + '.md'))) sources.push(path.join(dirp, f + '.md'));
      noteLinks.push(...noteSet(g));
    } else if (g === 'pacotes') {
      const p = path.join(dirp, 'Visao-geral.md');
      sources.push(p);
      for (const t of tables(read(p))) {
        if (norm(stripMd(t.header[0] || '')) !== 'pacote') continue;
        const iRole = colIdx(t.header, /^papel/);
        const iNote = colIdx(t.header, /^nota/);
        for (const r of t.rows) {
          const nm = stripMd(r[0] || '');
          const noteCell = r[iNote] || '';
          if (/fundamentos\//.test(noteCell)) continue; // @seedgrid/fe-components = grupo Fundamentos
          const mm = /\[\[(SeedGrid\/SeedGrid-components\/pacotes\/[^|\]\\]+)/.exec(noteCell);
          rows.push({ name: nm, exp: 'sim', sum: summ(r[iRole]), note: mm ? link(mm[1], mm[1].split('/').pop()) : link('SeedGrid/SeedGrid-components/pacotes/Visao-geral', 'Visao-geral') });
        }
      }
      noteLinks.push(...noteSet(g));
    } else if (g === 'modulos') {
      for (const f of files(dirp)) {
        if (!f.endsWith('.md') || f === 'Visao-geral.md') continue;
        const p = path.join(dirp, f);
        sources.push(p);
        const base = f.replace(/\.md$/, '');
        const text = read(p);
        const h1 = (/^# (.+)$/m.exec(text) || [, '@seedgrid/' + base])[1];
        let para = stripMd(firstParagraph(text));
        para = para.replace(/^Módulo front (?:de|do|da) [^:]{1,60}:\s*/, '');
        para = para.charAt(0).toUpperCase() + para.slice(1);
        rows.push({ name: stripMd(h1), exp: 'sim', sum: summ(para), note: link(`SeedGrid/SeedGrid-components/modulos/${base}`, base) });
      }
      sources.push(path.join(dirp, 'Visao-geral.md'));
      noteLinks.push(...noteSet(g));
    } else {
      for (const f of ['Visao-geral', 'API', 'Exemplos']) if (exists(path.join(dirp, f + '.md'))) sources.push(path.join(dirp, f + '.md'));
      const syms = groupSymbols(g);
      for (const [n, v] of syms) rows.push({ name: n, exp: v.exp, sum: v.summary, note: link(`SeedGrid/SeedGrid-components/${g}/API`, 'API') });
      noteLinks.push(...noteSet(g));
    }
    const sg = rows.filter((r) => /^Sg[A-Z0-9]/.test(r.name)).length;
    groupsOut.push({ g, title, rows, sg, other: rows.length - sg, noteLinks });
  }
  const known = new Set(GROUPS.map((x) => x[0]));
  const unknown = dirs(compDir).filter((d) => !known.has(d));
  const totalSg = groupsOut.reduce((n, x) => n + x.sg, 0);
  const totalOther = groupsOut.reduce((n, x) => n + x.other, 0);
  const L = [];
  L.push('---', 'tags: [seedgrid, component, indice]');
  for (const k of ['fonte', 'branch', 'commit']) if (fm[k]) L.push(`${k}: ${fm[k]}`);
  L.push(`analisado-em: ${maxDate(sources)}`, `gerado-por: ${GENERATOR} --only components`, '---', '');
  L.push('# Índice dos componentes SeedGrid (front-end)', '');
  L.push(`Monorepo \`front/seedgrid-fe-components\` (pnpm + Turborepo, React 19). Pacote principal \`@seedgrid/fe-components\` ${version}; importação pública pelo barrel \`src/index.ts\` (\`import { SgButton } from "@seedgrid/fe-components"\`) e CSS em \`@seedgrid/fe-components/style.css\` — detalhes em ${SG}fundamentos/Visao-geral|Fundamentos]].`, '');
  L.push('- **Exportado = sim**: disponível no barrel público. **não**: interno (documentado só para referência).');
  L.push('- Cada grupo tem `Visao-geral` (quando usar), `API` (props completas, eventos, a11y) e `Exemplos` (TSX validado contra a API).');
  L.push(`- Contratos comuns: react-hook-form e base \`SgInputText\` em ${SG}inputs-texto/API|inputs-texto/API]].`);
  L.push(`- App de vitrine: ${SG}showcase|Showcase]]. Pacotes de tema/core/playground: ${SG}pacotes/Visao-geral|Pacotes]]. Módulos de tela ligados às extensions: ${SG}modulos/Visao-geral|Módulos]].`);
  L.push(`- Esta nota é **gerada** (\`node scripts/kb-catalogs.mjs --only components --write\`) a partir das notas de cada grupo; os resumos são a 1ª frase da coluna "Para que serve"/"Use para" da Visao-geral (≤100 caracteres) — corrija a nota de origem e regenere.`, '');
  L.push('## Resumo', '', '| Grupo | Componentes `Sg*` | Outros símbolos (hooks, funções, pacotes) | Notas |', '|---|---|---|---|');
  for (const x of groupsOut) L.push(rowOf([x.title, x.sg, x.other, x.noteLinks.join(' · ')]));
  L.push(rowOf(['**Total**', `**${totalSg}**`, `**${totalOther}**`, '']), '');
  for (const x of groupsOut) {
    L.push(`## ${x.title}`, '', '| Nome | Exportado | Resumo | Nota |', '|---|---|---|---|');
    for (const r of x.rows) L.push(rowOf([`\`${r.name}\``, r.exp, r.sum, r.note]));
    L.push('');
  }
  const extra = unknown.length ? `; grupos não mapeados no script: ${unknown.join(', ')}` : '';
  return { text: L.join('\n'), summary: `${groupsOut.reduce((n, x) => n + x.rows.length, 0)} símbolos (Sg*: ${totalSg}, outros: ${totalOther}) em ${groupsOut.length} grupos${extra}` };
}

function noteSet(g) {
  const dirp = path.join(compDir, g);
  const out = [];
  const names = { 'Visao-geral': 'Visão geral', API: 'API', Exemplos: 'Exemplos' };
  for (const f of ['Visao-geral', 'API', 'Exemplos']) if (exists(path.join(dirp, f + '.md'))) out.push(link(`SeedGrid/SeedGrid-components/${g}/${f}`, names[f]));
  return out;
}

// ---------------------------------------------------------------- execução
const targets = {
  properties: { file: path.join(extDir, 'Catalogo-de-propriedades.md'), build: buildProperties },
  enums: { file: path.join(extDir, 'Catalogo-de-enums.md'), build: buildEnums },
  components: { file: path.join(compDir, 'Indice.md'), build: buildComponents },
};
let failed = false;
for (const kind of only ? [only] : KINDS) {
  const t = targets[kind];
  const { text, summary } = t.build();
  const eol = eolOf(t.file);
  const out = eol === '\r\n' ? text.replace(/\n/g, '\r\n') : text;
  const rel = path.relative(root, t.file).replace(/\\/g, '/');
  if (flag('--write')) {
    writeFileSync(t.file, out, 'utf8');
    console.log(`gravado ${rel}: ${summary}`);
  } else if (flag('--check')) {
    const cur = exists(t.file) ? readFileSync(t.file, 'utf8') : null;
    if (cur !== out) {
      failed = true;
      console.error(`DIVERGE ${rel} do que as notas da KB geram. Rode: node scripts/kb-catalogs.mjs --only ${kind} --write`);
    } else console.log(`ok ${rel}: ${summary}`);
  } else {
    console.log(`${kind}: ${summary} -> ${rel}`);
  }
}
if (failed) process.exit(1);
