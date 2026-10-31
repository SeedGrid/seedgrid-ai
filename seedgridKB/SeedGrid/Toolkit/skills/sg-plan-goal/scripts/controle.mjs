#!/usr/bin/env node
// Controle de um plano de tarefas no formato da skill sg-plan-goal. So le o arquivo do plano; nao altera nada.
//
//   node controle.mjs <plano.md> status                    progresso por fase
//   node controle.mjs <plano.md> checklist <fase> [--completa]
//                                                          toda tarefa [x] da fase precisa de uma linha "Evidencia:";
//                                                          com --completa tambem falha se sobrou tarefa aberta
//                                                          com --exceto-decisoes, tarefa aberta que depende (direta ou indiretamente) de uma [?]
//                                                          nao conta como problema: esta parada esperando o dono
//   node controle.mjs <plano.md> pendencias                perguntas ao dono: cada tarefa [?] (com Pergunta/Recomendacao do corpo)
//                                                          e as tarefas que ela bloqueia; sai 0 mesmo com pendencias
//   node controle.mjs <plano.md> proximas [--max 4] [--json]
//                                                          tarefas abertas cujo depende-de ja esta todo [x], escolhidas
//                                                          para rodar em paralelo sem dois escrevendo no mesmo caminho
//
// Formato esperado (veja assets/plano-de-tarefas.md):
//   ## Fase 1 — Nome
//   - [ ] **T1.1 Titulo** (`depende-de`: T0.1, T0.2; `escreve`: src/a.ts, tests/a.test.ts)
//     - Aceite: ...
//     - Evidencia: <comando, teste ou hash>      (so quando a tarefa vira [x])
// Estados: [ ] aberta, [~] em andamento, [x] feita, [>] adiada, [?] decisao do dono. Sai 1 se a conferencia falhar.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const MAX_PADRAO = 4;
const ID = /^[A-Za-z][0-9A-Za-z]*\.[0-9A-Za-z.]+$/;

export function lerPlano(texto) {
  const linhas = texto.replace(/^﻿/, '').split(/\r?\n/);
  const fases = [];
  let fase = null;
  let tarefa = null;
  for (const linha of linhas) {
    const f = /^##\s+Fase\s+(.+?)\s*$/.exec(linha);
    if (f) {
      fase = { titulo: f[1], chave: f[1].split(/[\s—–:-]+/)[0], tarefas: [] };
      fases.push(fase);
      tarefa = null;
      continue;
    }
    if (/^#{1,2}\s/.test(linha)) { fase = null; tarefa = null; continue; } // outro titulo: fecha a fase atual
    const t = /^\s*[-*]\s+\[([ x~>?])\]\s+\*\*(\S+?)[\s:—–-]/.exec(linha);
    if (t && fase) {
      tarefa = { id: t[2].replace(/[*:]+$/, ''), estado: t[1], cabecalho: linha, corpo: [], fase: fase.chave };
      fase.tarefas.push(tarefa);
      continue;
    }
    if (tarefa) tarefa.corpo.push(linha);
  }
  const todas = fases.flatMap((x) => x.tarefas);
  for (const t of todas) {
    const cab = t.cabecalho;
    const dep = /`?depende-de`?\s*:\s*([^;)]*)/i.exec(cab);
    t.dependeDe = dep ? dep[1].split(/[,\s]+/).map((s) => s.replace(/[`.;]+$/g, '')).filter((s) => ID.test(s)) : [];
    const esc = /`?escreve`?\s*:\s*([^)]*)\)/i.exec(cab);
    t.escreve = esc ? esc[1].split(',').map((s) => s.replace(/[`]/g, '').trim()).filter(Boolean) : [];
    t.temEvidencia = /Evid[eê]ncia\s*(\([^)]*\))?\s*:\s*\S/i.test(t.corpo.join('\n')) || /Evid[eê]ncia\s*(\([^)]*\))?\s*:\s*\S/i.test(cab);
  }
  return { fases, todas };
}

const mesmoCaminho = (a, b) => {
  const n = (p) => p.replace(/\\/g, '/').replace(/\/+$/, '');
  const x = n(a), y = n(b);
  return x === y || x.startsWith(y + '/') || y.startsWith(x + '/');
};

