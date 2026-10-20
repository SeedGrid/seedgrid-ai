// Remocao de modulos das telas do front e do admin, a partir de data/modulos-front.json. Sem dependencias.
// A mesma funcao serve ao scaffold (produto novo) e a reconfiguracao (mudar de ideia depois).
import { existsSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

export const ESCOPOS_FRONT = ['frontend', 'admin'];

// 'self-enter@admin' -> { modulo: 'self-enter', escopo: 'admin' }
export function lerAlvo(texto) {
  const [modulo, escopo] = String(texto).split('@');
  return { modulo, escopo };
}

// Problemas de uma lista de alvos contra o catalogo de receitas (vazia = ok).
export function validarAlvos(alvos, modulosFront) {
  const erros = [];
  for (const a of alvos) {
    const { modulo, escopo } = lerAlvo(a);
    const receita = modulosFront?.modulos?.[modulo]?.escopos?.[escopo];
    if (!ESCOPOS_FRONT.includes(escopo)) erros.push(`alvo de front invalido: ${a} (use modulo@frontend ou modulo@admin)`);
    else if (!receita) erros.push(`sem receita de remocao provada para ${a} em data/modulos-front.json`);
  }
  return erros;
}

// Aplica as receitas dos alvos em <destino>/<escopo>. Devolve as notas do que fez (e do que nao encontrou).
export function removerModulosFront(destino, alvos, modulosFront) {
  const notas = [];
  for (const alvo of [...new Set(alvos)].sort()) {
    const { modulo, escopo } = lerAlvo(alvo);
    const receita = modulosFront.modulos[modulo].escopos[escopo];
    const raiz = join(destino, escopo);
    if (!existsSync(raiz)) { notas.push(`${alvo}: pasta ${escopo}/ nao existe neste produto; nada a remover`); continue; }
    for (const rel of receita.apagar ?? []) {
      const p = join(raiz, rel);
      if (!existsSync(p)) { notas.push(`${alvo}: ${escopo}/${rel} ja nao existe`); continue; }
      rmSync(p, { recursive: statSync(p).isDirectory(), force: true });
      notas.push(`${alvo}: removido ${escopo}/${rel}`);
    }
    for (const { arquivo, contem } of receita.linhas ?? []) {
      const p = join(raiz, arquivo);
      if (!existsSync(p)) { notas.push(`${alvo}: ${escopo}/${arquivo} nao existe`); continue; }
      const texto = readFileSync(p, 'utf8');
      const fim = texto.includes('\r\n') ? '\r\n' : '\n';
      const linhas = texto.split(fim);
      const manter = linhas.filter((l) => !l.includes(contem));
      if (manter.length === linhas.length) { notas.push(`${alvo}: linha nao encontrada em ${escopo}/${arquivo} (${contem}); revise o menu a mao`); continue; }
      writeFileSync(p, manter.join(fim));
      notas.push(`${alvo}: ${linhas.length - manter.length} linha(s) removida(s) de ${escopo}/${arquivo}`);
    }
  }
  return notas;
}
