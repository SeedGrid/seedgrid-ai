#!/usr/bin/env node
// P180.F2.T5: verificacao dos padroes de tela dos boilerplates (FE-40, FE-41, FE-42 e campo mascarado). Reprova:
//  1. campo de documento, telefone, WhatsApp ou CEP com `SgInputText` em `*_edit/page.tsx` (use o componente com mascara);
//  2. item de seguranca (/security/..., /apikeys/...) solto na raiz do menu (`data.ts`), fora do grupo Seguranca (FE-40);
//  3. texto "Cadastre o ID de preco" fora do admin: o cliente nunca ve instrucao de administrador (FE-42);
//  4. contador `requests` declarado por padrao em *UsageMeters*.java (FE-41, BE-74);
//  5. Empresas e Seguranca fora do fim do menu lateral (FE-44);
//  6. botao de acao que GRAVA com `onClick={() => void salvar()}` (ou onSubmit): o `void` descarta a Promise e o SgButton nao entra em
//     loading, entao o clique repetido duplica o registro (FE-46, P190). Devolva a Promise: `onClick={() => salvar()}`;
//  7. `<form onSubmit={...}>` que faz mais do que `event.preventDefault()`: a gravacao passa sempre pelo botao (FE-46, P190). O form so
//     existe para o gerenciador de senha do navegador; o `SgButton type="submit"` leva o `onClick` que devolve a Promise.
//  8. `console.log/debug/info` que imprime requisicao, cabecalho, corpo, token, cookie ou senha (FE-47, P193): vaza segredo no console do navegador.
// Sem dependencias.  node scripts/check-padroes-tela.mjs [--dir <pasta>] [--baseline <arquivo>|--no-baseline]
// Baseline: violacoes ja conhecidas das copias da KB ainda nao sincronizadas com o boilerplate corrigido.
// Violacao nova reprova; entrada do baseline que deixou de ocorrer tambem reprova (apague-a: o baseline so encolhe).
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (n, d) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : d; };
const root = path.resolve(opt('--dir', 'seedgridKB/SeedGrid/Toolkit/boilerplates'));
const useBaseline = !args.includes('--no-baseline');
const baselineFile = path.resolve(opt('--baseline', 'scripts/check-padroes-tela.baseline.json'));
const SKIP = new Set(['node_modules', '.next', 'dist', 'build', '.git', 'target']);

function* walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) yield* walk(p);
    else yield p;
  }
}
const rel = (p) => path.relative(root, p).split(path.sep).join('/');
const read = (p) => fs.readFileSync(p, 'utf8').replace(/\r\n/g, '\n');
const out = [];
const add = (regra, file, detalhe) => out.push({ regra, file: rel(file), detalhe });

const MASCARADO = /\b(cpf|cnpj|documento|document(?!ation)|telefone|phone|celular|whats\s?app|cep|zip|postal)/i;

// atributos da tag que comeca em `start` (depois do nome), no nivel 0 de chaves/aspas
function tagAttrs(src, start) {
  let depth = 0, quote = null, txt = '';
  for (let k = start; k < src.length; k++) {
    const c = src[k];
    if (quote) { txt += c; if (c === quote && src.charCodeAt(k - 1) !== 92) quote = null; continue; }
    if (c === '"' || c === "'") { quote = c; txt += c; continue; }
    if (c === '{') depth++;
    if (c === '}') depth--;
    if (depth === 0 && c === '>' && src[k - 1] !== '=') return txt;
    txt += c;
  }
  return txt;
}

