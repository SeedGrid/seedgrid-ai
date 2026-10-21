// Quadro de portas e comandos do produto gerado, lido do docker-compose.yml que foi gravado (nunca escrito a mao,
// para nao divergir do compose). Sem dependencia de YAML: o compose do boilerplate usa so "servico:", "image:",
// "ports:" e "profiles:" no formato simples.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const FINALIDADE = [
  [/postgres/i, () => 'banco de dados PostgreSQL'],
  [/redis|valkey/i, () => 'cache Redis'],
  [/minio/i, (c) => (c === 9001 || c === 9011 ? 'console web do MinIO' : 'API S3 do MinIO')],
  [/mailpit/i, (c) => (c === 8025 ? 'interface web do Mailpit (e-mails enviados)' : 'SMTP do Mailpit (sem autenticacao)')],
  [/mailhog/i, (c) => (c === 8025 ? 'interface web do MailHog (e-mails enviados)' : 'SMTP do MailHog')],
  [/mongo-express/i, () => 'interface web do MongoDB'],
  [/mongo/i, () => 'banco MongoDB'],
  [/pgadmin/i, () => 'interface web do PostgreSQL (pgAdmin)'],
  [/mockoon/i, (c) => (c === 3001 ? 'back falso (Mockoon) com dados ficticios' : 'back falso (Mockoon)')],
];

function finalidade(imagem, nome, portaContainer) {
  for (const [re, f] of FINALIDADE) if (re.test(imagem) || re.test(nome)) return f(portaContainer);
  return '';
}

export function lerPortas(destino) {
  const arq = join(destino, 'docker-compose.yml');
  const servicos = [];
  if (existsSync(arq)) {
    const linhas = readFileSync(arq, 'utf8').split(/\r?\n/);
    let atual = null;
    let emPortas = false;
    let emPerfis = false;
    let noBloco = false;
    for (const l of linhas) {
      if (/^services:\s*$/.test(l)) { noBloco = true; continue; }
      if (noBloco && /^\S/.test(l) && l.trim()) { noBloco = false; atual = null; }
      if (!noBloco) continue;
      const s = /^ {2}([A-Za-z0-9_.-]+):\s*$/.exec(l);
      if (s) { atual = { servico: s[1], imagem: '', portas: [], perfis: [] }; servicos.push(atual); emPortas = emPerfis = false; continue; }
      if (!atual) continue;
      const img = /^ {4}image:\s*(\S+)/.exec(l);
      if (img) { atual.imagem = img[1]; emPortas = emPerfis = false; continue; }
      if (/^ {4}ports:\s*$/.test(l)) { emPortas = true; emPerfis = false; continue; }
      if (/^ {4}profiles:\s*$/.test(l)) { emPerfis = true; emPortas = false; continue; }
      const inline = /^ {4}profiles:\s*\[(.*)\]/.exec(l);
      if (inline) { atual.perfis = inline[1].split(',').map((x) => x.trim().replace(/["']/g, '')).filter(Boolean); continue; }
      const item = /^ {6}-\s*["']?([^"'\s#]+)["']?/.exec(l);
      if (item && emPortas) { atual.portas.push(item[1]); continue; }
      if (item && emPerfis) { atual.perfis.push(item[1]); continue; }
      if (/^ {4}\S/.test(l)) emPortas = emPerfis = false;
    }
  }
  const linhasServico = [];
  for (const s of servicos) {
    for (const p of s.portas) {
      const partes = p.split(':');
      const container = parseInt(partes[partes.length - 1], 10);
      const host = parseInt(partes[partes.length - 2], 10);
      if (!Number.isFinite(host)) continue;
      const web = /web|interface|console|ui/i.test(finalidade(s.imagem, s.servico, container));
      linhasServico.push({
        servico: s.servico, imagem: s.imagem, portaHost: host, portaContainer: container, perfis: s.perfis,
        url: web ? `http://localhost:${host}` : `localhost:${host}`,
        finalidade: finalidade(s.imagem, s.servico, container),
      });
    }
  }
  const temPerfilMock = servicos.some((s) => s.perfis.includes('mock'));
  const apps = [
    { nome: 'backend (Quarkus)', porta: 8080, url: 'http://localhost:8080', comando: 'cd backend && mvn quarkus:dev' },
    { nome: 'frontend (Next.js)', porta: 3000, url: 'http://localhost:3000', comando: 'cd frontend && pnpm install && pnpm dev' },
  ];
  if (existsSync(join(destino, 'admin', 'package.json'))) apps.push({ nome: 'admin (Next.js)', porta: 3001, url: 'http://localhost:3001', comando: 'cd admin && pnpm install && pnpm dev -p 3001' });
  const comandos = ['docker compose up -d   # sobe a infraestrutura abaixo (use "podman compose" se for o caso)'];
  if (temPerfilMock) comandos.push('docker compose --profile mock up -d   # inclui o back falso para o front');
  return { servicos: linhasServico, apps, comandos };
}

export function quadro(p) {
  const out = [];
  out.push('Como rodar:');
  for (const c of p.comandos) out.push(`  ${c}`);
  for (const a of p.apps) out.push(`  ${a.comando}   # ${a.nome}: ${a.url}`);
  if (p.servicos.length) {
    out.push('', 'Servicos do docker-compose:');
    const w = Math.max(...p.servicos.map((s) => s.servico.length));
    for (const s of p.servicos) {
      const perfil = s.perfis.length ? ` [perfil ${s.perfis.join(',')}]` : '';
      out.push(`  ${s.servico.padEnd(w)}  ${String(s.portaHost).padStart(5)}  ${s.url}  ${s.finalidade}${perfil}`.trimEnd());
    }
  }
  return out.join('\n');
}

export function comoRodarMd(p) {
  const l = ['# Como rodar', '', 'Gerado pelo `sg-new-product` a partir do `docker-compose.yml` do produto. Se mudar o compose, rode `--reconfigurar`.', '', '## Comandos', '', '```bash'];
  l.push(...p.comandos.map((c) => c.replace(/\s+#.*$/, '')));
  l.push(...p.apps.map((a) => a.comando));
  l.push('```', '', '## Aplicacoes', '', '| aplicacao | porta | URL |', '|---|---|---|');
  for (const a of p.apps) l.push(`| ${a.nome} | ${a.porta} | ${a.url} |`);
  l.push('', '## Servicos do docker-compose', '', '| servico | porta no host | endereco | para que serve | perfil |', '|---|---|---|---|---|');
  for (const s of p.servicos) l.push(`| ${s.servico} | ${s.portaHost} | ${s.url} | ${s.finalidade} | ${s.perfis.join(', ')} |`);
  l.push('');
  return l.join('\n');
}
