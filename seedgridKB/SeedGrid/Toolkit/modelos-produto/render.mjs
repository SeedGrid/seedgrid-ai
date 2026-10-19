// Renderizador minimo dos modelos de publicacao: substitui {{nome}} por valores do produto.json.
// Sem dependencias. `${{ ... }}` (expressoes do GitHub Actions) nao e tocado: so {{nome}} sem espacos
// e sem `$` na frente conta como placeholder. Placeholder desconhecido e erro.
// Uso: node render.mjs <produto.json> <pasta-de-saida>
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
const TIPOS = ['backend', 'frontend', 'admin'];

export function renderTemplate(texto, vars) {
  return texto.replace(/(?<!\$)\{\{([A-Za-z_]\w*)\}\}/g, (_, nome) => {
    if (!(nome in vars)) throw new Error(`placeholder sem valor: {{${nome}}}`);
    return String(vars[nome]);
  });
}

export function validarProduto(p) {
  for (const k of ['slug', 'nome', 'dominio', 'registry']) {
    if (typeof p?.[k] !== 'string' || !p[k].trim()) throw new Error(`produto.json: campo "${k}" obrigatorio`);
  }
  if (!/^[a-z][a-z0-9-]*$/.test(p.slug)) throw new Error('produto.json: slug invalido (minusculas, digitos e hifen)');
  if (!Array.isArray(p.servicos) || p.servicos.length === 0) throw new Error('produto.json: servicos vazio');
  const nomes = new Set();
  for (const s of p.servicos) {
    if (!/^[a-z][a-z0-9-]*$/.test(s?.nome ?? '')) throw new Error(`produto.json: nome de servico invalido: ${s?.nome}`);
    if (nomes.has(s.nome)) throw new Error(`produto.json: servico repetido: ${s.nome}`);
    nomes.add(s.nome);
    if (!TIPOS.includes(s.tipo)) throw new Error(`produto.json: tipo invalido em ${s.nome}: ${s.tipo}`);
    if (!Number.isInteger(s.porta) || s.porta < 1 || s.porta > 65535) throw new Error(`produto.json: porta invalida em ${s.nome}`);
  }
}

function ler(arquivo) {
  return readFileSync(join(AQUI, arquivo), 'utf8');
}

// Retorna { caminho: conteudo }: <servico>/Dockerfile para cada servico e .github/workflows/publicar.yml.
export function renderProduto(produto) {
  validarProduto(produto);
  const base = { slug: produto.slug, dominio: produto.dominio, registry: produto.registry.replace(/\/+$/, '') };
  const registryHost = base.registry.split('/')[0];
  const saida = {};
  const jobs = [];
  for (const s of produto.servicos) {
    const vars = { ...base, nome: s.nome, porta: s.porta, registryHost, nomeUpper: s.nome.toUpperCase().replace(/-/g, '_') };
    saida[`${s.nome}/Dockerfile`] = renderTemplate(ler(`${s.tipo}.Dockerfile.tpl`), vars);
    jobs.push(renderTemplate(ler('workflow-job.yml.tpl'), vars).replace(/\s+$/, ''));
  }
  saida['.github/workflows/publicar.yml'] = renderTemplate(ler('workflow.yml.tpl'), {
    ...base,
    nome: produto.nome,
    jobs: jobs.join('\n'),
  });
  return saida;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const [json, out] = process.argv.slice(2);
  if (!json || !out) {
    console.error('uso: node render.mjs <produto.json> <pasta-de-saida>');
    process.exit(2);
  }
  for (const [caminho, texto] of Object.entries(renderProduto(JSON.parse(readFileSync(json, 'utf8'))))) {
    const destino = join(out, caminho);
    mkdirSync(dirname(destino), { recursive: true });
    writeFileSync(destino, texto);
  }
}
