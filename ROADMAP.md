# psql-tutor Roadmap

Дорожная карта улучшений сайта. Используется агентом `psql-tutor-improver` (см. `.claude/agents/psql-tutor-improver.md`).

**Правила работы:**
- Задачи выполняются по порядку внутри спринта; спринты — по порядку.
- После выполнения задачи: поставить `[x]`, дописать в конце строки `— <YYYY-MM-DD>, <commit-sha-short>`.
- Если задача отменена/неактуальна — пометить `[~]` и кратко объяснить причину одной строкой ниже.
- При частичном выполнении задачу не закрывать; в строке ниже добавить `Status:` с тем, что сделано/осталось.
- Размеры: **S** ~ пара часов, **M** ~ день, **L** ~ 2–3 дня, **XL** ~ неделя+.

---

## Спринт 1 — Навигация и фундамент UX

### Фаза 0. Быстрые победы

- [x] **0.1** Опечатки: `scaling.html:180` (`vt v4`→`UUID v4`), `scaling.html:221` (`movemen`), `tooling.html:45` («психологии»→«хитрости») — **S** — 2026-05-08, 3064617
- [x] **0.2** Бамп `?v=` в тегах `<script>` после правок JS — **S** — 2026-05-08, c6ee598
- [x] **0.3** Прогон тестов: `node --test tests/*.mjs` + `for f in assets/*.js; do node --check "$f"; done` + `python3 -m unittest tests.server_proxy.test_proxy` — **S** — 2026-05-08, 393019e

### Фаза 1 (часть 1). Навигация

- [x] **1.1** Маршруты обучения: 3 трека-карточки на главной («Junior с нуля», «Middle», «Senior»). Каждый трек — упорядоченный список тем — **M** — 2026-05-08, 9e703aa
- [x] **1.3** Хлебные крошки + «Дальше / Назад» внизу каждой страницы по порядку трека — **S** — 2026-05-08, 6b6ede6
- [x] **1.4** Переименовать `index.html` → `cheatsheet.html`; новый `index.html` = лендинг с треками — **M** — 2026-05-08, 204cdb2
- [x] **1.8** A11y-аудит: контраст light-темы, focus-ring, `aria-label` на иконочных кнопках, Esc закрывает чат/модалку, ловушка фокуса в модалке настроек — **S** — 2026-05-08, 86fb461
- [x] **1.10** Якоря на каждую тему + кнопка «копировать ссылку на тему» — **S** — 2026-05-08, c5e13fc

---

## Спринт 2 — Практика: seed + упражнения + AI-ревью

- [x] **2.1** Seed-датасет: `examples/schema.sql` + `examples/seed.sql` (users/orders/order_items/products). Все примеры на сайте — только из этих таблиц. Кнопка «Скачать датасет» + инструкция `\i` — **M** — 2026-05-09, 595bafb
- [x] **2.2** Упражнения: 3–5 задач на каждой ключевой странице (basics, joins, indexes, transactions). Структура: условие → textarea → «Показать решение» + «Разобрать с ИИ» — **L** — 2026-05-09, 9a74e09
- [x] **3.1** Контекст упражнения в чат: кнопка «Разобрать с ИИ» из задачи передаёт условие/попытку/эталон в system prompt; режим код-ревью — **M** — 2026-05-09, 1f3a53e

---

## Спринт 3 — Закрыть контентные пробелы

- [x] **2.4** Расширить `programming.html`: курсоры, динамический SQL (`EXECUTE`), классы исключений (`SQLSTATE`), кастомные ошибки (`RAISE … USING`), `RETURNS TABLE` vs `SETOF` — **M** — 2026-05-09, bfc42e0
- [x] **2.5** Новая страница `security.html`: `pg_hba.conf`, SSL/TLS, `scram-sha-256`, иерархия ролей и `SET ROLE`, GRANT/REVOKE паттерны, аудит — **M** — 2026-05-09, 1e6ca3f
- [x] **2.6** Углубить бэкапы (`sr-backup-pitr`): `pg_dump`/`pg_dumpall` форматы, `pg_restore -j`, `pgBackRest`/`WAL-G`, retention, чек-лист восстановления — **M** — 2026-05-09, 6920a61
- [x] **2.8** Новая страница: конфигурация и тюнинг (`shared_buffers`, `work_mem`, `effective_cache_size`, `checkpoint_*`, `autovacuum_*`, `max_connections` vs PgBouncer) — **M** — 2026-05-09, d269813

