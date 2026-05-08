export async function* streamChat({ baseUrl, model, messages, temperature, maxTokens, signal }) {
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
      "Не удалось подключиться к LM Studio (" + url + ").\n" +
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
        /* ignore parse errors on heartbeat lines */
      }
    }
  }
}

export async function listModels(baseUrl) {
  const url = baseUrl.replace(/\/+$/, "") + "/models";
  const res = await fetch(url);
  if (!res.ok) throw new Error("HTTP " + res.status);
  const data = await res.json();
  return (data.data || []).map(m => m.id);
}
