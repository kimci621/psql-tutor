import { highlightSQL } from "./sql-highlight.js";
import { initChat } from "./chat.js";
import { loadTheme, saveTheme } from "./settings.js";

function applyTheme(t) {
  document.documentElement.setAttribute("data-theme", t);
  const btn = document.getElementById("themeToggle");
  if (btn) btn.textContent = t === "dark" ? "☀ Светлая" : "☾ Тёмная";
}
function initTheme() {
  applyTheme(loadTheme());
  const btn = document.getElementById("themeToggle");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = (document.documentElement.getAttribute("data-theme") === "dark") ? "light" : "dark";
    saveTheme(next);
    applyTheme(next);
  });
}

function initCodeBlocks() {
  document.querySelectorAll(".code-block").forEach(block => {
    const pre = block.querySelector("pre");
    if (!pre) return;
    const code = pre.textContent;
    pre.innerHTML = highlightSQL(code);

    const actions = block.querySelector(".code-actions");
    if (!actions) return;

    const copyBtn = actions.querySelector(".btn-copy");
    if (copyBtn) {
      copyBtn.addEventListener("click", async () => {
        try {
          await navigator.clipboard.writeText(code);
          const orig = copyBtn.textContent;
          copyBtn.textContent = "Скопировано ✓";
          setTimeout(() => (copyBtn.textContent = orig), 1400);
        } catch {
          // fallback
          const ta = document.createElement("textarea");
          ta.value = code;
          document.body.appendChild(ta);
          ta.select();
          try { document.execCommand("copy"); } catch {}
          document.body.removeChild(ta);
          copyBtn.textContent = "Скопировано";
          setTimeout(() => (copyBtn.textContent = "📋 Копировать"), 1400);
        }
      });
    }
  });
}

function initActiveNav() {
  const here = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav a").forEach(a => {
    const href = a.getAttribute("href") || "";
    if (href.endsWith(here)) a.classList.add("active");
  });
}

function injectChatPanel() {
  if (document.getElementById("chatPanel")) return;
  const html = `
<div id="scrim" class="scrim"></div>
<aside id="chatPanel" class="chat-panel" aria-label="Чат с ИИ-ментором">
  <div class="chat-head">
    <div style="flex:1; min-width: 0;">
      <div id="chatTitle" class="title">Тема</div>
      <div id="chatSub" class="topic-sub"></div>
    </div>
    <div class="chat-actions">
      <button class="btn icon" id="openSettings" title="Настройки LLM">⚙</button>
      <button class="btn icon" id="chatReset" title="Сбросить диалог">↺</button>
      <button class="btn icon" id="chatClose" title="Закрыть">✕</button>
    </div>
  </div>
  <div id="chatBody" class="chat-body"></div>
  <div class="chat-foot">
    <textarea id="chatInput" placeholder="Напиши свою мысль или вопрос… (Enter — отправить, Shift+Enter — перенос)"></textarea>
    <div class="row">
      <span class="hint">Ментор спрашивает, а не диктует — отвечай своими словами.</span>
      <div style="display:flex; gap:6px;">
        <button class="btn" id="chatStop" style="display:none;">Стоп</button>
        <button class="btn primary" id="chatSend">Отправить</button>
      </div>
    </div>
  </div>
</aside>

<div id="settingsModal" class="modal" role="dialog" aria-modal="true">
  <div class="box">
    <h2>Настройки локального LLM</h2>
    <small>По умолчанию — LM Studio. Включи в LM Studio: <em>Developer → Local Server → Start Server</em>.</small>
    <label>Base URL</label>
    <input id="setBaseUrl" type="text" placeholder="http://localhost:1234/v1">
    <label>Модель (id)</label>
    <input id="setModel" type="text" placeholder="оставь пустым для модели по умолчанию">
    <label>Temperature</label>
    <input id="setTemp" type="number" step="0.05" min="0" max="2">
    <label>Max tokens</label>
    <input id="setTokens" type="number" min="64" max="8192">
    <p id="settingsStatus" style="margin: 10px 0 0; min-height: 1em; color: var(--text-dim); font-size: 12.5px;"></p>
    <div class="modal-actions">
      <button class="btn ghost" id="settingsDetect">Найти модели</button>
      <button class="btn" id="settingsCancel">Отмена</button>
      <button class="btn primary" id="settingsSave">Сохранить</button>
    </div>
  </div>
</div>`;
  const wrap = document.createElement("div");
  wrap.innerHTML = html;
  while (wrap.firstChild) document.body.appendChild(wrap.firstChild);
}

document.addEventListener("DOMContentLoaded", () => {
  injectChatPanel();
  initTheme();
  initCodeBlocks();
  initActiveNav();
  initChat();
});
