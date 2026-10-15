import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { parse as parseToml } from 'smol-toml';
import { ADAPTERS } from '../adapters/index.js';
import type { Adapter } from '../adapters/types.js';
import { loadContent } from '../core/content.js';
import { bundledContentDir, cliVersion, resolveProject } from '../core/env.js';
import { parseFrontmatter } from '../core/frontmatter.js';
import { inspectInstallation, readIfFile } from '../core/inspect.js';
import { readLock, type Lock } from '../core/lock.js';
import { resolveInProject } from '../core/paths.js';
import { BLOCK_BEGIN } from '../core/blocks.js';
import { detectTool, runProbe, type ToolInfo } from '../core/tools.js';
import { EXIT_ERROR, EXIT_OK, type CommandOptions, type CommandResult } from './common.js';

type Level = 'ok' | 'info' | 'aviso' | 'erro';

interface Check {
  level: Level;
  area: string;
  message: string;
}

interface Discovery {
  target: string;
  kind: 'instruções' | 'skills' | 'agentes';
  location: string;
  syntax: 'válida' | 'inválida';
  realDiscovery: 'não verificada' | 'confirmada' | 'não encontrada';
  howToVerify: string;
}

const HOW_TO_VERIFY: Record<string, Record<Discovery['kind'], string>> = {
  claude: {
    instruções: 'Abra uma nova sessão (claude) na pasta do projeto e pergunte quais regras do SeedGrid AI Toolkit estão carregadas; /memory lista os arquivos de memória.',
    skills: 'Em nova sessão, digite / e confira as skills do toolkit no menu, ou peça a lista de skills disponíveis.',
    agentes: 'Em nova sessão, use /agents e confira os papéis do catálogo.',
  },
  codex: {
    instruções: 'Rode seedgrid-ai doctor --probe, ou abra nova sessão (codex) e pergunte quais instruções de AGENTS.md foram carregadas.',
    skills: 'Rode seedgrid-ai doctor --probe, ou em nova sessão digite $ e confira as skills do toolkit.',
    agentes: 'Marque o projeto como confiável (trust) e, em nova sessão, peça os tipos de agente aceitos por spawn_agent; sem confiança, .codex/agents/ é ignorado.',
  },
};

async function skillNamesIn(projectRoot: string, dir: string): Promise<Map<string, string[]>> {
  const byName = new Map<string, string[]>();
  let entries;
  try {
    entries = await readdir(resolveInProject(projectRoot, dir), { withFileTypes: true });
  } catch {
    return byName;
  }
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const text = await readIfFile(resolveInProject(projectRoot, `${dir}/${e.name}/SKILL.md`));
    if (text === null) continue;
    const fm = parseFrontmatter(text);
    const name = 'error' in fm || typeof fm.data.name !== 'string' ? e.name : fm.data.name;
    byName.set(name, [...(byName.get(name) ?? []), `${dir}/${e.name}`]);
  }
  return byName;
}

async function agentNamesIn(projectRoot: string, adapter: Adapter): Promise<Map<string, string[]>> {
  const byName = new Map<string, string[]>();
  const dir = adapter.nativeAgentsDir;
  let files: string[] = [];
  try {
    files = (await readdir(resolveInProject(projectRoot, dir), { recursive: true })).map(String);
  } catch {
    return byName;
  }
  for (const f of files.filter((x) => x.endsWith(adapter.nativeAgentExtension))) {
    const rel = `${dir}/${f.split(path.sep).join('/')}`;
    const text = await readIfFile(resolveInProject(projectRoot, rel));
    if (text === null) continue;
    let name: unknown;
    if (adapter.nativeAgentExtension === '.toml') {
      try {
        name = (parseToml(text) as Record<string, unknown>).name;
      } catch {
        continue;
      }
    } else {
      const fm = parseFrontmatter(text);
      name = 'error' in fm ? undefined : fm.data.name;
    }
    if (typeof name === 'string') byName.set(name, [...(byName.get(name) ?? []), rel]);
  }
  return byName;
}

/** Resultado da sonda: string com o contexto carregado, null se falhou, undefined se não executada. */
type Probe = string | null | undefined;

function probeResult(probe: Probe, found: boolean): Discovery['realDiscovery'] {
  if (typeof probe !== 'string') return 'não verificada';
  return found ? 'confirmada' : 'não encontrada';
}

