import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const css = readFileSync(join(root, "shell.css"), "utf8");
const js = readFileSync(join(root, "shell.js"), "utf8");
const posts = readFileSync(join(root, "data", "posts.json"), "utf8");
const anchor = readFileSync(join(root, "assets", "anchor.svg"), "utf8");
const layers = readFileSync(join(root, "assets", "layers.svg"), "utf8");
const paths = readFileSync(join(root, "assets", "paths.svg"), "utf8");
const data = JSON.parse(posts);

function esc(value) {
  return String(value).replace(/[&<>]/g, (ch) => ({ "&": "&", "<": "<", ">": ">" })[ch]);
}

const noscript = [
  "<h1>MJB reader</h1>",
  "<p>JavaScript is off, so the adjustable split is unavailable. The three demonstrations are below.</p>",
  ...data.posts.flatMap((post) => [
    `<h2>${esc(post.title)}</h2>`,
    `<p>${esc(post.anchor)}</p>`,
    ...post.steps.flatMap((step) => [
      `<h3>${esc(step.title)}</h3>`,
      `<p>${esc(step.body)}</p>`,
      `<p>${esc(step.qualification)}</p>`,
    ]),
  ]),
].join("\n");

let html = readFileSync(join(root, "template.html"), "utf8");
const slots = {
  __CSS__: css,
  __JS__: js,
  __POSTS__: posts.trim(),
  __SVG_ANCHOR__: anchor.trim(),
  __SVG_LAYERS__: layers.trim(),
  __SVG_PATHS__: paths.trim(),
  __NOSCRIPT__: noscript,
};
for (const [token, value] of Object.entries(slots)) {
  if (value.includes("</script") || value.includes("</style")) {
    throw new Error(`Refusing to inline ${token}`);
  }
  if (!html.includes(token)) throw new Error(`Missing ${token}`);
  html = html.replace(token, value);
}
for (const token of Object.keys(slots)) {
  if (html.includes(token)) throw new Error(`Unresolved ${token}`);
}
writeFileSync(join(root, "index.html"), html);
console.log(`wrote index.html ${html.length} bytes`);
