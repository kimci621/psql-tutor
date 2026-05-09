#!/usr/bin/env node
// Автобамп ?v= в HTML на дате-стампе вида YYYYMMDD.
// Запуск:  node tools/bump-cache.mjs
// Меняет: <script ... src="assets/app.js?v=ANYTHING"></script>
//   →     <script ... src="assets/app.js?v=20260509"></script>

import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

const today = new Date();
const stamp =
  today.getUTCFullYear().toString() +
  String(today.getUTCMonth() + 1).padStart(2, "0") +
  String(today.getUTCDate()).padStart(2, "0");

function listHtml(dir) {
  const out = [];
  for (const entry of readdirSync(dir)) {
    if (entry.startsWith(".") || ["node_modules", "__pycache__", "examples", "tests", "tools"].includes(entry)) continue;
    const p = join(dir, entry);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...listHtml(p));
    else if (entry.endsWith(".html")) out.push(p);
  }
  return out;
}

let touched = 0;
for (const file of listHtml(root)) {
  const before = readFileSync(file, "utf8");
  const after = before.replace(
    /(src="(?:\.\.\/)*assets\/app\.js)\?v=[^"]*"/g,
    `$1?v=${stamp}"`
  );
  if (after !== before) {
    writeFileSync(file, after);
    touched++;
  }
}

console.log(`Bumped ?v=${stamp} в ${touched} HTML-файлах`);
