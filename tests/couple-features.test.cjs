const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { webcrypto } = require('node:crypto');
const ts = require('typescript');

function load(relative) {
  const filename = path.resolve(__dirname, '..', relative);
  const output = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  const module = { exports: {} };
  vm.runInNewContext(output, {
    module, exports: module.exports, Date, Intl, TextEncoder, crypto: webcrypto,
    require: (name) => load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(filename), `${name}.ts`))),
  }, { filename });
  return module.exports;
}

const { nextTaskDate } = load('lib/taskDates.ts');
const { calendarFile, nextOccurrence } = load('lib/coupleCalendar.ts');
const { ballotHash, ballotStorageKey } = load('lib/secretBallot.ts');
const { questionForDate } = load('lib/coupleIdeas.ts');

test('recurring tasks cross months, years and leap days without losing the original monthly day', () => {
  assert.equal(nextTaskDate('2026-12-31', 'daily'), '2027-01-01');
  assert.equal(nextTaskDate('2026-12-28', 'weekly'), '2027-01-04');
  assert.equal(nextTaskDate('2028-02-28', 'daily'), '2028-02-29');
  assert.equal(nextTaskDate('2026-01-31', 'monthly', undefined, 31), '2026-02-28');
  assert.equal(nextTaskDate('2026-02-28', 'monthly', undefined, 31), '2026-03-31');
  assert.equal(nextTaskDate('', 'weekly', '2026-11-03'), '2026-11-10');
});

test('calendar export escapes event content and includes recurrence and alarms', () => {
  const event = { id: 'date-1', title: 'Viaje, juntos; sí\nBEGIN:VEVENT', date: '2024-02-29', yearly: true, reminderDays: 7 };
  const file = calendarFile(event);
  assert.ok(file.includes('SUMMARY:Viaje\\, juntos\\; sí\\nBEGIN:VEVENT\r\n'));
  assert.ok(file.includes('RRULE:FREQ=YEARLY;BYMONTH=2;BYMONTHDAY=-1'));
  assert.ok(file.includes('TRIGGER:-P7D'));
  assert.ok(!calendarFile({ ...event, reminderDays: -1 }).includes('BEGIN:VALARM'));
  assert.equal(nextOccurrence(event, '2027-02-27'), '2027-02-28');
});

test('secret ballot commitments bind the choice, salt, voter and poll', async () => {
  const ballot = { choice: 1, salt: webcrypto.randomUUID() + webcrypto.randomUUID() };
  const digest = await ballotHash('poll', 'user', ballot);
  assert.match(digest, /^[0-9a-f]{64}$/);
  assert.equal(digest, await ballotHash('poll', 'user', ballot));
  assert.notEqual(digest, await ballotHash('poll', 'user', { ...ballot, choice: 0 }));
  assert.notEqual(digest, await ballotHash('poll', 'user', { ...ballot, salt: 'different' }));
  assert.notEqual(digest, await ballotHash('another-poll', 'user', ballot));
  assert.notEqual(digest, await ballotHash('poll', 'another-user', ballot));
  assert.notEqual(ballotStorageKey('pair', 'poll', 'one'), ballotStorageKey('pair', 'poll', 'two'));
});

test('daily questions switch at Madrid midnight in winter and summer', () => {
  assert.equal(questionForDate(new Date('2026-11-03T22:59:59Z')).day, '2026-11-03');
  assert.equal(questionForDate(new Date('2026-11-03T23:00:00Z')).day, '2026-11-04');
  assert.equal(questionForDate(new Date('2026-07-03T22:00:00Z')).day, '2026-07-04');
});
