#!/usr/bin/env node
// Custo por tarefa, fase e plano (tokens e valor), somando as ferramentas de IA usadas no projeto. Node sem dependencia.
// Le SO campos de uso (modelo, data, tokens). Nunca le nem grava conteudo de conversa; nao toca em credenciais.
//
//   node custo.mjs <plano> resumo                 o plano inteiro, uma linha por tarefa, subtotal por fase e total
//   node custo.mjs <plano> fase <fase>            so uma fase (1 ou F1)
//   <plano>: o numero (163) ou o caminho do arquivo do plano (P163-....md)
//
// Fontes (--fonte, repetivel; sem --fonte detecta claude-code e codex pelo que existe na maquina):
//   claude-code             transcritos do Claude Code (--transcritos <pasta>; padrao ~/.claude/projects/<pasta atual>)
//   codex                   sessoes do Codex em ~/.codex/sessions (--codex <pasta>); so as sessoes cujo cwd e o do projeto
//                           (--projeto <pasta>, repetivel; padrao: a pasta atual)
//   json:<arquivo>          registros de outra LLM ou API (JSON); csv:<arquivo> o mesmo em CSV (colunas em leitores.mjs)
//
// Opcoes:
//   --precos <arquivo>      tabela de precos (padrao: .ai/local/precos-de-modelo.json na pasta atual)
//   --sessao <id>           so o uso dessa sessao (e dos subagentes dela); aceita o comeco do id
//   --janela P1.F1.T1=<inicio>,<fim>
//                           atribui a uma tarefa o uso SEM MARCA que nao e de subagente (sessao principal do Claude, sessao do
//                           Codex sem marca no titulo, linhas genericas) entre dois instantes ISO (repetivel). Filtra so por
//                           horario: numa pasta com varias sessoes use junto com --sessao
//   --gravar                grava o relatorio em docs/ai/custos/ (alem de imprimir)
//   --json                  saida em JSON
//
// Ligacao uso -> tarefa: Claude Code: o `description` do Agent comeca com P<plano>.F<fase>.T<tarefa>; Codex: a marca esta no
// titulo da sessao; generico: coluna `tarefa`. Uso deduplicado (Claude: message.id; Codex: diferenca entre totais acumulados).
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { TIPOS, zero, coletarClaude, coletarCodex, coletarGenerico, pastaDeTranscritos, pastaDoCodex, tokensDoUso, lerRequisicoes, usoDoRollout, lerCsv } from './leitores.mjs';

export { TIPOS, zero, tokensDoUso, lerRequisicoes, pastaDeTranscritos };
/** Compatibilidade: leitor do Claude Code. */
export const coletar = coletarClaude;
export { coletarClaude, coletarCodex, coletarGenerico, usoDoRollout, lerCsv };

/** Atribui a uma tarefa o uso sem marca (que nao e de subagente) dentro de janelas de tempo. */
export function aplicarJanelas(regs, janelas) {
  for (const r of regs) {
    if (r.tarefa || r.subagente) continue;
    const t = Date.parse(r.timestamp);
    const j = janelas.find((w) => t >= w.inicio && t <= w.fim);
    if (!j) continue;
    r.tarefa = j.tarefa; r.plano = j.plano; r.fase = j.fase;
  }
  return regs;
}

export function lerJanela(texto) {
  const m = /^P(\d+)\.F(\d+)\.T(\d+)=([^,]+),(.+)$/.exec(texto);
  if (!m) throw new Error(`--janela invalida: ${texto} (esperado P<plano>.F<fase>.T<tarefa>=<inicio>,<fim>)`);
  const inicio = Date.parse(m[4]); const fim = Date.parse(m[5]);
  if (Number.isNaN(inicio) || Number.isNaN(fim)) throw new Error(`--janela com data invalida: ${texto}`);
  return { tarefa: `P${m[1]}.F${m[2]}.T${m[3]}`, plano: Number(m[1]), fase: Number(m[2]), inicio, fim };
}

/**
 * Valor de uma requisicao: { valor, moeda, aviso, faixa }. A moeda e a da linha de preco, ou a do arquivo de precos.
 * Sem preco o valor e nulo (nunca inventa). Linha generica com `valor` ja informado pela API usa esse valor.
 */
