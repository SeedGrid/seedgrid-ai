import { lstat, readdir, readFile, realpath } from 'node:fs/promises';
import path from 'node:path';
import { parseFrontmatter } from './frontmatter.js';
import { isInside, isSafeRelPath } from './paths.js';
import { ToolkitError } from './types.js';

export const CONTENT_SCHEMA_VERSION = 2;

/** Nome no padrão Agent Skills: 1-64, [a-z0-9-], sem hífen nas pontas nem "--". */
export const NAME_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
export const MAX_NAME_LENGTH = 64;

export const AGENT_CAPABILITIES = ['read-files', 'edit-files', 'run-checks'] as const;
export type AgentCapability = (typeof AGENT_CAPABILITIES)[number];

/** Campos de frontmatter de skill aceitos no conteúdo compartilhado (portáveis). */
export const PORTABLE_SKILL_KEYS = ['name', 'description', 'license', 'compatibility', 'metadata', 'allowed-tools'];
const AGENT_KEYS = ['id', 'description', 'capabilities', 'preferred_skills'];
export const AGENT_REQUIRED_SECTIONS = [
  'Objetivo',
  'Quando usar',
  'Entradas necessárias',
  'Responsabilidades',
  'Limites',
  'Formato da entrega',
];
const MAX_AGENT_DESCRIPTION = 300;
const SHARED_TYPES = ['agents', 'rules', 'templates', 'references'] as const;
type SharedType = (typeof SHARED_TYPES)[number] | 'brain';

/** Padrões que nunca devem ir para um pacote público (verificados em todo o conteúdo). */
const SECRET_PATTERNS: [RegExp, string][] = [
  [/\b(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{10,}/, 'chave Stripe'],
  [/\bwhsec_[A-Za-z0-9]{10,}/, 'segredo de webhook Stripe'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'chave de acesso AWS'],
  [/\bgh[pousr]_[A-Za-z0-9]{30,}/, 'token do GitHub'],
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----\s*[A-Za-z0-9+/=]{40,}/, 'chave privada'],
];
const LOCAL_PATH = /[A-Za-z]:[\\/](?:Users|empreendedorismo|mcps|Projetos)\b|\/[cd]\/(?:Users|empreendedorismo|mcps)\b/;

/** Índices gerados (um por pasta); nomes reservados que não podem constar no manifesto. */
export const GENERATED_INDEX_FILES = SHARED_TYPES.map((t) => `${t}/index.md`);
const MAX_DESCRIPTION = 300;

export interface AgentDef {
  id: string;
  description: string;
  capabilities: AgentCapability[];
  preferredSkills: string[];
  /** Caminho relativo à raiz do conteúdo. */
  file: string;
  body: string;
  raw: string;
}

export interface SkillFile {
  /** Caminho relativo à pasta da skill. */
  path: string;
  content: string;
}

export interface SkillDef {
  name: string;
  description: string;
  files: SkillFile[];
}

export interface SharedFile {
  /** Caminho instalado relativo a .ai/ (ex.: rules/coordenacao.md, brain/SeedGrid/Visao-geral.md). */
  path: string;
  /** Caminho de origem relativo à raiz do vault. */
  src: string;
  type: SharedType;
  component: string;
  content: string;
  /** description do frontmatter (rules, templates e references); alimenta o index.md da pasta. */
  description?: string;
}

export interface ContentBundle {
  root: string;
  schemaVersion: number;
  contentVersion: string;
  shared: SharedFile[];
  agents: AgentDef[];
  skills: SkillDef[];
  /** Base de conhecimento instalada em .ai/brain/, ou null se o manifesto não a declara. */
  brain: { notes: number; entrypoints: string[] } | null;
  /** Todos os arquivos de origem (relativos à raiz do vault) que serão instalados. */
  sourceFiles: string[];
}

interface Ctx {
  root: string;
  rootReal: string;
  /** Pasta (relativa à raiz) onde ficam agents/, rules/, templates/, references/ e skills/. */
  base: string;
  errors: string[];
  sources: Set<string>;
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === 'object' && !Array.isArray(v);
}