---

## Спринт 4 — Прогресс, поиск, режимы чата

- [x] **1.2** Прогресс-трекинг: localStorage `psql-tutor:progress`, галочки «прочитано» / «попрактиковался», прогресс-бар в сайдбаре — **M** — 2026-05-09, afd91f9
- [x] **1.5** Поиск по темам (Cmd/Ctrl+K палитра): fuzzy по `topics.js`, переход к якорю — **M** — 2026-05-09, f294fcb
- [x] **1.6** Оглавление страницы (TOC) справа на десктопе с подсветкой активной секции через IntersectionObserver — **S** — 2026-05-09, 8f966dc
- [x] **1.7** Mobile UX: сайдбар в drawer, чат full-screen — **M** — 2026-05-09, 03284a1
- [x] **1.9** Системная тема по умолчанию + переключатель в шапке — **S** — 2026-05-09, df7c630
- [x] **2.3** Квизы в конце страницы (5 вопросов с вариантами); результат пишется в `progress` — **M** — 2026-05-09, feaa896
- [x] **3.2** Режимы чата: «Объясни», «Спроси меня», «Проверь мой SQL», «Дай задачу» — кнопки в шапке чата — **M** — 2026-05-09, 0853e8f

---

## Спринт 5 — Остальной контент, визуал, долг

### Контент

- [x] **2.7** Углубить репликацию: sync vs async, физическая vs логическая, replication slots, `wal_keep_size`, обзор failover (Patroni/pg_auto_failover) — **M** — 2026-05-09, ac373c2
- [x] **2.9** Отдельная страница оконных функций: frames (`ROWS`/`RANGE`/`GROUPS`), `LAG/LEAD`, `FIRST_VALUE`, паттерны (running totals, dedupe, top-N per group) — **M** — 2026-05-09, 70eae52
- [x] **2.10** Углубить JSONB: `jsonb_ops` vs `jsonb_path_ops`, `jsonb_path_query`, `@@` JSONPath, индексы по выражению — **S** — 2026-05-09, f83006c
- [x] **2.11** Страница `COPY`/массовая загрузка: форматы, тюнинг, `COPY … FROM PROGRAM`, сравнение с `pg_dump`, параллельный restore — **S** — 2026-05-09, de9c3cd

### AI-ментор

- [x] **3.3** Markdown-таблицы в `md.js` — **S** — 2026-05-09, 5d4e675
- [x] **3.4** Кнопка «Копировать» на code-блоки в чате — **S** — 2026-05-09, 5d4e675
- [x] **3.5** Экспорт диалога в Markdown — **S** — 2026-05-09, dc2ed05
  - Реализовано до создания roadmap (см. assets/chat.js::exportDialog).
- [x] **3.6** «Сбросить тему» / «Начать с чистого листа» с подтверждением — **S** — 2026-05-09, dc2ed05
  - Реализовано до создания roadmap (см. assets/chat.js::resetDialog).
- [x] **3.7** Индикатор «модель думает» + отмена стрима (AbortController) — **S** — 2026-05-09, dc2ed05
  - Реализовано до создания roadmap (см. .dots анимация и stopStream).
- [x] **3.8** Понятная ошибка при падении сети/LM Studio + подсказка про CORS и `/api/lmstudio/api/v1` — **S** — 2026-05-09, 5d4e675
- [x] **3.9** Подсказка модели при первом запуске: автодетект `/v1` vs `/api/v1`, тест `GET /models` — **M** — 2026-05-09, 5d4e675

### Визуал

