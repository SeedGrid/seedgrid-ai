#!/usr/bin/env node
// Diagnostico de um plano livre (briefing, plano de produto em prosa) contra o formato da skill sg-plan-goal, e esqueleto
// do plano adequado. So le o plano; so grava o arquivo passado em --saida (nunca o original).
//
//   node diagnostico.mjs <plano.md> [--json]
//        diagnostico: cabecalho (status, aidlc), tarefas no formato (depende-de, escreve, Aceite, Evidencia), ids falantes,
//        blocos /goal e o que o plano ja traz (hipoteses, fases da ordem de execucao, decisoes) para virar tarefa
//   node diagnostico.mjs <plano.md> --saida <novo.md> [--plano <numero>]
//        grava o esqueleto no formato da sg-plan-goal: fases da "Ordem de execucao", uma tarefa de prova por hipotese,
//        decisoes do dono (.D<n>) com Pergunta e Recomendacao, blocos /goal. Aceite, escreve e testes ficam como <definir>
//        para quem adequa preencher; recusa sobrescrever arquivo existente.
//   node diagnostico.mjs <plano.md> --novo <assunto>
//        igual a --saida, mas o destino e calculado: docs/ai/plans/P<n>-AAAA-MM-DD-<assunto>.md na raiz do projeto (a pasta
//        com .ai/toolkit-lock.json acima da pasta atual), com <n> = proximo numero livre da pasta. Nunca grava fora do projeto.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
const arquivo = args.find((a) => !a.startsWith('--') && a !== opt('--saida') && a !== opt('--plano') && a !== opt('--novo'));
if (!arquivo || !existsSync(arquivo)) {
  console.error('Uso: node diagnostico.mjs <plano.md> [--json] [--saida <novo.md> [--plano <numero>]]');
  process.exit(2);
}
const texto = readFileSync(arquivo, 'utf8').replace(/^﻿/, '');
const linhas = texto.split(/\r?\n/);

// ---------- leitura ----------
const fm = /^---\r?\n([\s\S]*?)\r?\n---/.exec(texto)?.[1] ?? '';
const campo = (n) => new RegExp(`^${n}\\s*:\\s*(.+)$`, 'm').exec(fm)?.[1].trim();

