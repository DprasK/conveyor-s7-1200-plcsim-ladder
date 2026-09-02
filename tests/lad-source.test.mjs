import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (name) => fs.readFileSync(path.join(root, 'source', name), 'utf8');

test('PLC program is LAD and contains fifteen documented networks', () => {
  const fb = read('FB_Conveyor_LAD.xml');
  assert.match(fb, /<ProgrammingLanguage>LAD<\/ProgrammingLanguage>/);
  assert.doesNotMatch(fb, /ProgrammingLanguage>SCL/);
  assert.equal((fb.match(/SW\.Blocks\.CompileUnit ID=/g) ?? []).length, 15);
  for (let number = 1; number <= 15; number += 1) {
    assert.match(fb, new RegExp(`<Text>${String(number).padStart(2, '0')} -`));
  }
});

test('tag table maps nine unique physical addresses', () => {
  const tagTable = read('Conveyor_IO_LAD.xml');
  const addresses = [...tagTable.matchAll(/<LogicalAddress>(%[IQ]\d+\.\d+)<\/LogicalAddress>/g)].map((match) => match[1]);
  assert.equal(addresses.length, 9);
  assert.equal(new Set(addresses).size, addresses.length);
  assert.deepEqual(addresses.slice(0, 6), ['%I0.0', '%I0.1', '%I0.2', '%I0.3', '%I0.4', '%I0.5']);
  assert.deepEqual(addresses.slice(6), ['%Q0.0', '%Q0.1', '%Q0.2']);
});

test('Main OB1 calls the conveyor FB through its instance DB', () => {
  const main = read('Main_LAD.xml');
  assert.match(main, /<Name>Main<\/Name><Number>1<\/Number>/);
  assert.match(main, /CallInfo Name="FB_Conveyor_LAD" BlockType="FB"/);
  assert.match(main, /Component Name="DB_Conveyor_LAD"/);
  assert.match(main, /<ConstantValue>T#5s<\/ConstantValue>/);
});