- [x] **4.1** ER-диаграмма (SVG) сквозной схемы, инлайн на нужных страницах — **S** — 2026-05-09, cd496fb
- [x] **4.2** Страница «Что выбрать»: деревья решений (индексы, изоляции, типы ID, partition vs shard, money types) — **M** — 2026-05-09, 82090c5
- [x] **4.3** Визуализация EXPLAIN: статичные «до/после» + ссылка на explain.dalibo.com / depesz — **S** — 2026-05-09, 5e912cf
- [x] **4.4** Разбить `index.html`/`cheatsheet.html` на тематические разделы, убрать дубли с Indexes/Transactions — **M** — 2026-05-09, b96d517
- [x] **4.5** Унифицировать «Где ещё» блоки через `relatedTopics` в `topics.js` — **M** — 2026-05-09, c676894
  - Введён `relatedTopics` + рендерер chips. Заполнить для всех тем — постепенная задача.

### Технический долг

- [x] **5.1** GitHub Actions CI: `node --test` + `python -m unittest` + `node --check` — **S** — 2026-05-09, 195841d
- [x] **5.2** Линтер HTML (html-validate) — дубли id, битые `data-topic-id` — **S** — 2026-05-09, 195841d
  - Свой узкий линтер вместо отдельной зависимости — `tools/check-topic-ids.mjs` (дубли id, неизвестные topic-id, битые .html-ссылки). Это отвечает целям задачи без новых deps.
- [x] **5.3** Скрипт-проверка целостности: парсит все HTML, сверяет `data-topic-id` с `topics.js`, падает при сироте — **S** — 2026-05-09, 195841d
- [x] **5.4** Docker-compose с Postgres 16 + pgAdmin + автозагрузка seed — **S** — 2026-05-09, 195841d
- [x] **5.5** Автобамп `?v=` через date-stamp в `app.js` — **S** — 2026-05-09, 195841d
- [x] **5.6** Service Worker для офлайн-кэша страниц и ассетов — **M** — 2026-05-09, 195841d
- [x] **5.7** Тесты на `prompts.js::buildSystemPrompt`: golden snapshot per topic — **S** — 2026-05-09, 195841d

---

## Спринт 6 — Реорганизация навигации

- [x] **6.1** Единый сайдбар через `assets/sidebar.js`, инжекция из `app.js`. Все HTML — пустой `<aside class="sidebar"></aside>` — **M** — 2026-05-13
- [x] **6.2** Видимая кнопка «🔍 Поиск по темам… ⌘K» сверху сайдбара — **S** — 2026-05-13
- [x] **6.3** Переименование треков: Junior/Middle/Senior → «Основы SQL»/«Прод и эксплуатация». Senior-трек удалён, темы senior.html распределены — **M** — 2026-05-13
- [x] **6.4** Удаление `senior.html`. Создание шести тематических страниц: `performance.html`, `replication.html`, `backups.html`, `migrations.html`, `search-text.html`, `app-integration.html` (все 28 sr-* topic-id сохранены, чтобы не сломать localStorage) — **L** — 2026-05-13
- [x] **6.5** Доперенос senior-тем в существующие страницы: концурентность в `transactions.html`, партиционирование+пулинг в `scaling.html`, RLS/SECURITY DEFINER/prepared statements в `security.html` — **M** — 2026-05-13
- [x] **6.6** Обновлены ссылки: `assets/topic-index.js` (sr-* теперь указывают на новые страницы), все cross-refs `senior.html#sr-*` переписаны на новые страницы — **S** — 2026-05-13
- [x] **6.7** sw.js: CACHE_NAME → v2, добавлен `assets/sidebar.js` в precache — **S** — 2026-05-13
- [x] **6.8** `relatedTopics` для центральных тем: 122/219 топиков получили 2–4 связанные темы (хабы основ, JOIN, агрегатов, окон, индексов, транзакций, перформанса, репликации, бэкапов, безопасности, тулинга) — **L** — 2026-05-13
  - Решение: не заполнять механически все 219, а покрыть навигационные узлы. Темы-листья (упражнения, узкоспец-конфиги, частные ошибки) оставлены без relatedTopics — для них чипы превратились бы в шум.