/** Tarefas abertas prontas (todo depende-de feito) que podem ir juntas: ate `max`, sem caminhos de escrita em comum. */
export function proximas(plano, max = MAX_PADRAO) {
  const feitas = new Set(plano.todas.filter((t) => t.estado === 'x').map((t) => t.id));
  const emAndamento = plano.todas.filter((t) => t.estado === '~');
  const prontas = plano.todas.filter((t) => t.estado === ' ' && t.dependeDe.every((d) => feitas.has(d)));
  const bloqueadas = plano.todas.filter((t) => t.estado === ' ' && !t.dependeDe.every((d) => feitas.has(d)));
  const escolhidas = [];
  const espera = [];
  const ocupados = emAndamento.flatMap((t) => t.escreve.map((p) => ({ p, id: t.id })));
  for (const t of prontas) {
    const sem = t.escreve.length === 0;
    const conflito = sem ? null : [...ocupados, ...escolhidas.flatMap((c) => c.escreve.map((p) => ({ p, id: c.id })))].find((o) => t.escreve.some((p) => mesmoCaminho(p, o.p)));
    if (conflito) espera.push({ id: t.id, motivo: `escreve em caminho comum com ${conflito.id}` });
    else if (escolhidas.length >= max) espera.push({ id: t.id, motivo: `acima do limite de ${max} agentes (so em worktree, plano da fase define o teto)` });
    else escolhidas.push(t);
  }
  return {
    paralelo: escolhidas.map((t) => t.id),
    semDeclararEscreve: escolhidas.filter((t) => t.escreve.length === 0).map((t) => t.id),
    espera,
    bloqueadas: bloqueadas.map((t) => ({ id: t.id, falta: t.dependeDe.filter((d) => !feitas.has(d)) })),
    emAndamento: emAndamento.map((t) => t.id),
  };
}

/** Tarefas abertas que dependem, direta ou indiretamente, de uma tarefa [?] (decisao do dono). */
export function bloqueadasPorDecisao(plano) {
  const porId = new Map(plano.todas.map((t) => [t.id, t]));
  const memo = new Map();
  const depende = (t, visitados = new Set()) => {
    if (memo.has(t.id)) return memo.get(t.id);
    if (visitados.has(t.id)) return false;
    visitados.add(t.id);
    const r = t.dependeDe.some((d) => { const x = porId.get(d); return x && (x.estado === '?' || depende(x, visitados)); });
    memo.set(t.id, r);
    return r;
  };
  return new Set(plano.todas.filter((t) => (t.estado === ' ' || t.estado === '~') && depende(t)).map((t) => t.id));
}

