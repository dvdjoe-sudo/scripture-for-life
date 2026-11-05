/* Scripture for Life — user-controlled local backup (no cloud service). */
(function (global) {
  'use strict';
  var PREFIX = 'scripture-for-life.';
  var FORMAT = 'scripture-for-life-backup';
  var VERSION = 1;

  function storage() {
    return global.localStorage;
  }

  function collectKeys(store) {
    store = store || storage();
    var out = {};
    var i, key, val;
    for (i = 0; i < store.length; i++) {
      key = store.key(i);
      if (!key || key.indexOf(PREFIX) !== 0) continue;
      val = store.getItem(key);
      if (val === null) continue;
      out[key] = val;
    }
    return out;
  }

  function buildBackup(store) {
    return {
      format: FORMAT,
      version: VERSION,
      exportedAt: new Date().toISOString(),
      app: 'Scripture for Life',
      keys: collectKeys(store)
    };
  }

  function validateBackup(raw) {
    if (raw == null) return { ok: false, error: 'Backup file is empty.' };
    var data = raw;
    if (typeof raw === 'string') {
      try {
        data = JSON.parse(raw);
      } catch (e) {
        return { ok: false, error: 'Backup file is not valid JSON.' };
      }
    }
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return { ok: false, error: 'Backup file has an unexpected shape.' };
    }
    if (data.format !== FORMAT) {
      return { ok: false, error: 'Not a Scripture for Life backup file.' };
    }
    if (data.version !== VERSION) {
      return { ok: false, error: 'Unsupported backup version.' };
    }
    if (!data.keys || typeof data.keys !== 'object' || Array.isArray(data.keys)) {
      return { ok: false, error: 'Backup is missing the keys map.' };
    }
    var entries = Object.keys(data.keys);
    for (var i = 0; i < entries.length; i++) {
      var k = entries[i];
      if (typeof k !== 'string' || k.indexOf(PREFIX) !== 0) {
        return { ok: false, error: 'Backup contains an invalid key: ' + k };
      }
      if (typeof data.keys[k] !== 'string') {
        return { ok: false, error: 'Backup value for ' + k + ' must be a string.' };
      }
    }
    return { ok: true, data: data, keyCount: entries.length };
  }

  function clearPrefixed(store) {
    store = store || storage();
    var toRemove = [];
    var i, key;
    for (i = 0; i < store.length; i++) {
      key = store.key(i);
      if (key && key.indexOf(PREFIX) === 0) toRemove.push(key);
    }
    toRemove.forEach(function (k) {
      store.removeItem(k);
    });
  }

  function applyBackup(backup, opts) {
    opts = opts || {};
    var store = opts.storage || storage();
    var check = validateBackup(backup);
    if (!check.ok) return check;
    if (opts.replace !== false) clearPrefixed(store);
    var keys = check.data.keys;
    Object.keys(keys).forEach(function (k) {
      store.setItem(k, keys[k]);
    });
    return { ok: true, keyCount: check.keyCount };
  }

  function filename() {
    var d = new Date();
    function p(n) {
      return String(n).padStart(2, '0');
    }
    return (
      'scripture-for-life-backup-' +
      d.getFullYear() +
      p(d.getMonth() + 1) +
      p(d.getDate()) +
      '-' +
      p(d.getHours()) +
      p(d.getMinutes()) +
      '.json'
    );
  }

  async function shareOrDownload(json, name) {
    var blob = new Blob([json], { type: 'application/json' });
    var file = null;
    try {
      file = new File([blob], name, { type: 'application/json' });
    } catch (e) {
      file = null;
    }
    if (file && global.navigator && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: 'Scripture for Life backup',
        text: 'Your on-device notes and preferences backup.'
      });
      return 'shared-file';
    }
    var cap = global.Capacitor;
    var sharePlugin = cap && cap.Plugins && cap.Plugins.Share;
    if (sharePlugin && typeof sharePlugin.share === 'function') {
      try {
        await sharePlugin.share({
          title: 'Scripture for Life backup',
          text: json,
          dialogTitle: 'Save or share your backup'
        });
        return 'shared-text';
      } catch (e) {
        if (/cancel/i.test(String((e && (e.message || e.code)) || ''))) return 'cancelled';
      }
    }
    if (global.navigator && typeof navigator.share === 'function' && file) {
      try {
        await navigator.share({
          files: [file],
          title: 'Scripture for Life backup'
        });
        return 'shared-file';
      } catch (e) {
        if (e && e.name === 'AbortError') return 'cancelled';
      }
    }
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 2000);
    return 'download';
  }

  async function exportBackup(store) {
    var backup = buildBackup(store);
    var json = JSON.stringify(backup, null, 2);
    var name = filename();
    var mode = await shareOrDownload(json, name);
    return { ok: mode !== 'cancelled', mode: mode, keyCount: Object.keys(backup.keys).length, filename: name, json: json };
  }

  function importBackupText(text, opts) {
    opts = opts || {};
    var check = validateBackup(text);
    if (!check.ok) return check;
    if (opts.confirm === false) {
      return applyBackup(check.data, opts);
    }
    return { ok: true, needsConfirm: true, keyCount: check.keyCount, data: check.data };
  }

  global.SFL_BACKUP = {
    PREFIX: PREFIX,
    FORMAT: FORMAT,
    VERSION: VERSION,
    collectKeys: collectKeys,
    buildBackup: buildBackup,
    validateBackup: validateBackup,
    applyBackup: applyBackup,
    clearPrefixed: clearPrefixed,
    exportBackup: exportBackup,
    importBackupText: importBackupText,
    filename: filename
  };
})(typeof window !== 'undefined' ? window : globalThis);