function secao(re) {
  const i = linhas.findIndex((l) => /^#{1,4}\s/.test(l) && re.test(l));
  if (i < 0) return [];
  const nivel = /^(#+)/.exec(linhas[i])[1].length;
  const out = [];
  for (let k = i + 1; k < linhas.length; k++) {
    const h = /^(#+)\s/.exec(linhas[k]);
    if (h && h[1].length <= nivel) break;
    out.push(linhas[k]);
  }
  return out;
}
const celulas = (l) => l.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());
const tabela = (ls) => ls.filter((l) => /^\s*\|/.test(l)).map(celulas).filter((c) => !c.every((x) => /^:?-{2,}:?$/.test(x)) ).slice(1);
const limpa = (s) => s.replace(/~~/g, '').replace(/\*\*/g, '').replace(/`/g, '').replace(/\s+/g, ' ').trim();

const hipoteses = tabela(secao(/Hip[óo]teses/i)).filter((c) => /^H\d+/.test(c[0])).map((c) => ({ id: c[0], texto: limpa(c[1] ?? ''), prova: limpa(c[2] ?? '') }));
const fasesOrdem = tabela(secao(/Ordem de execu[çc][ãa]o/i)).filter((c) => /^\w+$/.test(c[0])).map((c) => ({ chave: c[0], conteudo: limpa(c[1] ?? ''), portao: limpa(c[2] ?? '') }));
const aberto = secao(/Em aberto/i);
const blocos = { bloqueia: [], confirma: [], resolvidas: [] };
{
  let atual = null;
  for (const l of aberto) {
    if (/\*\*Bloqueia/i.test(l)) { atual = 'bloqueia'; continue; }
    if (/\*\*Pedem confirma/i.test(l)) { atual = 'confirma'; continue; }
    if (/\*\*Resolvidas/i.test(l)) { atual = 'resolvidas'; continue; }
    if (!atual) continue;
    if (atual === 'bloqueia' && /^\s*\d+\.\s/.test(l)) blocos.bloqueia.push(limpa(l.replace(/^\s*\d+\.\s*/, '')));
    else if (atual === 'resolvidas' && /^\s*[-*]\s/.test(l)) blocos.resolvidas.push(limpa(l.replace(/^\s*[-*]\s*/, '')));
  }
  blocos.confirma = tabela(aberto.slice(aberto.findIndex((l) => /\*\*Pedem confirma/i.test(l)))).map((c) => ({ tema: limpa(c[0] ?? ''), padrao: limpa(c[1] ?? '') })).filter((c) => c.tema);
}

// ---------- diagnostico ----------
const tarefas = [];
{
  let t = null;
  for (const l of linhas) {
    const m = /^\s*[-*]\s+\[([ x~>?])\]\s+\*\*(\S+?)[\s:—–-]/.exec(l);
    if (m) { t = { estado: m[1], id: m[2].replace(/[*:]+$/, ''), cab: l, corpo: [] }; tarefas.push(t); continue; }
    if (t && /^\s+\S/.test(l)) t.corpo.push(l); else if (t && /^\S/.test(l)) t = null;
  }
}
const corpoDe = (t) => t.corpo.join('\n');
const diag = {
  arquivo: resolve(arquivo),
  status: campo('status') ?? null,
  aidlc: campo('aidlc') ?? null,
  fases: linhas.filter((l) => /^##\s+Fase\s/.test(l)).length,
  tarefas: tarefas.length,
  idsFalantes: tarefas.filter((t) => /^P\d+\.F[0-9A-Za-z]+\.[TD]\d+$/.test(t.id) || /^P\d+\.FIM\.T\d+$/.test(t.id)).length,
  semDependeDe: tarefas.filter((t) => !/depende-de/i.test(t.cab)).map((t) => t.id),
  semEscreve: tarefas.filter((t) => !/escreve/i.test(t.cab)).map((t) => t.id),
  semAceite: tarefas.filter((t) => t.estado !== '?' && !/Aceite\s*:/i.test(corpoDe(t))).map((t) => t.id),
  feitasSemEvidencia: tarefas.filter((t) => t.estado === 'x' && !/Evid[eê]ncia\s*(\([^)]*\))?\s*:\s*\S/i.test(corpoDe(t) + t.cab)).map((t) => t.id),
  blocosGoal: (texto.match(/^\/goal\s/gm) ?? []).length,
  encontrado: { hipoteses: hipoteses.length, fasesNaOrdemDeExecucao: fasesOrdem.length, decisoesAbertas: blocos.bloqueia.length + blocos.confirma.length, decisoesResolvidas: blocos.resolvidas.length },
};
diag.problemas = [];
if (!diag.aidlc) diag.problemas.push('cabecalho sem `aidlc:` (contentVersion de .ai/toolkit-lock.json)');
if (!diag.status) diag.problemas.push('cabecalho sem `status:`');
if (diag.tarefas === 0) diag.problemas.push('nenhuma tarefa no formato `- [ ] **P<n>.F<f>.T<t> Titulo** (`depende-de`: ...; `escreve`: ...)`');
if (diag.tarefas > 0 && diag.idsFalantes < diag.tarefas) diag.problemas.push(`${diag.tarefas - diag.idsFalantes} tarefa(s) sem id falante P<plano>.F<fase>.T<tarefa>`);
if (diag.semDependeDe.length) diag.problemas.push(`sem depende-de: ${diag.semDependeDe.join(', ')}`);
if (diag.semEscreve.length) diag.problemas.push(`sem escreve: ${diag.semEscreve.join(', ')}`);
if (diag.semAceite.length) diag.problemas.push(`sem Aceite: ${diag.semAceite.join(', ')}`);
if (diag.feitasSemEvidencia.length) diag.problemas.push(`[x] sem Evidencia: ${diag.feitasSemEvidencia.join(', ')}`);
if (diag.blocosGoal === 0) diag.problemas.push('nenhum bloco /goal (um por fase e um do plano inteiro)');

// ---------- esqueleto ----------
function esqueleto(numero) {
  const P = `P${numero}`;
  const raiz = (() => { let d = dirname(resolve(arquivo)); for (let i = 0; i < 6; i++) { const l = join(d, '.ai', 'toolkit-lock.json'); if (existsSync(l)) return l; d = dirname(d); } return null; })();
  const aidlc = raiz ? (JSON.parse(readFileSync(raiz, 'utf8')).contentVersion ?? '0.0.0') : '0.0.0';
  const titulo = /^#\s+(.+)$/m.exec(texto)?.[1].trim() ?? 'Plano';
  const hoje = new Date().toISOString().slice(0, 10);
  const o = [];
  o.push('---', `numero: ${numero}`, 'status: proposto', `data: ${hoje}`, `aidlc: ${aidlc}   # contentVersion de .ai/toolkit-lock.json`, `origem: adequado de ${arquivo.replace(/\\/g, '/').split('/').pop()} (original intacto)`, '---', '');
  o.push(`# Tarefas: ${titulo}`, '');
  o.push(`**Identificador (número falante):** \`${P}.F<fase>.T<tarefa>\` para tarefa e \`${P}.F<fase>.D<n>\` para decisão do dono; \`F0\` vale para o plano inteiro e a fase final é \`${P}.FIM.T1\`. Quem fala com o dono cita sempre plano, fase, tarefa **e o título**.`, '');
  o.push('Legenda: `[ ]` aberta · `[~]` em andamento · `[x]` feita (só com linha `Evidencia:`) · `[>]` adiada · `[?]` decisão do dono.', '');
  o.push('## Princípios e restrições do dono', '', `- <copie do plano original, seção de princípios: ${arquivo.replace(/\\/g, '/').split('/').pop()}>`, '');
  o.push('## Definição de pronto (vale para toda tarefa)', '', 'Testes verdes, commit, linha `Evidencia:` preenchida, documentação e KB atualizadas. Push e merge só com autorização do dono.', '');
  o.push('## Goal do plano inteiro', '', '**Regra de decisão:** se precisar do dono para uma decisão (produto, custo, dependência nova, algo irreversível), **não decida sozinho**. Marque a tarefa como `[?]`, escreva `Pergunta:` e `Recomendacao:`, siga com todas as tarefas que não dependem dela e, **ao final, faça todas as perguntas de uma vez**.', '');
  o.push('```', `/goal Plano completo de <caminho deste plano>: para cada fase, rode \`node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist <fase> --completa --exceto-decisoes\` e mostre cada saída com 0 problema(s); depois rode \`node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> pendencias\` e mostre a saída. Se houver pergunta ao dono, liste todas numa mensagem só, com a sua recomendação, e pare. Máximo de 150 turnos. A condição só vale com essas saídas visíveis.`, '```', '');

  // Decisoes (F0): abertas viram [?]; resolvidas viram [x] com a data/origem como evidencia.
  let d = 0;
  const decisoes = [];
  for (const b of blocos.bloqueia) { d++; decisoes.push({ n: d, estado: '?', titulo: b.slice(0, 80), pergunta: b, rec: '<definir>' }); }
  for (const c of blocos.confirma) { d++; decisoes.push({ n: d, estado: '?', titulo: c.tema, pergunta: `${c.tema}: confirma o padrão proposto?`, rec: c.padrao }); }
  for (const r of blocos.resolvidas) { d++; decisoes.push({ n: d, estado: 'x', titulo: r.slice(0, 80), resposta: r }); }

  const fases = fasesOrdem.length ? fasesOrdem : [{ chave: '1', conteudo: '<definir a fase>', portao: '' }];
  const ids = {};
  o.push('## Fase 0 — Decisões do dono e provas das hipóteses', '', 'Aceite da fase: toda hipótese provada (ou virada achado) e toda decisão respondida ou registrada como pergunta.', '');
  o.push('```', `/goal Fase 0 de <caminho deste plano>: rode \`node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist 0 --completa --exceto-decisoes\` e mostre a saída com 0 problema(s). Máximo de 30 turnos. A condição só vale com essa saída visível.`, '```', '');
  const f0 = [];
  for (const x of decisoes) {
    const id = `${P}.F0.D${x.n}`; f0.push(id);
    if (x.estado === 'x') o.push(`- [x] **${id} ${x.titulo}** (\`depende-de\`: nada; \`escreve\`: este plano)`, `  - Evidencia: decisão do dono já registrada no plano original: ${x.resposta}`, '');
    else o.push(`- [?] **${id} ${x.titulo}** (\`depende-de\`: nada; \`escreve\`: este plano)`, `  - Pergunta: ${x.pergunta}`, `  - Recomendacao: ${x.rec}`, '');
  }
  hipoteses.forEach((h, i) => {
    const id = `${P}.F0.T${i + 1}`; f0.push(id);
    o.push(`- [ ] **${id} Provar ${h.id}: ${h.texto.slice(0, 70)}** (\`depende-de\`: nada; \`escreve\`: <definir>)`, `  - Passos: ${h.prova || '<definir>'}`, '  - Aceite: <definir; resultado inesperado é achado, não teste a consertar>', '  - Evidencia: <preencha só ao marcar [x]>', '');
  });
  ids['0'] = f0.filter((id) => /\.T\d+$/.test(id));
  let anterior = ids['0'];
  for (const f of fases) {
    if (f.chave === '0') continue;
    const id = `${P}.F${f.chave}.T1`;
    o.push(`## Fase ${f.chave} — ${f.conteudo.slice(0, 70)}`, '', 'Aceite da fase: <definir>.', '');
    o.push('```', `/goal Fase ${f.chave} de <caminho deste plano>: rode \`node .ai/skills/sg-plan-goal/scripts/controle.mjs <plano> checklist ${f.chave} --completa\` e mostre a saída com 0 problema(s). Máximo de 20 turnos. A condição só vale com essa saída visível.`, '```', '');
    o.push(`- [ ] **${id} ${f.conteudo.slice(0, 80)}** (\`depende-de\`: ${anterior.length ? anterior.join(', ') : 'nada'}; \`escreve\`: <definir>)`, '  - Passos: <quebre em tarefas T2, T3... conforme o plano original>', '  - Aceite: <definir>', '  - Testes: <guardiões previstos para esta fase no plano original>', ...(f.portao ? [`  - Portão humano: ${f.portao}`] : []), '  - Evidencia: <preencha só ao marcar [x]>', '');
    anterior = [id];
  }
  o.push('## Fase FIM — Fechar', '', `- [ ] **${P}.FIM.T1 Fechar o plano** (\`depende-de\`: ${anterior.join(', ')}; \`escreve\`: este plano)`, '  - Aceite: `status: concluido`, `fechado-por` preenchido e plano arquivado.', '  - Evidencia: <preencha só ao marcar [x]>', '');
  return o.join('\n');
}

function destinoNovo(assunto) {
  let d = resolve(process.cwd());
  let raiz = null;
  for (let i = 0; i < 8 && !raiz; i++) { if (existsSync(join(d, '.ai', 'toolkit-lock.json'))) raiz = d; else d = dirname(d); }
  if (!raiz) { console.error('Nao achei .ai/toolkit-lock.json acima da pasta atual: rode dentro do projeto ou use --saida.'); process.exit(2); }
  const dir = join(raiz, 'docs', 'ai', 'plans');
  mkdirSync(dir, { recursive: true });
  const usados = readdirSync(dir).filter((n) => n.endsWith('.md')).flatMap((n) => {
    const a = /^P(\d+)-/.exec(n)?.[1];
    const b = /^numero:\s*(\d+)/m.exec(readFileSync(join(dir, n), 'utf8'))?.[1];
    return [a, b].filter(Boolean).map(Number);
  });
  const n = Math.max(0, ...usados) + 1;
  const slug = assunto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return { saida: join(dir, `P${n}-${new Date().toISOString().slice(0, 10)}-${slug}.md`), n };
}

const novo = opt('--novo') ? destinoNovo(opt('--novo')) : null;
if (opt('--saida') || novo) {
  const saida = novo ? novo.saida : resolve(opt('--saida'));
  if (saida === resolve(arquivo)) { console.error('A saída não pode ser o próprio plano original.'); process.exit(2); }
  if (existsSync(saida)) { console.error(`Já existe: ${saida}. Escolha outro nome (nunca sobrescrevo).`); process.exit(2); }
  const num = novo ? String(novo.n) : opt('--plano') ??/(?:numero|número)\s*:\s*(\d+)/.exec(fm)?.[1] ?? '1';
  writeFileSync(saida, esqueleto(String(num).replace(/\D/g, '') || '1'));
  console.log(`[diagnostico] esqueleto gravado em ${saida} (${fasesOrdem.length} fase(s), ${hipoteses.length} hipótese(s), ${blocos.bloqueia.length + blocos.confirma.length} pergunta(s) ao dono, ${blocos.resolvidas.length} decisão(ões) já resolvida(s)). Preencha os <definir> e rode: node .ai/skills/sg-plan-goal/scripts/controle.mjs ${saida.replace(/\\/g, '/')} status`);
  process.exit(0);
}

if (args.includes('--json')) console.log(JSON.stringify(diag, null, 2));
else {
  console.log(`[diagnostico] ${diag.arquivo}`);
  console.log(`  cabecalho: status ${diag.status ?? '—'}, aidlc ${diag.aidlc ?? '—'}`);
  console.log(`  formato: ${diag.fases} fase(s), ${diag.tarefas} tarefa(s) (${diag.idsFalantes} com id falante), ${diag.blocosGoal} bloco(s) /goal`);
  console.log(`  o plano já traz: ${diag.encontrado.hipoteses} hipótese(s), ${diag.encontrado.fasesNaOrdemDeExecucao} fase(s) na ordem de execução, ${diag.encontrado.decisoesAbertas} decisão(ões) aberta(s), ${diag.encontrado.decisoesResolvidas} resolvida(s)`);
  diag.problemas.forEach((p) => console.log(`  PROBLEMA: ${p}`));
  console.log(`[diagnostico] ${diag.problemas.length} problema(s)`);
}
process.exit(0);
