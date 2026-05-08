import assert from "node:assert/strict";
import { test } from "node:test";

import { highlightSQL } from "../assets/sql-highlight.js";

test("highlightSQL preserves string literals", () => {
  const html = highlightSQL("CREATE DATABASE shop ENCODING 'UTF8';");

  assert.match(html, /'UTF8'/);
  assert.doesNotMatch(html, /ENCODING\s*<span class="sql-num">0<\/span>/);
});
