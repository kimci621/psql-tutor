import { topics } from "./topics.js";
import { buildSystemPrompt, greetingUserMessage } from "./prompts.js";
import { streamChat, listModels } from "./llm-client.js";
import { loadSettings, saveSettings } from "./settings.js";
import { renderMarkdown } from "./md.js";

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

  document.getElementById("chatClose").addEventListener("click", closeChat);
  scrimEl.addEventListener("click", closeChat);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && panelEl.classList.contains("open")) closeChat();
  });

  sendBtn.addEventListener("click", sendCurrent);
  stopBtn.addEventListener("click", stopStream);
  resetBtn.addEventListener("click", resetDialog);
  taEl.addEventListener("keydown", e => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendCurrent();
    }
  });

  initSettingsModal();
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
    // Первый запуск темы — попросим ИИ начать сократический диалог
    sendMessage(greetingUserMessage, /*hidden*/ true);
  }
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
  } else {
    div.textContent = html;
  }
  bodyEl.appendChild(div);
  if (isStream) div.dataset.streaming = "1";
  scrollToBottom();
  return div;
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
    { role: "system", content: buildSystemPrompt(state.topic) },
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
      scrollToBottom();
    }
  } catch (e) {
    if (e.name === "AbortError") {
      bubble.innerHTML = renderMarkdown(acc + "\n\n_(остановлено пользователем)_");
    } else {
      bubble.remove();
      appendError(e.message || String(e));
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

function stopStream() {
  if (state.controller) {
    try { state.controller.abort(); } catch {}
  }
}

function resetDialog() {
  if (!confirm("Сбросить диалог по этой теме?")) return;
  stopStream();
  state.history = [];
  saveHistory();
  bodyEl.innerHTML = "";
  // снова попросим ИИ начать
  sendMessage(greetingUserMessage, true);
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

  function open() {
    const s = loadSettings();
    baseUrlIn.value = s.baseUrl;
    modelIn.value = s.model || "";
    tempIn.value = s.temperature;
    tokensIn.value = s.maxTokens;
    status.textContent = "";
    modal.classList.add("open");
  }
  function close() { modal.classList.remove("open"); }

  openBtn.addEventListener("click", open);
  cancelBtn.addEventListener("click", close);
  modal.addEventListener("click", e => { if (e.target === modal) close(); });

  saveBtn.addEventListener("click", () => {
    saveSettings({
      baseUrl: baseUrlIn.value.trim() || "http://localhost:1234/v1",
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
