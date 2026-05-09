#!/usr/bin/env node
// Проверка целостности: каждая data-topic-id из HTML существует ключом в topics.js,
// и каждый id уникален внутри одного HTML-файла. Падает с ненулевым кодом
// при первой проблеме — годится для CI.

import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

function listHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || entry === "node_modules" || entry === "__pycache__" || entry === "examples" || entry === "tests" || entry === "tools") continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...listHtml(p));
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}

// Парсим ключи из topics.js регуляркой — это аналог того, что делает search.js.
const topicsSrc = readFileSync(join(root, "assets", "topics.js"), "utf8");
const keys = new Set(
  Array.from(topicsSrc.matchAll(/^\s*"([a-z0-9-]+)":\s*\{/gm)).map(m => m[1])
);

let problems = 0;
const htmls = listHtml(root);
for (const file of htmls) {
  const html = readFileSync(file, "utf8");
  const rel = relative(root, file);

  // 1. data-topic-id → должен быть в topics.js
  for (const m of html.matchAll(/data-topic-id="([^"]+)"/g)) {
    const id = m[1];
    if (!keys.has(id)) {
      console.error(`MISSING: data-topic-id="${id}" в ${rel} не существует в topics.js`);
      problems++;
    }
  }

  // 2. дубли id внутри одного файла
  const ids = Array.from(html.matchAll(/\sid="([^"]+)"/g)).map(m => m[1]);
  const seen = new Set();
  for (const id of ids) {
    if (seen.has(id)) {
      console.error(`DUPLICATE: id="${id}" в ${rel}`);
      problems++;
    }
    seen.add(id);
  }
}

// 3. Битые относительные ссылки на .html (без http://, #, javascript:).
const htmlFiles = new Set(htmls.map(f => relative(root, f).replace(/\\/g, "/")));
const isHttp = h => /^(https?:|mailto:|tel:|javascript:|data:)/i.test(h);
for (const file of htmls) {
  const rel = relative(root, file).replace(/\\/g, "/");
  const dir = dirname(rel);
  const html = readFileSync(file, "utf8");
  for (const m of html.matchAll(/href="([^"]+)"/g)) {
    let href = m[1];
    if (!href || href.startsWith("#") || isHttp(href)) continue;
    const hashIdx = href.indexOf("#");
    if (hashIdx !== -1) href = href.slice(0, hashIdx);
    if (!href) continue;
    // Проверяем только .html ссылки — на CSS/SQL/etc нам не релевантно для топик-целостности.
    if (!href.endsWith(".html")) continue;
    let target = join(dir, href).replace(/\\/g, "/");
    if (!htmlFiles.has(target)) {
      console.error(`BROKEN LINK: "${href}" в ${rel} → не найдено: ${target}`);
      problems++;
    }
  }
}

if (problems > 0) {
  console.error(`\nFAIL: ${problems} проблем(ы) целостности`);
  process.exit(1);
}
console.log(`OK: проверено HTML-файлов=${htmls.length}, ключей topics.js=${keys.size}`);
