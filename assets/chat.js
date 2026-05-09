import { topics } from "./topics.js";
import { buildInitialUserMessage, buildSystemPrompt } from "./prompts.js?v=4";
import { streamChat, listModels, detectBaseUrl } from "./llm-client.js";
import { defaults, loadSettings, saveSettings } from "./settings.js";
import { renderMarkdown } from "./md.js?v=2";
import { getExerciseAttempt } from "./exercises.js?v=1";

const HISTORY_PREFIX = "psql-tutor:chat:";
const state = {
  topicId: null,
  topic: null,
  history: [],
  controller: null,
  busy: false,
};

let panelEl, scrimEl, bodyEl, titleEl, subEl, taEl, sendBtn, stopBtn, resetBtn;

export function initChat() {
  panelEl = document.getElementById("chatPanel");
  scrimEl = document.getElementById("scrim");
  bodyEl = document.getElementById("chatBody");
  titleEl = document.getElementById("chatTitle");
  subEl = document.getElementById("chatSub");
  taEl = document.getElementById("chatInput");
  sendBtn = document.getElementById("chatSend");
  stopBtn = document.getElementById("chatStop");
  resetBtn = document.getElementById("chatReset");

  document.querySelectorAll("[data-topic-id]").forEach(btn => {
    btn.addEventListener("click", () => openChat(btn.dataset.topicId));
  });

  // Свежая попытка из textarea упражнения подхватывается на каждый send.
  // Здесь же — реакция на смену темы (state.topicId меняется при openChat).

  document.getElementById("chatClose").addEventListener("click", closeChat);
  scrimEl.addEventListener("click", closeChat);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panelEl.classList.contains("open")) closeChat();
  });

  sendBtn.addEventListener("click", sendCurrent);
  stopBtn.addEventListener("click", stopStream);
  resetBtn.addEventListener("click", resetDialog);
  document.getElementById("chatExport").addEventListener("click", exportDialog);

  // Кнопки режимов чата (3.2): шлют видимое user-сообщение, которое
  // переключает модель в соответствующий формат ответа.
  document.querySelectorAll("[data-chat-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (!state.topic || state.busy) return;
      const mode = btn.dataset.chatMode;
      const text = chatModeMessage(mode, state.topic);
      if (!text) return;
      sendMessage(text, false);
    });
  });

  taEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrent();
    }
  });

  initSettingsModal();
  maybeFirstRunDetect();
}

// 3.9: при первом запуске пробуем автоматически найти живой LM Studio
// по нескольким кандидатам. Если у пользователя уже выбрана модель —
// ничего не делаем.
const FIRST_RUN_DONE = "psql-tutor:first-run-detect";
function maybeFirstRunDetect() {
  try {
    if (localStorage.getItem(FIRST_RUN_DONE)) return;
  } catch { return; }

  const cur = loadSettings();
  if (cur.model) {
    try { localStorage.setItem(FIRST_RUN_DONE, "1"); } catch {}
    return;
  }

  const candidates = [
    cur.baseUrl,
    "/api/lmstudio/api/v1",
    "/api/lmstudio/v1",
    "http://127.0.0.1:1234/api/v1",
    "http://127.0.0.1:1234/v1",
  ].filter((v, i, a) => v && a.indexOf(v) === i);

  // Не блокируем UI; ловим тихо.
  detectBaseUrl(candidates).then(found => {
    try { localStorage.setItem(FIRST_RUN_DONE, "1"); } catch {}
    if (!found || !found.models.length) return;
    const next = { ...cur, baseUrl: found.baseUrl, model: found.models[0] };
    saveSettings(next);
  }).catch(() => {});
}

function openChat(topicId) {
  const t = topics[topicId];
  if (!t) {
    alert("Тема не найдена: " + topicId);
    return;
  }
  state.topicId = topicId;
  state.topic = t;
  titleEl.textContent = t.title;
  subEl.textContent = t.summary || "";

  loadHistory();
  renderHistory();

  panelEl.classList.add("open");
  scrimEl.classList.add("show");
  setTimeout(() => taEl.focus(), 200);

  if (state.history.length === 0) {
    // Первый запуск темы — попросим ИИ сначала объяснить выбранную тему
    // (или разобрать упражнение, если это exercise-тема).
    const initOpts = currentExerciseOpts();
    sendMessage(buildInitialUserMessage(state.topic, initOpts), /*hidden*/ true);
  }
}

// Опции, передаваемые в prompts.js: для упражнений — попытка ученика.
// Берём textarea «вживую», чтобы новая попытка попадала в следующий send.
function currentExerciseOpts() {
  if (!state.topic || state.topic.kind !== "exercise") return {};
  return { exerciseAttempt: getExerciseAttempt(state.topicId) };
}

function closeChat() {
  stopStream();
  panelEl.classList.remove("open");
  scrimEl.classList.remove("show");
}