async function checkTarget(
  projectRoot: string,
  lock: Lock,
  adapter: Adapter,
  checks: Check[],
  discovery: Discovery[],
  probe: Probe,
) {
  const area = adapter.displayName;
  const how = HOW_TO_VERIFY[adapter.target]!;
  const managed = new Set(lock.files.map((f) => f.path));

  // Instruções
  const instrFile = adapter.target === 'claude' ? 'CLAUDE.md' : 'AGENTS.md';
  const instrOk = lock.blocks.some((b) => b.file === instrFile);
  discovery.push({
    target: adapter.target,
    kind: 'instruções',
    location: instrFile,
    syntax: instrOk ? 'válida' : 'inválida',
    realDiscovery: probeResult(probe, typeof probe === 'string' && probe.includes(BLOCK_BEGIN)),
    howToVerify: how.instruções,
  });
  for (const issue of await adapter.projectChecks(projectRoot, lock.mode)) {
    checks.push({ level: issue.level, area, message: issue.message });
  }

  // Skills
  const skillNames = [...new Set(lock.files.filter((f) => f.component.startsWith('skill:')).map((f) => f.component.slice(6)))];
  const found = await skillNamesIn(projectRoot, adapter.skillsDir);
  let skillsValid = true;
  for (const name of skillNames) {
    const rel = `${adapter.skillsDir}/${name}/SKILL.md`;
    if (!managed.has(rel)) continue;
    const text = await readIfFile(resolveInProject(projectRoot, rel));
    if (text === null) {
      checks.push({ level: 'erro', area, message: `${rel} ausente` });
      skillsValid = false;
      continue;
    }
    const fm = parseFrontmatter(text);
    if ('error' in fm) {
      checks.push({ level: 'erro', area, message: `${rel}: ${fm.error}` });
      skillsValid = false;
    } else if (fm.data.name !== name || typeof fm.data.description !== 'string' || fm.data.description.trim() === '') {
      checks.push({ level: 'erro', area, message: `${rel}: name deve ser "${name}" e description é obrigatória` });
      skillsValid = false;
    }
    const dirs = found.get(name) ?? [];
    if (dirs.length > 1) {
      checks.push({ level: 'aviso', area, message: `skill "${name}" declarada em mais de uma pasta: ${dirs.join(', ')}` });
    }
  }
  discovery.push({
    target: adapter.target,
    kind: 'skills',
    location: `${adapter.skillsDir}/ (${skillNames.length})`,
    syntax: skillsValid ? 'válida' : 'inválida',
    realDiscovery: probeResult(probe, typeof probe === 'string' && skillNames.every((n) => probe.includes(n))),
    howToVerify: how.skills,
  });

  // Agentes nativos
  if (lock.mode === 'native') {
    const agentFiles = lock.files.filter((f) => f.path.startsWith(`${adapter.nativeAgentsDir}/`));
    let valid = agentFiles.length > 0;
    for (const f of agentFiles) {
      const text = await readIfFile(resolveInProject(projectRoot, f.path));
      if (text === null) {
        checks.push({ level: 'erro', area, message: `${f.path} ausente` });
        valid = false;
        continue;
      }
      const issues = adapter.checkNativeAgent(f.path, text);
      for (const i of issues) checks.push({ level: i.level, area, message: i.message });
      if (issues.some((i) => i.level === 'erro')) valid = false;
    }
    for (const [name, files] of await agentNamesIn(projectRoot, adapter)) {
      if (files.length > 1) checks.push({ level: 'aviso', area, message: `agente "${name}" definido mais de uma vez: ${files.join(', ')}` });
    }
    discovery.push({
      target: adapter.target,
      kind: 'agentes',
      location: `${adapter.nativeAgentsDir}/ (${agentFiles.length})`,
      syntax: valid ? 'válida' : 'inválida',
      realDiscovery: 'não verificada',
      howToVerify: how.agentes,
    });
  }
}

function toolCheck(info: ToolInfo, mode: string): Check {
  if (!info.installed) {
    return {
      level: 'aviso',
      area: info.displayName,
      message: `${info.displayName} não encontrado no PATH: o teste real de descoberta não foi executado.`,
    };
  }
  if (info.validated) {
    return { level: 'ok', area: info.displayName, message: `${info.displayName} ${info.version} (versão validada).` };
  }
  return {
    level: mode === 'native' ? 'aviso' : 'info',
    area: info.displayName,
    message: `${info.displayName} ${info.version ?? '(versão desconhecida)'} não consta das versões validadas (${info.validatedVersions.join(', ')}).`,
  };
}

/**
 * Diagnóstico: valida sintaxe e consistência dos destinos de descoberta e
 * relata o que não pode ser verificado sem abrir a ferramenta.
 */