/** Perguntas ao dono: cada tarefa [?], com as linhas do corpo, e as tarefas que ficam esperando por ela. */
export function pendencias(plano) {
  const porId = new Map(plano.todas.map((t) => [t.id, t]));
  const esperaPor = (alvo) => plano.todas.filter((t) => {
    const vistos = new Set();
    const alcanca = (x) => x.dependeDe.some((d) => { if (d === alvo) return true; if (vistos.has(d)) return false; vistos.add(d); const y = porId.get(d); return y ? alcanca(y) : false; });
    return alcanca(t);
  }).map((t) => t.id);
  return plano.todas.filter((t) => t.estado === '?').map((t) => ({
    id: t.id,
    titulo: t.cabecalho.replace(/^\s*[-*]\s+\[\?\]\s+/, '').replace(/\*\*/g, '').replace(/\s*\(`?depende-de.*$/, '').trim(),
    detalhe: t.corpo.map((l) => l.trim()).filter(Boolean).slice(0, 8),
    bloqueia: esperaPor(t.id),
  }));
}

export function checklist(plano, chave, completa, exetoDecisoes = false) {
  const fase = plano.fases.find((f) => f.chave === chave || f.titulo === chave);
  if (!fase) return { erros: [`fase "${chave}" nao encontrada`], fase: null };
  const erros = [];
  const paradas = exetoDecisoes ? bloqueadasPorDecisao(plano) : new Set();
  for (const t of fase.tarefas) {
    if (t.estado === 'x' && !t.temEvidencia) erros.push(`${t.id}: tarefa [x] sem linha "Evidencia:"`);
    if (completa && (t.estado === ' ' || t.estado === '~') && !paradas.has(t.id)) erros.push(`${t.id}: tarefa ainda aberta`);
  }
  return { erros, fase };
}

function main(argv) {
  const [arquivo, cmd, ...resto] = argv;
  if (!arquivo || !cmd) {
    console.error('Uso: controle.mjs <plano.md> status | checklist <fase> [--completa [--exceto-decisoes]] | pendencias | proximas [--max N] [--json]');
    return 2;
  }
  let texto;
  try { texto = readFileSync(arquivo, 'utf8'); } catch { console.error(`nao consegui ler ${arquivo}`); return 2; }
  const plano = lerPlano(texto);
  if (plano.todas.length === 0) { console.error('nenhuma tarefa no formato "- [ ] **ID Titulo**" dentro de "## Fase ..."'); return 2; }
  if (cmd === 'status') {
    const aidlc = /^aidlc:[ \t]*(\S+)/m.exec(texto.slice(0, 600));
    if (!aidlc) console.error('[aviso] plano sem "aidlc:" no cabecalho (copie o contentVersion de .ai/toolkit-lock.json)');
    else console.log(`AIDLC do plano: ${aidlc[1]}`);
    const aDefinir = plano.todas.filter((t) => /<definir/i.test(t.cabecalho + '\n' + t.corpo.join('\n'))).map((t) => t.id);
    if (aDefinir.length) console.error(`[aviso] ${aDefinir.length} tarefa(s) com "<definir>" ainda por preencher (leia o plano e preencha antes de apresentar): ${aDefinir.slice(0, 12).join(', ')}${aDefinir.length > 12 ? ', ...' : ''}`);
    for (const f of plano.fases) {
      const c = (e) => f.tarefas.filter((t) => t.estado === e).length;
      console.log(`Fase ${f.chave}: ${c('x')}/${f.tarefas.length} feitas, ${c('~')} em andamento, ${c(' ')} abertas, ${c('?')} decisao do dono, ${c('>')} adiadas`);
    }
    return 0;
  }
  if (cmd === 'checklist') {
    const chave = resto.find((a) => !a.startsWith('--'));
    if (!chave) { console.error('informe a fase'); return 2; }
    const r = checklist(plano, chave, resto.includes('--completa'), resto.includes('--exceto-decisoes'));
    for (const e of r.erros) console.error('  ' + e);
    console.log(`[controle] fase ${chave}: ${r.erros.length} problema(s).`);
    return r.erros.length ? 1 : 0;
  }
  if (cmd === 'pendencias') {
    const p = pendencias(plano);
    if (!p.length) { console.log('[controle] pendencias: 0 pergunta(s) ao dono.'); return 0; }
    for (const x of p) {
      console.log(`${x.id}: ${x.titulo}`);
      for (const l of x.detalhe) console.log('    ' + l);
      console.log(`    bloqueia: ${x.bloqueia.join(', ') || 'nenhuma tarefa'}`);
    }
    console.log(`[controle] pendencias: ${p.length} pergunta(s) ao dono.`);
    return 0;
  }
  if (cmd === 'proximas') {
    const i = resto.indexOf('--max');
    const max = i >= 0 ? Math.max(1, Number(resto[i + 1]) || MAX_PADRAO) : MAX_PADRAO;
    const r = proximas(plano, max);
    if (resto.includes('--json')) { console.log(JSON.stringify(r, null, 2)); return 0; }
    console.log(`Em paralelo agora (ate ${max}): ${r.paralelo.join(', ') || 'nenhuma'}`);
    if (r.semDeclararEscreve.length) console.log(`  AVISO sem "escreve" declarado (o paralelismo nao pode ser provado): ${r.semDeclararEscreve.join(', ')}`);
    for (const e of r.espera) console.log(`  espera ${e.id}: ${e.motivo}`);
    for (const b of r.bloqueadas) console.log(`  bloqueada ${b.id}: falta ${b.falta.join(', ')}`);
    if (r.emAndamento.length) console.log(`Em andamento: ${r.emAndamento.join(', ')}`);
    return 0;
  }
  console.error(`comando desconhecido: ${cmd}`);
  return 2;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
