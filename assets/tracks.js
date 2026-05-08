// Учебные треки. Каждый трек — упорядоченный список страниц.
// Используется лендингом (index.html) для отрисовки карточек,
// а также блоком «Дальше / Назад» внизу каждой страницы.

export const tracks = [
  {
    id: 'junior',
    title: 'Junior с нуля',
    summary: 'Поставить PostgreSQL, разобраться с psql, написать первый CREATE TABLE и SELECT, понять JOIN и агрегации.',
    level: 'Старт',
    estimate: '1–2 недели',
    pages: [
      { href: 'install.html', title: 'Установка PostgreSQL' },
      { href: 'basics.html', title: 'Основы SQL и psql' },
      { href: 'types.html', title: 'Типы данных' },
      { href: 'cheatsheet.html', title: 'Шпаргалка по командам' }, // ранее index.html
      { href: 'joins.html', title: 'Соединения (JOIN)' },
      { href: 'aggregates.html', title: 'Агрегации и GROUP BY' },
      { href: 'guides/list-tables.html', title: 'Гайд: список таблиц' },
      { href: 'guides/create-table.html', title: 'Гайд: создание таблицы' },
      { href: 'guides/list-users.html', title: 'Гайд: список пользователей' }
    ]
  },
  {
    id: 'middle',
    title: 'Middle',
    summary: 'Транзакции, изоляция, индексы, оптимизация, обслуживание, типичные ошибки и инструменты разработчика.',
    level: 'Развитие',
    estimate: '2–4 недели',
    pages: [
      { href: 'transactions.html', title: 'Транзакции и блокировки' },
      { href: 'indexes.html', title: 'Индексы' },
      { href: 'guides/create-index.html', title: 'Гайд: создание индекса' },
      { href: 'guides/vacuum.html', title: 'Гайд: VACUUM' },
      { href: 'programming.html', title: 'Программирование на стороне БД' },
      { href: 'errors.html', title: 'Частые ошибки' },
      { href: 'tooling.html', title: 'Тулинг' }
    ]
  },
  {
    id: 'senior',
    title: 'Senior',
    summary: 'Планировщик и EXPLAIN, миграции без даунтайма, пулинг, репликация, бэкапы, безопасность, RLS.',
    level: 'Прод и эксплуатация',
    estimate: '4+ недель',
    pages: [
      { href: 'scaling.html', title: 'Масштабирование' },
      { href: 'senior.html', title: 'Senior-уровень: производительность и прод' }
    ]
  }
];

// Нормализуем путь страницы относительно корня сайта,
// чтобы сравнение работало и на корневых, и на guides/-страницах.
function normalize(href) {
  return href.replace(/^\.\//, '').replace(/^\//, '');
}

// Возвращает контекст текущей страницы в треке: { track, index, prev, next }
// или null, если страница ни в одном треке не упомянута.
export function findTrackContext(currentPath) {
  const target = normalize(currentPath);
  for (const track of tracks) {
    const idx = track.pages.findIndex(p => normalize(p.href) === target);
    if (idx !== -1) {
      return {
        track,
        index: idx,
        prev: idx > 0 ? track.pages[idx - 1] : null,
        next: idx < track.pages.length - 1 ? track.pages[idx + 1] : null
      };
    }
  }
  return null;
}

// Преобразует относительный href из tracks.js в путь, корректный
// для текущей страницы. Если страница в подкаталоге `guides/`,
// корневые ссылки получают префикс `../`, а guides/-ссылки — обрезаются.
export function resolveHref(href, fromPath) {
  const inGuides = /(^|\/)guides\//.test(fromPath);
  const target = normalize(href);
  if (inGuides) {
    if (target.startsWith('guides/')) return target.slice('guides/'.length);
    return '../' + target;
  }
  return target;
}
