'use strict';
const assert = require('assert');
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '../..');
const bank = JSON.parse(fs.readFileSync(path.join(root, 'content/posts/posts.json'), 'utf8'));
assert.ok(['2.0','1.1'].includes(bank.schema_version));
assert.ok(bank.content_revision);
const slideIds = new Set();
for (const post of bank.posts) {
  assert.equal(post.evidence.class, 'editorial');
  assert.ok(!String(post.image.src).includes('topic-network.jpg'));
  assert.ok(post.image.rights !== 'PENDING_PROVENANCE_REVIEW');
  assert.ok(Array.isArray(post.slides) && post.slides.length >= 3);
  for (const slide of post.slides) {
    assert.ok(slide.id && /^MJB-S/.test(slide.id));
    assert.ok(!slideIds.has(slide.id));
    slideIds.add(slide.id);
  }
  const html = fs.readFileSync(path.join(root, 'site/social-reading-beta/p', post.id.toLowerCase(), 'index.html'), 'utf8');
  assert.ok(html.includes('srb-reader'));
  assert.ok(html.includes('data-split-divider'));
  for (const slide of post.slides) assert.ok(html.includes('data-slide-id="' + slide.id + '"'));
}
assert.ok(bank.claims && bank.claims.length >= 1);
assert.ok(fs.existsSync(path.join(root, 'site/social-reading-beta/assets/mjb-engraved-mark.svg')));
console.log('PASS authored-slides/v2:', slideIds.size, 'slides; split reader present');