export function precificar(reg, tabela) {
  if (reg.valorInformado !== undefined) return { valor: reg.valorInformado, moeda: reg.moeda || tabela?.moeda || 'USD', aviso: null };
  const dia = reg.timestamp.slice(0, 10);
  const linhas = (tabela?.precos || []).filter((p) => p.modelo === reg.modelo && String(p.vigente_desde) <= dia);
  if (linhas.length === 0) return { valor: null, moeda: null, aviso: `sem preço para ${reg.modelo} em ${dia || 'data desconhecida'}` };
  const p = linhas.sort((a, b) => String(b.vigente_desde).localeCompare(String(a.vigente_desde)))[0];
  let v = 0;
  for (const t of TIPOS) v += (reg.tokens[t] / 1e6) * (Number(p.por_milhao?.[t]) || 0);
  return { valor: v, moeda: p.moeda || tabela?.moeda || 'USD', aviso: null, faixa: p.vigente_desde };
}

export function lerTabelaDePrecos(arquivo) {
  if (!existsSync(arquivo)) return null;
  try { return JSON.parse(readFileSync(arquivo, 'utf8')); } catch { return null; }
}

const novoGrupo = () => ({ tokens: zero(), valores: {}, parcial: false, requisicoes: 0 });
function somarEm(g, tokens, valor, moeda) {
  for (const t of TIPOS) g.tokens[t] += tokens[t];
  g.requisicoes++;
  if (valor === null) g.parcial = true; else g.valores[moeda] = (g.valores[moeda] || 0) + valor;
}
function juntar(grupos) {
  const s = novoGrupo();
  for (const g of grupos) {
    for (const t of TIPOS) s.tokens[t] += g.tokens[t];
    s.requisicoes += g.requisicoes;
    if (g.parcial) s.parcial = true;
    for (const [m, v] of Object.entries(g.valores)) s.valores[m] = (s.valores[m] || 0) + v;
  }
  return s;
}

function avisosDeSemPreco(semPreco) {
  return [...semPreco.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([modelo, dias]) => {
    const d = [...dias].sort();
    return d.length === 1 ? `sem preço para ${modelo} em ${d[0]}` : `sem preço para ${modelo} em ${d.length} datas, de ${d[0]} a ${d[d.length - 1]}`;
  });
}

/** Soma por tarefa, ferramenta, papel e modelo. Uso sem tarefa do plano fica fora das somas (aparece em `semTarefa`). */
export function agregar(regs, tabela, plano, fase = null) {
  const semPreco = new Map(); // modelo -> dias sem preco (um aviso por modelo, nao um por dia)
  const porTarefa = new Map();
  const semTarefa = { principal: novoGrupo(), subagentes: novoGrupo() };
  for (const r of regs) {
    const doPlano = r.plano === plano && (fase === null || r.fase === fase);
    const { valor, moeda, aviso } = precificar(r, tabela);
    if (aviso && doPlano) { if (!semPreco.has(r.modelo)) semPreco.set(r.modelo, new Set()); semPreco.get(r.modelo).add(r.timestamp.slice(0, 10) || 'data desconhecida'); }
    if (!doPlano) {
      if (r.plano === null && fase === null) somarEm(r.subagente ? semTarefa.subagentes : semTarefa.principal, r.tokens, valor, moeda);
      continue;
    }
    const chave = `${r.tarefa}|${r.ferramenta}|${r.papel}|${r.modelo}`;
    let l = porTarefa.get(chave);
    if (!l) { l = { tarefa: r.tarefa, fase: r.fase, ferramenta: r.ferramenta, papel: r.papel, modelo: r.modelo, ...novoGrupo() }; porTarefa.set(chave, l); }
    somarEm(l, r.tokens, valor, moeda);
  }
  const linhas = [...porTarefa.values()].sort((a, b) => a.fase - b.fase || a.tarefa.localeCompare(b.tarefa, 'en', { numeric: true }) || a.ferramenta.localeCompare(b.ferramenta) || a.papel.localeCompare(b.papel));
  const fases = [...new Set(linhas.map((l) => l.fase))].map((f) => ({ fase: f, ...juntar(linhas.filter((l) => l.fase === f)) }));
  const chaveFm = new Map();
  for (const l of linhas) {
    const k = `${l.ferramenta}|${l.modelo}`;
    chaveFm.set(k, [...(chaveFm.get(k) || []), l]);
  }
  const porFerramenta = [...chaveFm.entries()].map(([k, ls]) => ({ ferramenta: ls[0].ferramenta, modelo: ls[0].modelo, ...juntar(ls) }));
  return { linhas, fases, porFerramenta, total: juntar(linhas), semTarefa, avisos: avisosDeSemPreco(semPreco) };
}

