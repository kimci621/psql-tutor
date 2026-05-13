// Учебные треки. Каждый трек — упорядоченный список страниц.
// Используется лендингом (index.html) для отрисовки карточек,
// а также блоком «Дальше / Назад» внизу каждой страницы.
//
// Раньше было три трека (Junior/Middle/Senior). Уровневые ярлыки убраны,
// темы senior-уровня распределены по тематическим разделам. Сейчас два трека —
// «Основы SQL» (язык, схема, чтение данных) и «Прод и эксплуатация» (то, что
// нужно, чтобы запустить и удерживать БД в проде).

export const tracks = [
  {
    id: 'fundamentals',
    title: 'Основы SQL',
    summary: 'Поставить PostgreSQL, разобраться с psql, написать первый CREATE TABLE и SELECT, понять JOIN, агрегации, оконные функции, индексы и транзакции.',
    level: 'Учебный путь',
    estimate: '2–4 недели',
    pages: [
      { href: 'install.html', title: 'Установка PostgreSQL' },
      { href: 'basics.html', title: 'Основы SQL и psql' },
      { href: 'types.html', title: 'Типы данных' },
      { href: 'joins.html', title: 'Соединения (JOIN)' },
      { href: 'aggregates.html', title: 'Агрегации и GROUP BY' },
      { href: 'window.html', title: 'Оконные функции' },
      { href: 'indexes.html', title: 'Индексы' },
      { href: 'transactions.html', title: 'Транзакции и блокировки' },
      { href: 'programming.html', title: 'Программирование на стороне БД' }
    ]
  },
  {
    id: 'operations',
    title: 'Прод и эксплуатация',
    summary: 'EXPLAIN и планировщик, тюнинг, репликация, бэкапы и PITR, миграции без даунтайма, безопасность и доступы, интеграция Postgres с приложением.',
    level: 'Прикладной путь',
    estimate: '4+ недель',
    pages: [
      { href: 'tuning.html', title: 'Конфигурация и тюнинг' },
      { href: 'performance.html', title: 'EXPLAIN и планировщик' },
      { href: 'scaling.html', title: 'Масштабирование и партиции' },
      { href: 'replication.html', title: 'Репликация' },
      { href: 'backups.html', title: 'Бэкапы и восстановление' },
      { href: 'migrations.html', title: 'Миграции без даунтайма' },
      { href: 'copy.html', title: 'COPY и массовая загрузка' },
      { href: 'security.html', title: 'Безопасность и доступы' },
      { href: 'app-integration.html', title: 'Postgres из приложения' },
      { href: 'tooling.html', title: 'Тулинг' }
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
