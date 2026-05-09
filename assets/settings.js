const KEY = "psql-tutor:settings";

export const defaults = {
  // Same-origin proxy in server.py. Browser avoids LM Studio CORS/preflight.
  // Direct alternatives still work if CORS is enabled in LM Studio:
  //   http://127.0.0.1:1234/api/v1
  //   http://127.0.0.1:1234/v1
  baseUrl: "/api/lmstudio/api/v1",
  model: "",
  temperature: 0.4,
  maxTokens: 1024,
};

function isDirectLmStudioUrl(url) {
  return /^http:\/\/(localhost|127\.0\.0\.1):1234(\/(v\d+|api\/v\d+))?\/?$/.test(url || "");
}

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    const stored = JSON.parse(raw);
    if (stored && isDirectLmStudioUrl(stored.baseUrl)) {
      stored.baseUrl = defaults.baseUrl;
      localStorage.setItem(KEY, JSON.stringify(stored));
    }
    return { ...defaults, ...stored };
  } catch {
    return { ...defaults };
  }
}

export function saveSettings(s) {
  localStorage.setItem(KEY, JSON.stringify(s));
}

// Тема. Если пользователь не выбирал явно — берём системную через
// prefers-color-scheme. Явный выбор сохраняется в localStorage.
export function loadTheme() {
  const explicit = localStorage.getItem("psql-tutor:theme");
  if (explicit === "dark" || explicit === "light") return explicit;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  }
  return "dark";
}
export function saveTheme(t) {
  localStorage.setItem("psql-tutor:theme", t);
}
// Подписка на смену системной темы — вызывает callback с новой темой.
// Действует только пока пользователь не сделал явный выбор.
export function watchSystemTheme(cb) {
  if (typeof window === "undefined" || !window.matchMedia) return;
  const mq = window.matchMedia("(prefers-color-scheme: light)");
  const handler = () => {
    if (localStorage.getItem("psql-tutor:theme")) return; // явный выбор — не трогаем
    cb(mq.matches ? "light" : "dark");
  };
  if (mq.addEventListener) mq.addEventListener("change", handler);
  else if (mq.addListener)  mq.addListener(handler);
}
