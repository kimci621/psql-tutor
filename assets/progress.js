// Простой прогресс-трекинг по страницам сайта.
// Хранится в localStorage под ключом psql-tutor:progress
// { "<pagepath>": { read: bool, practiced: bool } }
//
// Сюда же — экспорт/импорт всего учебного состояния (страницы + квизы +
// попытки упражнений). Чат-история и настройки LLM в экспорт не идут:
// первое — тяжёлое, второе — server-specific.

const KEY = "psql-tutor:progress";
const QUIZ_PREFIX = "psql-tutor:quiz:";
const EX_PREFIX = "psql-tutor:ex-attempt:";
const EXPORT_VERSION = 1;

function loadAll() {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAll(p) {
  try { localStorage.setItem(KEY, JSON.stringify(p)); } catch {}
}

export function getProgress(pagePath) {
  const all = loadAll();
  return all[pagePath] || { read: false, practiced: false };
}

export function setProgress(pagePath, patch) {
  const all = loadAll();
  const cur = all[pagePath] || { read: false, practiced: false };
  all[pagePath] = { ...cur, ...patch };
  saveAll(all);
  return all[pagePath];
}

// Вернёт сводку: сколько страниц прочитано и попрактиковано из заданного списка.
export function summarize(pagePaths) {
  const all = loadAll();
  const total = pagePaths.length;
  let read = 0, practiced = 0;
  for (const p of pagePaths) {
    const v = all[p];
    if (v && v.read)      read++;
    if (v && v.practiced) practiced++;
  }
  return { total, read, practiced };
}

// Чекбоксы прогресса в топбаре страницы (если страница есть в треке).
export function initProgressControls(pagePath) {
  const topbar = document.querySelector(".topbar");
  if (!topbar) return;
  if (topbar.querySelector(".progress-controls")) return;

  const cur = getProgress(pagePath);

  const wrap = document.createElement("div");
  wrap.className = "progress-controls";
  wrap.innerHTML = `
    <label class="progress-toggle"><input type="checkbox" data-prog="read" ${cur.read ? "checked" : ""}> Прочитано</label>
    <label class="progress-toggle"><input type="checkbox" data-prog="practiced" ${cur.practiced ? "checked" : ""}> Попрактиковался</label>
  `;
  // вставляем перед кнопкой темы
  const themeBtn = topbar.querySelector("#themeToggle");
  if (themeBtn) topbar.insertBefore(wrap, themeBtn);
  else topbar.appendChild(wrap);

  wrap.querySelectorAll("input[data-prog]").forEach(inp => {
    inp.addEventListener("change", () => {
      setProgress(pagePath, { [inp.dataset.prog]: inp.checked });
      // обновим прогресс-бар в сайдбаре
      window.dispatchEvent(new CustomEvent("psql-tutor:progress-changed"));
    });
  });
}

// Прогресс-бар в сайдбаре по списку страниц всех треков.
export function initSidebarProgress(allTrackPages) {
  const sidebar = document.querySelector(".sidebar");
  if (!sidebar) return;
  if (sidebar.querySelector(".sidebar-progress")) return;

  const wrap = document.createElement("div");
  wrap.className = "sidebar-progress";
  sidebar.insertBefore(wrap, sidebar.querySelector(".nav"));

  function render() {
    const s = summarize(allTrackPages);
    const pctRead = s.total ? Math.round(100 * s.read / s.total) : 0;
    const pctPract = s.total ? Math.round(100 * s.practiced / s.total) : 0;
    wrap.innerHTML = `
      <div class="sp-row">
        <span class="sp-label">Прочитано</span>
        <span class="sp-num">${s.read}/${s.total}</span>
      </div>
      <div class="sp-bar"><div class="sp-fill read" style="width: ${pctRead}%"></div></div>
      <div class="sp-row">
        <span class="sp-label">Практика</span>
        <span class="sp-num">${s.practiced}/${s.total}</span>
      </div>
      <div class="sp-bar"><div class="sp-fill practiced" style="width: ${pctPract}%"></div></div>
    `;
  }

  render();
  window.addEventListener("psql-tutor:progress-changed", render);
}

// Собирает все ключи localStorage с заданным префиксом.
function scanPrefix(prefix) {
  const out = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(prefix)) {
      const v = localStorage.getItem(k);
      try { out[k.slice(prefix.length)] = JSON.parse(v); }
      catch { out[k.slice(prefix.length)] = v; }
    }
  }
  return out;
}

// Возвращает срез прогресса: страницы, квизы и попытки упражнений.
export function getQuizScores() {
  return scanPrefix(QUIZ_PREFIX);
}

export function getExerciseAttempts() {
  return scanPrefix(EX_PREFIX);
}

// Сериализуем весь прогресс в JSON-объект, пригодный для скачивания.
export function exportProgress() {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    pages: loadAll(),
    quizzes: getQuizScores(),
    exercises: getExerciseAttempts()
  };
}

// Сливаем входящий прогресс с текущим. Стратегия — взять максимум:
// - read/practiced: OR (если хоть где-то true — оставляем true)
// - quiz: лучший по score
// - exercise-attempt: длиннее или новее (выбираем поступивший, если текущий пустой)
// Возвращает сводку изменений.
export function importProgress(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("Невалидный JSON прогресса");
  }
  if (payload.version !== EXPORT_VERSION) {
    throw new Error(`Неподдерживаемая версия формата (ожидалась ${EXPORT_VERSION}, получена ${payload.version})`);
  }
  const summary = { pagesAdded: 0, pagesUpdated: 0, quizzesUpdated: 0, exercisesUpdated: 0 };

  // pages
  if (payload.pages && typeof payload.pages === "object") {
    const cur = loadAll();
    for (const [page, val] of Object.entries(payload.pages)) {
      if (!val || typeof val !== "object") continue;
      const existing = cur[page];
      const next = {
        read: !!(existing?.read || val.read),
        practiced: !!(existing?.practiced || val.practiced)
      };
      if (!existing) summary.pagesAdded++;
      else if (next.read !== !!existing.read || next.practiced !== !!existing.practiced) summary.pagesUpdated++;
      cur[page] = next;
    }
    saveAll(cur);
  }

  // quizzes (выбираем больший score)
  if (payload.quizzes && typeof payload.quizzes === "object") {
    for (const [quizId, val] of Object.entries(payload.quizzes)) {
      if (!val || typeof val !== "object") continue;
      const key = QUIZ_PREFIX + quizId;
      let cur = null;
      try { cur = JSON.parse(localStorage.getItem(key) || "null"); } catch { cur = null; }
      const curScore = (cur && typeof cur.score === "number") ? cur.score : -1;
      const inScore = (typeof val.score === "number") ? val.score : -1;
      if (inScore > curScore) {
        try {
          localStorage.setItem(key, JSON.stringify(val));
          summary.quizzesUpdated++;
        } catch {}
      }
    }
  }

  // exercise attempts (берём входящий, если текущий пустой; иначе оставляем текущий)
  if (payload.exercises && typeof payload.exercises === "object") {
    for (const [exId, val] of Object.entries(payload.exercises)) {
      if (typeof val !== "string") continue;
      const key = EX_PREFIX + exId;
      const cur = localStorage.getItem(key) || "";
      if (cur.trim() === "" && val.trim() !== "") {
        try {
          localStorage.setItem(key, val);
          summary.exercisesUpdated++;
        } catch {}
      }
    }
  }

  window.dispatchEvent(new CustomEvent("psql-tutor:progress-changed"));
  return summary;
}
