/**
 * Subdominio da empresa e' SEMPRE minusculo: o usuario digita "Infotec" e a gente converte, em vez de
 * recusar. Aplicado ao digitar (campo) e ao enviar (payload/validacao). P180.F2.T10.
 */
export function normalizeSubdomain(value: string): string {
  return value.trim().toLowerCase();
}

/** Mesmo que `normalizeSubdomain`, sem o trim: para o valor enquanto se digita (espaco no meio nao some). */
export function lowerSubdomainWhileTyping(value: string): string {
  return value.toLowerCase();
}