/** Conta as demandas registradas da fase (docs/ai/demands/P<plano>.F<fase>.DEM*). */
export function consultasAoFonte(raiz, plano, fase) {
  const dir = join(raiz, 'docs', 'ai', 'demands');
  if (!existsSync(dir)) return 0;
  const re = new RegExp(`^P${plano}\\.F${fase}\\.DEM\\d+`);
  return readdirSync(dir).filter((f) => re.test(f)).length;
}

export function fmtTokens(n) {
  if (n >= 1e6) return `${(n / 1e6).toFixed(1).replace('.', ',')} M`;
  if (n >= 1e4) return `${Math.round(n / 1e3)} mil`;
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}
/** Valor de um grupo: uma parcela por moeda (nao se somam moedas diferentes). */
export function fmtValor(g) {
  const partes = Object.entries(g.valores).sort(([a], [b]) => a.localeCompare(b)).map(([m, v]) => `${m} ${v.toFixed(2).replace('.', ',')}`);
  if (partes.length === 0) return g.parcial ? '— (sem preço)' : '—';
  return partes.join(' + ') + (g.parcial ? ' (parcial)' : '');
}
const criado = (g) => g.tokens.cache_criado_5m + g.tokens.cache_criado_1h;
const colunasTokens = (g) => `${fmtTokens(g.tokens.entrada)} | ${fmtTokens(g.tokens.saida)} | ${fmtTokens(g.tokens.cache_lido)} | ${fmtTokens(criado(g))}`;

export function relatorio(ag, { plano, fase, raiz = '.', data = '' }) {
  const L = [`# Custo do P${plano}${fase === null ? '' : ` — fase F${fase}`}${data ? ` (${data})` : ''}`, ''];
  L.push('| Tarefa | Ferramenta | Papel | Modelo | Entrada | Saída | Cache lido | Cache criado | Valor |', '|---|---|---|---|---:|---:|---:|---:|---:|');
  for (const l of ag.linhas) L.push(`| ${l.tarefa || '(sem tarefa)'} | ${l.ferramenta} | ${l.papel} | ${l.modelo} | ${colunasTokens(l)} | ${fmtValor(l)} |`);
  L.push('', '## Por fase', '', '| Fase | Entrada | Saída | Cache lido | Cache criado | Valor | Consultas ao fonte |', '|---|---:|---:|---:|---:|---:|---:|');
  for (const f of ag.fases) L.push(`| F${f.fase} | ${colunasTokens(f)} | ${fmtValor(f)} | ${consultasAoFonte(raiz, plano, f.fase)} |`);
  if (new Set(ag.porFerramenta.map((x) => x.ferramenta)).size > 1 || ag.porFerramenta.length > 1) {
    L.push('', '## Por ferramenta e modelo', '', '| Ferramenta | Modelo | Entrada | Saída | Cache lido | Cache criado | Valor |', '|---|---|---:|---:|---:|---:|---:|');
    for (const x of ag.porFerramenta) L.push(`| ${x.ferramenta} | ${x.modelo} | ${colunasTokens(x)} | ${fmtValor(x)} |`);
  }
  L.push('', `**Total do plano:** entrada ${fmtTokens(ag.total.tokens.entrada)} · saída ${fmtTokens(ag.total.tokens.saida)} · cache lido ${fmtTokens(ag.total.tokens.cache_lido)} · cache criado ${fmtTokens(criado(ag.total))} · valor ${fmtValor(ag.total)}${ag.total.parcial ? ' — total PARCIAL: faltou preço' : ''}`);
  const resto = (g) => `${g.requisicoes} requisições, saída ${fmtTokens(g.tokens.saida)}, cache lido ${fmtTokens(g.tokens.cache_lido)}`;
  if (ag.semTarefa.principal.requisicoes > 0) L.push('', `Uso sem tarefa atribuída, fora de subagente (fora das somas acima; use --janela e --sessao, ou a marca no título da sessão do Codex): ${resto(ag.semTarefa.principal)}.`);
  if (ag.semTarefa.subagentes.requisicoes > 0) L.push('', `Subagentes sem marca P<plano>.F<fase>.T<tarefa> no description (fora das somas acima): ${resto(ag.semTarefa.subagentes)}.`);
  for (const a of ag.avisos) L.push('', `Aviso: ${a}.`);
  return L.join('\n') + '\n';
}

