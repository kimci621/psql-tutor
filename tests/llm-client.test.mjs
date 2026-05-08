import assert from "node:assert/strict";
import { test } from "node:test";

import { listModels, streamChat } from "../assets/llm-client.js";

async function collect(iterable) {
  let out = "";
  for await (const chunk of iterable) out += chunk;
  return out;
}

test("streamChat extracts text from LM Studio REST v1 output array", async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    output: [
      { type: "message", content: "Pong." },
    ],
  }), { status: 200 });

  try {
    const text = await collect(streamChat({
      baseUrl: "http://127.0.0.1:1234/api/v1",
      model: "gemma-4-e4b-it-mlx",
      messages: [{ role: "user", content: "ping" }],
    }));

    assert.equal(text, "Pong.");
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test("listModels extracts model keys from LM Studio REST v1 response", async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    models: [
      { key: "gemma-4-e4b-it-mlx", display_name: "Gemma 4 E4B Instruct" },
    ],
  }), { status: 200 });

  try {
    const ids = await listModels("http://127.0.0.1:1234/api/v1");
    assert.deepEqual(ids, ["gemma-4-e4b-it-mlx"]);
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test("listModels prefers loaded LM Studio REST v1 model instances", async () => {
  const oldFetch = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({
    models: [
      { key: "not-loaded", loaded_instances: [] },
      { key: "gemma-4-e4b-it-mlx", loaded_instances: [{ id: "gemma-4-e4b-it-mlx" }] },
    ],
  }), { status: 200 });

  try {
    const ids = await listModels("http://127.0.0.1:1234/api/v1");
    assert.deepEqual(ids, ["gemma-4-e4b-it-mlx", "not-loaded"]);
  } finally {
    globalThis.fetch = oldFetch;
  }
});

test("streamChat picks first LM Studio REST v1 model when model is empty", async () => {
  const oldFetch = globalThis.fetch;
  const calls = [];
  globalThis.fetch = async (url, init) => {
    calls.push({ url: String(url), init });
    if (String(url).endsWith("/models")) {
      return new Response(JSON.stringify({
        models: [{ key: "gemma-4-e4b-it-mlx" }],
      }), { status: 200 });
    }
    const body = JSON.parse(init.body);
    assert.equal(body.model, "gemma-4-e4b-it-mlx");
    return new Response(JSON.stringify({
      output: [{ type: "message", content: "Pong" }],
    }), { status: 200 });
  };

  try {
    const text = await collect(streamChat({
      baseUrl: "http://127.0.0.1:1234/api/v1",
      model: "",
      messages: [{ role: "user", content: "ping" }],
    }));

    assert.equal(text, "Pong");
    assert.deepEqual(calls.map(c => c.url), [
      "http://127.0.0.1:1234/api/v1/models",
      "http://127.0.0.1:1234/api/v1/chat",
    ]);
  } finally {
    globalThis.fetch = oldFetch;
  }
});
