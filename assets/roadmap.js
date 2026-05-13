// Логика страницы roadmap.html: рендер карты разделов с per-page статусом,
// прогресс-бары по трекам, кнопки экспорта/импорта прогресса.

import { tracks } from "./tracks.js?v=2";
import { sidebarGroups } from "./sidebar.js?v=2";
import {
  exportProgress, importProgress, getQuizScores
} from "./progress.js?v=2";

const KEY = "psql-tutor:progress";

function readPages() {
  try { return JSON.parse(localStorage.getItem(KEY) || "{}") || {}; }
  catch { return {}; }
}

// Привязка имени квиза к странице. Имя квиза = data-quiz-id со страницы;
// сейчас они совпадают с базовой темой страницы. См. соответствующие HTML.
const QUIZ_PAGE = {
  basics: "basics.html",
  joins: "joins.html",
  aggregates: "aggregates.html",
  indexes: "indexes.html",
  transactions: "transactions.html",
  window: "window.html",
  types: "types.html",
  programming: "programming.html",
  security: "security.html",
  tuning: "tuning.html",
  scaling: "scaling.html",
  copy: "copy.html",
  performance: "performance.html",
  replication: "replication.html",
  backups: "backups.html"
};

function pageStatus(page, pages, quizzes) {
  const p = pages[page] || {};
  const quizId = Object.keys(QUIZ_PAGE).find(k => QUIZ_PAGE[k] === page);
  const q = quizId && quizzes[quizId];
  const quizPassed = q && q.score && q.total && (q.score / q.total >= 0.6);
  if (quizPassed) return "quiz";
  if (p.practiced) return "practiced";
  if (p.read) return "read";
  return "todo";
}

function renderSummary(pages, quizzes) {
  // знаменатель — все страницы, упомянутые в треках + сайдбаре.
  const allPages = new Set();
  for (const t of tracks) for (const p of t.pages) allPages.add(p.href);
  for (const g of sidebarGroups) for (const it of g.items) allPages.add(it.href);

  let read = 0, practiced = 0;
  for (const page of allPages) {
    const p = pages[page] || {};
    if (p.read) read++;
    if (p.practiced) practiced++;
  }
  const total = allPages.size;

  const quizTotal = Object.keys(QUIZ_PAGE).length;
  let quizPassed = 0;
  for (const id of Object.keys(QUIZ_PAGE)) {
    const q = quizzes[id];
    if (q && q.score && q.total && (q.score / q.total >= 0.6)) quizPassed++;
  }

  const set = (key, value) => {
    const el = document.querySelector(`[data-rm="${key}"]`);
    if (el) el.textContent = value;
  };
  set("read-pct", total ? Math.round(100 * read / total) + "%" : "0%");
  set("read-frac", `${read} / ${total}`);
  set("practiced-pct", total ? Math.round(100 * practiced / total) + "%" : "0%");
  set("practiced-frac", `${practiced} / ${total}`);
  set("quiz-pct", quizTotal ? Math.round(100 * quizPassed / quizTotal) + "%" : "0%");
  set("quiz-frac", `${quizPassed} / ${quizTotal}`);
}

function renderTracks(pages, quizzes) {
  const root = document.getElementById("rm-tracks");
  if (!root) return;
  root.innerHTML = tracks.map(t => {
    const segments = t.pages.map(p => {
      const st = pageStatus(p.href, pages, quizzes);
      return `<a class="rm-seg rm-st-${st}" href="${p.href}" title="${escapeAttr(p.title)} — ${labelOf(st)}"></a>`;
    }).join("");
    const passed = t.pages.filter(p => pageStatus(p.href, pages, quizzes) !== "todo").length;
    return `
      <div class="rm-track">
        <div class="rm-track-head">
          <span class="rm-track-name">${escapeHtml(t.title)}</span>
          <span class="rm-track-frac">${passed} / ${t.pages.length}</span>
        </div>
        <div class="rm-track-bar" aria-label="Прогресс трека ${escapeAttr(t.title)}">${segments}</div>
        <div class="rm-track-summary">${escapeHtml(t.summary)}</div>
      </div>
    `;
  }).join("");
}