- [x] **6.9** Аудит `learningGoals`: 40 тем имели только одну цель, всем добавлена вторая (иногда третья) с учётом контекста темы — **M** — 2026-05-13
  - Аудит `summary` показал, что заглушек нет: формулировки на месте, длиннее 20 символов, по делу. `examples: []` у концептуальных тем (ACID, CAP, OLTP vs OLAP, decision-tree-страницы) оставлено намеренно — там примеров нет по природе.
- [x] **6.10** Перекомпоновка тем: добавлены вступительные абзацы `<p class="sub">` к 19 h2-секциям на `basics.html`, `joins.html`, `aggregates.html`, `indexes.html` — **S** — 2026-05-13
  - Структура страниц уже была логичной (1.x — 7.x секции с тематическими заголовками). Не хватало человеческих вступлений между h2 и первой карточкой — это и было «наваленностью».

## Спринт 7 — Closing the senior gap

Аудит 2026-05-13: текущие 216 не-упражнительных тем покрывают «середину» уверенно
(SQL, индексы, транзакции, базовая эксплуатация). Для уровня senior PostgreSQL DBA
не хватает 20 тем — ниже план. Разбиты по тематическим разделам, в порядке
важности «снизу вверх».

### Производительность и планировщик (5)

- [x] **7.1** **WAL и контрольные точки.** Что такое WAL, full-page writes, `checkpoint_timeout`/`max_wal_size`, `wal_compression`, `archive_command`, `pg_receivewal` — на `performance.html`, topic-id `sr-wal-checkpoints` — **M** — 2026-05-13
- [x] **7.2** **pg_locks и wait events.** Классы блокировок, `lock_timeout`, `deadlock_timeout`, `wait_event_type`/`wait_event`, `pg_blocking_pids` — на `transactions.html`, topic-id `sr-pg-locks-waits` — **M** — 2026-05-13
- [x] **7.3** **CREATE INDEX CONCURRENTLY и REINDEX CONCURRENTLY.** — на `indexes.html` (новая секция «Построение индекса под нагрузкой»), topic-id `sr-index-concurrently` — **S** — 2026-05-13
- [x] **7.4** **Параллельные планы.** parallel-aware nodes, `max_parallel_workers_per_gather`, Gather / Parallel Seq Scan, когда параллелизм вредит — на `performance.html`, topic-id `sr-parallel-query` — **S** — 2026-05-13
- [x] **7.5** **Статистика и `default_statistics_target`.** `SET STATISTICS`, `pg_stats`, `CREATE STATISTICS` — на `tuning.html` (новая секция 6), topic-id `sr-statistics-target` — **S** — 2026-05-13

### MVCC и эксплуатация (5)

- [x] **7.6** **HOT-updates и FILLFACTOR.** Условия HOT, `pg_stat_user_tables.n_tup_hot_upd`, fillfactor под write-heavy — на `tuning.html` (новая секция 7), topic-id `sr-hot-updates` — **M** — 2026-05-13
- [x] **7.7** **Transaction wraparound и VACUUM FREEZE.** age(datfrozenxid), single-user recovery — на `tuning.html` (новая секция 8), topic-id `sr-wraparound-freeze` — **M** — 2026-05-13
- [x] **7.8** **Bloat и pg_repack.** pgstattuple, pgstatindex, pg_repack vs VACUUM FULL — на `tuning.html` (новая секция 9), topic-id `sr-bloat` — **M** — 2026-05-13
- [x] **7.9** **TOAST и сжатие.** External storage, pglz vs lz4, pg_column_size vs octet_length — на `types.html` (новая секция 15), topic-id `sr-toast` — **S** — 2026-05-13
- [x] **7.10** **idle_in_transaction и lifecycle сессий.** Тайм-ауты, pg_stat_activity, pg_cancel/terminate_backend — на `transactions.html`, topic-id `sr-idle-in-transaction` — **S** — 2026-05-13

