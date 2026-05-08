import { highlightSQL } from "./sql-highlight.js?v=2";
import { initChat } from "./chat.js?v=4";
import { loadTheme, saveTheme } from "./settings.js";
import { findTrackContext, resolveHref } from "./tracks.js?v=1";

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

// Текущий путь страницы относительно корня сайта (без ведущего слеша).
// Учитывает подкаталог guides/.
function currentPagePath() {
  const path = location.pathname.replace(/\/$/, "/index.html");
  const parts = path.split("/").filter(Boolean);
  if (parts.length === 0) return "index.html";
  if (parts[parts.length - 2] === "guides") {
    return "guides/" + parts[parts.length - 1];
  }
  return parts[parts.length - 1];
}

// Вставляем хлебные крошки под топбаром и блок «Дальше / Назад» в конце main.
// Порядок страниц берётся из tracks.js. Если страница не входит ни в один трек,
// блоки не отрисовываются.
function initTrackNavigation() {
  const main = document.querySelector("main.main");
  if (!main) return;
  const here = currentPagePath();
  const ctx = findTrackContext(here);
  if (!ctx) return;

  // Хлебные крошки.
  const pageTitleEl = main.querySelector(".page-title");
  const homeHref = resolveHref("index.html", here);
  const crumbs = document.createElement("nav");
  crumbs.className = "breadcrumbs";
  crumbs.setAttribute("aria-label", "Хлебные крошки");
  const last = ctx.track.pages[ctx.index];
  crumbs.innerHTML =
    `<a href="${homeHref}">Главная</a>` +
    `<span class="sep" aria-hidden="true">›</span>` +
    `<span class="track-name">Трек: ${escapeHtml(ctx.track.title)}</span>` +
    `<span class="sep" aria-hidden="true">›</span>` +
    `<span class="current" aria-current="page">${escapeHtml(last.title)}</span>`;
  if (pageTitleEl) {
    pageTitleEl.parentNode.insertBefore(crumbs, pageTitleEl);
  } else {
    main.insertBefore(crumbs, main.firstChild);
  }

  // Прячем текстовый crumb в топбаре, чтобы не дублировать.
  const topbarCrumbs = main.querySelector(".topbar .crumbs");
  if (topbarCrumbs) topbarCrumbs.style.visibility = "hidden";

  // Блок «Дальше / Назад».
  const nav = document.createElement("nav");
  nav.className = "track-nav";
  nav.setAttribute("aria-label", "Навигация по треку");
  const prevHtml = ctx.prev
    ? `<a class="prev" href="${resolveHref(ctx.prev.href, here)}" rel="prev">
         <span class="label">← Назад</span>
         <span class="title">${escapeHtml(ctx.prev.title)}</span>
       </a>`
    : `<span class="prev placeholder" aria-hidden="true"></span>`;
  const nextHtml = ctx.next
    ? `<a class="next" href="${resolveHref(ctx.next.href, here)}" rel="next">
         <span class="label">Дальше →</span>
         <span class="title">${escapeHtml(ctx.next.title)}</span>
       </a>`
    : `<span class="next placeholder" aria-hidden="true"></span>`;
  nav.innerHTML = prevHtml + nextHtml;
  main.appendChild(nav);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
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
      <button class="btn icon" id="chatExport" title="Скачать диалог (.md)">⤓</button>
      <button class="btn icon" id="chatReset" title="Сбросить диалог">↺</button>
      <button class="btn icon" id="chatClose" title="Закрыть">✕</button>
    </div>
  </div>
  <div id="chatBody" class="chat-body"></div>
  <div class="chat-foot">
    <textarea id="chatInput" placeholder="Напиши свою мысль или вопрос… (Enter — отправить, Shift+Enter — перенос)"></textarea>
    <div class="row">
      <span class="hint">Ментор сначала объясняет тему, затем проверяет понимание.</span>
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
    <small>
      LM Studio: <em>Developer → Local Server → Start Server</em>.<br>
      По умолчанию сайт ходит через same-origin proxy, чтобы браузер не упирался в CORS.<br>
      • <code>/api/lmstudio/api/v1</code> — прокси к простому LM Studio API<br>
      • <code>/api/lmstudio/v1</code> — прокси к OpenAI-совместимому API
    </small>
    <label>Base URL</label>
    <input id="setBaseUrl" type="text" placeholder="/api/lmstudio/api/v1">
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
  initTrackNavigation();
  initChat();
});
