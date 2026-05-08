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

export function loadTheme() {
  return localStorage.getItem("psql-tutor:theme") || "dark";
}
export function saveTheme(t) {
  localStorage.setItem("psql-tutor:theme", t);
}
