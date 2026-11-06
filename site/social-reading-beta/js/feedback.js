/* Local-only feedback form (moved out of inline handlers so CSP script-src 'self' applies). Nothing is sent. */
(function () {
  'use strict';
  var KEY = 'mjb-srb-feedback-local';
  document.addEventListener('DOMContentLoaded', function () {
    var form = document.getElementById('srb-feedback'), st = document.getElementById('fb-status');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(form);
      var o = { savedAt: new Date().toISOString(), useful: String(fd.get('useful') || '').slice(0, 20), notes: String(fd.get('notes') || '').slice(0, 500) };
      try { localStorage.setItem(KEY, JSON.stringify(o)); st.textContent = 'Saved on this device only.'; }
      catch (err) { st.textContent = 'Not saved: browser storage is unavailable. Nothing was sent.'; }
    });
    document.getElementById('fb-copy').addEventListener('click', function () {
      var v = ''; try { v = localStorage.getItem(KEY) || ''; } catch (e) {}
      if (!v) { st.textContent = 'Nothing saved yet.'; return; }
      if (navigator.clipboard) navigator.clipboard.writeText(v).then(function () { st.textContent = 'Copied.'; }, function () { st.textContent = 'Copy blocked by this browser.'; });
      else st.textContent = 'Copy not supported here.';
    });
  });
})();
