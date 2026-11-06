/* Library group pages: remember which page was opened and restore focus/position on return. */
(function () {
  'use strict';
  var KEY = 'mjb-srb-library-last';
  document.addEventListener('DOMContentLoaded', function () {
    var list = document.querySelector('[data-lib-group]'); if (!list) return;
    list.addEventListener('click', function (e) {
      var a = e.target.closest('a[data-lib-read], a[data-lib-original]'); if (!a) return;
      var item = a.closest('.srb-lib-item'); if (!item) return;
      try { sessionStorage.setItem(KEY, JSON.stringify({ id: item.id, kind: a.hasAttribute('data-lib-read') ? 'read' : 'original' })); } catch (err) {}
    });
    var last = null; try { last = JSON.parse(sessionStorage.getItem(KEY) || 'null'); } catch (err) {}
    var id = (location.hash || '').slice(1) || (last && last.id);
    var item = id && /^RT-[a-z0-9-]+$/.test(id) ? document.getElementById(id) : null;
    if (!item) return;
    item.classList.add('srb-lib-current');
    var target = item.querySelector(last && last.kind === 'original' ? 'a[data-lib-original]' : 'a[data-lib-read]') || item.querySelector('a');
    item.scrollIntoView({ block: 'center' });
    if (target) target.focus({ preventScroll: true });
  });
})();