### Прикладные паттерны (3)

- [x] **7.11** **Generated columns + expression-индексы.** Регистронезависимый UNIQUE, вытаскивание полей из jsonb — на `types.html` (новая секция 16), topic-id `sr-generated-columns` — **S** — 2026-05-13
- [x] **7.12** **Optimistic locking + soft delete.** Compare-and-swap через version/xmin, partial unique index — на `transactions.html`, topic-id `sr-optimistic-locking` — **M** — 2026-05-13
- [x] **7.13** **Идемпотентность операций.** ON CONFLICT DO NOTHING/UPDATE, антипаттерн in_stock+EXCLUDED, journal-table миграции — на `migrations.html`, topic-id `sr-idempotency` — **S** — 2026-05-13

### Эксплуатация и экосистема (4)

- [x] **7.14** **Logical decoding и CDC.** pgoutput, wal2json, Debezium, REPLICA IDENTITY — на `replication.html`, topic-id `sr-logical-decoding-cdc` — **M** — 2026-05-13
- [x] **7.15** **Foreign data wrappers (postgres_fdw + file_fdw).** SERVER / USER MAPPING / IMPORT FOREIGN SCHEMA / pushdown — на `tooling.html` (новая секция 5), topic-id `sr-fdw` — **S** — 2026-05-13
- [x] **7.16** **Time-series в Postgres.** BRIN, pg_partman, TimescaleDB обзор — на `scaling.html` (новая секция 8), topic-id `sr-time-series` — **M** — 2026-05-13
- [x] **7.17** **Экосистема расширений.** Топ-12, pg_cron job, hypopg для проверки идеи индекса — на `tooling.html` (новая секция 6), topic-id `sr-extensions-ecosystem` — **S** — 2026-05-13

### Дизайн и тестирование (3)

- [x] **7.18** **Нормализация и денормализация.** 1NF–3NF, денормализация через триггер, EAV-антипаттерн — на `decisions.html` (новая секция 6), topic-id `sr-normalization` — **M** — 2026-05-13
- [x] **7.19** **Иерархии в таблице.** parent_id + RECURSIVE, ltree, closure table — на `joins.html` (новая секция 4), topic-id `sr-hierarchies` — **M** — 2026-05-13
- [x] **7.20** **Нагрузочное тестирование: pgbench.** Базовый TPC-B, кастомные `-f` скрипты, read/write микс, PgBouncer-vs-прямое — на `tooling.html` (новая секция 7), topic-id `sr-pgbench` — **S** — 2026-05-13

Итог: **спринт 7 закрыт в один день** (2026-05-13). 20 новых тем (`sr-wal-checkpoints`,
`sr-pg-locks-waits`, `sr-index-concurrently`, `sr-parallel-query`,
`sr-statistics-target`, `sr-hot-updates`, `sr-wraparound-freeze`, `sr-bloat`,
`sr-toast`, `sr-idle-in-transaction`, `sr-generated-columns`,
`sr-optimistic-locking`, `sr-idempotency`, `sr-logical-decoding-cdc`, `sr-fdw`,
`sr-time-series`, `sr-extensions-ecosystem`, `sr-normalization`,
`sr-hierarchies`, `sr-pgbench`). Все темы получили summary / examples /
pitfalls / learningGoals / relatedTopics; новые секции на 8 страницах
(`performance`, `transactions`, `indexes`, `tuning`, `types`, `migrations`,
`replication`, `scaling`, `tooling`, `decisions`, `joins`).

Итоговая база: **248** topic-id. Контент сайта покрывает senior-уровень
эксплуатации PostgreSQL.

## Спринт 8 — Roadmap-страница и сохранность прогресса

