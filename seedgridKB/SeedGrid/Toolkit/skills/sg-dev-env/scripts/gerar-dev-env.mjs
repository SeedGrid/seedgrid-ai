#!/usr/bin/env node
// Gera o dev.env de qualquer projeto a partir do arquivo de exemplo (dev.env.example ou .env.example).
//   node gerar-dev-env.mjs --destino <pasta> [--exemplo <arquivo>] [--saida <arquivo>] [--forcar] [--json]
// Regras: valor que nao e placeholder e copiado como esta; placeholder de segredo (vazio, change-me, <...>) vira segredo novo,
// do tipo certo pelo NOME da variavel; credencial de fornecedor externo (Stripe, Google, OpenAI...) fica em branco e entra na
// lista de pendencias (nunca e inventada). Se o dev.env ja existe, so acrescenta o que falta (nunca troca valor); --forcar refaz
// os segredos. Garante dev.env no .gitignore. Nunca imprime valor de segredo. Sem dependencias.
import { generateKeyPairSync, randomBytes } from 'node:crypto';
import { chmodSync, existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const CANDIDATOS = ['dev.env.example', 'backend/dev.env.example', '.env.example', 'backend/.env.example'];
const PLACEHOLDER = /^(|change[-_ ]?me|changeme|todo|xxx+|<[^>]*>|\$\{externo\}|replace[-_ ]?me|your[-_ ].*|seu[-_ ].*)$/i;
// Fornecedor externo: a credencial nasce no painel dele, o gerador nao pode criar.
const EXTERNO = /(STRIPE|GOOGLE|FACEBOOK|META|OPENAI|ANTHROPIC|AWS|AZURE|TWILIO|SENDGRID|MAILGUN|GITHUB|QDRANT|MERCADOPAGO|PAGARME)[A-Z0-9_]*(KEY|SECRET|TOKEN|CLIENT_ID|APIKEY|WEBHOOK)/;
// Placeholder embutido num valor maior (ex.: mongodb://admin:change-me@host): o script nao reescreve URL; avisa.
const EMBUTIDO = /change[-_ ]?me|<[^>]+>/i;
const alfabeto = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

function alnum(n) {
  const b = randomBytes(n * 2);
  let s = '';
  for (let i = 0; i < b.length && s.length < n; i++) if (b[i] < 256 - (256 % alfabeto.length)) s += alfabeto[b[i] % alfabeto.length];
  return s.length === n ? s : alnum(n);
}
function senhaPolitica() {
  // Politica de senha do security: minimo 8, maiuscula, minuscula, especial, sem repeticao seguida.
  for (;;) {
    const s = `${alnum(6)}${randomBytes(1)[0] % 10}${'!@#$%&*?'[randomBytes(1)[0] % 8]}${alnum(6)}`;
    if (/[A-Z]/.test(s) && /[a-z]/.test(s) && !/(.)\1/.test(s)) return s;
  }
}

/** Tipo de segredo pelo nome da variavel; null = nao e segredo (o placeholder fica como esta). */
export function tipoDoSegredo(nome) {
  if (EXTERNO.test(nome)) return 'externo';
  if (/(JWT|RSA|SIGNING).*PRIVATE|PRIVATE.*(KEY|B64)/.test(nome)) return 'rsa-privada-b64';
  if (/(JWT|RSA|SIGNING).*PUBLIC|PUBLIC.*(KEY|B64)/.test(nome)) return 'rsa-publica-b64';
  if (/ADMIN.*(PASSWORD|SENHA)/.test(nome)) return 'politica-admin';
  if (/(PASSWORD|PASSWD|SENHA)/.test(nome)) return 'senha';
  if (/(ENCRYPTION|CRYPTO|SEARCH|HASH|PEPPER|SALT).*KEY|MASTER_KEY/.test(nome)) return 'base64-32';
  if (/(SECRET|TOKEN|APIKEY|API_KEY)/.test(nome)) return 'hex-32';
  return null;
}

export function criarGerador() {
  let par = null;
  const rsa = () => (par ??= generateKeyPairSync('rsa', { modulusLength: 2048, publicKeyEncoding: { type: 'spki', format: 'der' }, privateKeyEncoding: { type: 'pkcs8', format: 'der' } }));
  return (tipo) => {
    switch (tipo) {
      case 'senha': return alnum(32);
      case 'politica-admin': return senhaPolitica();
      // Nunca comeca com '/': o Git Bash (run.sh no Windows) reescreve valor de variavel que comeca com '/' como caminho ("C:/Program Files/Git/...") e a chave deixa de ser base64 valido.
      case 'base64-32': { let v; do v = randomBytes(32).toString('base64'); while (v.startsWith('/')); return v; }
      case 'hex-32': return randomBytes(32).toString('hex');
      case 'rsa-privada-b64': return rsa().privateKey.toString('base64');
      case 'rsa-publica-b64': return rsa().publicKey.toString('base64');
      default: throw new Error(`tipo de segredo desconhecido: ${tipo}`);
    }
  };
}

export function lerLinhas(texto) {
  return texto.replace(/\r\n/g, '\n').split('\n').map((l) => {
    const m = /^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/.exec(l);
    return m ? { chave: m[1], valor: m[2], linha: l } : { linha: l };
  });
}

export function achaExemplo(destino, exemplo) {
  if (exemplo) return resolve(destino, exemplo);
  for (const c of CANDIDATOS) if (existsSync(join(destino, c))) return join(destino, c);
  return null;
}

/** Gera o conteudo do dev.env. `existente`: texto do dev.env atual (ou null). Devolve { texto, relatorio }. */
export function gerar({ exemplo, existente = null, forcar = false }) {
  const gerarValor = criarGerador();
  const atuais = new Map();
  if (existente && !forcar) for (const l of lerLinhas(existente)) if (l.chave) atuais.set(l.chave, l.valor);
  const rel = { gerados: {}, copiados: 0, mantidos: 0, pendencias: [], embutidos: [] };
  const saida = [];
  for (const l of lerLinhas(exemplo)) {
    if (!l.chave) { saida.push(l.linha); continue; }
    if (atuais.has(l.chave)) { saida.push(`${l.chave}=${atuais.get(l.chave)}`); rel.mantidos++; continue; }
    if (!PLACEHOLDER.test(l.valor.trim())) {
      saida.push(l.linha);
      rel.copiados++;
      if (EMBUTIDO.test(l.valor)) rel.embutidos.push(l.chave);
      continue;
    }
    const tipo = tipoDoSegredo(l.chave);
    if (tipo === null) { saida.push(l.linha); rel.copiados++; continue; }
    if (tipo === 'externo') { saida.push(`${l.chave}=`); rel.pendencias.push(l.chave); continue; }
    saida.push(`${l.chave}=${gerarValor(tipo)}`);
    (rel.gerados[tipo] ??= []).push(l.chave);
  }
  // O que ja existia no dev.env e nao esta mais no exemplo continua: nao apagamos nada do usuario.
  if (existente && !forcar) {
    const noExemplo = new Set(lerLinhas(exemplo).filter((x) => x.chave).map((x) => x.chave));
    const extras = [...atuais].filter(([k]) => !noExemplo.has(k));
    if (extras.length) {
      saida.push('', '# Variaveis que ja existiam neste dev.env e nao constam do exemplo (mantidas)');
      for (const [k, v] of extras) saida.push(`${k}=${v}`);
      rel.mantidos += extras.length;
    }
  }
  return { texto: saida.join('\n').replace(/\n*$/, '\n'), relatorio: rel };
}

export function garantirGitignore(pasta, nomeSaida) {
  const arq = join(pasta, '.gitignore');
  const atual = existsSync(arq) ? readFileSync(arq, 'utf8') : '';
  const linhas = atual.replace(/\r\n/g, '\n').split('\n').map((x) => x.trim());
  if (linhas.includes(nomeSaida) || linhas.includes(`/${nomeSaida}`) || linhas.includes('*.env') || linhas.includes('.env*')) return false;
  writeFileSync(arq, `${atual}${atual && !atual.endsWith('\n') ? '\n' : ''}${nomeSaida}\n`);
  return true;
}

function main() {
  const arg = (n) => { const i = process.argv.indexOf(`--${n}`); return i >= 0 ? process.argv[i + 1] : undefined; };
  const destino = resolve(arg('destino') ?? '.');
  const exemploArq = achaExemplo(destino, arg('exemplo'));
  if (!exemploArq || !existsSync(exemploArq)) {
    console.error(`Nao achei dev.env.example nem .env.example em ${destino} (use --exemplo <arquivo>).`);
    process.exit(2);
  }
  const saidaArq = resolve(destino, arg('saida') ?? join(dirname(relative(destino, exemploArq)), 'dev.env'));
  const forcar = process.argv.includes('--forcar');
  const existente = existsSync(saidaArq) ? readFileSync(saidaArq, 'utf8') : null;
  const { texto, relatorio } = gerar({ exemplo: readFileSync(exemploArq, 'utf8'), existente, forcar });
  writeFileSync(saidaArq, texto, { mode: 0o600 });
  try { chmodSync(saidaArq, 0o600); } catch { /* Windows */ }
  const gitignore = garantirGitignore(dirname(saidaArq), saidaArq.split(/[\\/]/).pop());
  const r = { exemplo: relative(destino, exemploArq), saida: relative(destino, saidaArq), tinhaDevEnv: existente !== null, forcado: forcar, ...relatorio, gitignoreAtualizado: gitignore };
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); return; }
  const n = Object.values(r.gerados).reduce((s, a) => s + a.length, 0);
  console.log(`${r.saida} ${r.tinhaDevEnv && !forcar ? 'completado' : 'gerado'} a partir de ${r.exemplo}: ${n} segredo(s) novo(s), ${r.copiados} valor(es) copiado(s), ${r.mantidos} mantido(s).`);
  for (const [t, ks] of Object.entries(r.gerados)) console.log(`  ${t}: ${ks.join(', ')}`);
  if (r.pendencias.length) console.log(`PENDENTE (credencial de fornecedor externo, preencha voce): ${r.pendencias.join(', ')}`);
  if (r.embutidos.length) console.log(`REVISAR (placeholder dentro de um valor maior, ex.: senha numa URL; o script nao reescreve): ${r.embutidos.join(', ')}`);
  if (gitignore) console.log('.gitignore atualizado: dev.env nao vai para o git.');
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) main();
