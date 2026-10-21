import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { test } from 'node:test';

// Guardiao do renome Sg das annotations Java (corte seco, 2026-10-21): o nome antigo nao pode voltar a aparecer
// na KB. Tabela: tests/fixtures/renome-sg-tabela.json (copia de planos/transversal/insumos-kb-host/renome-sg-tabela.json
// do repositorio de trabalho). Excecoes: CHANGELOG* (cita os dois nomes), arquivos de Rust (Fase RP), ADRs (historico).
// Nomes ambiguos so valem nas formas inequivocas (@Audit, annotations.Audit, @PersonalData, masking.PersonalData).
type Simbolo = { antigo: string; novo: string | null };
const TABELA = JSON.parse(readFileSync(join(process.cwd(), 'tests/fixtures/renome-sg-tabela.json'), 'utf8')) as { simbolos: Simbolo[] };
const RAIZ = resolve(process.cwd(), 'seedgridKB');
const AMBIGUOS: Record<string, RegExp[]> = {
  Audit: [/@Audit(?![A-Za-z0-9_])/, /annotations\.Audit(?![A-Za-z0-9_])/],
  PersonalData: [/@PersonalData(?![A-Za-z0-9_])/, /masking\.PersonalData(?![A-Za-z0-9_])/],
};
function padrao(antigo: string): RegExp[] {
  return AMBIGUOS[antigo] ?? [new RegExp(`(?<![A-Za-z0-9_])${antigo}(?![A-Za-z0-9_])`)];
}
function mds(dir: string, saida: string[] = []): string[] {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    const rel = p.split(sep).join('/');
    if (e.isDirectory()) { if (!['node_modules', '.git', '.obsidian'].includes(e.name)) mds(p, saida); continue; }
    if (!/\.md$/i.test(e.name) || /^CHANGELOG/i.test(e.name)) continue;
    if (/rust/i.test(e.name) || /\/rust\//i.test(rel) || rel.includes('/Dev/ADR/')) continue;
    saida.push(p);
  }
  return saida;
}

test('guardiao do renome Sg: nenhuma annotation Java com o nome antigo na KB (fora das excecoes)', () => {
  const achados: string[] = [];
  for (const f of mds(RAIZ)) {
    const linhas = readFileSync(f, 'utf8').split(/\r?\n/);
    // ApiKeyAllowed foi REMOVIDA: so pode aparecer dizendo que nao existe (nota de Rust)
    linhas.forEach((l, i) => {
      for (const s of TABELA.simbolos) {
        if (s.novo === null) { if (/ApiKeyAllowed/.test(l)) achados.push(`${f}:${i + 1} ${s.antigo} (removida)`); continue; }
        if (padrao(s.antigo).some((re) => re.test(l))) achados.push(`${f}:${i + 1} ${s.antigo} -> ${s.novo}`);
      }
    });
  }
  assert.deepEqual(achados, [], `nome antigo de annotation encontrado:\n${achados.slice(0, 20).join('\n')}`);
});

test('guardiao do renome Sg: a tabela cobre os 15 renomeados e a removida', () => {
  assert.equal(TABELA.simbolos.filter((s) => s.novo !== null).length, 15);
  assert.equal(TABELA.simbolos.filter((s) => s.novo === null).map((s) => s.antigo).join(), 'ApiKeyAllowed');
  for (const s of TABELA.simbolos) if (s.novo) assert.equal(s.novo, s.novo.startsWith('Sg') ? s.novo : 'Sg...', `${s.antigo} deve virar Sg*`);
});
