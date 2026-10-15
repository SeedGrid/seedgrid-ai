import assert from 'node:assert/strict';
import { test } from 'node:test';
import { BLOCK_BEGIN, BLOCK_END, removeBlock, scanBlock, upsertBlock } from '../src/core/blocks.js';

test('cria arquivo novo apenas com o bloco', () => {
  assert.equal(upsertBlock(null, 'conteúdo'), `${BLOCK_BEGIN}\nconteúdo\n${BLOCK_END}\n`);
});

test('insere ao final preservando o texto existente e remove de volta ao original', () => {
  const original = '# Projeto\n\nRegras do time.\n';
  const withBlock = upsertBlock(original, 'gerenciado');
  assert.ok(withBlock.startsWith(original));
  assert.equal(removeBlock(withBlock), original);
});

test('substitui somente o interior do bloco, preservando texto antes e depois', () => {
  const text = `antes\n\n${BLOCK_BEGIN}\nv1\n${BLOCK_END}\n\ndepois\n`;
  const updated = upsertBlock(text, 'v2');
  assert.equal(updated, `antes\n\n${BLOCK_BEGIN}\nv2\n${BLOCK_END}\n\ndepois\n`);
  assert.equal(removeBlock(updated), 'antes\n\ndepois\n');
});

test('preserva finais de linha CRLF', () => {
  const text = 'linha 1\r\nlinha 2\r\n';
  const out = upsertBlock(text, 'a\nb');
  assert.ok(out.startsWith(text));
  assert.ok(!/[^\r]\n/.test(out), 'todas as quebras devem ser CRLF');
  assert.equal(removeBlock(out), text);
});

test('marcadores duplicados ou incompletos são inválidos', () => {
  assert.equal(scanBlock(`${BLOCK_BEGIN}\nx\n${BLOCK_END}\n${BLOCK_BEGIN}\n`).status, 'invalid');
  assert.equal(scanBlock(`${BLOCK_END}\n${BLOCK_BEGIN}\n`).status, 'invalid');
  assert.throws(() => upsertBlock(`${BLOCK_BEGIN}\n`, 'x'));
});
