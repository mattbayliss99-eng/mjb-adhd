import { readFileSync, writeFileSync } from "node:fs";

const file = ".netlify/functions-internal/server/server.mjs";
const marker = '"/forms/contact.html"';
const text = readFileSync(file, "utf8");
if (!text.includes("preferStatic: true")) {
  throw new Error("Netlify function is missing preferStatic");
}
if (text.includes(marker)) {
  process.stdout.write("contact form path already excluded\n");
  process.exit(0);
}
const next = text.replace(
  'excludedPath: ["/.netlify/*"]',
  'excludedPath: ["/.netlify/*", "/forms/contact.html"]',
);
if (next === text) throw new Error("Could not exclude /forms/contact.html from the Netlify function");
writeFileSync(file, next);
process.stdout.write("excluded /forms/contact.html from the Netlify function\n");
