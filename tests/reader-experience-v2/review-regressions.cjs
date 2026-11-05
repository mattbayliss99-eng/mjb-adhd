'use strict';
// DOM behaviour checks. These do not establish browser layout or device accessibility.
const { JSDOM } = require('jsdom');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.join(__dirname, '../..');
function open(route, seed = {}) {
  const dom = new JSDOM(fs.readFileSync(path.join(root, 'site', route, 'index.html'), 'utf8'), {
    url: 'https://mjb.test/' + route, runScripts: 'outside-only', pretendToBeVisual: true
  });
  const w = dom.window;
  w.matchMedia = () => ({ matches: false });
  w.scrollTo = () => {};
  w.alert = () => {};
  for (const [key, value] of Object.entries(seed)) w.localStorage.setItem(key, JSON.stringify(value));
  return dom;
}
function script(dom, name) {
  dom.window.eval(fs.readFileSync(path.join(root, 'site/social-reading-beta/js', name + '.js'), 'utf8'));
}
function story(query, seed) {
  const dom = open('social-reading-beta/p/mjb-p000001/', seed);
  if (query) dom.window.history.replaceState(null, '', '?slide=' + query);
  script(dom, 'prefs'); script(dom, 'story');
  return dom;
}
const current = d => new URL(d.window.location.href).searchParams.get('slide');
(async () => {
  {
    const dom = open('social-reading-beta/saved/', {
      'mjb-srb-favourites-v1': [{ id: 'MJB-P000001', title: '<img src=x onload="window.injected=1">', savedAt: '<svg onload="window.injected=1">' }]
    });
    script(dom, 'favourites');
    const list = dom.window.document.querySelector('#srb-saved-list');
    assert.equal(list.querySelector('img,svg,script'), null);
    assert.ok(list.textContent.includes('<img'));
    assert.doesNotMatch(list.textContent, /Nothing saved/);
    dom.window.close();
  }
  for (const value of [null, {}, ['bad'], [null], [{id:'MJB-P000001', title:{bad:true}}]]) {
    const dom = open('social-reading-beta/saved/', { 'mjb-srb-favourites-v1': value });
    script(dom, 'favourites');
    assert.match(dom.window.document.querySelector('#srb-saved-list').textContent, /Nothing saved/);
    dom.window.close();
  }
  {
    const dom = story('2');
    assert.equal(current(dom), 'MJB-S000001-02');
    const button = dom.window.document.querySelector('[data-slide-next]');
    button.dispatchEvent(new dom.window.KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true, cancelable:true}));
    assert.equal(current(dom), 'MJB-S000001-02', 'arrow on a native control must not advance text');
    dom.window.document.querySelector('[data-visual-next]').click();
    assert.equal(dom.window.document.querySelector('[data-pin-visual]').dataset.manual, '1');
    button.click();
    assert.equal(dom.window.document.querySelector('[data-pin-visual]').dataset.manual, '1');
    assert.equal(dom.window.document.querySelector('[data-resume-linked]').hidden, false);
    dom.window.document.querySelector('[data-resume-linked]').click();
    assert.equal(dom.window.document.querySelector('[data-pin-visual]').dataset.manual, undefined);
    dom.window.close();
  }
  {
    const dom = story(null, { 'mjb-srb-progress:MJB-P000001': {slideId:'MJB-S000001-03'} });
    assert.equal(current(dom), 'MJB-S000001-03', 'progress must survive a new session');
    dom.window.close();
  }
  {
    const dom = story('MJB-S000001-03');
    const doc = dom.window.document;
    assert.equal(doc.querySelector('[data-thread]').hidden, true, 'split must not duplicate thread content');
    doc.querySelector('[data-split-preset="continuous"]').click();
    assert.equal(doc.querySelectorAll('.srb-slide:not([hidden])').length, 4, 'continuous must expose all steps');
    assert.equal(doc.querySelector('[data-thread]').hidden, true);
    doc.querySelector('[data-split-preset="thread"]').click();
    assert.equal(doc.querySelectorAll('.srb-slide:not([hidden])').length, 0);
    assert.equal(doc.querySelector('[data-thread]').hidden, false);
    doc.querySelector('[data-split-preset="split"]').click();
    assert.equal(doc.querySelectorAll('.srb-slide:not([hidden])').length, 1);
    assert.equal(doc.querySelector('.srb-slide:not([hidden])').dataset.slideId, 'MJB-S000001-03');
    dom.window.close();
  }
  {
    const dom = story('MJB-S000001-03');
    dom.window.print = () => {};
    const details = [...dom.window.document.querySelectorAll('details.srb-evidence')];
    const before = details.map(d => d.open);
    dom.window.document.querySelector('[data-print-deck]').click();
    await new Promise(r => setTimeout(r, 600));
    assert.equal(current(dom), 'MJB-S000001-03', 'printing must preserve the selected step');
    assert.deepEqual(details.map(d => d.open), before, 'printing must restore disclosures');
    dom.window.close();
  }
  assert.equal(fs.existsSync(path.join(root, 'site/social-reading-beta/assets/topic-network.jpg')), false);
  console.log('PASS review regressions: safe favourite rendering/corrupt storage, numeric slide links, native-control arrows, manual pin, persistent progress, print state and beta asset exclusion. DOM only.');
})().catch(err => {console.error(err); process.exitCode = 1;});
