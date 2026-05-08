# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A static, offline-first PostgreSQL learning site (HTML/CSS/JS, ES modules, no build step). Every topic has a «Поучиться с ИИ» button that opens a side panel chat with a local LLM (LM Studio) acting as a Russian-language mentor. Content is original Russian text — never paraphrase third-party sources when extending.

## Commands

```bash
# Dev server (recommended — has LM Studio proxy that bypasses CORS)
python3 server.py --port 8000
# optional flags: --host 0.0.0.0  --lmstudio-url http://127.0.0.1:1234

# Plain static server (CORS must be enabled in LM Studio for the chat to work)
python3 -m http.server 8000

# Tests
node --test tests/*.mjs        # JS unit tests (node:test)
node --test tests/llm-client.test.mjs   # single suite
python3 -m unittest tests.server_proxy.test_proxy   # proxy tests

# Quick smoke check after editing JS modules
for f in assets/*.js; do node --check "$f"; done
```

## Architecture

**Static pages + a single chat module injected into every page.** There is no router, no build, no framework. Each HTML page (`index.html`, `errors.html`, `senior.html`, `guides/*.html`) loads `assets/app.js`, which on `DOMContentLoaded` injects the chat panel + settings modal into the body, wires up copy buttons, and binds every `[data-topic-id]` button to open the chat for that topic.

**Topic identity is the contract between content and AI.** Every «Поучиться с ИИ» button carries `data-topic-id="some-id"`. That id must exist as a key in `assets/topics.js`. The topic record (title, summary, examples, pitfalls, learningGoals) is fed into `buildSystemPrompt` in `assets/prompts.js` to construct a per-topic system message. **When adding a new topic card to any HTML page, you must also add a matching entry to `topics.js` — otherwise the chat will alert «Тема не найдена».**

**LLM client auto-detects two endpoints** (`assets/llm-client.js`):
- baseUrl ending in `/v1` → OpenAI-compatible `POST /chat/completions` with SSE streaming.
- baseUrl ending in `/api/v1` → LM Studio's simple API `POST /chat` with `{model, system_prompt, input}` shape, non-streaming. Multi-turn history is flattened into the `input` field as `Ученик: … / Ментор: …` lines.

The default baseUrl is `http://127.0.0.1:1234/api/v1` (LM Studio's «Reachable at» address — `localhost` may resolve to IPv6 and miss the server). When changing the default, update the `STALE_DEFAULTS` set in `settings.js` so existing users' localStorage gets migrated automatically.

**CORS-free dev via proxy.** `server.py` is a `SimpleHTTPRequestHandler` subclass that serves the static files and forwards anything under `/api/lmstudio/*` to the upstream LM Studio URL (default `http://127.0.0.1:1234`). For users who hit CORS issues, the recommended baseUrl is `/api/lmstudio/api/v1` (relative — same-origin, no preflight).

**Chat state is per-topic in localStorage** under `psql-tutor:chat:<topic-id>`. Settings live under `psql-tutor:settings`. Hidden bootstrap messages (the kickoff prompt that asks the LLM to explain the topic) are stored with `hidden: true` and skipped in render and export but kept in the messages sent to the model.

**System prompt is structured, not freeform.** `prompts.js::buildSystemPrompt` enforces a specific opening template: the LLM must explain the topic first (definition → why → SQL example in a fenced block → breakdown), then ask one comprehension question. Subsequent turns switch to Socratic mode. When editing the prompt, preserve the explain-first behavior — the start template is what makes the first reply useful when the user opens a topic cold.

## Adding content

- **New topic card on an existing page:** add the `<article class="topic">` markup with a unique `data-topic-id`, then add the matching record to `assets/topics.js`. SQL examples go in `<pre>` inside `.code-block`; the copy button and AI button live in `.code-actions`. The SQL highlighter (`sql-highlight.js`) and copy logic find these by class — keep the structure.
- **New page:** copy the sidebar markup from `senior.html` (it's the canonical nav). The script tag uses cache-busting like `assets/app.js?v=2` — bump the `?v=` when shipping incremental JS changes so users don't get stale modules.
- **Russian content rule:** all explanations are written from scratch in Russian. SQL syntax and PostgreSQL error texts are reproduced verbatim (they're factual). Don't translate or paraphrase content from external sites.

## Gotchas

- The minimal markdown renderer in `assets/md.js` and the SQL highlighter in `assets/sql-highlight.js` use placeholder substitution (`__SQL_PLACEHOLDER_N__`). Don't introduce strings that match these patterns in user-facing content.
- `streamChat` in `llm-client.js` is an async generator for both modes — the simple endpoint yields the whole response as a single chunk so `chat.js` doesn't need to branch.
- Settings migration in `settings.js` is the only place that mutates stored user state on load. Add stale URLs there when defaults change.