export async function doctorCommand(opts: CommandOptions): Promise<CommandResult> {
  const projectRoot = resolveProject(opts.project);
  const checks: Check[] = [];
  const discovery: Discovery[] = [];
  const limitations: string[] = [];
  const tools: ToolInfo[] = [];

  try {
    const bundle = await loadContent(bundledContentDir());
    checks.push({ level: 'ok', area: 'conteúdo', message: `Conteúdo empacotado ${bundle.contentVersion} válido.` });
  } catch (err) {
    checks.push({ level: 'erro', area: 'conteúdo', message: `Conteúdo empacotado inválido: ${(err as Error).message}` });
  }

  const lockState = await readLock(projectRoot);
  let lock: Lock | null = null;
  if (lockState.status === 'absent') {
    checks.push({ level: 'info', area: 'instalação', message: 'Toolkit não instalado neste projeto.' });
  } else if (lockState.status === 'invalid') {
    checks.push({ level: 'erro', area: 'instalação', message: `Lock inválido: ${lockState.errors.join('; ')}` });
  } else {
    lock = lockState.lock;
    checks.push({ level: 'ok', area: 'instalação', message: `Lock válido: conteúdo ${lock.contentVersion}, ${lock.targets.join('+')}, ${lock.mode}.` });
    const insp = await inspectInstallation(projectRoot, lock);
    for (const f of insp.files.filter((x) => x.state !== 'ok')) {
      checks.push({ level: 'erro', area: 'arquivos', message: `${f.path}: ${f.state}${f.detail ? ` (${f.detail})` : ''}` });
    }
    for (const b of insp.blocks.filter((x) => x.state !== 'ok')) {
      checks.push({ level: 'erro', area: 'blocos', message: `${b.file}: bloco ${b.state}${b.detail ? ` (${b.detail})` : ''}` });
    }
    if (insp.files.every((f) => f.state === 'ok') && insp.blocks.every((b) => b.state === 'ok')) {
      checks.push({ level: 'ok', area: 'arquivos', message: `${insp.files.length} arquivos e ${insp.blocks.length} blocos conferem com os hashes do lock.` });
    }
    // Cópias de skills entre targets devem ser idênticas (mesma fonte).
    const bySkillFile = new Map<string, Set<string>>();
    for (const f of lock.files.filter((x) => x.component.startsWith('skill:'))) {
      const rel = f.path.replace(/^\.(claude|agents)\/skills\//, '');
      if (!bySkillFile.has(rel)) bySkillFile.set(rel, new Set());
      bySkillFile.get(rel)!.add(f.sha256);
    }
    for (const [rel, hashes] of bySkillFile) {
      if (hashes.size > 1) checks.push({ level: 'erro', area: 'skills', message: `cópias divergentes de ${rel} entre targets` });
    }
    const hasLocal = (await readdir(resolveInProject(projectRoot, '.ai/local')).catch(() => null)) !== null;
    checks.push({
      level: 'info',
      area: 'personalização',
      message: hasLocal ? '.ai/local/ presente: personalizações locais serão consideradas.' : '.ai/local/ não existe (opcional).',
    });
  }

  const targets = lock?.targets ?? (['claude', 'codex'] as const);
  for (const t of targets) {
    const adapter = ADAPTERS[t];
    const info = await detectTool(adapter);
    tools.push(info);
    checks.push(toolCheck(info, lock?.mode ?? 'shared'));
    let probe: Probe;
    if (lock && opts.probe && adapter.probeCommand && info.installed) {
      probe = await runProbe(adapter.probeCommand, projectRoot);
      checks.push(
        probe === null
          ? { level: 'aviso', area: adapter.displayName, message: `sonda falhou: ${adapter.probeCommand}` }
          : { level: 'info', area: adapter.displayName, message: `sonda executada: ${adapter.probeCommand}` },
      );
    } else if (lock && opts.probe && !adapter.probeCommand) {
      checks.push({ level: 'info', area: adapter.displayName, message: 'sem sonda automática; use o smoke test manual.' });
    }
    if (lock) {
      await checkTarget(projectRoot, lock, adapter, checks, discovery, probe);
      limitations.push(...adapter.limitations(lock.mode).map((l) => `${adapter.displayName}: ${l}`));
    }
  }
  limitations.push(
    'O doctor valida sintaxe e consistência. A descoberta real só é confirmada com --probe (Codex: instruções e skills) ou abrindo uma nova sessão de cada ferramenta.',
    'Seleção de papéis e delegação seguem instruções; não são garantias determinísticas do instalador.',
  );

  for (const d of discovery.filter((x) => x.realDiscovery === 'não encontrada')) {
    checks.push({ level: 'erro', area: d.target, message: `${d.kind}: a sonda não encontrou o conteúdo instalado em ${d.location}` });
  }
  const hasError = checks.some((c) => c.level === 'erro');
  const icon: Record<Level, string> = { ok: '[ok]', info: '[i]', aviso: '[!]', erro: '[x]' };
  const lines = [`seedgrid-ai doctor (CLI ${cliVersion()}) em ${projectRoot}`, ''];
  for (const c of checks) lines.push(`${icon[c.level].padEnd(5)}${c.area}: ${c.message}`);
  if (discovery.length > 0) {
    lines.push('', 'Destinos de descoberta (sintaxe x descoberta real):');
    for (const d of discovery) {
      lines.push(`  ${d.target.padEnd(7)} ${d.kind.padEnd(11)} ${d.location.padEnd(28)} sintaxe ${d.syntax}; descoberta real ${d.realDiscovery}`);
      lines.push(`          como verificar: ${d.howToVerify}`);
    }
  }
  lines.push('', 'Limitações:');
  for (const l of limitations) lines.push(`  - ${l}`);
  lines.push('', 'Após instalar ou atualizar, abra uma nova sessão: não há recarga garantida em todas as ferramentas.');

  return {
    exitCode: hasError ? EXIT_ERROR : EXIT_OK,
    report: { command: 'doctor', project: projectRoot, cliVersion: cliVersion(), installed: lock !== null, tools, checks, discovery, limitations },
    lines,
  };
}