function renderMap(pages, quizzes) {
  const root = document.getElementById("rm-map");
  if (!root) return;
  root.innerHTML = sidebarGroups.map(g => {
    const cells = g.items.map(it => {
      const st = pageStatus(it.href, pages, quizzes);
      return `<a class="rm-cell rm-st-${st}" href="${it.href}" title="${escapeAttr(labelOf(st))}">
        <span class="rm-cell-dot" aria-hidden="true"></span>
        <span class="rm-cell-label">${escapeHtml(it.label)}</span>
      </a>`;
    }).join("");
    return `
      <div class="rm-group">
        <div class="rm-group-head">${escapeHtml(g.title)}</div>
        <div class="rm-group-grid">${cells}</div>
      </div>
    `;
  }).join("");
}

function labelOf(st) {
  return { todo: "не начат", read: "прочитан", practiced: "с практикой", quiz: "+ квиз пройден" }[st] || st;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function escapeAttr(s) { return escapeHtml(s); }

function downloadJson(filename, payload) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function setStatus(msg, kind) {
  const el = document.getElementById("rm-status");
  if (!el) return;
  el.className = "rm-pp-status" + (kind ? " rm-status-" + kind : "");
  el.textContent = msg;
}

function wireButtons() {
  const exportBtn = document.getElementById("rm-export");
  const importBtn = document.getElementById("rm-import");
  const fileInp = document.getElementById("rm-import-file");
  const resetBtn = document.getElementById("rm-reset");

  exportBtn?.addEventListener("click", () => {
    const data = exportProgress();
    const stamp = new Date().toISOString().slice(0, 10);
    downloadJson(`psql-tutor-progress-${stamp}.json`, data);
    setStatus("Скачан JSON с прогрессом.", "ok");
  });

  importBtn?.addEventListener("click", () => fileInp?.click());

  fileInp?.addEventListener("change", async () => {
    const file = fileInp.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const summary = importProgress(parsed);
      setStatus(
        `Загружено: страниц ${summary.pagesUpdated + summary.pagesAdded} (новых ${summary.pagesAdded}), квизов улучшено ${summary.quizzesUpdated}, попыток упражнений ${summary.exercisesUpdated}.`,
        "ok"
      );
      renderAll();
    } catch (e) {
      setStatus("Ошибка импорта: " + (e?.message || e), "err");
    } finally {
      fileInp.value = ""; // позволить повторно выбрать тот же файл
    }
  });

  resetBtn?.addEventListener("click", () => {
    if (!confirm("Сбросить прогресс? Будут удалены отметки прочитано/практика, результаты квизов и попытки упражнений. Историю чатов это не затронет.")) return;
    // удаляем только ключи учебного прогресса
    const prefixes = ["psql-tutor:progress", "psql-tutor:quiz:", "psql-tutor:ex-attempt:"];
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (!k) continue;
      if (prefixes.some(p => k === p || k.startsWith(p))) toRemove.push(k);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
    setStatus(`Сброшено ${toRemove.length} ключей прогресса.`, "ok");
    window.dispatchEvent(new CustomEvent("psql-tutor:progress-changed"));
    renderAll();
  });
}

function renderAll() {
  const pages = readPages();
  const quizzes = getQuizScores();
  renderSummary(pages, quizzes);
  renderTracks(pages, quizzes);
  renderMap(pages, quizzes);
}

// app.js на DOMContentLoaded инжектит сайдбар; нужно дождаться его, чтобы
// группы из sidebar.js точно были доступны (они и так доступны — это просто
// импорт массива, не DOM). Но render-функции вешаем на ту же событийную точку.
document.addEventListener("DOMContentLoaded", () => {
  renderAll();
  wireButtons();
  window.addEventListener("psql-tutor:progress-changed", renderAll);
});
