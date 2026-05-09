// Простой прогресс-трекинг по страницам сайта.
// Хранится в localStorage под ключом psql-tutor:progress
// { "<pagepath>": { read: bool, practiced: bool } }

const KEY = "psql-tutor:progress";

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
