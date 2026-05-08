// Поддерживает два эндпоинта LM Studio:
//   1. OpenAI-совместимый: POST {baseUrl}/chat/completions  (baseUrl оканчивается на /v1)
//      — стриминг по SSE, multi-turn messages.
//   2. Простой LM Studio API: POST {baseUrl}/chat            (baseUrl оканчивается на /api/v1)
//      — один ответ целиком, поля {model, system_prompt, input}, без стриминга.

function detectMode(baseUrl) {
  const u = baseUrl.replace(/\/+$/, "");
  if (/\/api\/v\d+$/.test(u)) return "simple";
  return "openai";
}

export function clientMode(baseUrl) {
  return detectMode(baseUrl);
}

export async function* streamChat({ baseUrl, model, messages, temperature, maxTokens, signal }) {
  const mode = detectMode(baseUrl);
  if (mode === "simple") {
    const text = await sendSimple({ baseUrl, model, messages, signal });
    yield text;
    return;
  }
  yield* streamOpenAI({ baseUrl, model, messages, temperature, maxTokens, signal });
}

async function* streamOpenAI({ baseUrl, model, messages, temperature, maxTokens, signal }) {
  const url = baseUrl.replace(/\/+$/, "") + "/chat/completions";
  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model || undefined,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      }),
      signal,
    });
  } catch (e) {
    throw new Error(
      "Не удалось подключиться к LLM (" + url + ").\n" +
      "Проверь, что в LM Studio открыт Local Server и сервер запущен.\n" +
      "Подробности: " + (e.message || e)
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ошибка ${res.status} ${res.statusText}\n${text}`);
  }

  const reader = res.body.getReader();
  const dec = new TextDecoder();
  let buf = "";
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    let idx;
    while ((idx = buf.indexOf("\n")) !== -1) {
      const line = buf.slice(0, idx).trim();
      buf = buf.slice(idx + 1);
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (payload === "[DONE]") return;
      try {
        const obj = JSON.parse(payload);
        const delta = obj.choices?.[0]?.delta?.content;
        if (delta) yield delta;
      } catch {
        /* ignore heartbeats */
      }
    }
  }
}

async function sendSimple({ baseUrl, model, messages, signal }) {
  const url = baseUrl.replace(/\/+$/, "") + "/chat";
  const resolvedModel = model || await firstModel(baseUrl);
  const system = messages.find(m => m.role === "system")?.content || "";
  const turns = messages.filter(m => m.role !== "system");

  // последний user — это новый ввод; всё что до — диалоговая история
  const last = turns[turns.length - 1];
  const prior = turns.slice(0, -1);

  const lines = [];
  for (const m of prior) {
    lines.push((m.role === "user" ? "Ученик" : "Ментор") + ":\n" + m.content);
  }
  lines.push("Ученик:\n" + (last?.content || ""));
  lines.push("Ментор:");
  const input = lines.join("\n\n");

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: resolvedModel || undefined,
        system_prompt: system,
        input,
      }),
      signal,
    });
  } catch (e) {
    throw new Error(
      "Не удалось подключиться к LLM (" + url + ").\n" +
      "Проверь:\n" +
      "  • LM Studio: Status: Running на вкладке Developer / Local Server\n" +
      "  • Адрес соответствует «Reachable at» в LM Studio (обычно http://127.0.0.1:1234)\n" +
      "  • Если в браузере консоль ругается на CORS — открой Server Settings в LM Studio и включи «Enable CORS»\n" +
      "Техническая ошибка: " + (e.message || e)
    );
  }

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Ошибка ${res.status} ${res.statusText}\n${text}`);
  }

  const data = await res.json().catch(() => ({}));
  return extractContent(
    data.output ??
    data.response ??
    data.text ??
    data.content ??
    data.message?.content ??
    data.choices?.[0]?.message?.content ??
    data.choices?.[0]?.text,
    data
  );
}

async function firstModel(baseUrl) {
  const ids = await listModels(baseUrl);
  return ids[0] || "";
}

function extractContent(value, fallback) {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) {
    return value.map(item => extractContent(item, "")).filter(Boolean).join("\n");
  }
  if (value && typeof value === "object") {
    if (typeof value.content === "string") return value.content;
    if (Array.isArray(value.content)) return extractContent(value.content, "");
    if (typeof value.text === "string") return value.text;
  }
  return JSON.stringify(fallback ?? value, null, 2);
}

export async function listModels(baseUrl) {
  const u = baseUrl.replace(/\/+$/, "");
  // OpenAI: /v1/models. Simple: /api/v1/models — у LM Studio оба пути обычно отвечают.
  const url = u + "/models";
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  if (Array.isArray(data.data)) return data.data.map(m => m.id);
  if (Array.isArray(data.models)) {
    const loaded = data.models
      .flatMap(m => (m.loaded_instances || []).map(instance => instance.id || m.id || m.key || m.name))
      .filter(Boolean);
    const all = data.models.map(m => m.id || m.key || m.name).filter(Boolean);
    return [...new Set([...loaded, ...all])];
  }
  return [];
}