function loadHistory() {
  try {
    const raw = localStorage.getItem(HISTORY_PREFIX + state.topicId);
    state.history = raw ? JSON.parse(raw) : [];
  } catch {
    state.history = [];
  }
}
function saveHistory() {
  localStorage.setItem(HISTORY_PREFIX + state.topicId, JSON.stringify(state.history));
}

function renderHistory() {
  bodyEl.innerHTML = "";
  for (const m of state.history) {
    if (m.hidden) continue;
    appendBubble(m.role, m.content);
  }
  scrollToBottom();
}

function appendBubble(role, html, isStream) {
  const div = document.createElement("div");
  div.className = "msg " + role;
  div.dataset.role = role;
  if (role === "assistant") {
    div.innerHTML = renderMarkdown(html);
    decorateCodeBlocks(div);
  } else {
    div.textContent = html;
  }
  bodyEl.appendChild(div);
  if (isStream) div.dataset.streaming = "1";
  scrollToBottom();
  return div;
}

// 3.4: добавляем кнопку «Копировать» к каждому <pre><code> в сообщении ИИ.
function decorateCodeBlocks(root) {
  root.querySelectorAll("pre").forEach(pre => {
    if (pre.querySelector(".chat-code-copy")) return;
    pre.style.position = "relative";
    const btn = document.createElement("button");
    btn.className = "btn chat-code-copy";
    btn.type = "button";
    btn.textContent = "Копировать";
    btn.setAttribute("aria-label", "Копировать код");
    btn.addEventListener("click", async () => {
      const code = pre.querySelector("code");
      const text = (code ? code.textContent : pre.textContent) || "";
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Скопировано ✓";
      } catch {
        const ta = document.createElement("textarea");
        ta.value = text; document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); } catch {}
        document.body.removeChild(ta);
        btn.textContent = "Скопировано";
      }
      setTimeout(() => { btn.textContent = "Копировать"; }, 1400);
    });
    pre.appendChild(btn);
  });
}

function appendError(text) {
  const div = document.createElement("div");
  div.className = "msg error";
  div.textContent = text;
  bodyEl.appendChild(div);
  scrollToBottom();
}

function scrollToBottom() {
  bodyEl.scrollTop = bodyEl.scrollHeight;
}

function setBusy(b) {
  state.busy = b;
  sendBtn.disabled = b;
  stopBtn.style.display = b ? "inline-flex" : "none";
}

async function sendCurrent() {
  const text = taEl.value.trim();
  if (!text || state.busy) return;
  taEl.value = "";
  await sendMessage(text, false);
}

async function sendMessage(text, hidden) {
  if (state.busy) return;
  const userMsg = { role: "user", content: text, hidden: !!hidden };
  state.history.push(userMsg);
  if (!hidden) appendBubble("user", text);
  saveHistory();

  const settings = loadSettings();
  const messages = [
    { role: "system", content: buildSystemPrompt(state.topic, currentExerciseOpts()) },
    ...state.history.map(m => ({ role: m.role, content: m.content })),
  ];

  setBusy(true);
  state.controller = new AbortController();

  const bubble = appendBubble("assistant", "", true);
  bubble.classList.add("dots");
  let acc = "";

  try {
    for await (const chunk of streamChat({
      baseUrl: settings.baseUrl,
      model: settings.model,
      messages,
      temperature: settings.temperature,
      maxTokens: settings.maxTokens,
      signal: state.controller.signal,
    })) {
      acc += chunk;
      bubble.classList.remove("dots");
      bubble.innerHTML = renderMarkdown(acc);
      decorateCodeBlocks(bubble);
      scrollToBottom();
    }
  } catch (e) {
    if (e.name === "AbortError") {
      bubble.innerHTML = renderMarkdown(acc + "\n\n_(остановлено пользователем)_");
    } else {
      bubble.remove();
      appendError(friendlyNetworkError(e, settings));
      // откатим юзера, чтобы он мог переотправить
    }
  } finally {
    setBusy(false);
    bubble.classList.remove("dots");
    if (acc.trim()) {
      state.history.push({ role: "assistant", content: acc });
      saveHistory();
    }
  }
}

// 3.8: понятное сообщение об ошибке сети / LM Studio.
function friendlyNetworkError(e, settings) {
  const msg = e && e.message ? String(e.message) : String(e);
  const isNetwork =
    e instanceof TypeError ||                     // fetch network errors
    /Failed to fetch|NetworkError|ECONNREFUSED|fetch failed/i.test(msg);
  const url = (settings && settings.baseUrl) || "";

  if (isNetwork) {
    const hints = [
      "Не удалось дотянуться до LM Studio.",
      `Проверь, что: 1) LM Studio открыт и Local Server запущен (Developer → Local Server → Start);`,
      `2) у тебя загружена хотя бы одна модель;`,
      `3) baseUrl в настройках указывает на доступный сервер. Сейчас: ${url || "—"}.`,
    ];
    if (!url.startsWith("/api/lmstudio")) {
      hints.push(
        "Если ловишь CORS, переключись на same-origin proxy: открой dev-сервер `python3 server.py` и поставь baseUrl `/api/lmstudio/api/v1`."
      );
    }
    return hints.join(" ");
  }
  if (/HTTP 4\d\d/.test(msg)) {
    return `LM Studio ответил клиентской ошибкой: ${msg}. Проверь модель и параметры в настройках.`;
  }
  if (/HTTP 5\d\d/.test(msg)) {
    return `LM Studio упал на сервере: ${msg}. Перезапусти Local Server и попробуй снова.`;
  }
  return msg;
}

