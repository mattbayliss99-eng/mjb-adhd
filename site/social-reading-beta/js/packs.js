(function () {
  'use strict';
  function statusNodes() { return Array.prototype.slice.call(document.querySelectorAll('[data-download-status]')); }
  function setStatus(msg) { statusNodes().forEach(function (n) { n.textContent = msg; }); }
  function packUrl(postId) { return '/social-reading-beta/packs/' + String(postId).toLowerCase() + '.html'; }
  async function requestPack(postId) {
    setStatus('Download requested… preparing pack ' + postId);
    var url = packUrl(postId);
    try {
      var res = await fetch(url, { credentials: 'same-origin' });
      if (!res.ok) throw new Error('HTTP ' + res.status);
      var text = await res.text();
      if (!/name="viewport"\s+content="width=device-width,\s*initial-scale=1"/.test(text)) throw new Error('Pack missing mobile viewport meta');
      if (!/name="mjb-content-revision"/.test(text) || !/name="mjb-content-date"/.test(text)) throw new Error('Pack missing content revision/date');
      var blob = new Blob([text], { type: 'text/html;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = postId.toLowerCase() + '-reading-pack.html';
      a.rel = 'noopener';
      document.body.appendChild(a);
      a.click();
      setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
      setStatus('Download requested — browser save dialog opened for ' + postId + ' (revision stamped in file). Verified available only after you keep the file.');
    } catch (err) {
      setStatus('Download requested — failed: ' + (err && err.message ? err.message : 'unknown error'));
    }
  }
  document.querySelectorAll('[data-download-pack]').forEach(function (btn) {
    btn.addEventListener('click', function () { requestPack(btn.getAttribute('data-download-pack')); });
  });
  window.__SRB_requestPack = requestPack;
})();