async function readContentFile(ctx: Ctx, relUnderBase: string, where: string, base = ctx.base): Promise<string | null> {
  if (!isSafeRelPath(relUnderBase)) {
    ctx.errors.push(`${where}: caminho inválido ${JSON.stringify(relUnderBase)}`);
    return null;
  }
  const rel = base ? `${base}/${relUnderBase}` : relUnderBase;
  const abs = path.join(ctx.root, ...rel.split('/'));
  try {
    const st = await lstat(abs);
    if (st.isSymbolicLink()) {
      ctx.errors.push(`${where}: ${rel} é link simbólico; use arquivos regulares no conteúdo`);
      return null;
    }
    if (!st.isFile()) {
      ctx.errors.push(`${where}: ${rel} não é um arquivo`);
      return null;
    }
    const real = await realpath(abs);
    if (!isInside(ctx.rootReal, real)) {
      ctx.errors.push(`${where}: ${rel} fica fora da pasta de conteúdo`);
      return null;
    }
    const buf = await readFile(abs);
    const text = buf.toString('utf8');
    if (Buffer.compare(Buffer.from(text, 'utf8'), buf) !== 0) {
      ctx.errors.push(`${where}: ${rel} não é UTF-8 válido`);
      return null;
    }
    ctx.sources.add(rel);
    for (const [re, label] of SECRET_PATTERNS) {
      if (re.test(text)) ctx.errors.push(`${where}: ${rel} parece conter ${label}; remova antes de distribuir`);
    }
    return text;
  } catch {
    ctx.errors.push(`${where}: arquivo ausente ${rel}`);
    return null;
  }
}

async function listFilesRecursive(dir: string, prefix = ''): Promise<string[]> {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const e of entries) {
    const rel = prefix ? `${prefix}/${e.name}` : e.name;
    if (e.isDirectory()) out.push(...(await listFilesRecursive(path.join(dir, e.name), rel)));
    else out.push(rel);
  }
  return out;
}

function validName(name: unknown): name is string {
  return typeof name === 'string' && name.length <= MAX_NAME_LENGTH && NAME_PATTERN.test(name);
}

function stringList(v: unknown): string[] | null {
  if (v === undefined) return [];
  if (!Array.isArray(v) || !v.every((x) => typeof x === 'string')) return null;
  return v as string[];
}

/** Links Markdown relativos: [texto](destino). Ignora URLs, âncoras e e-mails. */
export function relativeLinks(markdown: string): string[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const out: string[] = [];
  for (const m of withoutCode.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)) {
    const target = m[1]!;
    if (/^[a-z][a-z0-9+.-]*:/i.test(target) || target.startsWith('#')) continue;
    out.push(decodeURIComponent(target.split('#')[0]!));
  }
  return out.filter((t) => t.length > 0);
}

function checkLinks(ctx: Ctx, fromRel: string, text: string, available: Set<string>, scope: string): void {
  for (const link of relativeLinks(text)) {
    if (link.startsWith('/')) {
      ctx.errors.push(`${scope}: ${fromRel} usa link absoluto ${link}`);
      continue;
    }
    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(fromRel), link));
    if (resolved.startsWith('..') || !available.has(resolved.replace(/\/$/, ''))) {
      ctx.errors.push(`${scope}: referência quebrada em ${fromRel} -> ${link}`);
    }
  }
}

/** Destinos de wikilinks do Obsidian ([[destino|rótulo]], [[destino#seção]]), ignorando trechos de código. */
export function wikilinkTargets(markdown: string): string[] {
  const withoutCode = markdown.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '');
  const out: string[] = [];
  for (const m of withoutCode.matchAll(/!?\[\[([^\]\n]+?)\]\]/g)) {
    // Dentro de tabelas Markdown o separador é escrito como "\|".
    const target = m[1]!.replace(/\\\|/g, '|').split('|')[0]!.split('#')[0]!.split('^')[0]!.trim();
    if (target) out.push(target);
  }
  return out;
}

function checkBrain(ctx: Ctx, notes: SharedFile[], entrypoints: string[], brainBase: string): void {
  const known = new Set(notes.map((n) => n.src.replace(/\.md$/, '')));
  for (const n of notes) {
    if (LOCAL_PATH.test(n.content)) ctx.errors.push(`KB ${n.src}: contém caminho local de máquina; use caminhos relativos ao repositório`);
    const missing = new Set<string>();
    for (const t of wikilinkTargets(n.content)) if (!known.has(t.replace(/\.md$/, ''))) missing.add(t);
    for (const t of missing) ctx.errors.push(`KB ${n.src}: wikilink sem destino na base instalada [[${t}]]`);
  }
  for (const e of entrypoints) {
    if (!notes.some((n) => n.src === `${brainBase}/${e}`)) ctx.errors.push(`KB: entrypoint inexistente "${e}"`);
  }
}

