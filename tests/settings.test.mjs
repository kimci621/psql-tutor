import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";

import { defaults, loadSettings } from "../assets/settings.js";

const store = new Map();

globalThis.localStorage = {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  },
  setItem(key, value) {
    store.set(key, value);
  },
};

beforeEach(() => store.clear());

test("loadSettings uses proxy default without stored settings", () => {
  assert.equal(loadSettings().baseUrl, defaults.baseUrl);
});

test("loadSettings migrates direct LM Studio localhost URL to proxy", () => {
  localStorage.setItem("psql-tutor:settings", JSON.stringify({
    baseUrl: "http://127.0.0.1:1234",
    model: "gemma-4-e4b-it-mlx",
  }));

  const settings = loadSettings();

  assert.equal(settings.baseUrl, defaults.baseUrl);
  assert.equal(settings.model, "gemma-4-e4b-it-mlx");
});