function planoNumero(arg) {
  const m = /^\d+$/.test(arg) ? [null, arg] : /(?:^|[\\/])P(\d+)-/.exec(arg);
  return m ? Number(m[1]) : null;
}

/** Junta os registros das fontes pedidas (ou detectadas). Devolve { regs, avisos }. */
export function coletarFontes(opt, cwd, home = undefined) {
  const avisos = [];
  const regs = [];
  let fontes = opt.fonte;
  if (fontes.length === 0) {
    fontes = [];
    if (opt.transcritos || existsSync(pastaDeTranscritos(cwd, home))) fontes.push('claude-code');
    if (opt.codex || existsSync(pastaDoCodex(home))) fontes.push('codex');
  }
  for (const f of fontes) {
    if (f === 'claude-code') regs.push(...coletarClaude(opt.transcritos || pastaDeTranscritos(cwd, home)));
    else if (f === 'codex') regs.push(...coletarCodex(opt.codex || pastaDoCodex(home), opt.projeto.length ? opt.projeto : [cwd], avisos));
    else if (/^(json|csv):/.test(f)) regs.push(...coletarGenerico(resolve(cwd, f.slice(f.indexOf(':') + 1)), f.slice(0, f.indexOf(':'))));
    else throw new Error(`--fonte invalida: ${f} (claude-code, codex, json:<arquivo> ou csv:<arquivo>)`);
  }
  return { regs, avisos };
}

export function main(argv, { cwd = process.cwd(), home = undefined, saida = (s) => process.stdout.write(s), erro = (s) => process.stderr.write(s) } = {}) {
  const pos = []; const opt = { janela: [], fonte: [], projeto: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--json' || a === '--gravar') opt[a.slice(2)] = true;
    else if (['--transcritos', '--precos', '--sessao', '--codex'].includes(a)) opt[a.slice(2)] = argv[++i];
    else if (['--janela', '--fonte', '--projeto'].includes(a)) opt[a.slice(2)].push(argv[++i]);
    else pos.push(a);
  }
  const plano = pos[0] ? planoNumero(pos[0]) : null;
  const modo = pos[1];
  const fase = modo === 'fase' && pos[2] ? Number(String(pos[2]).replace(/^F/i, '')) : null;
  if (plano === null || !['resumo', 'fase'].includes(modo) || (modo === 'fase' && !Number.isInteger(fase))) {
    erro('uso: custo.mjs <plano> resumo | <plano> fase <fase> [--fonte claude-code|codex|json:arq|csv:arq] [--transcritos pasta] [--codex pasta] [--projeto pasta] [--precos arquivo] [--sessao id] [--janela P1.F1.T1=ini,fim] [--gravar] [--json]\n');
    return 2;
  }
  let regs; let avisosLeitura;
  try {
    ({ regs, avisos: avisosLeitura } = coletarFontes(opt, cwd, home));
    if (opt.sessao) regs = regs.filter((r) => String(r.sessao).startsWith(opt.sessao));
    regs = aplicarJanelas(regs, opt.janela.map(lerJanela));
  } catch (e) { erro(`${e.message}\n`); return 2; }
  const arqPrecos = opt.precos || join(cwd, '.ai', 'local', 'precos-de-modelo.json');
  const tabela = lerTabelaDePrecos(arqPrecos);
  const ag = agregar(regs, tabela, plano, fase);
  if (!tabela) ag.avisos.unshift(`tabela de preços ausente ou ilegível (${arqPrecos}); mostrando só tokens`);
  ag.avisos.unshift(...avisosLeitura);
  const data = new Date().toISOString().slice(0, 10);
  const texto = relatorio(ag, { plano, fase, raiz: cwd, data });
  if (opt.json) saida(JSON.stringify({ plano, fase, ...ag }, null, 2) + '\n');
  else saida(texto);
  if (opt.gravar) {
    const dir = join(cwd, 'docs', 'ai', 'custos');
    mkdirSync(dir, { recursive: true });
    const arq = join(dir, `P${plano}${fase === null ? '' : `-F${fase}`}-custo-${data}.md`);
    writeFileSync(arq, texto, 'utf8');
    erro(`gravado: ${arq}\n`);
  }
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exit(main(process.argv.slice(2)));