function parseAgent(ctx: Ctx, file: string, raw: string): AgentDef | null {
  const where = `agente ${file}`;
  const fm = parseFrontmatter(raw);
  if ('error' in fm) {
    ctx.errors.push(`${where}: ${fm.error}`);
    return null;
  }
  const d = fm.data;
  let ok = true;
  for (const key of Object.keys(d)) {
    if (!AGENT_KEYS.includes(key)) {
      ctx.errors.push(`${where}: campo não suportado "${key}" (permitidos: ${AGENT_KEYS.join(', ')})`);
      ok = false;
    }
  }
  if (!validName(d.id)) {
    ctx.errors.push(`${where}: id ausente ou inválido (use minúsculas, números e hífens)`);
    ok = false;
  } else if (path.posix.basename(file) !== `${d.id}.md`) {
    ctx.errors.push(`${where}: o nome do arquivo deve ser ${d.id}.md`);
    ok = false;
  }
  if (typeof d.description !== 'string' || d.description.trim() === '') {
    ctx.errors.push(`${where}: description obrigatória`);
    ok = false;
  } else if (d.description.length > MAX_AGENT_DESCRIPTION) {
    ctx.errors.push(`${where}: description excede ${MAX_AGENT_DESCRIPTION} caracteres`);
    ok = false;
  }
  const caps = stringList(d.capabilities);
  if (caps === null) {
    ctx.errors.push(`${where}: capabilities deve ser uma lista de textos`);
    ok = false;
  } else {
    for (const c of caps) {
      if (!(AGENT_CAPABILITIES as readonly string[]).includes(c)) {
        ctx.errors.push(`${where}: capability desconhecida "${c}" (permitidas: ${AGENT_CAPABILITIES.join(', ')})`);
        ok = false;
      }
    }
  }
  const skills = stringList(d.preferred_skills);
  if (skills === null) {
    ctx.errors.push(`${where}: preferred_skills deve ser uma lista de textos`);
    ok = false;
  }
  for (const section of AGENT_REQUIRED_SECTIONS) {
    const re = new RegExp(`^##\\s+${section}\\s*$`, 'mi');
    if (!re.test(fm.body)) {
      ctx.errors.push(`${where}: seção obrigatória ausente "## ${section}"`);
      ok = false;
    }
  }
  if (!ok) return null;
  return {
    id: d.id as string,
    description: (d.description as string).trim(),
    capabilities: (caps ?? []) as AgentCapability[],
    preferredSkills: skills ?? [],
    file,
    body: fm.body,
    raw,
  };
}

/** rules, templates e references precisam de description: é ela que aparece no index.md da pasta. */
function sharedDescription(ctx: Ctx, file: string, raw: string): string | undefined {
  const where = `conteúdo ${file}`;
  const fm = parseFrontmatter(raw);
  if ('error' in fm) {
    ctx.errors.push(`${where}: ${fm.error} (rules, templates e references exigem frontmatter com description)`);
    return undefined;
  }
  const d = fm.data.description;
  if (typeof d !== 'string' || d.trim() === '') {
    ctx.errors.push(`${where}: description obrigatória no frontmatter`);
    return undefined;
  }
  if (d.length > MAX_DESCRIPTION) ctx.errors.push(`${where}: description excede ${MAX_DESCRIPTION} caracteres`);
  return d.trim();
}

