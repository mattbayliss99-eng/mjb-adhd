/** A self-contained introductions file. It is not the live site and not a paper download. */

export type PackSlide = { heading: string; body: string };
export type PackSource = { label: string; href: string };
export type PackPost = {
  id: string;
  title: string;
  status: string;
  slides: PackSlide[];
  sources: PackSource[];
};
export type ReadingPack = {
  id: string;
  title: string;
  note: string;
  /** Bank revision the slides were taken from. Not a publication. */
  contentRevision: string;
  /** Date the slide set was authored, YYYY-MM-DD. Not a publication date. */
  revisedOn: string;
  posts: PackPost[];
};

const ALLOWED = /^(https?:|mailto:|tel:)/i;

export function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!ALLOWED.test(trimmed) || /[\u0000-\u001F]/.test(trimmed)) return null;
  return trimmed;
}

const ESCAPE: Record<string, string> = {
  "&": "&" + "amp;",
  "<": "&" + "lt;",
  ">": "&" + "gt;",
  '"': "&" + "quot;",
  "'": "&" + "#39;",
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => ESCAPE[char] ?? char);
}

export function renderPackHtml(pack: ReadingPack): string {
  const posts = pack.posts
    .map((post) => {
      const slides = post.slides
        .map((slide, index) => {
          const heading = slide.heading
            ? `<h3>${escapeHtml(`${index + 1} of ${post.slides.length}. ${slide.heading}`)}</h3>`
            : `<h3>${escapeHtml(`${index + 1} of ${post.slides.length}`)}</h3>`;
          return `<li>${heading}<p>${escapeHtml(slide.body)}</p></li>`;
        })
        .join("");
      const sources = post.sources
        .map((source) => {
          const href = safeHref(source.href);
          const label = escapeHtml(source.label);
          return href
            ? `<li><a href="${escapeHtml(href)}">${label}</a></li>`
            : `<li>${label} (link unavailable)</li>`;
        })
        .join("");
      return `<article><p>Draft · Pending evidence review</p><h2>${escapeHtml(post.title)}</h2><p>${escapeHtml(post.id)} · ${escapeHtml(post.status)}</p><ol>${slides}</ol><h3>Sources</h3><ul>${sources}</ul></article>`;
    })
    .join("");
  return `<!DOCTYPE html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escapeHtml(pack.title)}</title><style>body{font-family:Georgia,serif;background:#050505;color:#f4ebd4;margin:1.25rem;line-height:1.5;max-width:40rem}a{color:#e8d48a}</style></head><body><h1>${escapeHtml(pack.title)}</h1><p>${escapeHtml(pack.note)}</p><p>Content revision ${escapeHtml(pack.contentRevision)}. Slide set dated ${escapeHtml(pack.revisedOn)}. This is not a publication date.</p>${posts}</body></html>`;
}

export function packByteSize(html: string): number {
  return new Blob([html]).size;
}

const DB = "mjb-packs";
const STORE = "packs";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) request.result.createObjectStore(STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePackLocal(pack: ReadingPack, html: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ pack, html, savedAt: new Date().toISOString() }, pack.id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function loadPackLocal(id: string): Promise<{ pack: ReadingPack; html: string; savedAt: string } | null> {
  const db = await openDb();
  const row = await new Promise<{ pack: ReadingPack; html: string; savedAt: string } | undefined>((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const request = tx.objectStore(STORE).get(id);
    request.onsuccess = () => resolve(request.result as { pack: ReadingPack; html: string; savedAt: string } | undefined);
    request.onerror = () => reject(request.error);
  });
  db.close();
  return row ?? null;
}

export async function removePackLocal(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}
