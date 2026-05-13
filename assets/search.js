// Командная палитра поиска по темам.
// Cmd/Ctrl+K (или /) открывает оверлей с инпутом.
// Поиск — простой fuzzy/substring по полям title и summary в topics.js,
// фильтруется списком topicPageIndex (id → файл страницы).

import { topics } from "./topics.js";
import { topicPageIndex } from "./topic-index.js?v=1";

let overlayEl, inputEl, listEl;
let items = [];        // массив { id, title, summary, page, kind }
let selectedIdx = 0;
let filtered = [];

function buildItems() {
  items = [];
  for (const id of Object.keys(topics)) {
    const t = topics[id];
    const page = topicPageIndex[id];
    if (!page) continue; // тема без места на странице — в палитре не показываем
    items.push({
      id,
      title: t.title || id,
      summary: t.summary || "",
      page,
      kind: t.kind || "topic"
    });
  }
}

// Простой скоринг: чем ближе совпадение к началу title, тем выше.
// Поддерживаем подстрочный поиск + порядок символов (loose).
function score(item, q) {
  if (!q) return 0;
  const t = (item.title + " " + item.summary).toLowerCase();
  const ql = q.toLowerCase();

  // Точное вхождение фразы — лучший балл
  const direct = t.indexOf(ql);
  if (direct !== -1) {
    return 1000 - direct + (item.title.toLowerCase().indexOf(ql) === 0 ? 200 : 0);
  }

  // Loose: все символы запроса встречаются по порядку
  let i = 0;
  for (const ch of t) {
    if (ch === ql[i]) i++;
    if (i === ql.length) break;
  }
  if (i === ql.length) return 100 - (t.length / 100);
  return -1; // не подходит
}

function filter(q) {
  const trimmed = q.trim();
  if (!trimmed) {
    return items.slice(0, 30);
  }
  const scored = [];
  for (const it of items) {
    const s = score(it, trimmed);
    if (s >= 0) scored.push({ it, s });
  }
  scored.sort((a, b) => b.s - a.s);
  return scored.slice(0, 30).map(x => x.it);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function render() {
  if (filtered.length === 0) {
    listEl.innerHTML = `<div class="search-empty">Ничего не нашлось</div>`;
    return;
  }
  listEl.innerHTML = filtered.map((it, i) => `
    <a class="search-item ${i === selectedIdx ? "active" : ""}"
       data-idx="${i}"
       href="${resolvePath(it.page)}#${escapeHtml(it.id)}">
      <span class="si-title">${escapeHtml(it.title)}</span>
      <span class="si-sum">${escapeHtml(it.summary)}</span>
      <span class="si-page">${escapeHtml(it.page)}</span>
    </a>
  `).join("");
  // Прокрутить активный элемент в видимую область
  const active = listEl.querySelector(".search-item.active");
  if (active) active.scrollIntoView({ block: "nearest" });
}

function resolvePath(page) {
  // Текущий путь: учитываем guides/ и корень.
  const here = location.pathname;
  const inGuides = /\/guides\//.test(here);
  if (inGuides) {
    if (page.startsWith("guides/")) return page.slice("guides/".length);
    return "../" + page;
  }
  return page;
}

export function openSearch() {
  open();
}

function open() {
  if (!overlayEl) return;
  overlayEl.classList.add("open");
  inputEl.value = "";
  filtered = filter("");
  selectedIdx = 0;
  render();
  setTimeout(() => inputEl.focus(), 30);
}

function close() {
  if (!overlayEl) return;
  overlayEl.classList.remove("open");
}

export function initSearch() {
  buildItems();

  // Создаём оверлей в DOM
  overlayEl = document.createElement("div");
  overlayEl.className = "search-overlay";
  overlayEl.setAttribute("role", "dialog");
  overlayEl.setAttribute("aria-label", "Поиск по темам");
  overlayEl.innerHTML = `
    <div class="search-box">
      <input class="search-input" type="text" placeholder="Поиск по темам… (Esc — закрыть)" aria-label="Поиск">
      <div class="search-list" role="listbox"></div>
      <div class="search-hint">↑/↓ — выбор · Enter — открыть · Esc — закрыть</div>
    </div>
  `;
  document.body.appendChild(overlayEl);
  inputEl = overlayEl.querySelector(".search-input");
  listEl = overlayEl.querySelector(".search-list");

  overlayEl.addEventListener("click", e => {
    if (e.target === overlayEl) close();
  });

  inputEl.addEventListener("input", () => {
    filtered = filter(inputEl.value);
    selectedIdx = 0;
    render();
  });

  inputEl.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (selectedIdx < filtered.length - 1) selectedIdx++;
      render();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (selectedIdx > 0) selectedIdx--;
      render();
    } else if (e.key === "Enter") {
      e.preventDefault();
      const it = filtered[selectedIdx];
      if (it) {
        const href = resolvePath(it.page) + "#" + it.id;
        location.href = href;
      }
    }
  });

  // Глобальный хоткей Cmd/Ctrl+K и /
  document.addEventListener("keydown", e => {
    const isMac = navigator.platform.toLowerCase().includes("mac");
    const cmd = isMac ? e.metaKey : e.ctrlKey;
    if (cmd && (e.key === "k" || e.key === "K")) {
      e.preventDefault();
      if (overlayEl.classList.contains("open")) close(); else open();
    } else if (e.key === "/" && document.activeElement && document.activeElement.tagName !== "INPUT" && document.activeElement.tagName !== "TEXTAREA") {
      e.preventDefault();
      open();
    }
  });
}