function checkSkillFrontmatter(ctx: Ctx, name: string, raw: string): string | null {
  const where = `skill ${name}`;
  const fm = parseFrontmatter(raw);
  if ('error' in fm) {
    ctx.errors.push(`${where}: SKILL.md ${fm.error}`);
    return null;
  }
  const d = fm.data;
  for (const key of Object.keys(d)) {
    if (!PORTABLE_SKILL_KEYS.includes(key)) {
      ctx.errors.push(`${where}: campo "${key}" não é portável; mantenha extensões no adaptador`);
    }
  }
  if (d.name !== name) ctx.errors.push(`${where}: o name do SKILL.md deve ser "${name}" (igual à pasta)`);
  if (typeof d.description !== 'string' || d.description.trim() === '') {
    ctx.errors.push(`${where}: description obrigatória`);
    return null;
  }
  if (d.description.length > 1024) ctx.errors.push(`${where}: description excede 1024 caracteres`);
  if (d.compatibility !== undefined && (typeof d.compatibility !== 'string' || d.compatibility.length > 500)) {
    ctx.errors.push(`${where}: compatibility deve ter até 500 caracteres`);
  }
  if (d.metadata !== undefined) {
    if (!isRecord(d.metadata) || !Object.values(d.metadata).every((v) => typeof v === 'string')) {
      ctx.errors.push(`${where}: metadata deve mapear textos para textos`);
    }
  }
  return d.description.trim();
}

/**
 * Carrega e valida a fonte de conteúdo. Todas as falhas são acumuladas e
 * lançadas juntas; nada é instalado a partir de conteúdo inválido.
 */
