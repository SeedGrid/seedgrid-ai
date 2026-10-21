// Gera o ambiente do Mockoon (back falso para o front) a partir de data/mock-rotas.json.
// Determinístico: os UUIDs saem de um hash do slug + rota, entao a mesma resposta gera o mesmo arquivo
// (necessario para o manifesto e para a reconfiguracao).
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

export const PORTA_MOCKOON = 3100;
export const IMAGEM_MOCKOON = 'mockoon/cli:9.9.0';
const AQUI = dirname(fileURLToPath(import.meta.url));

function uuid(...partes) {
  const h = createHash('sha1').update(partes.join('|')).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-4${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
}
const b64u = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
// JWT ficticio: so o front le o claim `audience`; a assinatura e' fixa e invalida de proposito.
function jwtFicticio(audience) {
  return `${b64u({ alg: 'none', typ: 'JWT' })}.${b64u({ sub: '11111111-1111-4111-8111-111111111111', audience, iss: 'mockoon', exp: 4102444800 })}.mock`;
}

export function carregarMock(dataDir = join(AQUI, '..', 'data')) {
  return JSON.parse(readFileSync(join(dataDir, 'mock-rotas.json'), 'utf8'));
}

function resolverCorpo(corpo, def) {
  if (corpo === '$login') {
    return { status: 'OK', token: jwtFicticio(def.tokens.audience), tokenType: 'Bearer', refreshToken: jwtFicticio(def.tokens.audience), publicId: '11111111-1111-4111-8111-111111111111', changePasswordRequired: false, twoFactorEnabled: false };
  }
  if (typeof corpo === 'string' && corpo.startsWith('$paginado:')) {
    const itens = def.dados[corpo.slice('$paginado:'.length)];
    return { items: itens, totalRecords: itens.length, page: 0, size: 10, sortField: 'name', sortOrder: 'asc', query: '' };
  }
  if (corpo === '$permissoes') return def.dados.permissoes;
  return corpo;
}

// modulos: ids de data/mock-rotas.json a incluir (padrao: todos)
export function montarMockoon({ slug, nome, modulos, def = carregarMock() }) {
  const usar = modulos ?? Object.keys(def.modulos);
  const rotas = [];
  for (const m of usar) {
    for (const r of def.modulos[m] ?? []) {
      const corpo = resolverCorpo(r.corpo, def);
      rotas.push({
        uuid: uuid(slug, m, r.metodo, r.caminho),
        type: 'http',
        documentation: r.doc ?? '',
        method: r.metodo,
        endpoint: r.caminho,
        responses: [{
          uuid: uuid(slug, m, r.metodo, r.caminho, 'resposta'),
          body: typeof corpo === 'string' ? corpo : JSON.stringify(corpo, null, 2),
          latency: 0, statusCode: r.status, label: '', headers: [], bodyType: 'INLINE', filePath: '', databucketID: '', sendFileAsBody: false,
          rules: [], rulesOperator: 'OR', disableTemplating: true, fallbackTo404: false, default: true,
        }],
        enabled: true, responseMode: null, streamingMode: null, streamingInterval: 0,
      });
    }
  }
  return {
    uuid: uuid(slug, 'ambiente'),
    lastMigration: 33,
    name: `${nome ?? slug} (back falso)`,
    endpointPrefix: '',
    latency: 0,
    port: PORTA_MOCKOON,
    hostname: '0.0.0.0',
    folders: [],
    routes: rotas,
    rootChildren: rotas.map((r) => ({ type: 'route', uuid: r.uuid })),
    proxyMode: false, proxyHost: '', proxyRemovePrefix: false,
    tlsOptions: { enabled: false, type: 'CERT', pfxPath: '', certPath: '', keyPath: '', caPath: '', passphrase: '' },
    cors: true,
    headers: [{ key: 'Content-Type', value: 'application/json' }],
    proxyReqHeaders: [{ key: '', value: '' }],
    proxyResHeaders: [{ key: '', value: '' }],
    data: [], callbacks: [],
  };
}

export function composeMockoon(slug) {
  return `  mockoon:
    image: ${IMAGEM_MOCKOON}
    restart: unless-stopped
    profiles: ["mock"]
    # Back falso para o front: ${'`docker compose --profile mock up -d`'}. Sem interface web; edite mocks/${slug}.mockoon.json no aplicativo desktop do Mockoon.
    command: ["--data", "/data/${slug}.mockoon.json", "--port", "${PORTA_MOCKOON}", "--disable-admin-api"]
    volumes:
      - ./mocks/${slug}.mockoon.json:/data/${slug}.mockoon.json:ro
    ports:
      - "127.0.0.1:${PORTA_MOCKOON}:${PORTA_MOCKOON}"
`;
}
