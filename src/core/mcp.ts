import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Target } from './types.js';

/** Servidor de componentes em produção, no modo misto: uma entrada só atende React e Flutter (a tool recebe `platform`). */
export const MCP_NAME = 'seedgrid-components';
export const MCP_URL = process.env.SEEDGRID_AI_MCP_URL || 'https://components-mcp.seedgrid.com.br/mcp/all';

export interface McpSetup {
  file: string;
  /** added: entrada acrescentada; present: já existia (não alterada); skipped: nada feito (motivo em `reason`). */
  status: 'added' | 'present' | 'skipped';
  reason: string;
}

async function read(file: string): Promise<string | null> {
  try {
    return await readFile(file, 'utf8');
  } catch {
    return null;
  }
}

/** `.mcp.json` (Claude Code): acrescenta `mcpServers.seedgrid-components` sem tocar nas demais entradas; nunca sobrescreve a do usuário. */
async function claudeEntry(projectRoot: string): Promise<McpSetup> {
  const file = '.mcp.json';
  const full = path.join(projectRoot, file);
  const raw = await read(full);
  let json: { mcpServers?: Record<string, unknown> } = {};
  let eol = '\n';
  if (raw !== null && raw.trim() !== '') {
    try {
      json = JSON.parse(raw);
    } catch {
      return { file, status: 'skipped', reason: '.mcp.json inválido; não alterado' };
    }
    if (typeof json !== 'object' || json === null || Array.isArray(json)) return { file, status: 'skipped', reason: '.mcp.json não é um objeto; não alterado' };
    if (raw.includes('\r\n')) eol = '\r\n';
  }
  if (json.mcpServers !== undefined && (typeof json.mcpServers !== 'object' || json.mcpServers === null)) {
    return { file, status: 'skipped', reason: '.mcp.json com "mcpServers" inválido; não alterado' };
  }
  if (json.mcpServers && MCP_NAME in json.mcpServers) return { file, status: 'present', reason: `${MCP_NAME} já está no .mcp.json` };
  json.mcpServers = { ...(json.mcpServers ?? {}), [MCP_NAME]: { type: 'http', url: MCP_URL } };
  await writeFile(full, JSON.stringify(json, null, 2).replace(/\n/g, eol) + eol, 'utf8');
  return { file, status: 'added', reason: `${MCP_NAME} → ${MCP_URL}` };
}

/**
 * `.codex/config.toml` (Codex): acrescenta a tabela `[mcp_servers.seedgrid-components]` no fim do arquivo, sem reescrever o resto.
 * O Codex só lê a configuração do projeto se ele estiver marcado como confiável (o aviso fica a cargo do comando).
 */
async function codexEntry(projectRoot: string): Promise<McpSetup> {
  const file = '.codex/config.toml';
  const full = path.join(projectRoot, file);
  const raw = await read(full);
  const header = new RegExp(`^\\s*\\[\\s*mcp_servers\\s*\\.\\s*["']?${MCP_NAME}["']?\\s*\\]`, 'm');
  if (raw !== null && header.test(raw)) return { file, status: 'present', reason: `${MCP_NAME} já está no config.toml` };
  const eol = raw?.includes('\r\n') ? '\r\n' : '\n';
  const table = [`[mcp_servers.${MCP_NAME}]`, `url = "${MCP_URL}"`].join(eol) + eol;
  const prefix = raw === null || raw.trim() === '' ? '' : raw.replace(/\s*$/, '') + eol + eol;
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, prefix + table, 'utf8');
  return { file, status: 'added', reason: `${MCP_NAME} → ${MCP_URL}` };
}

/**
 * Registra o MCP de componentes nos arquivos de configuração de cada ferramenta escolhida. Idempotente e aditivo:
 * entrada já existente (mesmo nome) nunca é alterada. Falha aqui nunca desfaz a instalação.
 */
export async function setupMcp(projectRoot: string, targets: readonly Target[]): Promise<McpSetup[]> {
  if (process.env.SEEDGRID_AI_SKIP_MCP === '1') return [];
  const out: McpSetup[] = [];
  for (const t of targets) {
    try {
      out.push(t === 'claude' ? await claudeEntry(projectRoot) : await codexEntry(projectRoot));
    } catch (err) {
      out.push({ file: t === 'claude' ? '.mcp.json' : '.codex/config.toml', status: 'skipped', reason: `erro: ${(err as Error).message.split('\n')[0]}` });
    }
  }
  return out;
}
