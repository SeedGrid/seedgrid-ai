#!/usr/bin/env node
// Barreira contra migration incompativel com a versao anterior do codigo (regra de migration do produto).
// A migration do release N so ACRESCENTA; remover, renomear, trocar tipo ou NOT NULL sem DEFAULT vai em release posterior.
//
//   node check-migrations.mjs <dir>... [--new-since <ref-git>]
//
// Reprova (saida 1) script V*__*.sql que tenha DROP, RENAME, ALTER COLUMN ... TYPE, ou ADD COLUMN ... NOT NULL sem
// DEFAULT (inclui SET NOT NULL) em ALTER TABLE. Excecao explicita: uma linha `-- sg:contrair <motivo>` no script
// (o motivo e' obrigatorio) marca uma contracao: remocao de algo que o release anterior ja parou de usar.
// --new-since confere so os scripts adicionados/alterados desde a referencia (git diff <ref>...HEAD). Sem dependencias.
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const MARCA = 'sg:contrair';
const MARCA_COM_MOTIVO = new RegExp(`--\\s*${MARCA}[ \\t]+\\S`);
const VERSIONADO = /^V[0-9][^/\\]*__[^/\\]*\.sql$/;
const DROP = /\bDROP\s+(TABLE|COLUMN|INDEX|CONSTRAINT|VIEW|MATERIALIZED|SEQUENCE|TYPE|SCHEMA|FUNCTION|TRIGGER|DOMAIN|EXTENSION|POLICY|RULE)\b/;
const RENAME = /\bRENAME\b/;
const ALTER_TYPE = /\bALTER\s+(COLUMN\s+)?\S+\s+(SET\s+DATA\s+)?TYPE\b/;
const SET_NOT_NULL = /\bSET\s+NOT\s+NULL\b/;
const ALTER_TABLE = /^\s*ALTER\s+TABLE\b/;
const NOT_NULL = /\bNOT\s+NULL\b/;
const DEFAULT = /\bDEFAULT\b/;
const ADD_COLUMN = /\bADD\s+(COLUMN\s+)?(IF\s+NOT\s+EXISTS\s+)?\S+/;

function semComentarios(sql) {
  // preserva as quebras de linha para contar linhas
  return sql.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/--[^\n]*/g, '');
}

function acoes(statement) {
  const out = [];
  let depth = 0;
  let start = 0;
  for (let i = 0; i < statement.length; i++) {
    const c = statement[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (c === ',' && depth === 0) {
      out.push(statement.slice(start, i));
      start = i + 1;
    }
  }
  out.push(statement.slice(start));
  return out;
}

export function conferir(arquivo, sql) {
  if (MARCA_COM_MOTIVO.test(sql)) return [];
  const limpo = semComentarios(sql);
  const violacoes = [];
  let deslocamento = 0;
  for (const bruto of limpo.split(';')) {
    const inicio = deslocamento + (bruto.length - bruto.trimStart().length);
    deslocamento += bruto.length + 1;
    const normalizado = bruto.replace(/\s+/g, ' ').trim();
    if (!normalizado) continue;
    const linha = limpo.slice(0, inicio).split('\n').length;
    const maiusculo = normalizado.toUpperCase();
    const resumo = normalizado.length > 120 ? `${normalizado.slice(0, 117)}...` : normalizado;
    const marcar = (regra) => violacoes.push({ arquivo, linha, regra, trecho: resumo });
    if (DROP.test(maiusculo)) marcar('DROP');
    if (RENAME.test(maiusculo)) marcar('RENAME');
    if (ALTER_TABLE.test(maiusculo)) {
      if (ALTER_TYPE.test(maiusculo)) marcar('ALTER TYPE');
      if (SET_NOT_NULL.test(maiusculo)) marcar('SET NOT NULL');
      for (const acao of acoes(maiusculo)) {
        if (ADD_COLUMN.test(acao) && NOT_NULL.test(acao) && !DEFAULT.test(acao) && !acao.includes('ADD CONSTRAINT')) {
          marcar('NOT NULL sem DEFAULT');
        }
      }
    }
  }
  return violacoes;
}

function listar(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) listar(p, out);
    else if (VERSIONADO.test(e.name)) out.push(p);
  }
  return out;
}

function novosDesde(ref, dirs) {
  const saida = execFileSync('git', ['diff', '--name-only', '--diff-filter=AM', `${ref}...HEAD`, '--', ...dirs], {
    encoding: 'utf8',
  });
  return new Set(saida.split(/\r?\n/).map((l) => l.trim().replace(/\\/g, '/')).filter(Boolean));
}

function main(argv) {
  const dirs = [];
  let desde = null;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--new-since' && argv[i + 1]) desde = argv[++i];
    else dirs.push(argv[i]);
  }
  if (!dirs.length) {
    console.error('uso: node check-migrations.mjs <dir>... [--new-since <ref-git>]');
    return 2;
  }
  const so = desde ? novosDesde(desde, dirs) : null;
  const violacoes = [];
  for (const dir of dirs) {
    for (const arquivo of listar(dir).sort()) {
      const normal = arquivo.replace(/\\/g, '/');
      if (so && ![...so].some((n) => normal.endsWith(n) || n.endsWith(normal))) continue;
      violacoes.push(...conferir(normal, fs.readFileSync(arquivo, 'utf8')));
    }
  }
  if (!violacoes.length) {
    console.log(`migrations compativeis com a versao anterior${so ? ` (${so.size} nova(s) desde ${desde})` : ''}`);
    return 0;
  }
  console.error('Migration incompativel com a versao anterior do codigo: so acrescente no release N;');
  console.error('remocao, renomeacao, troca de tipo e NOT NULL sem DEFAULT vao em release posterior.');
  console.error(`Se for uma contracao (o release anterior ja parou de usar), marque o script: -- ${MARCA} <motivo>`);
  for (const v of violacoes) console.error(`  ${v.arquivo}:${v.linha} [${v.regra}] ${v.trecho}`);
  return 1;
}

if (import.meta.url === `file://${process.argv[1].replace(/\\/g, '/')}` || process.argv[1]?.endsWith('check-migrations.mjs')) {
  process.exit(main(process.argv.slice(2)));
}
