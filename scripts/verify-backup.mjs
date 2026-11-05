import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

class MemoryStorage {
  constructor(init = {}) {
    this._data = { ...init };
  }
  get length() {
    return Object.keys(this._data).length;
  }
  key(i) {
    return Object.keys(this._data)[i] ?? null;
  }
  getItem(k) {
    return Object.prototype.hasOwnProperty.call(this._data, k) ? this._data[k] : null;
  }
  setItem(k, v) {
    this._data[k] = String(v);
  }
  removeItem(k) {
    delete this._data[k];
  }
  clear() {
    this._data = {};
  }
}

const src = readFileSync(path.join(process.cwd(), 'backup.js'), 'utf8');
const sandbox = { console, Date, JSON, Blob: class {}, File: class {}, URL: { createObjectURL() { return ''; }, revokeObjectURL() {} }, document: { createElement() { return { click() {}, remove() {} }; }, body: { appendChild() {} } }, setTimeout, navigator: {}, Capacitor: undefined };
sandbox.window = sandbox;
sandbox.globalThis = sandbox;
sandbox.localStorage = new MemoryStorage();
vm.runInNewContext(src, sandbox);
const B = sandbox.SFL_BACKUP;
assert.ok(B, 'SFL_BACKUP missing');

function check(name, fn) {
  fn();
  console.log('PASS —', name);
}

check('collect only scripture-for-life keys', () => {
  const store = new MemoryStorage({
    'scripture-for-life.saved': '{"Psalm 23:1":{"text":"x"}}',
    'scripture-for-life.notes': '{"Psalm 23:1":"hello"}',
    'other.app': 'nope'
  });
  const keys = B.collectKeys(store);
  assert.equal(Object.keys(keys).length, 2);
  assert.equal(keys['other.app'], undefined);
});

check('round-trip export/import restores all keys', () => {
  const store = new MemoryStorage({
    'scripture-for-life.saved': '{"Psalm 23:1":{"text":"The LORD is my shepherd;"}}',
    'scripture-for-life.notes': '{"Psalm 23:1":"peace"}',
    'scripture-for-life.theme': 'dark',
    'scripture-for-life.genesis-note-1-2': 'scene note',
    'scripture-for-life.text-size': 'large'
  });
  const backup = B.buildBackup(store);
  assert.equal(backup.format, B.FORMAT);
  assert.equal(backup.version, B.VERSION);
  assert.equal(Object.keys(backup.keys).length, 5);
  const empty = new MemoryStorage({ 'scripture-for-life.streak': '{"count":9}' });
  const applied = B.applyBackup(backup, { storage: empty, replace: true });
  assert.equal(applied.ok, true);
  assert.equal(empty.getItem('scripture-for-life.streak'), null);
  assert.equal(empty.getItem('scripture-for-life.saved'), store.getItem('scripture-for-life.saved'));
  assert.equal(empty.getItem('scripture-for-life.notes'), '{\"Psalm 23:1\":\"peace\"}');
  assert.equal(empty.getItem('scripture-for-life.theme'), 'dark');
  assert.equal(empty.getItem('scripture-for-life.genesis-note-1-2'), 'scene note');
  assert.equal(empty.getItem('scripture-for-life.text-size'), 'large');
});

check('bad JSON rejected', () => {
  const r = B.validateBackup('{not json');
  assert.equal(r.ok, false);
  assert.match(r.error, /JSON/i);
});

check('wrong format rejected', () => {
  const r = B.validateBackup(JSON.stringify({ format: 'other', version: 1, keys: {} }));
  assert.equal(r.ok, false);
  assert.match(r.error, /Not a Scripture for Life/i);
});

check('foreign key rejected', () => {
  const r = B.validateBackup(
    JSON.stringify({
      format: B.FORMAT,
      version: B.VERSION,
      keys: { 'evil.key': 'x' }
    })
  );
  assert.equal(r.ok, false);
  assert.match(r.error, /invalid key/i);
});

check('non-string value rejected', () => {
  const r = B.validateBackup(
    JSON.stringify({
      format: B.FORMAT,
      version: B.VERSION,
      keys: { 'scripture-for-life.notes': { nested: true } }
    })
  );
  assert.equal(r.ok, false);
  assert.match(r.error, /must be a string/i);
});

console.log('All backup checks passed.');
