'use strict';
/* Minimal local static server that applies site/_headers rules (incl. CSP) so CSP violations surface in tests.
   This is NOT Netlify; edge functions and _redirects are not emulated. */
const http = require('http'), fs = require('fs'), path = require('path');
function parseHeaders(file) {
  const rules = []; let cur = null;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue;
    if (!/^\s/.test(line)) { cur = { pattern: line.trim(), headers: {} }; rules.push(cur); }
    else if (cur) { const i = line.indexOf(':'); cur.headers[line.slice(0, i).trim()] = line.slice(i + 1).trim(); }
  }
  return rules;
}
function match(p, url) { const re = new RegExp('^' + p.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$'); return re.test(url); }
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.avif': 'image/avif', '.mp4': 'video/mp4', '.csv': 'text/csv', '.txt': 'text/plain', '.webmanifest': 'application/manifest+json', '.xml': 'application/xml', '.md': 'text/markdown', '.pdf': 'application/pdf' };
module.exports = function serve(root, port) {
  const rules = parseHeaders(path.join(root, '_headers'));
  const srv = http.createServer((req, res) => {
    const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = path.join(root, u); if (!f.startsWith(root)) { res.writeHead(403); return res.end(); }
    if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
      if (!u.endsWith('/')) { res.writeHead(301, { Location: u + '/' }); return res.end(); }
      f = path.join(f, 'index.html');
    }
    const hdr = {}; for (const r of rules) if (match(r.pattern, u)) Object.assign(hdr, r.headers);
    if (!fs.existsSync(f)) { res.writeHead(404, { ...hdr, 'Content-Type': 'text/html' }); return res.end(fs.readFileSync(path.join(root, '404.html'))); }
    res.writeHead(200, { ...hdr, 'Content-Type': TYPES[path.extname(f)] || 'application/octet-stream' });
    fs.createReadStream(f).pipe(res);
  });
  return new Promise(r => srv.listen(port, '127.0.0.1', () => r(srv)));
};
