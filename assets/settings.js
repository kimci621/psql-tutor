const KEY = "psql-tutor:settings";

export const defaults = {
  baseUrl: "http://localhost:1234/v1",
  model: "",
  temperature: 0.4,
  maxTokens: 1024,
};

export function loadSettings() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...defaults };
    return { ...defaults, ...JSON.parse(raw) };
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