function chatModeMessage(mode, topic) {
  const t = topic.title;
  switch (mode) {
    case "explain":
      return `Объясни тему "${t}" заново — короткое определение, зачем нужно, один SQL-пример отдельным fenced code block, разбор по частям. В конце один проверочный вопрос.`;
    case "quiz-me":
      return `Спроси меня сейчас один короткий проверочный вопрос по теме "${t}". Не давай ответ — жди мою попытку.`;
    case "check-sql":
      return `Я хочу прислать свой SQL по теме "${t}". Попроси меня вставить запрос и опиши, что именно ты будешь проверять (синтаксис, логика, индексы, NULL, JOIN, изоляция — что применимо к теме).`;
    case "give-task":
      return `Дай мне практическую задачу по теме "${t}" на учебных таблицах users / products / orders / order_items. Сначала только условие — без решения. Я попробую сам, потом разберём.`;
    default:
      return null;
  }
}

function stopStream() {
  if (state.controller) {
    try { state.controller.abort(); } catch {}
  }
}

function exportDialog() {
  if (!state.topic) return;
  const lines = [
    `# ${state.topic.title}`,
    "",
    `_Экспорт диалога с ИИ-ментором · ${new Date().toLocaleString("ru-RU")}_`,
    "",
  ];
  let hasContent = false;
  for (const m of state.history) {
    if (m.hidden) continue;
    hasContent = true;
    lines.push(m.role === "user" ? "## Я" : "## Ментор");
    lines.push("");
    lines.push(m.content);
    lines.push("");
  }
  if (!hasContent) {
    alert("В этом диалоге пока нет сообщений.");
    return;
  }
  const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const stamp = new Date().toISOString().slice(0, 19).replace(/[T:]/g, "-");
  a.download = `psql-${state.topicId}-${stamp}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function resetDialog() {
  if (!confirm("Сбросить диалог по этой теме?")) return;
  stopStream();
  state.history = [];
  saveHistory();
  bodyEl.innerHTML = "";
  // снова попросим ИИ сначала объяснить тему / разобрать упражнение
  sendMessage(buildInitialUserMessage(state.topic, currentExerciseOpts()), true);
}

// ===== Settings modal =====
function initSettingsModal() {
  const openBtn = document.getElementById("openSettings");
  const modal = document.getElementById("settingsModal");
  const cancelBtn = document.getElementById("settingsCancel");
  const saveBtn = document.getElementById("settingsSave");
  const detectBtn = document.getElementById("settingsDetect");
  const baseUrlIn = document.getElementById("setBaseUrl");
  const modelIn = document.getElementById("setModel");
  const tempIn = document.getElementById("setTemp");
  const tokensIn = document.getElementById("setTokens");
  const status = document.getElementById("settingsStatus");

  let lastFocused = null;

  function focusableIn(root) {
    return Array.from(root.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )).filter(el => el.offsetParent !== null || el === document.activeElement);
  }

  function open() {
    const s = loadSettings();
    baseUrlIn.value = s.baseUrl;
    modelIn.value = s.model || "";
    tempIn.value = s.temperature;
    tokensIn.value = s.maxTokens;
    status.textContent = "";
    lastFocused = document.activeElement;
    modal.classList.add("open");
    setTimeout(() => baseUrlIn.focus(), 50);
  }
  function close() {
    modal.classList.remove("open");
    if (lastFocused && typeof lastFocused.focus === "function") {
      lastFocused.focus();
    }
  }

  openBtn.addEventListener("click", open);
  cancelBtn.addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });

  // Esc закрывает модалку настроек; Tab/Shift+Tab — ловушка фокуса.
  modal.addEventListener("keydown", e => {
    if (!modal.classList.contains("open")) return;
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
      return;
    }
    if (e.key === "Tab") {
      const items = focusableIn(modal);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  saveBtn.addEventListener("click", () => {
    saveSettings({
      baseUrl: baseUrlIn.value.trim() || defaults.baseUrl,
      model: modelIn.value.trim(),
      temperature: parseFloat(tempIn.value) || 0.4,
      maxTokens: parseInt(tokensIn.value) || 1024,
    });
    close();
  });

  detectBtn.addEventListener("click", async () => {
    status.textContent = "Поиск моделей…";
    try {
      const ids = await listModels(baseUrlIn.value.trim());
      if (ids.length === 0) {
        status.textContent = "Сервер ответил, но моделей нет.";
        return;
      }
      modelIn.value = ids[0];
      status.textContent = "Найдено: " + ids.join(", ");
    } catch (e) {
      status.textContent = "Ошибка: " + (e.message || e);
    }
  });
}
