// Простой service worker для офлайн-кэша.
// Стратегия:
//   - HTML и assets/* — stale-while-revalidate;
//   - API LM Studio (/api/lmstudio/*) — bypass: всегда сеть.
//
// Версия кэша меняй вручную при значимых изменениях, чтобы у юзеров слетел
// старый snapshot.

const CACHE_NAME = "psql-tutor-v1";
const PRECACHE = [
  "./",
  "./index.html",
  "./assets/styles.css",
  "./assets/app.js",
  "./assets/topics.js",
  "./assets/topic-index.js",
  "./assets/tracks.js",
  "./assets/chat.js",
  "./assets/llm-client.js",
  "./assets/md.js",
  "./assets/prompts.js",
  "./assets/settings.js",
  "./assets/sql-highlight.js",
  "./assets/exercises.js",
  "./assets/quiz.js",
  "./assets/progress.js",
  "./assets/search.js",
  "./assets/toc.js",
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      // Префетч даём ленивый — игнорим неудачи (например, нет network на установке).
      Promise.all(PRECACHE.map(u => cache.add(u).catch(() => {})))
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // LM Studio API — никогда не кэшируем (там диалог с моделью).
  if (url.pathname.startsWith("/api/lmstudio/")) return;

  // Только GET-запросы того же origin кладём в кэш.
  if (e.request.method !== "GET" || url.origin !== self.location.origin) return;

  e.respondWith(
    caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(e.request);
      const network = fetch(e.request).then(res => {
        if (res && res.status === 200) cache.put(e.request, res.clone()).catch(() => {});
        return res;
      }).catch(() => null);
      // Stale-while-revalidate: отдаём cache мгновенно, обновляем в фоне.
      return cached || network || new Response("", { status: 504 });
    })
  );
});
