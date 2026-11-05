/* Allowlisted, query-gated preview/beta return. Ordinary article visits are unchanged. */
(function () {
  const params = new URLSearchParams(location.search);
  const id = params.get('post-return');
  if (!/^MJB-P00000[123]$/.test(id || '')) return;
  // Reject absolute external return targets: we only ever build relative beta/preview paths.
  const main = document.querySelector('main');
  if (!main) return;
  const from = params.get('from');
  let slide = params.get('slide');
  try {
    const saved = JSON.parse(sessionStorage.getItem('mjb-srb-article-return') || 'null');
    if (saved && saved.postId === id && saved.slideId && !slide) slide = saved.slideId;
  } catch (e) {}
  const base =
    from === 'social-reading-beta'
      ? '/social-reading-beta/p/' + id.toLowerCase() + '/'
      : '/posts-preview/p/' + id.toLowerCase() + '/';
  const href = slide ? base + '?slide=' + encodeURIComponent(slide) : base;
  const label =
    from === 'social-reading-beta' ? 'Return to your social reading beta story' : 'Return to your visual post';
  const p = document.createElement('p');
  p.className = 'mjb-posts-return';
  p.setAttribute('data-article-return', 'true');
  const a = document.createElement('a');
  a.href = href;
  a.textContent = label;
  a.setAttribute('data-return-to-story', id);
  p.append(a);
  main.prepend(p);
})();
