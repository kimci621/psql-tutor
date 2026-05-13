// Единая навигация сайдбара. Раньше дублировалась в каждом HTML-файле —
// теперь генерируется этим модулем и инжектится из app.js на DOMContentLoaded.
// Группы расставлены по логике «от простого к сложному», без уровневых ярлыков
// junior/senior.

const groups = [
  {
    title: "Старт",
    items: [
      { href: "install.html", label: "Установка" },
      { href: "basics.html", label: "Основы SQL и psql" }
    ]
  },
  {
    title: "Работа с данными",
    items: [
      { href: "types.html", label: "Типы данных" },
      { href: "joins.html", label: "Соединения (JOIN)" },
      { href: "aggregates.html", label: "Агрегации и GROUP BY" },
      { href: "window.html", label: "Оконные функции" }
    ]
  },
  {
    title: "Производительность",
    items: [
      { href: "indexes.html", label: "Индексы" },
      { href: "performance.html", label: "EXPLAIN и планировщик" }
    ]
  },
  {
    title: "Транзакции",
    items: [
      { href: "transactions.html", label: "Транзакции и блокировки" }
    ]
  },
  {
    title: "Программирование",
    items: [
      { href: "programming.html", label: "PL/pgSQL, функции, триггеры" }
    ]
  },
  {
    title: "Эксплуатация",
    items: [
      { href: "tuning.html", label: "Конфигурация и тюнинг" },
      { href: "scaling.html", label: "Масштабирование и партиции" },
      { href: "replication.html", label: "Репликация" },
      { href: "backups.html", label: "Бэкапы и восстановление" },
      { href: "migrations.html", label: "Миграции без даунтайма" },
      { href: "copy.html", label: "COPY и массовая загрузка" }
    ]
  },
  {
    title: "Безопасность",
    items: [
      { href: "security.html", label: "Аутентификация и доступы" }
    ]
  },
  {
    title: "Интеграция",
    items: [
      { href: "app-integration.html", label: "Postgres из приложения" },
      { href: "search-text.html", label: "Полнотекстовый и fuzzy поиск" },
      { href: "tooling.html", label: "Тулинг" }
    ]
  },
  {
    title: "Справочники",
    items: [
      { href: "roadmap.html", label: "Roadmap и прогресс" },
      { href: "cheatsheet.html", label: "Шпаргалка" },
      { href: "decisions.html", label: "Что выбрать" },
      { href: "errors.html", label: "Частые ошибки" }
    ]
  },
  {
    title: "Гайды",
    items: [
      { href: "guides/list-tables.html", label: "Список таблиц" },
      { href: "guides/create-table.html", label: "Создание таблицы" },
      { href: "guides/vacuum.html", label: "VACUUM" },
      { href: "guides/list-users.html", label: "Список пользователей" },
      { href: "guides/create-index.html", label: "Создание индекса" }
    ]
  }
];

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

// Преобразует относительный href ссылки сайдбара в путь, корректный
// для текущей страницы (так же, как resolveHref в tracks.js).
function resolveHref(href, fromPath) {
  const inGuides = /(^|\/)guides\//.test(fromPath || "");
  const target = href.replace(/^\.\//, "").replace(/^\//, "");
  if (inGuides) {
    if (target.startsWith("guides/")) return target.slice("guides/".length);
    return "../" + target;
  }
  return target;
}

// Возвращает HTML содержимого сайдбара: шапку, кнопку поиска и сгруппированные
// ссылки. currentPath — путь текущей страницы относительно корня (например,
// "basics.html" или "guides/vacuum.html"). Используется для корректных
// относительных href.
export function renderSidebar(currentPath) {
  const homeHref = resolveHref("index.html", currentPath);
  const head = `
    <h1><a href="${homeHref}" class="sidebar-home">PostgreSQL Tutor</a></h1>
    <div class="tag">Локальный учебник</div>
    <button type="button" class="sidebar-search" aria-label="Открыть поиск по темам">
      <span class="ss-icon" aria-hidden="true">🔍</span>
      <span class="ss-label">Поиск по темам…</span>
      <span class="ss-kbd" aria-hidden="true">⌘K</span>
    </button>
  `;

  const navHtml = groups.map(g => {
    const title = `<li class="group-title">${escapeHtml(g.title)}</li>`;
    const lis = g.items.map(it => {
      const href = resolveHref(it.href, currentPath);
      return `<li><a href="${href}">${escapeHtml(it.label)}</a></li>`;
    }).join("");
    return title + lis;
  }).join("");

  return head + `<ul class="nav">${navHtml}</ul>`;
}

// Список всех href из навигации (нормализованных), пригодится для проверок
// и pre-cache в service worker.
export const sidebarPages = groups.flatMap(g => g.items.map(it => it.href));

// Группы сайдбара — экспортируем для roadmap-страницы, чтобы
// нарисовать ту же таксономию визуально.
export const sidebarGroups = groups;
