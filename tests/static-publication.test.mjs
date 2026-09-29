import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readStaticPublication, validatePublication } from '../packages/backend/src/publication/static-weekly.mjs';

const data = await readStaticPublication(new URL('../', import.meta.url));
const validate = value => validatePublication(value.channels, value.issues, value.sources);
test('publication has complete, traceable first issue', () => {
  assert.equal(data.issues[0].reports.length, 2);
  assert.doesNotThrow(() => validate(data));
});
test('new channel is accepted without publication code changes', () => {
  const next = structuredClone(data);
  next.channels.push({id:'math-teaching', name:'数学教学', shortName:'教学', maxItems:2});
  next.issues[0].reports.push({...next.issues[0].reports[0], id:'new-report', channel:'math-teaching'});
  assert.doesNotThrow(() => validate(next));
});
test('untraceable and unsafe sources cannot publish', () => {
  const next = structuredClone(data);
  next.issues[0].reports[0].sources[0].url = 'javascript:alert(1)';
  assert.throws(() => validate(next), /来源/);
  next.issues[0].reports[0].sources = [];
  assert.throws(() => validate(next), /来源/);
});
test('unknown channels and duplicate issue IDs cannot publish', () => {
  const next = structuredClone(data);
  next.issues[0].reports[0].channel = 'missing';
  assert.throws(() => validate(next), /栏目/);
  const duplicate = structuredClone(data);
  duplicate.issues.push(duplicate.issues[0]);
  assert.throws(() => validate(duplicate), /期号/);
});
test('learning science stays at one article per issue', () => {
  const next = structuredClone(data);
  next.issues[0].reports.push({...next.issues[0].reports[0],id:'extra'});
  assert.throws(() => validate(next), /上限/);
});
