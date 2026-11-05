'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../..');
const bank = JSON.parse(fs.readFileSync(path.join(root, 'content/posts/posts.json'), 'utf8'));
const packsDir = path.join(root, 'site/social-reading-beta/packs');

for (const post of bank.posts) {
  const file = path.join(packsDir, post.id.toLowerCase() + '.html');
  assert.ok(fs.existsSync(file), 'missing pack ' + file);
  const html = fs.readFileSync(file, 'utf8');
  assert.ok(/<meta\s+name="viewport"\s+content="width=device-width,\s*initial-scale=1">/i.test(html), 'mobile viewport required');
  assert.ok(html.includes('name="mjb-content-revision"'), 'content revision meta');
  assert.ok(html.includes(bank.content_revision), 'revision value stamped');
  assert.ok(html.includes('name="mjb-content-date"'), 'content date meta');
  assert.ok(html.includes(bank.generated_at), 'date value stamped');
  for (const slide of post.slides) {
    assert.ok(html.includes("id='" + slide.id + "'") || html.includes('id="' + slide.id + '"'), 'pack missing slide ' + slide.id);
    if (slide.qualification) assert.ok(html.includes(slide.qualification.slice(0, 24)), 'qualification retained in pack');
  }
}
const packsIndex = fs.readFileSync(path.join(packsDir, 'index.html'), 'utf8');
assert.ok(/download requested/i.test(packsIndex), 'UI must say download requested');
assert.ok(!/file downloaded/i.test(packsIndex), 'packs index must not use file downloaded wording');
const packsJs = fs.readFileSync(path.join(root, 'site/social-reading-beta/js/packs.js'), 'utf8');
assert.ok(packsJs.includes('Download requested'), 'packs.js status wording');
const visibleStatuses = packsJs.match(/setStatus\((['"`])([\s\S]*?)\1\)/g) || [];
for (const call of visibleStatuses) {
  assert.ok(!/file downloaded/i.test(call), 'status string must not claim file downloaded: ' + call);
}
console.log('PASS reading-pack: viewport + revision/date + wording for', bank.posts.length, 'packs');
