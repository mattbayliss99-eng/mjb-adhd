'use strict';
/* Scans every byte under site/ (the published directory): GROK-ASSET-003 (topic-network.jpg, rights unresolved) must be absent
   by content hash AND by name/reference; no secrets-like or private-journal fixtures ship. */
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const site = path.join(__dirname, '..', '..', 'site');
const EXCLUDED_SHA256 = { 'GROK-ASSET-003 topic-network.jpg': '89903187a7ff2e08aa3d734ed0e2b31b7c5ce600fe5e13ac22c2a549373c27ed' };
if (process.env.EXCLUDED_SHA) EXCLUDED_SHA256['GROK-ASSET-003 topic-network.jpg'] = process.env.EXCLUDED_SHA;
const bad = []; let files = 0, bytes = 0;
(function walk(d) { for (const n of fs.readdirSync(d)) { const p = path.join(d, n); const s = fs.statSync(p);
  if (s.isDirectory()) { walk(p); continue; } files++; bytes += s.size;
  const b = fs.readFileSync(p); const h = crypto.createHash('sha256').update(b).digest('hex');
  for (const [k, v] of Object.entries(EXCLUDED_SHA256)) if (h === v) bad.push(`${p}: bytes identical to ${k}`);
  if (/topic-network/i.test(n)) bad.push(`${p}: excluded filename`);
  if (/\.(html|js|css|json|csv|txt|xml|md|svg|webmanifest)$|^_/.test(n)) { const t = b.toString('utf8');
    if (/topic-network|GROK-ASSET-003/i.test(t)) bad.push(`${p}: references excluded asset`);
    if (/-----BEGIN [A-Z ]*PRIVATE KEY|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{30,}|xox[bp]-/.test(t)) bad.push(`${p}: secret-like token`);
    if (/mjb-journal-backup|"format":\s*"mjb-journal-store"/.test(t) && !/social-reading-beta\/js\/journal\.js$/.test(p.split(path.sep).join('/'))) bad.push(`${p}: journal data-like content`);
  }
  if (/^\.env|\.pem$|\.key$/.test(n)) bad.push(`${p}: secret-like file`);
} })(site);
console.log(`scanned ${files} files, ${bytes} bytes under site/`);
if (bad.length) { console.log('FAIL\n' + bad.join('\n')); process.exit(1); }
console.log('PASS public bytes: excluded asset absent by hash/name/reference; no secret-like tokens or journal data');