export async function loadContent(root: string): Promise<ContentBundle> {
  const absRoot = path.resolve(root);
  let rootReal: string;
  try {
    rootReal = await realpath(absRoot);
  } catch {
    throw new ToolkitError(`Pasta de conteúdo não encontrada: ${absRoot}`);
  }
  const ctx: Ctx = { root: absRoot, rootReal, base: '', errors: [], sources: new Set() };

  let manifest: unknown;
  try {
    manifest = JSON.parse(await readFile(path.join(absRoot, 'manifest.json'), 'utf8'));
  } catch (err) {
    throw new ToolkitError(`manifest.json ausente ou inválido em ${absRoot}`, [(err as Error).message]);
  }
  if (!isRecord(manifest)) throw new ToolkitError('manifest.json deve ser um objeto');
  if (manifest.schemaVersion !== CONTENT_SCHEMA_VERSION) {
    throw new ToolkitError(
      `schemaVersion ${String(manifest.schemaVersion)} não suportado (esperado ${CONTENT_SCHEMA_VERSION})`,
    );
  }
  const contentVersion = manifest.contentVersion;
  if (typeof contentVersion !== 'string' || !/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(contentVersion)) {
    ctx.errors.push('manifest: contentVersion deve seguir semver (ex.: 1.0.0)');
  }
  if (!Array.isArray(manifest.components)) throw new ToolkitError('manifest: components deve ser uma lista');
  const toolkitBase = manifest.toolkitBase ?? '';
  if (typeof toolkitBase !== 'string' || (toolkitBase !== '' && !isSafeRelPath(toolkitBase))) {
    throw new ToolkitError('manifest: toolkitBase deve ser um caminho relativo (ex.: SeedGrid/Toolkit)');
  }
  ctx.base = toolkitBase;
  let brain: { base: string; notes: SharedFile[]; entrypoints: string[] } | null = null;

  const shared: SharedFile[] = [];
  const skills: SkillDef[] = [];
  const agentFiles: string[] = [];
  const componentIds = new Set<string>();
  const declaredSkills = new Set<string>();
  const listedByDir = new Map<string, Set<string>>();
  const markListed = (dir: string, rel: string) => {
    if (!listedByDir.has(dir)) listedByDir.set(dir, new Set());
    listedByDir.get(dir)!.add(rel);
  };

  for (const [i, comp] of manifest.components.entries()) {
    const where = `manifest.components[${i}]`;
    if (!isRecord(comp) || typeof comp.id !== 'string' || typeof comp.type !== 'string') {
      ctx.errors.push(`${where}: id e type são obrigatórios`);
      continue;
    }
    if (componentIds.has(comp.id)) ctx.errors.push(`${where}: id duplicado "${comp.id}"`);
    componentIds.add(comp.id);

    if (comp.type === 'brain') {
      // Base de conhecimento: todas as notas .md da pasta base (menos exclusões) viram .ai/brain/<base>/...
      const base = comp.base;
      if (brain) {
        ctx.errors.push(`${where}: só pode haver um componente brain`);
        continue;
      }
      if (typeof base !== 'string' || !isSafeRelPath(base)) {
        ctx.errors.push(`${where}: base inválida ${JSON.stringify(base)}`);
        continue;
      }
      const strings = (v: unknown) => (Array.isArray(v) && v.every((x) => typeof x === 'string') ? (v as string[]) : null);
      const exclude = strings(comp.exclude ?? []);
      const entrypoints = strings(comp.entrypoints ?? []);
      if (!exclude || !entrypoints || entrypoints.some((e) => !isSafeRelPath(e))) {
        ctx.errors.push(`${where}: exclude e entrypoints devem ser listas de caminhos relativos`);
        continue;
      }
      // O conteúdo do toolkit, se estiver dentro da base, é instalado em outros destinos.
      if (toolkitBase.startsWith(`${base}/`)) exclude.push(`${toolkitBase.slice(base.length + 1)}/`);
      const notes: SharedFile[] = [];
      const all = (await listFilesRecursive(path.join(absRoot, ...base.split('/')))).sort();
      for (const rel of all) {
        if (rel.split('/').some((seg) => seg.startsWith('.'))) continue;
        if (exclude.some((x) => (x.endsWith('/') ? rel.startsWith(x) : rel === x))) continue;
        if (!rel.endsWith('.md')) {
          ctx.errors.push(`KB ${base}/${rel}: só arquivos .md são suportados na base de conhecimento`);
          continue;
        }
        const text = await readContentFile(ctx, rel, 'KB', base);
        if (text !== null) notes.push({ path: `brain/${base}/${rel}`, src: `${base}/${rel}`, type: 'brain', component: comp.id, content: text });
      }
      if (notes.length === 0) ctx.errors.push(`${where}: nenhuma nota encontrada em ${base}/`);
      brain = { base, notes, entrypoints };
      continue;
    }

    if (!Array.isArray(comp.files) || comp.files.length === 0) {
      ctx.errors.push(`${where}: files deve ser uma lista não vazia`);
      continue;
    }

    if ((SHARED_TYPES as readonly string[]).includes(comp.type)) {
      const type = comp.type as (typeof SHARED_TYPES)[number];
      for (const f of comp.files) {
        if (typeof f !== 'string' || !isSafeRelPath(f) || !f.startsWith(`${type}/`)) {
          ctx.errors.push(`${where}: arquivo inválido ${JSON.stringify(f)} (deve ficar em ${type}/)`);
          continue;
        }
        if (GENERATED_INDEX_FILES.includes(f)) {
          ctx.errors.push(`${where}: ${f} é gerado automaticamente e não pode ser listado`);
          continue;
        }
        markListed(type, f.slice(type.length + 1));
        const text = await readContentFile(ctx, f, where);
        if (text === null) continue;
        let description: string | undefined;
        if (type === 'agents') agentFiles.push(f);
        else description = sharedDescription(ctx, f, text);
        shared.push({ path: f, src: ctx.base ? `${ctx.base}/${f}` : f, type, component: comp.id, content: text, description });
      }
    } else if (comp.type === 'skill') {
      const name = comp.name;
      if (typeof name === 'string') declaredSkills.add(name);
      if (!validName(name)) {
        ctx.errors.push(`${where}: nome de skill inválido ${JSON.stringify(name)}`);
        continue;
      }
      if (comp.id !== `skill:${name}`) ctx.errors.push(`${where}: o id da skill deve ser "skill:${name}"`);
      if (skills.some((s) => s.name === name)) {
        ctx.errors.push(`${where}: skill duplicada "${name}"`);
        continue;
      }
      const files: SkillFile[] = [];
      const seen = new Set<string>();
      for (const f of comp.files) {
        const entry = typeof f === 'string' ? { path: f, from: undefined } : isRecord(f) ? f : null;
        if (!entry || !isSafeRelPath(entry.path) || (entry.from !== undefined && !isSafeRelPath(entry.from))) {
          ctx.errors.push(`${where}: arquivo inválido ${JSON.stringify(f)}`);
          continue;
        }
        const relInSkill = entry.path as string;
        if (seen.has(relInSkill)) {
          ctx.errors.push(`${where}: arquivo repetido ${relInSkill}`);
          continue;
        }
        seen.add(relInSkill);
        // "from" permite reutilizar um template/referência sem duplicar a autoria.
        const source = typeof entry.from === 'string' ? entry.from : `skills/${name}/${relInSkill}`;
        if (typeof entry.from !== 'string') markListed(`skills/${name}`, relInSkill);
        const text = await readContentFile(ctx, source, `skill ${name}`);
        if (text !== null) files.push({ path: relInSkill, content: text });
      }
      const skillMd = files.find((f) => f.path === 'SKILL.md');
      if (!seen.has('SKILL.md')) {
        ctx.errors.push(`skill ${name}: SKILL.md deve constar em files`);
        continue;
      }
      if (!skillMd) continue;
      const description = checkSkillFrontmatter(ctx, name, skillMd.content);
      if (description === null) continue;
      const available = new Set(files.map((f) => f.path));
      for (const f of files.filter((x) => x.path.endsWith('.md'))) {
        checkLinks(ctx, f.path, f.content, available, `skill ${name}`);
      }
      skills.push({ name, description, files });
    } else {
      ctx.errors.push(`${where}: type desconhecido "${comp.type}"`);
    }
  }

  // Arquivos presentes na fonte mas fora do manifesto indicam esquecimento.
  for (const dir of [...SHARED_TYPES.map(String), ...skills.map((s) => `skills/${s.name}`)]) {
    const listed = listedByDir.get(dir) ?? new Set<string>();
    const dirAbs = path.join(absRoot, ...(ctx.base ? ctx.base.split('/') : []), ...dir.split('/'));
    for (const f of await listFilesRecursive(dirAbs)) {
      if (!listed.has(f)) ctx.errors.push(`arquivo não listado no manifesto: ${dir}/${f}`);
    }
  }
  try {
    for (const e of await readdir(path.join(absRoot, ...(ctx.base ? ctx.base.split('/') : []), 'skills'), { withFileTypes: true })) {
      if (e.isDirectory() && !declaredSkills.has(e.name)) {
        ctx.errors.push(`pasta de skill sem componente no manifesto: skills/${e.name}`);
      }
    }
  } catch {
    // sem pasta skills
  }

  const agents: AgentDef[] = [];
  for (const f of agentFiles) {
    if (f.split('/').length !== 2) {
      ctx.errors.push(`agente ${f}: papéis devem ficar diretamente em agents/`);
      continue;
    }
    const sf = shared.find((s) => s.path === f)!;
    const agent = parseAgent(ctx, f, sf.content);
    if (!agent) continue;
    if (agents.some((a) => a.id === agent.id)) ctx.errors.push(`agente ${f}: id duplicado "${agent.id}"`);
    else agents.push(agent);
  }
  for (const a of agents) {
    for (const s of a.preferredSkills) {
      if (!skills.some((k) => k.name === s)) ctx.errors.push(`agente ${a.id}: preferred_skills referencia skill inexistente "${s}"`);
    }
  }

  // Links entre arquivos compartilhados são verificados no layout instalado (.ai/).
  const sharedAvailable = new Set([...shared.map((s) => s.path), ...(brain?.notes.map((n) => n.path) ?? []), ...GENERATED_INDEX_FILES]);
  for (const p of [...sharedAvailable]) {
    const parts = p.split('/');
    for (let k = 1; k < parts.length; k++) sharedAvailable.add(parts.slice(0, k).join('/'));
  }
  for (const s of shared) {
    if (s.path.endsWith('.md')) checkLinks(ctx, s.path, s.content, sharedAvailable, 'conteúdo');
  }
  if (brain) {
    checkBrain(ctx, brain.notes, brain.entrypoints, brain.base);
    shared.push(...brain.notes);
  }

  if (ctx.errors.length > 0) {
    throw new ToolkitError(`Conteúdo inválido em ${absRoot}`, ctx.errors);
  }
  return {
    root: absRoot,
    schemaVersion: CONTENT_SCHEMA_VERSION,
    contentVersion: contentVersion as string,
    shared,
    agents: agents.sort((a, b) => a.id.localeCompare(b.id)),
    skills: skills.sort((a, b) => a.name.localeCompare(b.name)),
    brain: brain
      ? { notes: brain.notes.length, entrypoints: brain.entrypoints.map((e) => `.ai/brain/${brain.base}/${e}`) }
      : null,
    sourceFiles: [...ctx.sources].sort(),
  };
}
