'use strict';
const assert = require('assert'), fs = require('fs'), { JSDOM } = require('jsdom');
const code = fs.readFileSync('site/social-reading-beta/js/prefs.js', 'utf8');
for (const prefs of [{ reduceMotion: 'false' }, { layoutMode: 'unknown' }, { text: {} }, { splitRatio: -400 }, { themeTokens: { bg: '#123456' } }]) {
  const w = new JSDOM('<body></body>', { url: 'https://example.test', runScripts: 'outside-only' }).window;
  w.localStorage.setItem('mjb-srb-prefs-v2', JSON.stringify(prefs));
  w.eval(code);
  const p = w.__SRB_readPrefs();
  assert.strictEqual(p.layoutMode, 'auto');
  assert.strictEqual(p.reduceMotion, null);
  assert.strictEqual(p.text, '100');
  assert.strictEqual(p.splitRatio, 42);
  assert.strictEqual(p.themeTokens, null);
  w.close();
}
console.log('PASS preferences: invalid stored types, enums, ratios and incomplete colours fall back safely');
