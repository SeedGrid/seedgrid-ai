import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';

// O atalho do CLI (2026-10-31, a pedido do dono): `sgr` e o mesmo executavel de `seedgrid-ai`. O nome longo fica,
// porque scripts, documentacao e produtos ja o usam.
const pacote = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { bin: Record<string, string> };

test('bin: seedgrid-ai e o atalho sgr apontam para o mesmo executavel', () => {
  assert.equal(pacote.bin['seedgrid-ai'], 'dist/cli.js');
  assert.equal(pacote.bin['sgr'], pacote.bin['seedgrid-ai']);
});
