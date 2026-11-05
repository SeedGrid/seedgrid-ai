import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { test } from 'node:test';

const SCRIPTS = resolve(process.cwd(), 'seedgridKB/SeedGrid/Toolkit/skills/sg-plan-goal/scripts');
const SCRIPT = join(SCRIPTS, 'varredura-componentes.mjs');
type Comp = { nome: string; react: boolean; flutter: boolean };
const mod = (await import(pathToFileURL(SCRIPT).href)) as {
  lerFonte: (plataforma: string, fonte?: string) => Comp[];
  blocoNovo: (lista: Comp[], nome?: string) => string;
  cobertura: (texto: string, lista: Comp[], nome?: string) => { erros: string[]; faltam: string[]; sobram: string[] };
  atualizar: (texto: string, lista: Comp[], nome?: string) => { texto: string; acrescentadas: number };
};
const controle = (await import(pathToFileURL(join(SCRIPTS, 'controle.mjs')).href)) as {
  varredura: (texto: string, completa?: boolean) => { blocos: { nome: string; total: number; feitos: number }[]; erros: string[] };
};

const dirs: string[] = [];
process.on('exit', () => { for (const d of dirs) rmSync(d, { recursive: true, force: true }); });

function escreve(p: string, texto = '') { mkdirSync(dirname(p), { recursive: true }); writeFileSync(p, texto, 'utf8'); }

/** Um seedgrid-platform de mentira: paridade.json e os dois showcases. */
function plataforma(): string {
  const raiz = mkdtempSync(join(tmpdir(), 'sg-varredura-comp-'));
  dirs.push(raiz);
  const front = join(raiz, 'front');
  escreve(join(front, 'seedgrid-fe-flutter/docs/paridade.json'), JSON.stringify({
    versaoReact: '2026.11.2',
    componentes: [
      { componente: 'SgInputText', status: 'portado' },
      { componente: 'SgButton', status: 'portado' },
      { componente: 'SgNotificationBell', status: 'parcial' },
      { componente: 'SgSoReact', status: 'pendente' },
    ],
  }));
  const comps = join(front, 'seedgrid-fe-components/apps/showcase/src/app/components');
  for (const n of ['sg-button', 'sg-input-text', 'sg-input-cpfcnpj']) escreve(join(comps, n, 'page.tsx'));
  escreve(join(comps, 'gadgets/sg-clock/page.tsx'));
  escreve(join(comps, 'hooks/useAlgo/page.tsx'));
  const pages = join(front, 'seedgrid-fe-flutter/apps/seedgrid_showcase/lib/pages');
  for (const n of ['sg_button_page.dart', 'sg_input_text_page.dart', 'sg_dock_zone_page.dart', 'sg_button_page.snippets.g.dart', 'pages.g.dart', 'modelo_page.dart']) escreve(join(pages, n));
  return raiz;
}

const roda = (...args: string[]) => { const r = spawnSync(process.execPath, [SCRIPT, ...args], { encoding: 'utf8' }); return { status: r.status, out: r.stdout, err: r.stderr }; };

test('fonte paridade: todos os componentes do pacote e o estado no Flutter (portado/parcial existem; pendente não)', () => {
  const lista = mod.lerFonte(plataforma());
  assert.deepEqual(lista.map((c) => c.nome), ['SgButton', 'SgInputText', 'SgNotificationBell', 'SgSoReact']);
  assert.deepEqual(lista.map((c) => [c.react, c.flutter]), [[true, true], [true, true], [true, true], [true, false]]);
});

test('fonte showcase: une as pastas sg-* do React (inclusive em subpastas) e as páginas sg_*_page.dart do Flutter pelo nome normalizado', () => {
  const lista = mod.lerFonte(plataforma(), 'showcase');
  const por = Object.fromEntries(lista.map((c) => [c.nome, [c.react, c.flutter]]));
  assert.deepEqual(por, { 'sg-button': [true, true], 'sg-clock': [true, false], 'sg-dock-zone': [false, true], 'sg-input-cpfcnpj': [true, false], 'sg-input-text': [true, true] });
  assert.throws(() => mod.lerFonte(plataforma(), 'inventada'), /fonte desconhecida/);
});

test('o bloco gerado tem uma linha por componente, n/a onde a plataforma não tem, e a ordem é a mesma sempre', () => {
  const lista = mod.lerFonte(plataforma());
  const bloco = mod.blocoNovo(lista);
  assert.ok(bloco.includes('| SgSoReact | sim | nao | [ ] | n/a |  |  |'));
  assert.ok(bloco.includes('| SgButton | sim | sim | [ ] | [ ] |  |  |'));
  assert.equal(bloco, mod.blocoNovo(mod.lerFonte(plataforma())));
  // o bloco gerado é válido para as regras da varredura
  const v = controle.varredura(bloco);
  assert.deepEqual(v.erros, []);
  assert.deepEqual(v.blocos, [{ nome: 'comp', total: 4, feitos: 0 }], 'toda linha nasce com marca aberta');
});

