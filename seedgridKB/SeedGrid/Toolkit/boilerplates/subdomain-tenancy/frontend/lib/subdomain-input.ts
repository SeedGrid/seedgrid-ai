/**
 * Subdominio da empresa e' SEMPRE minusculo: o usuario digita "Infotec" e a gente converte, em vez de
 * recusar. Aplicado ao digitar (campo) e ao enviar (payload/validacao). P180.F2.T10.
 */
export function normalizeSubdomain(value: string): string {
  return lowerSubdomainWhileTyping(value.trim());
}

/**
 * Enquanto se digita (ou cola): minusculas, sem acento, espaco e `_` (em sequencia) viram UM hifen e o que nao for
 * letra, numero ou hifen e' descartado (simbolos). Ex.: "Informática Ltda_1" -> "informatica-ltda-1". Nao apara hifens
 * nas pontas (o hifen que acabou de virar espaco precisa ficar); isso e' recusado com aviso na validacao.
 */
export function lowerSubdomainWhileTyping(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[\s_]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Regra unica do subdominio (SubdomainRules da extension, KB subdomain-tenancy): minusculas, digitos e hifen
 * (RFC 1123); sem hifen no comeco nem no fim; sem `--` nas posicoes 3 e 4; 5 a 50 caracteres. `_` NAO e aceito.
 */
export const SUBDOMAIN_PATTERN = /^(?!-)(?![a-z0-9-]{2}--)[a-z0-9-]{5,50}(?<!-)$/;

/** Nomes que o cadastro recusa (400, ReservedSubdomainException). */
export const RESERVED_SUBDOMAINS = [
  "master", "www", "api", "admin", "app", "mail", "smtp", "ftp", "root", "static",
  "assets", "cdn", "auth", "login", "billing", "support", "status", "docs", "blog",
];

export const SUBDOMAIN_FORMAT_MESSAGE =
  "Use 5 a 50 caracteres: letras minúsculas, números ou hífen (não pode começar nem terminar com hífen).";
export const SUBDOMAIN_RESERVED_MESSAGE = "Este nome é reservado. Escolha outro subdomínio.";

/** Mensagem de erro do subdominio (ja normalizado ou nao), ou null quando vale. */
export function subdomainError(value: string): string | null {
  const v = normalizeSubdomain(value);
  if (!SUBDOMAIN_PATTERN.test(v)) return SUBDOMAIN_FORMAT_MESSAGE;
  if (RESERVED_SUBDOMAINS.includes(v)) return SUBDOMAIN_RESERVED_MESSAGE;
  return null;
}