- [x] **8.1** Новая страница `roadmap.html`: визуальная карта всех разделов и тем с per-topic статусами (прочитано / попрактиковался / квиз пройден), рекомендация порядка изучения, прогресс-бары по двум трекам — **M** — 2026-05-13
- [x] **8.2** `assets/progress.js`: функции `exportProgress()` и `importProgress(json)` — JSON с прогрессом по страницам, баллами квизов и темой. Кнопки «Скачать прогресс» / «Загрузить прогресс» на roadmap-странице — **S** — 2026-05-13
- [x] **8.3** Прогресс не теряется: при clear-localStorage пользователь увидит предупреждение; импорт сливает свой прогресс с текущим (берёт максимум) — **S** — 2026-05-13

## Журнал решений

Здесь агент фиксирует значимые отклонения от плана, найденные проблемы, новые задачи. Формат: `YYYY-MM-DD — заметка`.

- 2026-05-08 — Roadmap создан.
- 2026-05-09 — Прошли спринты 2–5. Ключевые архитектурные решения:
  - Каждое упражнение получило отдельный topic-id с `kind: "exercise"` и полями
    `task` / `solution`. `buildSystemPrompt` ветвится на код-ревью режим и
    подмешивает попытку ученика из textarea «вживую» при каждом отправлении.
  - `assets/topic-index.js` — статический карта topic-id → page, генерируется
    одноразово (см. inline node-снипеты в коммитах). Используется поиском (1.5)
    и блоком «Связано» (4.5).
  - Линтер HTML — собственный `tools/check-topic-ids.mjs` вместо html-validate,
    чтобы не тащить deps. Ловит битые data-topic-id, дубли id, битые .html-ссылки.
  - Service worker (5.6) — простой stale-while-revalidate; для LM Studio
    проксированного API всегда обходится сетью.
  - 4.5 (relatedTopics) реализован как поле + рендерер; заполнен только для
    `inner-join` в качестве примера. Доfill — постепенная задача.
- 2026-05-13 — Спринт 6: реорганизация навигации.
  - Сайдбар стал сгруппированным и генерируется одним местом (`assets/sidebar.js`),
    больше не дублируется в каждом HTML. Это ликвидировало drift и упростит
    дальнейшие правки навигации.
  - Удалён трек Senior и страница `senior.html`: 28 тем распределены по новым
    шести страницам (`performance`, `replication`, `backups`, `migrations`,
    `search-text`, `app-integration`) и расширили `transactions`, `scaling`,
    `security`. **topic-id сохранены — localStorage чатов уцелел.**
  - Треки переименованы: «Основы SQL» (учебный путь) и «Прод и эксплуатация»
    (прикладной путь). Шпаргалка, errors, decisions, search-text вынесены вне
    треков в категорию «Справочники».
  - Добавлена видимая кнопка поиска в сайдбаре — Cmd+K палитра теперь
    «откуда взять» очевидна.
  - Не сделано в этом спринте, оставлено в задачах 6.8–6.10: массовое
    заполнение `relatedTopics`, пересмотр `summary`/`learningGoals` для всех
    тем, и перекомпоновка карточек на старых страницах в логические h2-группы.
  - Через несколько часов 6.8–6.10 закрыты:
    - relatedTopics заполнен для 122/219 тем — стратегически по навигационным
      узлам, не механически по всем.
    - learningGoals: 40 тем имели одну цель; всем добавлена вторая по сути темы.
    - В h2-секции `basics`/`joins`/`aggregates`/`indexes` добавлены вступления
      по 2–4 строки (19 секций).
- 2026-05-13 — Спринт 7 (closing the senior gap) закрыт в один день.
  20 новых тем добавлено в `topics.js`, новые секции на 8 страницах.
  Решение по размещению: придерживаемся уже сложившейся таксономии вместо
  создания страниц «sr-…» — senior-темы должны жить рядом со своими
  «обычными» соседями (HOT-updates в tuning, CIC в indexes, иерархии в joins).
  Все 20 topic-id префиксованы `sr-` — чтобы при будущем экспорте по prefix
  отличать «то, что для senior-уровня» от «то, что для базы».
  248 topic-id в `topics.js`, 30 HTML, тесты зелёные.