for (const f of walk(root)) {
  const r = rel(f);
  if (/_edit\/page\.tsx$/.test(r)) {
    const src = read(f);
    for (const m of src.matchAll(/<SgInputText\b/g)) {
      const attrs = tagAttrs(src, m.index + m[0].length);
      const hit = attrs.match(/\b(?:id|label|field|name)\s*=\s*(?:"([^"]*)"|\{[`'"]([^`'"]*)[`'"]\})/g) || [];
      const campo = hit.find((h) => MASCARADO.test(h));
      if (campo) add('campo-mascarado', f, `SgInputText para ${campo.replace(/\s+/g, ' ')}: use o componente com mascara (documento, telefone, CEP)`);
    }
  }
  if (/(^|\/)data\.ts$/.test(r)) {
    const lines = read(f).split('\n');
    const itens = lines.map((l, i) => ({ i, m: l.match(/^(\s*)\{?\s*href:\s*"([^"]*)"/), l })).filter((x) => x.m);
    const ind = itens.length ? Math.min(...itens.map((x) => x.m[1].length)) : 0;
    // item do nivel raiz (mesma indentacao do primeiro): nos grupos o href aparece na linha seguinte a `{`
    const rootIndent = Math.min(...lines.filter((l) => /^\s*\{\s*$/.test(l) || /^\s*\{\s*href:/.test(l)).map((l) => l.match(/^\s*/)[0].length), 99);
    for (const x of itens) {
      const href = x.m[2];
      const ehRaiz = /^\s*\{\s*href:/.test(x.l) ? x.m[1].length === rootIndent : x.m[1].length === rootIndent + 2 && /^\s*\{\s*$/.test(lines[x.i - 1] || '') && (lines[x.i - 1].match(/^\s*/)[0].length === rootIndent);
      if (ehRaiz && /^\/(security\/(?!companies)|apikeys|audit)/.test(href) && !/children/.test(lines.slice(x.i, x.i + 4).join('\n'))) {
        add('menu-seguranca-solto', f, `item "${href}" na raiz do menu: deve ficar dentro do grupo Seguranca (FE-40)`);
      }
    }
    void ind;
    // FE-44: Empresas e Seguranca (grupo "/security") sao as ULTIMAS opcoes do menu lateral; nada de dominio depois delas
    const raizes = itens.filter((x) => (/^\s*\{\s*href:/.test(x.l) ? x.m[1].length === rootIndent : x.m[1].length === rootIndent + 2 && /^\s*\{\s*$/.test(lines[x.i - 1] || '') && lines[x.i - 1].match(/^\s*/)[0].length === rootIndent)).map((x) => x.m[2]);
    const fim = (h) => h === '/security' || /^\/security\/companies/.test(h);
    const primeiro = raizes.findIndex(fim);
    if (primeiro >= 0) {
      const depois = raizes.slice(primeiro).filter((h) => !fim(h) && !/^\/(security\/|apikeys|audit)/.test(h));
      if (depois.length) add('menu-ordem', f, `Empresas e Seguranca devem ser as ultimas opcoes do menu (FE-44); depois delas: ${depois.join(', ')}`);
    }
  }
  if (/\.tsx$/.test(r) && !/\.(test|spec)\./.test(r)) {
    const GRAVA = /(save|submit|salvar|confirm|delete|remove|excluir|create|criar|send|enviar|pay|pagar|update|reactivate|reativar|cancel|downgrade|register|apply|aplicar|publish|revoke|invite|approve|reject|rotate|regenerate|toggle|restore|import|export|finish|signup|login|logout)/i;
    const re = /on(?:Click|Submit)=\{\s*(?:\([^)]*\)|[A-Za-z_$][\w$]*)\s*=>\s*void\s+([A-Za-z_$][\w$.]*)\s*\(/g;
    const srcF = read(f);
    for (const m of srcF.matchAll(/<form\b/g)) {
      const attrs = tagAttrs(srcF, m.index + m[0].length);
      const o = attrs.match(/\bonSubmit\s*=\s*\{([\s\S]*)\}\s*$/m) || attrs.match(/\bonSubmit\s*=\s*\{([\s\S]*?)\}(?=\s+\w+=|\s*$)/);
      if (!o) continue;
      const corpo = o[1].replace(/\s+/g, ' ').trim();
      if (!/^\(?\s*[A-Za-z_$][\w$]*\s*\)?\s*=>\s*[A-Za-z_$][\w$]*\.preventDefault\(\)\s*$/.test(corpo)) {
        add('form-onsubmit-grava', f, `<form onSubmit={${corpo.slice(0, 60)}${corpo.length > 60 ? '...' : ''}}>: o form so faz event.preventDefault(); a acao passa pelo SgButton type="submit" com onClick que devolve a Promise (FE-46)`);
      }
    }
    for (const m of srcF.matchAll(re)) {
      if (GRAVA.test(m[1])) add('botao-grava-com-void', f, `onClick/onSubmit com \`void ${m[1]}()\`: devolva a Promise (\`() => ${m[1]}()\`) para o SgButton travar o clique repetido (FE-46)`);
    }
  }
  if (/\.(tsx?|mjs|js)$/.test(r) && !/\.(test|spec)\./.test(r)) {
    // 8. console.log/debug/info que imprime requisicao, cabecalho, corpo, token ou senha (FE-47, P193)
    const SENSIVEL = /(authorization|headers?|body|token|password|senha|cookie|api[-_ ]?key|curl|requestinit)/i;
    for (const m of read(f).matchAll(/console\.(?:log|debug|info)\s*\(([^;]*?)\)\s*;?\s*$/gm)) {
      if (SENSIVEL.test(m[1])) add('console-log-sensivel', f, `console.${m[0].slice(8, 12).replace(/\W/g, '')} com dado sensivel (requisicao, cabecalho, corpo, token ou senha): nao logue isso (FE-47)`);
    }
  }
  if (/\.(tsx|ts)$/.test(r) && !/(^|\/)admin\//.test(r) && !/\.(test|spec)\./.test(r)) {
    if (/Cadastre o ID de pre[cç]o/i.test(read(f))) add('instrucao-admin-no-cliente', f, 'texto "Cadastre o ID de preco" fora do admin: o cliente nunca ve instrucao de administrador (FE-42)');
  }
  if (/UsageMeters?[A-Za-z]*\.java$/.test(r) || /Usage.*Meter.*\.java$/.test(r)) {
    const src = read(f);
    if (/UsageMeterDefinition/.test(src) && /new\s+UsageMeterDefinition\(\s*(REQUESTS\b|"requests")/.test(src)) {
      add('contador-requests-por-padrao', f, 'contador `requests` declarado por padrao: so o que o dominio do produto conta (FE-41, BE-74)');
    }
  }
}

const key = (v) => `${v.regra}|${v.file}`;
let base = new Set();
if (useBaseline && fs.existsSync(baselineFile)) base = new Set(JSON.parse(fs.readFileSync(baselineFile, 'utf8')).conhecidas || []);
const found = new Set(out.map(key));
const novas = out.filter((v) => !base.has(key(v)));
const velhas = [...base].filter((k) => !found.has(k));

if (!novas.length && !velhas.length) {
  console.log(`[check-padroes-tela] ok (${out.length} violacao(oes) conhecida(s) no baseline)`);
  process.exit(0);
}
for (const v of novas) console.error(`[check-padroes-tela] ${v.regra}: ${v.file}: ${v.detalhe}`);
for (const k of velhas) console.error(`[check-padroes-tela] baseline obsoleto (ja corrigido, apague a entrada): ${k}`);
process.exit(1);
