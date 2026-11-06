'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..', '..');
const bank = JSON.parse(fs.readFileSync(path.join(root, 'content/posts/posts.json'), 'utf8'));
assert.strictEqual(bank.posts.length, 3);
const arts = bank.posts.map(p => p.article.url);
assert.strictEqual(new Set(arts).size, 3, 'three distinct article URLs');
assert.ok(arts.includes('/science/what-is-adhd/'));
assert.ok(arts.includes('/science/genetics/'));
assert.ok(arts.includes('/science/pathway/'));
for (const p of bank.posts) {
  assert.ok(!String((p.image||{}).src).includes('topic-network'), 'image src must not use unresolved raster');
  assert.notStrictEqual((p.image||{}).rights, 'PENDING_PROVENANCE_REVIEW');
  assert.ok((p.slides||[]).every(s => s.id && !/\s/.test(s.id)));
  assert.ok(!String((p.image||{}).asset_id||'').includes('GROK-ASSET-003'));
}
assert.ok((bank.beta_policy.exclude_from_public_beta||[]).includes('topic-network.jpg'));
for (const url of arts) {
  const file = path.join(root, 'site', url.replace(/^\//,''), 'index.html');
  assert.ok(fs.existsSync(file), 'missing article ' + file);
}
// Public beta tree must not contain the raster bytes
const raster = path.join(root, 'site/social-reading-beta/assets/topic-network.jpg');
assert.ok(!fs.existsSync(raster), 'raster file must be absent from public beta assets');
const rb = JSON.parse(fs.readFileSync(path.join(root, 'content/routes/route-bank.json'), 'utf8'));
const ids = rb.routes.map(r => r.id); assert.strictEqual(new Set(ids).size, ids.length, 'route ids unique');
const onDisk = []; (function w(d) { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); if (fs.statSync(p).isDirectory()) w(p); else if (n === 'index.html') onDisk.push(('/' + path.relative(path.join(root, 'site'), path.dirname(p)).split(path.sep).join('/') + '/').replace('//', '/')); } })(path.join(root, 'site'));
const pub = onDisk.filter(r => !/^\/(social-reading-beta|posts-preview)\//.test(r));
assert.deepStrictEqual(pub.sort(), rb.routes.map(r => r.oldRoute).sort(), 'every public route mapped exactly once');
for (const p of bank.posts) for (const s of p.slides) assert.ok(/^MJB-S\d{6}-\d{2}$/.test(s.id), 'authored stable slide id ' + s.id);
console.log('PASS unit.bank (' + rb.routes.length + ' routes mapped, slide ids authored)');