test('conferir: componente novo na fonte sem linha reprova; atualizar acrescenta sem tocar nas marcadas', () => {
  const p = plataforma();
  const lista = mod.lerFonte(p);
  const plano = join(p, 'plano.md');
  writeFileSync(plano, ['# Plano', '', mod.blocoNovo(lista.slice(0, 3)), ''].join('\n'), 'utf8');
  let r = roda('conferir', plano, '--plataforma', p);
  assert.equal(r.status, 1);
  assert.match(r.err, /componente "SgSoReact" esta na fonte e nao tem linha/);
  r = roda('atualizar', plano, '--plataforma', p);
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /1 componente\(s\) acrescentado\(s\)/);
  r = roda('conferir', plano, '--plataforma', p);
  assert.equal(r.status, 0, r.err);
  assert.match(r.out, /0 problema\(s\)/);
  // marca à mão e depois atualiza de novo: nada muda na linha marcada
  const marcado = readFileSync(plano, 'utf8').replace('| SgButton | sim | sim | [ ] | [ ] |  |  |', '| SgButton | sim | sim | [x] | [x] | front | verificador ok |');
  writeFileSync(plano, marcado, 'utf8');
  assert.equal(roda('atualizar', plano, '--plataforma', p).status, 0);
  assert.equal(readFileSync(plano, 'utf8'), marcado);
});

test('conferir: linha que não é componente da fonte, [x] sem evidência e --completa com marca aberta reprovam', () => {
  const p = plataforma();
  const lista = mod.lerFonte(p);
  const plano = join(p, 'plano.md');
  const base = mod.blocoNovo(lista);
  writeFileSync(plano, base.replace('<!-- varredura:comp:fim -->', '| SgInventado | sim | sim | [ ] | [ ] |  |  |\n<!-- varredura:comp:fim -->'), 'utf8');
  assert.match(roda('conferir', plano, '--plataforma', p).err, /"SgInventado" esta na tabela e nao e componente da fonte/);

  writeFileSync(plano, base.replace('| SgButton | sim | sim | [ ] | [ ] |  |  |', '| SgButton | sim | sim | [x] | [ ] |  |  |'), 'utf8');
  const sem = roda('conferir', plano, '--plataforma', p);
  assert.equal(sem.status, 1);
  assert.match(sem.err, /"SgButton" esta \[x\] sem "Quem conferiu"/);
  assert.match(sem.err, /"SgButton" esta \[x\] sem "Evidencia"/);

  // tudo marcado com evidência: passa mesmo com --completa; n/a não conta como aberto
  let tudo = base;
  for (const c of lista) tudo = tudo.replace(`| ${c.nome} | ${c.react ? 'sim' : 'nao'} | ${c.flutter ? 'sim' : 'nao'} | [ ] | ${c.flutter ? '[ ]' : 'n/a'} |  |  |`, `| ${c.nome} | ${c.react ? 'sim' : 'nao'} | ${c.flutter ? 'sim' : 'nao'} | [x] | ${c.flutter ? '[x]' : 'n/a'} | front | ok |`);
  writeFileSync(plano, tudo, 'utf8');
  const ok = roda('conferir', plano, '--completa', '--plataforma', p);
  assert.equal(ok.status, 0, ok.err);
  assert.match(ok.out, /4\/4 componentes conferidos \(fonte: 4\)/);
  writeFileSync(plano, tudo.replace('| SgInputText | sim | sim | [x] | [x] | front | ok |', '| SgInputText | sim | sim | [x] | [~] | front | ok |'), 'utf8');
  assert.match(roda('conferir', plano, '--completa', '--plataforma', p).err, /"SgInputText" ainda nao esta \[x\]/);
});

test('uso: sem plataforma, comando inválido e plano ilegível saem com 2', () => {
  assert.equal(roda('gerar').status, 2);
  assert.equal(roda('nada').status, 2);
  const p = plataforma();
  assert.equal(roda('conferir', join(p, 'nao-existe.md'), '--plataforma', p).status, 2);
  assert.equal(roda('gerar', '--plataforma', join(p, 'vazio')).status, 2);
  assert.match(roda('gerar', '--plataforma', p).out, /<!-- varredura:comp:inicio -->/);
});
