// Метаданные всех тем. Используются ИИ-ментором как контекст диалога.
// data-topic-id у кнопки "Поучиться с ИИ" должен совпадать с ключом ниже.

export const topics = {
  // 1. Подключение и сессия
  "psql-connect": {
    title: "Подключение через psql",
    summary: "Как подключиться к серверу PostgreSQL утилитой psql, выбрать БД и пользователя.",
    examples: [
      "psql -h localhost -p 5432 -U postgres -d mydb",
      "\\c another_db",
      "SHOW server_version;"
    ],
    pitfalls: [
      "Пароль может запрашиваться интерактивно или браться из ~/.pgpass",
      "Параметр -d можно не указывать — по умолчанию используется БД с именем пользователя",
      "Команды на бэкслеше (\\c, \\dt) — это мета-команды psql, не SQL"
    ],
    learningGoals: [
      "понимать роли параметров -h -p -U -d",
      "уметь переключаться между БД внутри сессии"
    ]
  },
  "session-info": {
    title: "Информация о сессии",
    summary: "Версия сервера, текущий пользователь, БД и search_path.",
    examples: [
      "SELECT version();",
      "SELECT current_user, current_database();",
      "SHOW search_path;"
    ],
    pitfalls: [
      "current_user и session_user могут отличаться при SET ROLE",
      "search_path определяет, в какой схеме искать неквалифицированные имена"
    ],
    learningGoals: [
      "видеть, в каком окружении выполняется запрос",
      "понимать роль search_path"
    ]
  },

  // 2. Базы данных
  "create-database": {
    title: "Создание базы данных",
    summary: "CREATE DATABASE с указанием владельца, кодировки и шаблона.",
    examples: [
      "CREATE DATABASE shop;",
      "CREATE DATABASE shop OWNER app_user ENCODING 'UTF8' TEMPLATE template0;"
    ],
    pitfalls: [
      "Нельзя создать БД внутри транзакции",
      "TEMPLATE template1 копирует объекты — иногда это сюрприз",
      "Кодировку нельзя сменить позже без пересоздания БД"
    ],
    learningGoals: [
      "понимать роль шаблонов и кодировки",
      "знать, какие настройки задаются только при создании"
    ]
  },
  "drop-database": {
    title: "Удаление базы данных",
    summary: "DROP DATABASE и завершение активных подключений.",
    examples: [
      "DROP DATABASE IF EXISTS shop;",
      "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'shop' AND pid <> pg_backend_pid();"
    ],
    pitfalls: [
      "Не получится удалить БД, если есть подключения — их нужно сначала закрыть",
      "Нельзя удалить БД, к которой ты сам подключён",
      "WITH (FORCE) (PG 13+) принудительно отключает клиентов"
    ],
    learningGoals: [
      "уметь корректно освободить БД от подключений",
      "понимать необратимость операции"
    ]
  },
  "list-databases": {
    title: "Список баз и их размер",
    summary: "psql-команда \\l и запросы к pg_database.",
    examples: [
      "\\l",
      "SELECT datname, pg_size_pretty(pg_database_size(datname)) FROM pg_database ORDER BY pg_database_size(datname) DESC;"
    ],
    pitfalls: [
      "pg_database_size не учитывает табличные пространства за пределами БД",
      "template0 нельзя соединиться, но размер у неё всё равно есть"
    ],
    learningGoals: [
      "получать данные о БД через системный каталог",
      "видеть, какие БД занимают больше всего места"
    ]
  },

  // 3. Схемы
  "create-schema": {
    title: "Создание схемы",
    summary: "Схемы — пространства имён внутри БД для группировки объектов.",
    examples: [
      "CREATE SCHEMA reporting;",
      "CREATE SCHEMA IF NOT EXISTS reporting AUTHORIZATION analyst;",
      "SET search_path = reporting, public;"
    ],
    pitfalls: [
      "По умолчанию объекты создаются в схеме из search_path",
      "Имена схем чувствительны к регистру при кавычках"
    ],
    learningGoals: [
      "понимать, зачем нужны схемы",
      "уметь управлять search_path"
    ]
  },
  "list-schemas": {
    title: "Список схем",
    summary: "Команда \\dn и запрос к information_schema.schemata.",
    examples: [
      "\\dn",
      "SELECT schema_name FROM information_schema.schemata ORDER BY schema_name;"
    ],
    pitfalls: [
      "Системные схемы pg_catalog и information_schema есть всегда",
      "pg_temp_* — временные схемы сессий"
    ],
    learningGoals: [
      "видеть пользовательские схемы",
      "отличать системные от пользовательских"
    ]
  },

  // 4. Таблицы (DDL)
  "create-table-basic": {
    title: "Базовое CREATE TABLE",
    summary: "Создание таблицы с типами, ограничениями и значением по умолчанию.",
    examples: [
      "CREATE TABLE users (\n  id        bigserial PRIMARY KEY,\n  email     text UNIQUE NOT NULL,\n  is_active boolean NOT NULL DEFAULT true,\n  created_at timestamptz NOT NULL DEFAULT now()\n);"
    ],
    pitfalls: [
      "bigserial — устаревший способ; с PG 10+ предпочтительнее GENERATED ALWAYS AS IDENTITY",
      "timestamptz vs timestamp: первый учитывает часовой пояс",
      "DEFAULT now() вычисляется на момент INSERT, а не CREATE"
    ],
    learningGoals: [
      "уметь подобрать типы под бизнес-данные",
      "знать разницу между serial и identity"
    ]
  },
  "alter-table": {
    title: "ALTER TABLE — изменение структуры",
    summary: "Добавление, удаление и переименование столбцов и ограничений.",
    examples: [
      "ALTER TABLE users ADD COLUMN last_login timestamptz;",
      "ALTER TABLE users DROP COLUMN last_login;",
      "ALTER TABLE users RENAME COLUMN email TO email_address;",
      "ALTER TABLE users ALTER COLUMN is_active SET DEFAULT false;"
    ],
    pitfalls: [
      "ADD COLUMN ... NOT NULL DEFAULT — на старых версиях переписывал всю таблицу; с PG 11+ оптимизировано",
      "DROP COLUMN не освобождает место сразу — нужно VACUUM FULL",
      "Многие ALTER берут ACCESS EXCLUSIVE — блокирует чтения"
    ],
    learningGoals: [
      "оценивать стоимость изменения схемы на боевой БД",
      "понимать, какие операции переписывают таблицу"
    ]
  },
  "drop-truncate": {
    title: "DROP и TRUNCATE",
    summary: "Удаление таблицы целиком vs быстрая очистка.",
    examples: [
      "DROP TABLE IF EXISTS users CASCADE;",
      "TRUNCATE users RESTART IDENTITY CASCADE;"
    ],
    pitfalls: [
      "TRUNCATE минует триггеры ON DELETE",
      "RESTART IDENTITY сбрасывает связанные последовательности",
      "CASCADE автоматически тянет связанные таблицы — будь аккуратен"
    ],
    learningGoals: [
      "выбирать между DELETE, TRUNCATE и DROP",
      "оценивать каскадные эффекты"
    ]
  },

  // 5. Типы данных
  "data-types": {
    title: "Базовые типы данных",
    summary: "Числовые, текстовые, временные, логические, uuid, jsonb, массивы.",
    examples: [
      "CREATE TABLE t (\n  i  integer,\n  bi bigint,\n  n  numeric(12,2),\n  s  text,\n  v  varchar(255),\n  ts timestamptz,\n  u  uuid,\n  j  jsonb,\n  arr int[]\n);"
    ],
    pitfalls: [
      "numeric точен, но медленнее float",
      "Длина в varchar(n) — ограничение, а не оптимизация хранения; чаще достаточно text",
      "timestamp без tz уязвим к смене таймзоны клиента",
      "uuid требует расширения для генерации (gen_random_uuid из pgcrypto/PG13+)"
    ],
    learningGoals: [
      "выбирать тип под задачу",
      "избегать частых ошибок с float и timestamp"
    ]
  },

  // 6. Ограничения
  "constraints": {
    title: "Ограничения целостности",
    summary: "PRIMARY KEY, UNIQUE, FOREIGN KEY, CHECK, NOT NULL, DEFAULT.",
    examples: [
      "CREATE TABLE orders (\n  id         bigserial PRIMARY KEY,\n  user_id    bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,\n  total      numeric(12,2) NOT NULL CHECK (total >= 0),\n  status     text NOT NULL DEFAULT 'new',\n  created_at timestamptz NOT NULL DEFAULT now(),\n  UNIQUE (user_id, created_at)\n);"
    ],
    pitfalls: [
      "FK по умолчанию NOT DEFERRABLE — проверяется сразу",
      "UNIQUE с NULL: несколько NULL допустимы (стандарт SQL)",
      "CHECK не видит соседних строк — для этого нужны триггеры или EXCLUDE"
    ],
    learningGoals: [
      "проектировать схему с гарантиями целостности",
      "понимать поведение NULL в UNIQUE"
    ]
  },

  // 7. CRUD
  "insert-basics": {
    title: "INSERT — добавление строк",
    summary: "Вставка одной и нескольких строк, RETURNING.",
    examples: [
      "INSERT INTO users (email) VALUES ('a@example.com');",
      "INSERT INTO users (email) VALUES ('a@example.com'), ('b@example.com') RETURNING id, email;"
    ],
    pitfalls: [
      "Если столбец опущен, берётся DEFAULT или NULL",
      "RETURNING полезен, чтобы получить сгенерированный id"
    ],
    learningGoals: [
      "вставлять с DEFAULT и без",
      "использовать RETURNING вместо повторного SELECT"
    ]
  },
  "upsert": {
    title: "UPSERT через ON CONFLICT",
    summary: "INSERT ... ON CONFLICT DO UPDATE / DO NOTHING.",
    examples: [
      "INSERT INTO users (email) VALUES ('a@example.com')\nON CONFLICT (email) DO NOTHING;",
      "INSERT INTO counters (key, n) VALUES ('hits', 1)\nON CONFLICT (key) DO UPDATE SET n = counters.n + EXCLUDED.n\nRETURNING n;"
    ],
    pitfalls: [
      "Конфликт ловится только по UNIQUE/PK или EXCLUSION constraint",
      "EXCLUDED — синтетическая таблица со значениями, которые пытались вставить",
      "DO UPDATE может не сработать, если триггеры BEFORE INSERT меняют ключевое поле"
    ],
    learningGoals: [
      "понимать смысл EXCLUDED",
      "выбирать DO UPDATE vs DO NOTHING"
    ]
  },
  "update-delete": {
    title: "UPDATE и DELETE",
    summary: "Изменение и удаление с условиями, FROM/USING, RETURNING.",
    examples: [
      "UPDATE users SET is_active = false WHERE last_login < now() - interval '1 year';",
      "UPDATE orders o SET status = 'paid' FROM payments p WHERE p.order_id = o.id AND p.success;",
      "DELETE FROM sessions WHERE expires_at < now() RETURNING id;"
    ],
    pitfalls: [
      "UPDATE/DELETE без WHERE затронет все строки",
      "FROM в UPDATE и USING в DELETE позволяют присоединять другие таблицы",
      "Для крупных удалений — DELETE батчами, чтобы не пухло WAL"
    ],
    learningGoals: [
      "пользоваться FROM/USING для условий из других таблиц",
      "избегать массовых блокировок"
    ]
  },

  // 8. Выборка
  "select-basics": {
    title: "SELECT — основа выборки",
    summary: "Столбцы, WHERE, ORDER BY, LIMIT, DISTINCT, алиасы.",
    examples: [
      "SELECT id, email FROM users WHERE is_active ORDER BY created_at DESC LIMIT 10;",
      "SELECT DISTINCT country FROM customers ORDER BY country;",
      "SELECT u.id AS user_id, u.email FROM users u WHERE u.email ILIKE '%@example.com';"
    ],
    pitfalls: [
      "ORDER BY без LIMIT может быть дорогим",
      "DISTINCT не бесплатен — обычно требует sort/hash",
      "ILIKE удобен, но не использует обычный B-tree индекс"
    ],
    learningGoals: [
      "знать порядок логического выполнения SELECT",
      "уметь читать план"
    ]
  },
  "filtering": {
    title: "Фильтрация: WHERE, IN, BETWEEN, LIKE",
    summary: "WHERE с операторами =, <>, IN, BETWEEN, LIKE — и невидимая ловушка с NULL, который не равен ни одному значению, даже самому себе.",
    examples: [
      "SELECT * FROM products WHERE price BETWEEN 100 AND 500;",
      "SELECT * FROM orders WHERE status IN ('new','paid');",
      "SELECT * FROM users WHERE email LIKE '%@example.com';",
      "SELECT * FROM users WHERE deleted_at IS NULL;"
    ],
    pitfalls: [
      "NULL = NULL → NULL, а не TRUE. Нужно IS NULL/IS NOT NULL",
      "LIKE '%foo' не использует обычный B-tree (нужен trigram-индекс)",
      "BETWEEN включает обе границы"
    ],
    learningGoals: [
      "корректно сравнивать с NULL",
      "выбирать оператор под задачу"
    ]
  },
  "limit-offset": {
    title: "Пагинация: LIMIT, OFFSET, keyset",
    summary: "Постраничная выборка и ловушки OFFSET на больших таблицах.",
    examples: [
      "SELECT * FROM posts ORDER BY created_at DESC LIMIT 20 OFFSET 100;",
      "SELECT * FROM posts WHERE created_at < $1 ORDER BY created_at DESC LIMIT 20;"
    ],
    pitfalls: [
      "OFFSET 100000 заставит пройти первые 100000 строк",
      "Keyset-пагинация (WHERE id < last_seen) гораздо эффективнее на больших таблицах"
    ],
    learningGoals: [
      "сравнивать OFFSET и keyset",
      "выбирать стратегию по размеру выборки"
    ]
  },

  // 9. Соединения
  "joins": {
    title: "JOIN: INNER, LEFT, RIGHT, FULL, CROSS",
    summary: "Соединения таблиц и разница их семантик.",
    examples: [
      "SELECT u.email, o.id FROM users u INNER JOIN orders o ON o.user_id = u.id;",
      "SELECT u.email, o.id FROM users u LEFT JOIN orders o ON o.user_id = u.id;",
      "SELECT a.x, b.y FROM a CROSS JOIN b;",
      "SELECT u.email, o.id FROM users u JOIN orders o USING (id);"
    ],
    pitfalls: [
      "После LEFT JOIN условие на «правой» таблице в WHERE превращает его в INNER",
      "USING требует одинакового имени столбца в обеих таблицах",
      "CROSS JOIN даёт декартово произведение — на больших таблицах опасно"
    ],
    learningGoals: [
      "интуитивно понимать разницу INNER/LEFT",
      "не превращать LEFT в INNER случайно"
    ]
  },
  "lateral-join": {
    title: "LATERAL JOIN",
    summary: "Подзапрос в JOIN, видящий столбцы предыдущих таблиц.",
    examples: [
      "SELECT u.id, latest.created_at\nFROM users u\nLEFT JOIN LATERAL (\n  SELECT created_at FROM orders o\n  WHERE o.user_id = u.id\n  ORDER BY created_at DESC LIMIT 1\n) latest ON true;"
    ],
    pitfalls: [
      "Без LATERAL подзапрос не видит u.id",
      "ON true — частая идиома при использовании LATERAL"
    ],
    learningGoals: [
      "решать «top-N per group»",
      "понимать, когда нужен LATERAL"
    ]
  },

  // 10. Агрегации
  "group-by": {
    title: "GROUP BY и агрегаты",
    summary: "count, sum, avg, min, max, FILTER, HAVING.",
    examples: [
      "SELECT user_id, count(*) AS orders_total, sum(total) AS revenue\nFROM orders\nGROUP BY user_id\nHAVING count(*) > 5\nORDER BY revenue DESC;",
      "SELECT user_id,\n  count(*) FILTER (WHERE status = 'paid') AS paid_count,\n  count(*) AS all_count\nFROM orders\nGROUP BY user_id;"
    ],
    pitfalls: [
      "Все неагрегированные столбцы должны быть в GROUP BY",
      "WHERE фильтрует строки до агрегации, HAVING — после",
      "count(*) и count(col) различаются по NULL"
    ],
    learningGoals: [
      "понимать порядок WHERE → GROUP BY → HAVING",
      "пользоваться FILTER вместо CASE WHEN"
    ],
    relatedTopics: ["having", "grouping-sets", "win-intro"]
  },

  // 11. CTE
  "cte": {
    title: "CTE: WITH",
    summary: "Именованные подзапросы для читаемости и переиспользования.",
    examples: [
      "WITH active AS (\n  SELECT id, email FROM users WHERE is_active\n)\nSELECT a.email, count(o.id)\nFROM active a\nLEFT JOIN orders o ON o.user_id = a.id\nGROUP BY a.email;"
    ],
    pitfalls: [
      "До PG 12 CTE были оптимизационным барьером",
      "С PG 12+ planner может встраивать неизменяемые CTE; чтобы запретить — MATERIALIZED",
      "Модифицирующие CTE (INSERT/UPDATE/DELETE с RETURNING) — мощно, но запутанно"
    ],
    learningGoals: [
      "повышать читаемость многошаговых запросов",
      "понимать MATERIALIZED / NOT MATERIALIZED"
    ]
  },
  "recursive-cte": {
    title: "Рекурсивные CTE",
    summary: "WITH RECURSIVE — единственный способ написать в SQL обход иерархии или графа: дерево комментариев, цепочка менеджеров, связи между деталями.",
    examples: [
      "WITH RECURSIVE tree AS (\n  SELECT id, parent_id, 1 AS depth FROM categories WHERE parent_id IS NULL\n  UNION ALL\n  SELECT c.id, c.parent_id, t.depth + 1\n  FROM categories c JOIN tree t ON c.parent_id = t.id\n)\nSELECT * FROM tree;"
    ],
    pitfalls: [
      "Без условия выхода рекурсия может зациклиться при петлях в данных",
      "UNION (вместо UNION ALL) автоматически отсеивает повторы, но дороже"
    ],
    learningGoals: [
      "обходить деревья и графы",
      "защищаться от циклов"
    ]
  },

  // 12. Window
  "windows": {
    title: "Оконные функции",
    summary: "OVER, PARTITION BY, ORDER BY, ROW_NUMBER, RANK, LAG/LEAD.",
    examples: [
      "SELECT user_id, id, created_at,\n  row_number() OVER (PARTITION BY user_id ORDER BY created_at DESC) AS rn\nFROM orders;",
      "SELECT id, total,\n  total - lag(total) OVER (ORDER BY id) AS diff\nFROM orders;"
    ],
    pitfalls: [
      "Окно не уменьшает количество строк — это не GROUP BY",
      "ROW_NUMBER уникален в окне; RANK даёт «дырки» при равенстве",
      "Без ORDER BY в окне порядок строк не определён"
    ],
    learningGoals: [
      "находить «N последних на пользователя»",
      "понимать разницу row_number/rank/dense_rank"
    ]
  },

  // 13. Индексы
  "create-index-btree": {
    title: "CREATE INDEX (B-tree)",
    summary: "Базовый индекс по столбцу или выражению.",
    examples: [
      "CREATE INDEX idx_orders_user_created ON orders (user_id, created_at DESC);",
      "CREATE INDEX idx_users_email_lower ON users (lower(email));",
      "CREATE INDEX CONCURRENTLY idx_orders_status ON orders (status);"
    ],
    pitfalls: [
      "Порядок столбцов в составном индексе важен (leftmost prefix)",
      "Индекс по выражению требует тех же выражений в WHERE",
      "CONCURRENTLY медленнее, но не блокирует запись"
    ],
    learningGoals: [
      "проектировать составные индексы",
      "понимать, когда индекс не помогает"
    ],
    relatedTopics: ["gin-index", "index-types", "composite-index"]
  },
  "partial-index": {
    title: "Частичный индекс",
    summary: "Индекс, покрывающий только часть строк.",
    examples: [
      "CREATE INDEX idx_orders_active ON orders (user_id) WHERE status <> 'cancelled';"
    ],
    pitfalls: [
      "Запрос должен содержать тот же предикат, чтобы планировщик использовал индекс",
      "Хорош для редких подмножеств — экономит место"
    ],
    learningGoals: [
      "сужать индекс под частые запросы",
      "снижать стоимость поддержки индекса"
    ],
    relatedTopics: ["expression-index", "selectivity"]
  },
  "gin-index": {
    title: "GIN-индексы для jsonb и массивов",
    summary: "GIN — индекс для значений, состоящих из элементов: массивы, jsonb, полнотекст, триграммы. Когда B-tree бессилен «искать внутри», работает GIN.",
    examples: [
      "CREATE INDEX idx_docs_data ON docs USING gin (data);",
      "CREATE INDEX idx_docs_tags ON docs USING gin (tags);"
    ],
    pitfalls: [
      "GIN дороже B-tree при записи",
      "Для jsonb с jsonb_path_ops индекс компактнее, но поддерживает не все операторы"
    ],
    learningGoals: [
      "выбирать тип индекса под структуру данных",
      "понимать стоимость GIN на запись"
    ],
    relatedTopics: ["sr-fulltext", "sr-pg-trgm", "jsonb"]
  },

  // 14. Транзакции
  "transactions": {
    title: "Транзакции и уровни изоляции",
    summary: "BEGIN/COMMIT/ROLLBACK, READ COMMITTED, REPEATABLE READ, SERIALIZABLE.",
    examples: [
      "BEGIN;\nUPDATE accounts SET balance = balance - 100 WHERE id = 1;\nUPDATE accounts SET balance = balance + 100 WHERE id = 2;\nCOMMIT;",
      "BEGIN ISOLATION LEVEL SERIALIZABLE;\n-- ... запросы ...\nCOMMIT;"
    ],
    pitfalls: [
      "Уровень по умолчанию — READ COMMITTED",
      "В SERIALIZABLE возможна ошибка serialization_failure — нужно повторить транзакцию",
      "DDL внутри транзакции в Postgres работает (в отличие от некоторых других СУБД)"
    ],
    learningGoals: [
      "выбирать уровень изоляции под задачу",
      "обрабатывать retry-логику"
    ],
    relatedTopics: ["acid", "iso-summary", "savepoints"]
  },
  "locks": {
    title: "Блокировки строк",
    summary: "SELECT ... FOR UPDATE / SHARE / SKIP LOCKED.",
    examples: [
      "BEGIN;\nSELECT * FROM jobs WHERE status = 'pending' ORDER BY id LIMIT 1 FOR UPDATE SKIP LOCKED;\n-- обработка\nUPDATE jobs SET status = 'done' WHERE id = $1;\nCOMMIT;"
    ],
    pitfalls: [
      "FOR UPDATE без транзакции бесполезен — блок снимется сразу",
      "SKIP LOCKED — рабочий шаблон очереди задач",
      "Долгие транзакции с блокировками тормозят всю систему"
    ],
    learningGoals: [
      "реализовать простую очередь",
      "избегать deadlocks"
    ],
    relatedTopics: ["sr-advisory-locks", "sr-mvcc-snapshot"]
  },

  // 15. Представления
  "view": {
    title: "Представления (VIEW)",
    summary: "Сохранённый запрос в виде «виртуальной» таблицы.",
    examples: [
      "CREATE OR REPLACE VIEW active_users AS\nSELECT id, email FROM users WHERE is_active;"
    ],
    pitfalls: [
      "Представление выполняется заново при каждом обращении",
      "Обновляемое представление — только если оно простое (один источник, без агрегатов)"
    ],
    learningGoals: [
      "инкапсулировать сложную логику",
      "понимать стоимость VIEW"
    ]
  },
  "materialized-view": {
    title: "Материализованные представления",
    summary: "MATERIALIZED VIEW — кешированный результат тяжёлого SELECT, материализованный в таблицу. Обновляется по команде REFRESH, не автоматически.",
    examples: [
      "CREATE MATERIALIZED VIEW daily_stats AS\nSELECT date_trunc('day', created_at) AS d, count(*)\nFROM orders GROUP BY 1;",
      "REFRESH MATERIALIZED VIEW CONCURRENTLY daily_stats;"
    ],
    pitfalls: [
      "REFRESH без CONCURRENTLY эксклюзивно блокирует чтения",
      "CONCURRENTLY требует UNIQUE-индекса на представлении",
      "Данные не обновляются автоматически — только по REFRESH"
    ],
    learningGoals: [
      "ускорять тяжёлые отчёты",
      "проектировать стратегию refresh"
    ]
  },

  // 16. Роли и права
  "create-role": {
    title: "Создание ролей и пользователей",
    summary: "CREATE ROLE с разными атрибутами (LOGIN, SUPERUSER, PASSWORD).",
    examples: [
      "CREATE ROLE app_user LOGIN PASSWORD 'secret';",
      "CREATE ROLE readonly NOLOGIN;",
      "GRANT readonly TO app_user;"
    ],
    pitfalls: [
      "В Postgres user — это синоним role с LOGIN",
      "Роль без LOGIN используется как «группа»",
      "Никогда не давай SUPERUSER приложению"
    ],
    learningGoals: [
      "разделять «человеческие» и сервисные роли",
      "строить иерархию ролей"
    ]
  },
  "grants": {
    title: "GRANT и REVOKE",
    summary: "Управление правами на схемы, таблицы и столбцы.",
    examples: [
      "GRANT USAGE ON SCHEMA public TO readonly;",
      "GRANT SELECT ON ALL TABLES IN SCHEMA public TO readonly;",
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO readonly;",
      "REVOKE ALL ON TABLE secrets FROM PUBLIC;"
    ],
    pitfalls: [
      "Права на ALL TABLES применяются к существующим — для новых нужен ALTER DEFAULT PRIVILEGES",
      "PUBLIC — это все роли; иногда там стоят лишние права",
      "Без USAGE на схему права на таблицу не работают"
    ],
    learningGoals: [
      "выдавать минимум необходимых прав",
      "автоматизировать права для будущих таблиц"
    ]
  },

  // 17. Обслуживание
  "vacuum-basic": {
    title: "VACUUM и autovacuum",
    summary: "Уборка мёртвых версий строк, обновление статистики.",
    examples: [
      "VACUUM;",
      "VACUUM (VERBOSE, ANALYZE) orders;",
      "VACUUM FULL orders;"
    ],
    pitfalls: [
      "VACUUM FULL переписывает таблицу и берёт ACCESS EXCLUSIVE",
      "Обычный VACUUM не возвращает место ОС — только освобождает внутри файла",
      "Autovacuum по умолчанию включён, но иногда не успевает на горячих таблицах"
    ],
    learningGoals: [
      "понимать, зачем нужна уборка в MVCC",
      "выбирать VACUUM vs VACUUM FULL"
    ]
  },
  "analyze": {
    title: "ANALYZE — статистика для планировщика",
    summary: "Сбор распределений для оптимизатора запросов.",
    examples: [
      "ANALYZE users;",
      "ANALYZE VERBOSE;"
    ],
    pitfalls: [
      "После большой загрузки данных ANALYZE обязателен",
      "default_statistics_target управляет точностью"
    ],
    learningGoals: [
      "связывать качество плана и свежесть статистики",
      "запускать ANALYZE после миграций"
    ]
  },
  "reindex": {
    title: "REINDEX",
    summary: "Перестроение индекса при разрастании или повреждении.",
    examples: [
      "REINDEX INDEX CONCURRENTLY idx_orders_user_created;",
      "REINDEX TABLE CONCURRENTLY orders;"
    ],
    pitfalls: [
      "REINDEX без CONCURRENTLY блокирует таблицу",
      "На горячей системе всегда CONCURRENTLY (PG 12+)"
    ],
    learningGoals: [
      "восстанавливать раздутые индексы без даунтайма",
      "оценивать необходимость REINDEX"
    ]
  },

  // 18. EXPLAIN
  "explain": {
    title: "EXPLAIN и EXPLAIN ANALYZE",
    summary: "EXPLAIN — окно в работу планировщика. Показывает, в каком порядке Postgres хочет читать таблицы, использовать ли индекс и сколько строк ожидает.",
    examples: [
      "EXPLAIN SELECT * FROM orders WHERE user_id = 1;",
      "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id = 1;"
    ],
    pitfalls: [
      "EXPLAIN ANALYZE реально выполняет запрос — будь осторожен с UPDATE/DELETE (используй ROLLBACK)",
      "Узлы Seq Scan — не всегда плохо",
      "Высокий estimate, но низкое actual rows = устаревшая статистика"
    ],
    learningGoals: [
      "читать узлы плана",
      "находить ключевые узкие места"
    ],
    relatedTopics: ["sr-explain-deep", "explain-before-after"]
  },

  // 19. JSON / JSONB
  "jsonb": {
    title: "JSONB — операции и индексы",
    summary: "Универсальный тип для полуструктурированных данных. -> и ->> для доступа, @> и ? для поиска, GIN-индекс для запросов внутри документа.",
    examples: [
      "SELECT data->>'name' AS name FROM docs;",
      "SELECT * FROM docs WHERE data @> '{\"role\":\"admin\"}';",
      "SELECT jsonb_array_elements(data->'tags') FROM docs;"
    ],
    pitfalls: [
      "-> возвращает jsonb, ->> возвращает text",
      "Сравнение @> требует точного вложения",
      "Индекс GIN с jsonb_path_ops компактнее, но поддерживает только @>"
    ],
    learningGoals: [
      "уверенно ходить по jsonb",
      "выбирать тип GIN-индекса"
    ],
    relatedTopics: ["jsonb-ops-vs-pathops", "jsonb-expression-index", "gin-index"]
  },

  // 20. Дата и время
  "datetime": {
    title: "Дата и время",
    summary: "now(), interval, date_trunc, часовые пояса.",
    examples: [
      "SELECT now(), now() - interval '7 days';",
      "SELECT date_trunc('day', created_at) AS d, count(*) FROM orders GROUP BY 1;",
      "SELECT now() AT TIME ZONE 'Europe/Moscow';"
    ],
    pitfalls: [
      "timestamp без tz путает разработчиков и админов",
      "now() возвращает время начала транзакции; clock_timestamp() — реальное",
      "AT TIME ZONE на timestamp и timestamptz работает по-разному"
    ],
    learningGoals: [
      "работать с интервалами",
      "понимать поведение TIME ZONE"
    ]
  },

  // ===== Гайды =====
  "guide-list-tables": {
    title: "Гайд: список таблиц",
    summary: "Как получить список таблиц через psql и системные каталоги.",
    examples: [
      "\\dt",
      "\\dt schema_name.*",
      "SELECT schemaname, tablename FROM pg_catalog.pg_tables WHERE schemaname NOT IN ('pg_catalog','information_schema');"
    ],
    pitfalls: [
      "information_schema может скрывать таблицы, к которым у пользователя нет прав",
      "pg_tables показывает только обычные таблицы; для всего — pg_class"
    ],
    learningGoals: [
      "видеть таблицы в нужной схеме",
      "знать разницу pg_tables и pg_class"
    ]
  },
  "guide-create-table": {
    title: "Гайд: создание таблицы",
    summary: "Полный путь: имя, столбцы, типы, ограничения, identity, generated.",
    examples: [
      "CREATE TABLE products (\n  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  sku         text UNIQUE NOT NULL,\n  price_cents integer NOT NULL CHECK (price_cents >= 0),\n  search_text text GENERATED ALWAYS AS (lower(sku)) STORED,\n  created_at  timestamptz NOT NULL DEFAULT now()\n);"
    ],
    pitfalls: [
      "GENERATED ALWAYS AS IDENTITY рекомендуется вместо bigserial",
      "STORED-генерируемые столбцы занимают место, но индексируются как обычные"
    ],
    learningGoals: [
      "проектировать таблицу с современным синтаксисом",
      "видеть варианты identity и generated"
    ]
  },
  "guide-vacuum": {
    title: "Гайд: VACUUM",
    summary: "MVCC, dead tuples, autovacuum, мониторинг.",
    examples: [
      "VACUUM (VERBOSE, ANALYZE) orders;",
      "SELECT relname, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;"
    ],
    pitfalls: [
      "n_dead_tup — кандидаты на уборку",
      "Если autovacuum не успевает — настраиваются autovacuum_vacuum_scale_factor для горячих таблиц"
    ],
    learningGoals: [
      "понимать связь MVCC и VACUUM",
      "находить таблицы, требующие внимания"
    ]
  },
  "guide-list-users": {
    title: "Гайд: список пользователей",
    summary: "\\du, pg_roles, pg_user — что они показывают.",
    examples: [
      "\\du",
      "SELECT rolname, rolsuper, rolcanlogin FROM pg_roles ORDER BY rolname;",
      "SELECT usename FROM pg_user;"
    ],
    pitfalls: [
      "pg_user — представление над pg_roles, показывает только LOGIN-роли",
      "rolsuper = true — суперпользователь; стоит проверять"
    ],
    learningGoals: [
      "знать разницу role/user в Postgres",
      "находить опасные привилегии"
    ]
  },
  "guide-create-index": {
    title: "Гайд: создание индекса",
    summary: "Когда нужен индекс, какие типы есть, CONCURRENTLY.",
    examples: [
      "CREATE INDEX CONCURRENTLY idx_orders_user_created ON orders (user_id, created_at DESC);",
      "EXPLAIN SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC LIMIT 20;"
    ],
    pitfalls: [
      "CONCURRENTLY нельзя в транзакции",
      "Если CONCURRENTLY упал — оставит INVALID индекс, его нужно дропнуть",
      "Индекс ускоряет чтение, но замедляет запись"
    ],
    learningGoals: [
      "проектировать индекс под конкретные запросы",
      "безопасно создавать индексы на проде"
    ]
  },

  // ===== Ошибки =====
  "err-relation-does-not-exist": {
    title: "Ошибка: relation \"X\" does not exist",
    summary: "Таблица не найдена: опечатка, неверная схема или search_path.",
    examples: [
      "SELECT * FROM Users; -- если таблица создавалась как \"Users\" в кавычках, регистр имеет значение",
      "SHOW search_path;",
      "SET search_path = public, my_schema;"
    ],
    pitfalls: [
      "Без двойных кавычек идентификаторы приводятся к нижнему регистру",
      "Нужная схема может отсутствовать в search_path"
    ],
    learningGoals: [
      "локализовать причину «таблица не найдена»",
      "научиться проверять search_path"
    ]
  },
  "err-duplicate-key": {
    title: "Ошибка: duplicate key value violates unique constraint",
    summary: "Нарушение UNIQUE/PK при INSERT или UPDATE.",
    examples: [
      "INSERT INTO users (email) VALUES ('a@example.com')\nON CONFLICT (email) DO NOTHING;"
    ],
    pitfalls: [
      "Конфликт может приходить из любого UNIQUE-индекса, не только PK",
      "ON CONFLICT решает не любую гонку — нужны транзакции"
    ],
    learningGoals: [
      "находить виноватый индекс",
      "выбирать стратегию UPSERT"
    ]
  },
  "err-not-null": {
    title: "Ошибка: null value in column violates not-null constraint",
    summary: "Ошибка вставки: в столбец с NOT NULL пришёл NULL. Обычно — забыли значение в INSERT или DEFAULT не подтянулся.",
    examples: [
      "ALTER TABLE users ALTER COLUMN email SET DEFAULT '';"
    ],
    pitfalls: [
      "Иногда виноват триггер, который обнуляет значение",
      "DEFAULT помогает, если столбец просто не указан в INSERT"
    ],
    learningGoals: [
      "находить место, где появляется NULL",
      "решать задачу через DEFAULT или явное значение"
    ]
  },
  "err-fk": {
    title: "Ошибка: insert or update on table violates foreign key constraint",
    summary: "Связанная строка отсутствует или удаляется без CASCADE.",
    examples: [
      "ALTER TABLE orders DROP CONSTRAINT orders_user_id_fkey,\n  ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;"
    ],
    pitfalls: [
      "Порядок INSERT-ов: сперва родитель, потом ребёнок",
      "ON DELETE SET NULL требует, чтобы столбец FK был nullable"
    ],
    learningGoals: [
      "понимать ON DELETE/UPDATE действия",
      "правильно проектировать каскады"
    ]
  },
  "err-syntax": {
    title: "Ошибка: syntax error at or near \"...\"",
    summary: "Синтаксическая ошибка SQL — обычно опечатка или лишний/пропущенный знак.",
    examples: [
      "SELECT id, name FROM users WHERE id = 1;"
    ],
    pitfalls: [
      "Пропущенная запятая в списке столбцов",
      "Зарезервированное слово в качестве имени без кавычек",
      "Висящая запятая перед FROM"
    ],
    learningGoals: [
      "локализовать ошибку по позиции в сообщении",
      "узнавать типичные паттерны опечаток"
    ]
  },
  "err-permission-denied": {
    title: "Ошибка: permission denied for table/relation/schema",
    summary: "Не выданы нужные права (USAGE на схему или SELECT/INSERT/... на таблицу).",
    examples: [
      "GRANT USAGE ON SCHEMA public TO app_user;",
      "GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE orders TO app_user;"
    ],
    pitfalls: [
      "Без USAGE на схему другие права не сработают",
      "ALTER DEFAULT PRIVILEGES управляет правами для будущих таблиц"
    ],
    learningGoals: [
      "выстраивать минимально достаточные права",
      "понимать роль PUBLIC"
    ]
  },
  "err-division-by-zero": {
    title: "Ошибка: division by zero",
    summary: "22012 division_by_zero — арифметика на ноль. Чаще всего срабатывает в выражениях вроде sum(x) / count(*) на пустом наборе.",
    examples: [
      "SELECT a / NULLIF(b, 0) FROM t;"
    ],
    pitfalls: [
      "NULLIF(b, 0) превращает 0 в NULL, и итог становится NULL",
      "Иногда нужен CASE для значения по умолчанию"
    ],
    learningGoals: [
      "защищаться от 0 в знаменателе",
      "понимать поведение NULL в арифметике"
    ]
  },
  "err-invalid-input": {
    title: "Ошибка: invalid input syntax for type ...",
    summary: "Строка не приводится к нужному типу (дата, число, uuid).",
    examples: [
      "SELECT '2025-13-40'::date; -- упадёт",
      "SELECT to_date('07.05.2026','DD.MM.YYYY');"
    ],
    pitfalls: [
      "Формат дат зависит от datestyle — лучше явно через to_date/to_timestamp",
      "Лишние пробелы и непечатаемые символы — частая причина"
    ],
    learningGoals: [
      "не полагаться на неявное приведение",
      "использовать to_date/to_timestamp"
    ]
  },
  "err-deadlock": {
    title: "Ошибка: deadlock detected",
    summary: "Две транзакции взаимно ждут блокировок друг друга.",
    examples: [
      "-- A: UPDATE accounts WHERE id=1; -- держит блок 1\n-- B: UPDATE accounts WHERE id=2; -- держит блок 2\n-- A: UPDATE accounts WHERE id=2; -- ждёт B\n-- B: UPDATE accounts WHERE id=1; -- ждёт A → deadlock"
    ],
    pitfalls: [
      "Postgres сам выбирает «жертву» и откатывает её",
      "Решение — фиксированный порядок захвата блокировок и retry"
    ],
    learningGoals: [
      "находить причину дедлока в логах",
      "проектировать порядок UPDATE"
    ]
  },
  "err-serialization": {
    title: "Ошибка: could not serialize access due to concurrent update",
    summary: "Сериализационный конфликт в REPEATABLE READ или SERIALIZABLE.",
    examples: [
      "BEGIN ISOLATION LEVEL SERIALIZABLE;\n-- запросы;\nCOMMIT;\n-- при ошибке — повторить транзакцию"
    ],
    pitfalls: [
      "В SERIALIZABLE такие ошибки — норма, нужен retry-цикл",
      "Это не баг, а контракт уровня изоляции"
    ],
    learningGoals: [
      "понимать смысл сериализационного конфликта",
      "встроить retry в приложение"
    ]
  },
  "err-too-many-connections": {
    title: "Ошибка: too many connections / out of shared memory",
    summary: "Превышен лимит подключений или общей памяти.",
    examples: [
      "SHOW max_connections;",
      "SELECT count(*) FROM pg_stat_activity;"
    ],
    pitfalls: [
      "Решается пуллером (PgBouncer) и закрытием idle-соединений",
      "Поднять max_connections — не всегда выход: память тоже не резиновая"
    ],
    learningGoals: [
      "видеть, кто держит подключения",
      "вводить пуллинг"
    ]
  },
  "err-statement-timeout": {
    title: "Ошибка: canceling statement due to statement timeout",
    summary: "Запрос превысил statement_timeout и был отменён.",
    examples: [
      "SET statement_timeout = '5s';",
      "EXPLAIN ANALYZE SELECT ...;"
    ],
    pitfalls: [
      "Чаще всего настраивается на уровне роли или сессии",
      "Не путай с lock_timeout и idle_in_transaction_session_timeout"
    ],
    learningGoals: [
      "оптимизировать долгие запросы",
      "корректно настраивать тайм-ауты"
    ]
  },
  "err-database-in-use": {
    title: "Ошибка: database \"X\" is being accessed by other users",
    summary: "Нельзя удалить/переименовать БД, пока к ней подключены клиенты.",
    examples: [
      "SELECT pg_terminate_backend(pid)\nFROM pg_stat_activity\nWHERE datname = 'shop' AND pid <> pg_backend_pid();",
      "DROP DATABASE shop WITH (FORCE);"
    ],
    pitfalls: [
      "WITH (FORCE) — c PG 13",
      "Сам не должен быть подключён к этой БД"
    ],
    learningGoals: [
      "корректно освобождать БД",
      "пользоваться pg_stat_activity"
    ]
  },
  // ===== Senior-уровень =====

  "sr-explain-deep": {
    title: "Чтение EXPLAIN ANALYZE",
    summary: "Узлы плана: Seq Scan, Index Scan, Bitmap, Nested Loop / Hash / Merge Join.",
    examples: [
      "EXPLAIN (ANALYZE, BUFFERS, VERBOSE)\nSELECT u.email, count(o.id)\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP BY u.email;"
    ],
    pitfalls: [
      "actual rows ≫ estimated rows — устаревшая статистика или сложный предикат",
      "Hash Join с 'Buckets/Memory: ... Disk' — не хватает work_mem",
      "Nested Loop по большой внешней таблице — обычно красный флаг"
    ],
    learningGoals: [
      "уверенно читать узлы плана",
      "связывать узкое место с настройкой/индексом"
    ],
    relatedTopics: ["sr-pg-stat-statements", "sr-planner-knobs", "explain"]
  },
  "sr-pg-stat-statements": {
    title: "pg_stat_statements",
    summary: "Главный инструмент поиска тяжёлых запросов на проде.",
    examples: [
      "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;",
      "SELECT round(total_exec_time::numeric, 1) AS total_ms,\n       calls,\n       round(mean_exec_time::numeric, 2) AS mean_ms,\n       query\nFROM   pg_stat_statements\nORDER  BY total_exec_time DESC\nLIMIT  20;"
    ],
    pitfalls: [
      "Требует загрузки в shared_preload_libraries и рестарта сервера",
      "Запросы агрегируются по нормализованной форме — параметры заменены на $1, $2",
      "track_io_timing нужно включать отдельно для I/O-метрик"
    ],
    learningGoals: [
      "находить top-N запросов по суммарному времени",
      "отличать редкий-тяжёлый запрос от частого-лёгкого"
    ],
    relatedTopics: ["sr-explain-deep", "sr-observability"]
  },
  "sr-planner-knobs": {
    title: "Настройки планировщика",
    summary: "work_mem, effective_cache_size, random_page_cost.",
    examples: [
      "SHOW work_mem;",
      "SET LOCAL work_mem = '64MB';",
      "ALTER SYSTEM SET random_page_cost = 1.1;  -- для SSD"
    ],
    pitfalls: [
      "work_mem применяется к каждому узлу-сортировке/хэшу — не к запросу целиком",
      "effective_cache_size — это подсказка планировщику, а не аллокация памяти",
      "random_page_cost = 4 (по умолчанию) — устаревшее значение для SSD"
    ],
    learningGoals: [
      "подбирать work_mem под рабочую нагрузку",
      "понимать, что меняет random_page_cost"
    ],
    relatedTopics: ["sr-explain-deep", "cfg-shared-buffers", "cfg-work-mem"]
  },

  "sr-pgbench": {
    title: "pgbench — нагрузочное тестирование PostgreSQL",
    summary: "Идёт в комплекте с Postgres, готов к работе из коробки. Базовый сценарий (TPC-B-like) хорош для сравнения железа и настроек; кастомные скрипты — для проверки своего профиля нагрузки.",
    examples: [
      "# инициализация (создаст таблицы pgbench_*):\npgbench -i -s 100 -h localhost -U postgres bench\n# -s 100 = scale 100 ≈ 1.6 ГБ данных. 1000 ≈ 16 ГБ.\n\n# базовый прогон: 50 клиентов, 4 потока, 5 минут\npgbench -h localhost -U postgres -c 50 -j 4 -T 300 -P 10 bench\n# -P 10 = печатать промежуточный TPS каждые 10 сек\n\n# только чтение (read-only сценарий):\npgbench -c 50 -j 4 -T 300 -S bench",
      "# кастомный скрипт под свой профиль:\n# my_bench.sql:\n# \\set uid random(1, 100000)\n# SELECT * FROM users WHERE id = :uid;\n# SELECT count(*) FROM orders WHERE user_id = :uid;\n\npgbench -c 100 -j 8 -T 300 -f my_bench.sql -P 10 app",
      "# смешанный сценарий (90% read / 10% write):\npgbench -c 50 -j 4 -T 300 \\\n  -f read.sql@9 \\\n  -f write.sql@1 \\\n  -P 10 app\n\n# подключение через PgBouncer — сравнить с прямым подключением:\npgbench -h pgbouncer.internal -p 6432 -c 200 -j 16 -T 300 bench",
      "# вывод:\n# tps = 3421.5 (without initial connection time)\n# latency average = 14.6 ms\n# initial connection time = 23 ms\n# что смотреть: tps, p95-латенси (через --report-per-command), стабильность TPS на интервалах"
    ],
    pitfalls: [
      "Сравнивать TPS на разных scale-факторах нельзя: pgbench с -s 1 → всё в кеше, цифры космические; -s 1000 → реальный диск",
      "TPS pgbench != TPS приложения. У реального приложения другие запросы, другие соединения, другие latency-распределения",
      "На coffee-cup-нагрузке (-c 1 -j 1) ты измеряешь не Postgres, а сетевой round-trip к клиенту. Минимум -c 10 -j 4",
      "Initial-connection-time иногда занимает 95% всего теста. -T 300 = 5 минут — это минимум; короче — пьяные цифры",
      "Без -P видишь только итог; не заметишь, что в середине теста TPS просел в 5 раз из-за чекпойнта"
    ],
    learningGoals: [
      "запускать стандартный pgbench под свою БД и интерпретировать результат",
      "писать кастомный сценарий через -f",
      "понимать ограничения: pgbench != «производительность приложения»"
    ],
    relatedTopics: ["sr-explain-deep", "sr-pg-stat-statements", "tools-overview", "sr-pgbouncer"]
  },

  "sr-hierarchies": {
    title: "Иерархии в таблице: parent_id, materialized path, closure table",
    summary: "Три способа хранить дерево/граф (категории, комментарии, организационная структура). У каждого свой профиль чтения и записи — выбор зависит от того, что важнее.",
    examples: [
      "-- 1) Adjacency list (parent_id) — самый частый и простой:\nCREATE TABLE categories (\n  id        bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  parent_id bigint REFERENCES categories(id),\n  name      text NOT NULL\n);\n\n-- получить всех потомков узла #1 — WITH RECURSIVE:\nWITH RECURSIVE descendants AS (\n  SELECT id, parent_id, name, 1 AS depth\n  FROM   categories WHERE id = 1\n  UNION ALL\n  SELECT c.id, c.parent_id, c.name, d.depth + 1\n  FROM   categories c\n  JOIN   descendants d ON c.parent_id = d.id\n)\nSELECT * FROM descendants;",
      "-- 2) Materialized path — путь хранится как строка/массив:\nCREATE TABLE categories_mp (\n  id   bigint PRIMARY KEY,\n  path ltree NOT NULL,           -- '1.4.7.42'\n  name text NOT NULL\n);\nCREATE EXTENSION IF NOT EXISTS ltree;\nCREATE INDEX idx_categories_mp_path ON categories_mp USING gist (path);\n\n-- все потомки узла '1.4.7' — один запрос без recursive:\nSELECT * FROM categories_mp WHERE path <@ '1.4.7';\n-- предки узла:\nSELECT * FROM categories_mp WHERE path @> '1.4.7.42.99';",
      "-- 3) Closure table — отдельная таблица «предок-потомок» для каждой пары:\nCREATE TABLE categories_cl (id bigint PRIMARY KEY, name text);\nCREATE TABLE categories_closure (\n  ancestor   bigint NOT NULL REFERENCES categories_cl(id),\n  descendant bigint NOT NULL REFERENCES categories_cl(id),\n  depth      int    NOT NULL,\n  PRIMARY KEY (ancestor, descendant)\n);\nCREATE INDEX ON categories_closure (descendant);\n\n-- все предки узла:\nSELECT c.* FROM categories_closure cl\nJOIN   categories_cl c ON c.id = cl.ancestor\nWHERE  cl.descendant = 42;\n\n-- INSERT и MOVE дороги — поддерживать closure через триггеры."
    ],
    pitfalls: [
      "parent_id + recursive CTE — самый общий вариант, но чтение всех потомков может быть дорогим на глубоких деревьях. Под чтение оптимизируют materialized path или closure",
      "Materialized path требует обновления path при перемещении узла — каскадом для всех потомков. Запись дороже, чтение дешевле",
      "Closure table — самое быстрое чтение «все предки/потомки», но запись = O(глубина); MOVE подузла = пересоздать все его пары",
      "ltree (Postgres-расширение) даёт операторы <@ / @> / lquery / lca и GiST-индекс — лучший выбор для materialized path в Postgres",
      "Не делай DFS/BFS на стороне приложения через N запросов — это лекарство хуже болезни. WITH RECURSIVE в БД всегда дешевле"
    ],
    learningGoals: [
      "выбирать adjacency / path / closure по профилю чтения и записи",
      "писать WITH RECURSIVE для adjacency list",
      "использовать ltree для materialized path"
    ],
    relatedTopics: ["recursive-cte", "self-join", "rel-one-to-many", "gin-index"]
  },

  "sr-normalization": {
    title: "Нормализация и денормализация",
    summary: "Нормализация — про защиту от противоречий: каждый факт хранится в одном месте. Денормализация — осознанный шаг назад ради чтения. Кто умеет говорить и то, и другое, не путая, — у того схема выживает.",
    examples: [
      "-- 1NF: все колонки атомарны (никаких 'tag1,tag2,tag3' в одной строке)\n-- НАРУШЕНИЕ:\nCREATE TABLE posts (id int, tags text);  -- tags = 'sql,db,postgres'\n-- НОРМА:\nCREATE TABLE posts (id int);\nCREATE TABLE post_tags (post_id int, tag text, PRIMARY KEY (post_id, tag));",
      "-- 2NF: неключевые колонки зависят от ВСЕГО PK, не от его части\n-- НАРУШЕНИЕ:\nCREATE TABLE order_items (\n  order_id int, product_id int,\n  qty int,\n  product_name text,   -- зависит только от product_id, не от обоих\n  PRIMARY KEY (order_id, product_id)\n);\n-- НОРМА: product_name переезжает в products",
      "-- 3NF: неключевые колонки НЕ зависят от других неключевых\n-- НАРУШЕНИЕ:\nCREATE TABLE users (id int PRIMARY KEY, country_code text, country_name text);\n--                                          country_name → зависит от country_code\n-- НОРМА: countries(code PK, name); users (..., country_code FK)",
      "-- денормализация — осознанная, под конкретный запрос\nALTER TABLE users ADD COLUMN orders_count int NOT NULL DEFAULT 0;\n-- держим в актуальности триггером:\nCREATE FUNCTION bump_orders_count() RETURNS trigger AS $$\nBEGIN\n  IF TG_OP = 'INSERT' THEN\n    UPDATE users SET orders_count = orders_count + 1 WHERE id = NEW.user_id;\n  ELSIF TG_OP = 'DELETE' THEN\n    UPDATE users SET orders_count = orders_count - 1 WHERE id = OLD.user_id;\n  END IF;\n  RETURN NULL;\nEND;\n$$ LANGUAGE plpgsql;\n\nCREATE TRIGGER orders_count_trg\n  AFTER INSERT OR DELETE ON orders\n  FOR EACH ROW EXECUTE FUNCTION bump_orders_count();",
      "-- EAV-антипаттерн (Entity-Attribute-Value): «гибкая» схема через 3 колонки\n-- ❌ почти всегда плохо:\nCREATE TABLE attributes (entity_id int, key text, value text);\n-- Запрос «дай мне все товары с цветом=red и размером=M» → 2 JOIN'а к самой себе.\n-- Решение: либо jsonb, либо нормальная схема с колонками."
    ],
    pitfalls: [
      "«Денормализация для производительности» в 80% случаев — оправдание ошибки в индексах. Сначала EXPLAIN, потом денормализация",
      "EAV (entity-attribute-value) — антипаттерн: невозможно индексировать, невозможно типизировать, JOIN на каждый запрос. Если поля плавают — jsonb",
      "Денормализованное поле требует синхронизации (триггер / materialized view / приложение). Забудешь — данные разъедутся",
      "1NF строго говоря запрещает массивы, но Postgres-массив — компромисс: атомарный для движка, но удобный для тегов",
      "Materialized view — это тоже денормализация, только декларативная. REFRESH CONCURRENTLY (PG 9.4+) делает её приемлемой для прода"
    ],
    learningGoals: [
      "видеть нарушения 1NF/2NF/3NF на пальцах",
      "не путать «денормализация» с «убрать FK»",
      "распознавать EAV-антипаттерн и предлагать jsonb или нормальную схему"
    ],
    relatedTopics: ["keys-pk-fk", "rel-one-to-many", "rel-many-to-many", "types-jsonb", "materialized-view", "triggers"]
  },

  "sr-extensions-ecosystem": {
    title: "Экосистема расширений PostgreSQL",
    summary: "Postgres сильнее, чем кажется по коробке. Десяток зрелых расширений закрывают геопоиск, time-series, аудит, планирование заданий, гипотетические индексы, измерение bloat. Знать их — то же, что senior отличается от middle.",
    examples: [
      "-- общий механизм:\nSELECT * FROM pg_available_extensions ORDER BY name;\nCREATE EXTENSION IF NOT EXISTS extname;\nSELECT * FROM pg_extension;     -- что включено в этой БД",
      "-- топовые расширения по применимости:\n-- pg_stat_statements  — top тяжёлых запросов (есть отдельная тема)\n-- pg_trgm             — fuzzy/подстрочный поиск (есть отдельная тема)\n-- pgcrypto            — gen_random_uuid, hashing, симметричное шифрование\n-- citext              — case-insensitive text без lower() в каждом запросе\n-- hstore              — legacy key/value, сейчас почти всегда заменяется jsonb\n-- uuid-ossp           — UUID v1/v3/v4/v5 (новый код берёт gen_random_uuid из pgcrypto)",
      "-- эксплуатация:\n-- postgis        — индустриальный стандарт геоданных\n-- timescaledb    — hypertables + continuous aggregates для time-series\n-- pg_partman     — автоматическая ротация партиций\n-- pg_cron        — планировщик задач прямо в БД (cron-синтаксис)\n-- pg_repack      — упаковка таблиц без блокировки\n-- pgaudit        — аудит DDL/DML с детальной фильтрацией\n-- pgstattuple    — точное измерение bloat\n-- hypopg         — гипотетические индексы: «что было бы, если добавить»",
      "-- пример: pg_cron поверх Postgres:\nCREATE EXTENSION IF NOT EXISTS pg_cron;\n\nSELECT cron.schedule(\n  'cleanup-old-events',\n  '0 3 * * *',                                  -- каждый день в 3:00\n  $$ DELETE FROM events WHERE ts < now() - interval '90 days' $$\n);\n\nSELECT * FROM cron.job;\nSELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 20;",
      "-- пример: hypopg — проверить индекс до создания\nCREATE EXTENSION IF NOT EXISTS hypopg;\nSELECT hypopg_create_index('CREATE INDEX ON orders (user_id, created_at DESC)');\nEXPLAIN SELECT * FROM orders WHERE user_id = 1 ORDER BY created_at DESC;\n-- если план поменялся — значит, индекс реально поможет. Сбросить:\nSELECT hypopg_reset();"
    ],
    pitfalls: [
      "Managed-сервисы (RDS, Cloud SQL) часто разрешают только whitelisted расширения. Перед миграцией — сверить со списком провайдера",
      "CREATE EXTENSION требует SUPERUSER (для большинства). На managed-сервисах есть отдельная роль или web-консоль для установки",
      "Не все расширения переживают мажорный upgrade Postgres без обновления самого расширения. Проверять на staging",
      "hypopg-индексы НЕ существуют физически, не помогают реальным запросам и видны только в EXPLAIN — это инструмент исследования, не оптимизации",
      "Каждое расширение = поверхность атаки. На проде ставим только то, что действительно нужно"
    ],
    learningGoals: [
      "знать топ-10 расширений и под какие задачи",
      "ставить расширение и проверять, что оно есть на managed-сервисе",
      "пользоваться hypopg для проверки идеи индекса"
    ],
    relatedTopics: ["sr-pg-stat-statements", "sr-pg-trgm", "sr-fulltext", "sr-time-series", "sr-bloat"]
  },

  "sr-time-series": {
    title: "Time-series в Postgres",
    summary: "Постгрес без расширений справляется с миллиардами event-строк, если правильно расставить три кирпича: partition by range (ts), BRIN-индекс на ts, и автоматизация ротации через pg_partman. Для серьёзной аналитики поверх — TimescaleDB.",
    examples: [
      "-- партиционированная таблица событий по месяцам:\nCREATE TABLE events (\n  id   bigint GENERATED ALWAYS AS IDENTITY,\n  ts   timestamptz NOT NULL,\n  user_id bigint NOT NULL,\n  data jsonb,\n  PRIMARY KEY (id, ts)\n) PARTITION BY RANGE (ts);\n\nCREATE TABLE events_2026_05 PARTITION OF events\n  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');\n\n-- BRIN — идеальный индекс для append-only по времени:\nCREATE INDEX idx_events_ts_brin ON events USING brin (ts)\n  WITH (pages_per_range = 32);",
      "-- pg_partman — автоматическая ротация партиций:\nCREATE EXTENSION IF NOT EXISTS pg_partman;\n\nSELECT partman.create_parent(\n  p_parent_table => 'public.events',\n  p_control      => 'ts',\n  p_type         => 'range',\n  p_interval     => '1 month',\n  p_premake      => 4  -- держим 4 будущих партиции готовыми\n);\n\n-- ретеншн: дропать партиции старше 12 месяцев:\nUPDATE partman.part_config\nSET    retention = '12 months', retention_keep_table = false\nWHERE  parent_table = 'public.events';\n\n-- запускать ротацию (обычно из cron):\nSELECT run_maintenance();",
      "-- TimescaleDB — Postgres-расширение, превращающее таблицу в гиперт-таблицу:\nCREATE EXTENSION IF NOT EXISTS timescaledb;\n\nSELECT create_hypertable('events', 'ts', chunk_time_interval => interval '1 day');\n\n-- continuous aggregates — materialized views, которые обновляются автоматически:\nCREATE MATERIALIZED VIEW events_hourly\nWITH (timescaledb.continuous) AS\nSELECT time_bucket('1 hour', ts) AS bucket,\n       user_id, count(*)\nFROM events\nGROUP BY bucket, user_id;"
    ],
    pitfalls: [
      "BRIN ускоряет ТОЛЬКО когда таблица отсортирована по индексируемому полю физически — это естественно для append-only event-stream. На таблице с UPDATE в произвольном порядке BRIN бесполезен",
      "Партиционирование без ротации = таблиц станет тысячи и план каждый раз будет тяжелее. pg_partman автоматизирует, но его cron должен реально запускаться",
      "TimescaleDB лицензия: open core + community + commercial. Continuous aggregates — community, не во всех managed-сервисах есть",
      "Не забыть PRIMARY KEY включает partition key — иначе ALTER TABLE на партицированной таблице не пройдёт",
      "На write-heavy time-series autovacuum часто отстаёт — поднимай scale_factor и naptime"
    ],
    learningGoals: [
      "проектировать партиционированную event-таблицу с BRIN",
      "автоматизировать ротацию через pg_partman",
      "понимать, что добавляет TimescaleDB поверх обычного Postgres"
    ],
    relatedTopics: ["sr-partitioning", "create-index-btree", "sr-bloat", "cfg-autovacuum"]
  },

  "sr-fdw": {
    title: "Foreign Data Wrappers (postgres_fdw)",
    summary: "FDW даёт обращаться к чужой БД как к локальной таблице. postgres_fdw — самый зрелый: Postgres-to-Postgres. Также есть file_fdw, mysql_fdw, mongo_fdw, oracle_fdw — экосистема расширений.",
    examples: [
      "-- подключение к другой Postgres-БД:\nCREATE EXTENSION IF NOT EXISTS postgres_fdw;\n\nCREATE SERVER reports_db\n  FOREIGN DATA WRAPPER postgres_fdw\n  OPTIONS (host 'reports.internal', port '5432', dbname 'analytics');\n\nCREATE USER MAPPING FOR app_user\n  SERVER reports_db\n  OPTIONS (user 'app_reader', password '...');\n\n-- IMPORT FOREIGN SCHEMA — массовое создание foreign-таблиц:\nIMPORT FOREIGN SCHEMA public\n  LIMIT TO (orders, line_items)\n  FROM SERVER reports_db INTO ext;",
      "-- использование выглядит как обычная таблица:\nSELECT u.email, count(o.id)\nFROM   users u                       -- локальная\nLEFT JOIN ext.orders o ON o.user_id = u.id    -- foreign\nGROUP  BY u.email;",
      "-- посмотреть, что Postgres pushed-down на удалённую сторону:\nEXPLAIN (VERBOSE, ANALYZE) SELECT ...;\n-- ищи 'Remote SQL' — то, что реально ушло на reports_db.\n\n-- CSV через file_fdw:\nCREATE EXTENSION IF NOT EXISTS file_fdw;\nCREATE SERVER files FOREIGN DATA WRAPPER file_fdw;\nCREATE FOREIGN TABLE logs (\n  ts text, level text, msg text\n) SERVER files OPTIONS (filename '/var/log/app.csv', format 'csv', header 'true');"
    ],
    pitfalls: [
      "Pushdown — главный плюс postgres_fdw. Без него любой JOIN тянет всю таблицу через сеть. Помогают use_remote_estimate и async_capable",
      "Транзакционность ОДНОСТОРОННЯЯ: BEGIN на локальной — это не BEGIN на удалённой. Двух-фазный commit (2PC) FDW не использует",
      "user mapping хранит пароль в pg_user_mappings — доступен суперпользователю; для прода — sslmode=verify-full и/или scram",
      "Foreign-таблицы не индексируются локально (нет смысла) — фильтры должны pushdown'иться на удалённую сторону. Если не идёт — переписывать запрос",
      "Не путать FDW с logical replication: FDW — синхронные запросы по требованию, repl — асинхронный поток событий"
    ],
    learningGoals: [
      "создавать SERVER, USER MAPPING, FOREIGN TABLE",
      "видеть Remote SQL в EXPLAIN и понимать pushdown",
      "выбирать между FDW и logical replication"
    ],
    relatedTopics: ["sr-logical-decoding-cdc", "sr-replication", "tools-overview"]
  },

  "sr-logical-decoding-cdc": {
    title: "Logical decoding и CDC",
    summary: "Logical decoding превращает WAL в поток событий «строка изменена». На этом строятся CDC-конвейеры (Debezium, wal2json) и репликация между гетерогенными БД. Без понимания replica identity и слотов это не запустить.",
    examples: [
      "-- включаем logical-уровень WAL (нужен restart кластера):\nALTER SYSTEM SET wal_level = 'logical';\nALTER SYSTEM SET max_replication_slots = 10;\nALTER SYSTEM SET max_wal_senders = 10;\n-- restart обязателен!",
      "-- replica identity: что попадает в WAL при UPDATE/DELETE\n-- DEFAULT — только PK; для таблиц без PK это проблема:\nALTER TABLE events REPLICA IDENTITY FULL;     -- вся старая строка\nALTER TABLE events REPLICA IDENTITY USING INDEX idx_events_user; -- по конкретному уникальному индексу",
      "-- создать logical slot и стрим через pgoutput (нативный плагин):\nSELECT pg_create_logical_replication_slot('cdc_app', 'pgoutput');\n\n-- через wal2json — события в JSON:\nSELECT pg_create_logical_replication_slot('cdc_json', 'wal2json');\n\nSELECT data\nFROM   pg_logical_slot_peek_changes('cdc_json', NULL, NULL,\n         'pretty-print', '1',\n         'include-timestamp', 'on');",
      "-- Debezium для production: подключается через replication-протокол,\n-- читает WAL через pgoutput / wal2json и пишет события в Kafka.\n-- Postgres-сторона:\nCREATE PUBLICATION debezium_pub FOR TABLE orders, users;\nCREATE USER debezium WITH REPLICATION PASSWORD '...';\nGRANT SELECT ON orders, users TO debezium;"
    ],
    pitfalls: [
      "Заброшенный logical slot — главная причина «диск кончился». Postgres держит WAL для подписчика; если воркер мёртв, WAL копится. Мониторь pg_replication_slots.confirmed_flush_lsn",
      "REPLICA IDENTITY DEFAULT и таблица без PK = UPDATE/DELETE летят в WAL без идентификации строки. CDC ловит «событие без before-state»",
      "REPLICA IDENTITY FULL пишет всю строку в WAL — дорого на write-heavy таблицах. Используй только там, где нужно",
      "Logical replication НЕ передаёт DDL. ALTER TABLE на источнике надо повторить вручную на приёмнике",
      "Не путать с physical replication (тот стримит WAL побайтно). Logical работает поверх — нужен logical wal_level"
    ],
    learningGoals: [
      "включать logical wal_level и понимать его цену",
      "выбирать REPLICA IDENTITY под нужды CDC",
      "ловить и чинить разрастание logical slot"
    ],
    relatedTopics: ["sr-replication", "sr-physical-vs-logical", "sr-replication-slots", "sr-outbox"]
  },

  "sr-idempotency": {
    title: "Идемпотентность операций",
    summary: "Любая надёжная распределённая система делает один и тот же запрос дважды. Идемпотентность — это когда второй раз ничего не происходит. В Postgres основной инструмент — UNIQUE + ON CONFLICT и идемпотентный ключ.",
    examples: [
      "-- идемпотентный INSERT через ON CONFLICT DO NOTHING:\nINSERT INTO orders (id, user_id, total, idempotency_key)\nVALUES ($1, $2, $3, $4)\nON CONFLICT (idempotency_key) DO NOTHING\nRETURNING id;\n-- если ничего не вернулось — запись уже была, второй раз — нет операции.",
      "-- идемпотентный UPSERT через ON CONFLICT DO UPDATE:\nINSERT INTO inventory (sku, in_stock) VALUES ($1, $2)\nON CONFLICT (sku) DO UPDATE\n  SET in_stock = inventory.in_stock + EXCLUDED.in_stock;\n\n-- ВАЖНО: in_stock + EXCLUDED.in_stock — НЕ идемпотентно (повтор увеличит дважды).\n-- Идемпотентный вариант: сохранять последнее значение, не складывать.\nON CONFLICT (sku) DO UPDATE SET in_stock = EXCLUDED.in_stock;",
      "-- идемпотентные миграции через таблицу-журнал:\nCREATE TABLE schema_migrations (\n  version    text PRIMARY KEY,\n  applied_at timestamptz NOT NULL DEFAULT now()\n);\n\nDO $$\nBEGIN\n  IF NOT EXISTS (SELECT 1 FROM schema_migrations WHERE version = '2026_05_13_add_email_norm') THEN\n    ALTER TABLE users ADD COLUMN email_norm text;\n    INSERT INTO schema_migrations (version) VALUES ('2026_05_13_add_email_norm');\n  END IF;\nEND$$;",
      "-- идемпотентный outbox-воркер: SKIP LOCKED + помечаем published_at\n-- (повторный запуск не повторит публикацию):\nUPDATE outbox\nSET    published_at = now()\nWHERE  id IN (\n  SELECT id FROM outbox\n  WHERE  published_at IS NULL\n  ORDER  BY id\n  LIMIT  100\n  FOR UPDATE SKIP LOCKED\n)\nRETURNING id, topic, payload;"
    ],
    pitfalls: [
      "Самый частый антипаттерн: «in_stock + EXCLUDED.in_stock» — выглядит идемпотентно, но повтор удваивает значение",
      "ON CONFLICT (col) требует UNIQUE-индекс на col. Без него — синтаксическая ошибка",
      "Идемпотентность по бизнес-ключу (idempotency_key) важнее, чем по PK: PK ставится автоматически и НЕ совпадает между повторами",
      "Без RETURNING невозможно отличить «вставили» от «уже было» — для аналитики и логов это критично",
      "Идемпотентные миграции через таблицу-журнал — единственный способ накатывать их повторно после провала на середине"
    ],
    learningGoals: [
      "писать идемпотентные INSERT/UPSERT через ON CONFLICT",
      "проектировать idempotency-ключ для API",
      "делать миграции, которые можно повторить после провала"
    ],
    relatedTopics: ["upsert", "sr-outbox", "sr-zero-downtime-migrations", "sr-optimistic-locking"]
  },

  "sr-optimistic-locking": {
    title: "Оптимистичные блокировки и soft delete",
    summary: "Альтернатива SELECT FOR UPDATE: не блокировать строку, а проверять на UPDATE, что её никто не изменил. Через явный счётчик `version` или через системный `xmin`. На read-heavy сценариях намного дешевле.",
    examples: [
      "-- паттерн с явным version-столбцом:\nCREATE TABLE accounts (\n  id      bigint PRIMARY KEY,\n  balance numeric NOT NULL,\n  version int NOT NULL DEFAULT 0\n);\n\n-- транзакция приложения (псевдо):\n--   1. читаем  SELECT balance, version FROM accounts WHERE id = $1;\n--   2. думаем  newBalance = balance - 100;\n--   3. пишем  UPDATE accounts\n--             SET balance = $newBalance, version = version + 1\n--             WHERE id = $1 AND version = $version;\n--   4. если updated_rows = 0 → кто-то опередил, retry от шага 1.",
      "-- то же через системный xmin (без лишнего столбца):\nSELECT id, balance, xmin FROM accounts WHERE id = $1;\n-- … затем\nUPDATE accounts\nSET    balance = $newBalance\nWHERE  id = $1 AND xmin = $xmin\nRETURNING xmin;",
      "-- soft delete вместо физического DELETE:\nALTER TABLE users ADD COLUMN deleted_at timestamptz;\n\n-- частичный UNIQUE-индекс — позволяет переиспользовать email\n-- после удаления, не сломав FK на исторические записи:\nCREATE UNIQUE INDEX users_email_active_uq\n  ON users (email) WHERE deleted_at IS NULL;\n\n-- частичные индексы для запросов «живых» строк:\nCREATE INDEX users_active ON users (id) WHERE deleted_at IS NULL;"
    ],
    pitfalls: [
      "Оптимистичная блокировка требует retry-логики в приложении. Если её нет — конкурентный update просто молча «исчезает», ученик не понимает «почему»",
      "version-счётчик и xmin не защищают от write skew на разных строках. Для инварианта типа «врачей в смене не меньше двух» нужен SERIALIZABLE",
      "Soft delete = WHERE deleted_at IS NULL на КАЖДОМ запросе. Забыл — отдал клиенту удалённую запись. Хорошо помогает views или RLS",
      "xmin сменяется при VACUUM FREEZE — нельзя хранить долго и сравнивать через дни",
      "Не путать с пессимистичной SELECT FOR UPDATE: оптимистичная не блокирует, а гонится"
    ],
    learningGoals: [
      "реализовать compare-and-swap через version или xmin",
      "выбирать между оптимистичной блокировкой и FOR UPDATE",
      "проектировать частичные индексы для soft delete"
    ],
    relatedTopics: ["transactions", "iso-summary", "sr-mvcc-snapshot", "partial-index", "sr-idle-in-transaction"]
  },

  "sr-generated-columns": {
    title: "Generated columns + expression-индексы",
    summary: "GENERATED ALWAYS AS … STORED — производное поле, которое БД пересчитывает сама при каждом INSERT/UPDATE. В паре с индексом по выражению — идеальный способ ускорить «частые запросы по производной» без поддержки руками.",
    examples: [
      "-- классический пример: нормализация email для регистронезависимого UNIQUE:\nCREATE TABLE users (\n  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email text   NOT NULL,\n  email_norm text GENERATED ALWAYS AS (lower(email)) STORED\n);\n\nCREATE UNIQUE INDEX users_email_norm_uq ON users (email_norm);\n\nINSERT INTO users (email) VALUES ('Alice@Example.com');\nINSERT INTO users (email) VALUES ('alice@example.com');  -- ERROR: duplicate",
      "-- JSONB: вытащить поле наружу как обычную колонку\n-- (быстрее запросов через ->>'…' и используется в индексе нативно):\nALTER TABLE orders ADD COLUMN status text\n  GENERATED ALWAYS AS (data->>'status') STORED;\nCREATE INDEX orders_status ON orders (status);",
      "-- альтернатива: индекс по выражению (без хранения):\nCREATE INDEX users_email_lower ON users (lower(email));\n-- query должен повторить выражение дословно:\nSELECT * FROM users WHERE lower(email) = 'alice@example.com';",
      "-- generated column нельзя задать вручную:\nINSERT INTO users (email, email_norm) VALUES ('a@b', 'x');\n-- ERROR: column \"email_norm\" can only be updated to DEFAULT"
    ],
    pitfalls: [
      "STORED отнимает место (хранится отдельно); VIRTUAL в Postgres ещё не поддерживается (PG 17). Если поле не нужно как индекс — лучше выражение",
      "Выражение должно быть IMMUTABLE: now(), random(), функции с VOLATILE — нельзя. Postgres откажет на CREATE",
      "Индекс по выражению работает только если запрос дословно повторяет выражение. lower(email) ≠ LOWER(email::text) в некоторых редких случаях",
      "При смене формулы нужно DROP COLUMN + ADD COLUMN — ALTER … SET GENERATION пока не работает",
      "Generated column не передаётся в logical replication по умолчанию — он восстанавливается на реплике через ту же формулу"
    ],
    learningGoals: [
      "решать «регистронезависимый UNIQUE» через generated column + UNIQUE индекс",
      "вытаскивать поля из jsonb в индексируемые колонки",
      "отличать generated column от индекса по выражению"
    ],
    relatedTopics: ["expression-index", "types-jsonb", "constraints", "sr-zero-downtime-migrations"]
  },

  "sr-idle-in-transaction": {
    title: "idle_in_transaction и lifecycle сессий",
    summary: "Сессия, открывшая транзакцию и заснувшая (приложение зависло на сетевом вызове, дебагер на брейкпойнте), держит её часами — и тормозит VACUUM, удерживает row-locks, копит WAL. Это самая частая «тихая» проблема в проде.",
    examples: [
      "-- защита кластера от спящих транзакций:\nALTER SYSTEM SET idle_in_transaction_session_timeout = '5min';\nALTER SYSTEM SET statement_timeout = '30s';\nALTER SYSTEM SET lock_timeout = '5s';\nSELECT pg_reload_conf();",
      "-- найти текущих «спящих в транзакции»:\nSELECT pid, usename, application_name, client_addr,\n       state, age(now(), xact_start) AS xact_age,\n       query\nFROM   pg_stat_activity\nWHERE  state = 'idle in transaction'\n   AND xact_start < now() - interval '1 min'\nORDER  BY xact_start;",
      "-- грохнуть зависшую транзакцию:\nSELECT pg_cancel_backend(12345);    -- мягкая отмена текущего запроса\nSELECT pg_terminate_backend(12345); -- разорвать соединение",
      "-- хорошая практика — приложение задаёт application_name:\nSET application_name = 'migration-runner';\n-- видно в pg_stat_activity, в логах, в pg_stat_statements"
    ],
    pitfalls: [
      "idle in transaction ≠ idle. Первое — открытая транзакция без активного запроса, опасно. Второе — закрытое соединение, нормально",
      "idle_in_transaction_session_timeout появился в PG 9.6. До него — только мониторить и убивать вручную",
      "Глобальный statement_timeout — палка о двух концах: чинит запросы, но может прибить миграцию посередине. Лучше per-сессия / per-роль",
      "lock_timeout без SET LOCAL живёт всю сессию — pgbouncer + transaction-режим может потерять, потому что сбрасывает на DISCARD ALL",
      "Длинная транзакция в PgBouncer transaction-pooling-режиме = занят серверный коннект до её конца. Это утечка соединений"
    ],
    learningGoals: [
      "настраивать idle_in_transaction_session_timeout / statement_timeout / lock_timeout",
      "находить долгие транзакции через pg_stat_activity",
      "понимать, почему длинные транзакции тормозят VACUUM"
    ],
    relatedTopics: ["sr-pg-locks-waits", "sr-mvcc-snapshot", "sr-wraparound-freeze", "cfg-max-connections", "sr-pgbouncer"]
  },

  "sr-toast": {
    title: "TOAST и сжатие значений",
    summary: "Когда значение в строке больше 2 КБ, Postgres хранит его не в основной таблице, а в TOAST-таблице — обычно сжатым. Это работает «само», пока ты не упрёшься в его цену: TOAST-чтение медленнее обычного, и сжатие выбирается по умолчанию (с PG 14 можно lz4).",
    examples: [
      "-- TOAST-таблица создаётся автоматически для любой таблицы\n-- с varlena-полями (text, jsonb, bytea, arrays).\nSELECT c.relname AS table_name,\n       t.relname AS toast_name,\n       pg_size_pretty(pg_relation_size(c.oid)) AS heap,\n       pg_size_pretty(pg_relation_size(t.oid)) AS toast\nFROM   pg_class c\nJOIN   pg_class t ON t.oid = c.reltoastrelid\nWHERE  c.relname = 'docs';",
      "-- стратегия хранения колонки:\nSELECT attname, attstorage\nFROM   pg_attribute\nWHERE  attrelid = 'docs'::regclass AND attnum > 0;\n-- p (plain)    — не TOAST'ить\n-- e (external) — TOAST'ить, не сжимать\n-- m (main)     — сжимать, но в основной таблице\n-- x (extended) — сжимать + TOAST'ить (по умолчанию для varlena)\n\nALTER TABLE docs ALTER COLUMN body SET STORAGE EXTERNAL;",
      "-- алгоритм сжатия (PG 14+):\nALTER TABLE docs ALTER COLUMN body SET COMPRESSION lz4;\nALTER SYSTEM SET default_toast_compression = 'lz4';\n-- pglz — старый дефолт, безопасный\n-- lz4  — быстрее декомпрессии в 2–3 раза, сравнимая степень сжатия",
      "-- увидеть, что лежит в TOAST:\nSELECT pg_column_size(body) AS stored_bytes,\n       octet_length(body)  AS uncompressed\nFROM   docs LIMIT 5;"
    ],
    pitfalls: [
      "Любая выборка TOAST-поля = JOIN с TOAST-таблицей по неявному idx. Если в выборке тонна крупных jsonb/text — это I/O-боттлнек, скрытый от тебя",
      "SET STORAGE EXTERNAL отключает сжатие — полезно, когда данные уже сжаты (картинки, gzip-blob)",
      "lz4 доступен только если Postgres собран с поддержкой (--with-lz4). Managed-облака обычно поддерживают",
      "Старые строки в lz4 не пересжимаются — нужно UPDATE или pg_repack. Новые INSERT/UPDATE — да",
      "pg_column_size возвращает сжатый размер; octet_length — несжатый. Разница и есть выигрыш от компрессии"
    ],
    learningGoals: [
      "понимать, что TOAST — отдельная таблица, и видеть её размер",
      "выбирать стратегию хранения (plain/external/main/extended)",
      "знать разницу pglz vs lz4 и когда переключаться"
    ],
    relatedTopics: ["types-jsonb", "types-bytea", "sr-bloat"]
  },

  "sr-bloat": {
    title: "Bloat и pg_repack",
    summary: "Bloat — это не dead tuples (их убирает VACUUM), а пустые слоты в страницах, которые VACUUM не возвращает в ФС. Если 50% таблицы — пустота, индексы тоже распухли, чтения дороже. Чистится через VACUUM FULL или pg_repack/pg_squeeze.",
    examples: [
      "-- pgstattuple: точное измерение bloat (без эвристик):\nCREATE EXTENSION IF NOT EXISTS pgstattuple;\n\nSELECT * FROM pgstattuple('orders');\n-- table_len, tuple_count, dead_tuple_count, free_space, free_percent\n\nSELECT * FROM pgstattuple_approx('orders');  -- быстрее, без полного скана",
      "-- bloat в индексах:\nSELECT * FROM pgstatindex('idx_orders_user_created');\n-- leaf_pages, internal_pages, empty_pages, avg_leaf_density",
      "-- pg_repack — упаковать без блокировки записи:\n-- (требует расширения pg_repack + утилиту-клиент)\npg_repack -d app -t orders --jobs=4\npg_repack -d app --no-superuser-check --index idx_orders_user_created",
      "-- VACUUM FULL — тоже упаковывает, но БЛОКИРУЕТ таблицу полностью\n-- (ACCESS EXCLUSIVE). Только в окно обслуживания:\nVACUUM (FULL, VERBOSE) orders;"
    ],
    pitfalls: [
      "Bloat растёт там, где много UPDATE/DELETE и HOT не работает. Лечится не VACUUM, а VACUUM FULL / pg_repack",
      "VACUUM FULL = ACCESS EXCLUSIVE = блокирует таблицу под чтение и запись. На проде — только pg_repack",
      "pg_repack делает копию таблицы, пишет туда параллельно через триггер, потом меняет местами. Нужен дополнительный диск ≈ размер таблицы",
      "После pg_repack индексы тоже перепакованы. Если репликация streaming — реплика тоже получит",
      "Эвристики bloat (вроде check_postgres.pl или query из вики) — приблизительные. Для точных цифр — pgstattuple"
    ],
    learningGoals: [
      "отличать dead tuples от bloat",
      "измерять bloat через pgstattuple",
      "применять pg_repack без даунтайма"
    ],
    relatedTopics: ["vacuum-basic", "sr-hot-updates", "sr-wraparound-freeze", "sr-index-concurrently"]
  },

  "sr-wraparound-freeze": {
    title: "Transaction wraparound и VACUUM FREEZE",
    summary: "Postgres нумерует транзакции 32-битным xid; когда счётчик пробегает по кругу, БД остановится, чтобы не потерять данные. FREEZE — операция, которая помечает старые строки как «вечные» и сдвигает дедлайн.",
    examples: [
      "-- сколько xid осталось до wraparound у твоей БД:\nSELECT datname,\n       age(datfrozenxid) AS xid_age,\n       2^31 - age(datfrozenxid) AS xid_left\nFROM   pg_database\nORDER  BY xid_age DESC;",
      "-- какие таблицы ближе всех к freeze-лимиту:\nSELECT relname,\n       age(relfrozenxid) AS xid_age,\n       pg_size_pretty(pg_table_size(oid)) AS size\nFROM   pg_class\nWHERE  relkind IN ('r','t','m') AND age(relfrozenxid) > 100000000\nORDER  BY age(relfrozenxid) DESC\nLIMIT  20;",
      "-- ускорить freeze на горячих таблицах:\nALTER TABLE events SET (autovacuum_freeze_max_age = 200000000);\nVACUUM (FREEZE, VERBOSE) events;\n\n-- глобальные ручки:\nSHOW autovacuum_freeze_max_age;  -- по умолчанию 200M\nSHOW vacuum_freeze_min_age;      -- 50M",
      "-- аварийный режим — Postgres перешёл в read-only:\n-- ERROR:  database is not accepting commands to avoid wraparound data loss\n-- Решение: подключиться single-user-mode и сделать VACUUM FREEZE\n-- postgres --single -D /var/lib/postgresql/16/main app\n-- backend> VACUUM FREEZE;"
    ],
    pitfalls: [
      "Long-running transaction = freeze не двигается. Активная транзакция держит xid_horizon, и autovacuum не может пометить более новые tuples как замороженные",
      "VACUUM FREEZE может занять часы на крупных таблицах; запускать в окне обслуживания или через VACUUM (FREEZE, FAST = true) на PG 16+",
      "При приближении к 1B (миллиард) xid Postgres начинает кричать в логах. К 2B — переводит БД в read-only. Игнорить нельзя",
      "autovacuum_freeze_max_age на write-heavy таблицах часто стоит снизить, чтобы freeze шёл регулярно, а не одним большим всплеском"
    ],
    learningGoals: [
      "понимать, зачем существует FREEZE и почему он нужен",
      "мониторить age(datfrozenxid) и age(relfrozenxid)",
      "знать порядок действий при приближении к wraparound"
    ],
    relatedTopics: ["vacuum-basic", "cfg-autovacuum", "sr-mvcc-snapshot", "sr-idle-in-transaction"]
  },

  "sr-hot-updates": {
    title: "HOT-updates и FILLFACTOR",
    summary: "UPDATE в Postgres = INSERT нового tuple + пометка старого как мёртвого. HOT-update — оптимизация, при которой Postgres держит цепочку в одной странице и не трогает индексы. Это то, что превращает «write-heavy таблицу» из «постоянная боль» в «нормально работает».",
    examples: [
      "-- условие HOT: (1) обновляемые колонки не входят ни в один индекс,\n--               (2) на странице есть место под новый tuple.\n-- освободить место помогает fillfactor — оставляем зазор при INSERT:\nCREATE TABLE counters (\n  id    bigint PRIMARY KEY,\n  value bigint NOT NULL,\n  ts    timestamptz NOT NULL DEFAULT now()\n) WITH (fillfactor = 70);\n\n-- для существующей таблицы:\nALTER TABLE counters SET (fillfactor = 70);\n-- старые страницы перепакуются на REINDEX/VACUUM FULL/pg_repack.",
      "-- посчитать долю HOT-апдейтов:\nSELECT relname,\n       n_tup_upd      AS total_upd,\n       n_tup_hot_upd  AS hot_upd,\n       round(100.0 * n_tup_hot_upd / NULLIF(n_tup_upd, 0), 1) AS hot_pct\nFROM   pg_stat_user_tables\nORDER  BY n_tup_upd DESC\nLIMIT  20;",
      "-- индекс убил HOT? Посмотри, какие колонки он покрывает:\nSELECT i.indexrelid::regclass AS index,\n       array_agg(a.attname ORDER BY x.ordinality) AS cols\nFROM   pg_index i\nJOIN   pg_class c ON c.oid = i.indrelid\nJOIN   unnest(i.indkey) WITH ORDINALITY x(attnum, ordinality) ON true\nJOIN   pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = x.attnum\nWHERE  c.relname = 'counters'\nGROUP  BY i.indexrelid;"
    ],
    pitfalls: [
      "Любой индекс на обновляемой колонке = HOT отключён для этого UPDATE; цепочка tuples будет ходить по индексам, индексы пухнут",
      "fillfactor 100 (по умолчанию) = места под HOT нет, write-heavy таблица сразу теряет HOT. Для write-heavy счётчиков — 70–80",
      "fillfactor применяется только к НОВЫМ страницам; для старых нужен VACUUM FULL или pg_repack, и оба требуют ACCESS EXCLUSIVE",
      "Для индекса fillfactor по умолчанию 90 — не путать с табличным"
    ],
    learningGoals: [
      "видеть долю HOT-апдейтов в pg_stat_user_tables",
      "подбирать fillfactor под write-нагрузку",
      "понимать, почему «лишний индекс» — это не бесплатно"
    ],
    relatedTopics: ["sr-mvcc-snapshot", "sr-bloat", "sr-index-concurrently", "vacuum-basic"]
  },

  "sr-statistics-target": {
    title: "Статистика и default_statistics_target",
    summary: "ANALYZE строит гистограммы распределения значений в колонках, и от их детальности зависит, насколько точно планировщик угадает количество строк. Слишком грубо → плохие планы; слишком детально → ANALYZE тормозит.",
    examples: [
      "-- глобальный дефолт (100). Для крупных таблиц или горячих колонок поднимают до 500–1000:\nSHOW default_statistics_target;\nALTER SYSTEM SET default_statistics_target = 200;\nSELECT pg_reload_conf();",
      "-- per-column настройка — точечно там, где планировщик ошибается:\nALTER TABLE orders ALTER COLUMN status SET STATISTICS 1000;\nANALYZE orders;\n\n-- посмотреть, что лежит в статистике:\nSELECT attname, n_distinct, most_common_vals, most_common_freqs\nFROM   pg_stats\nWHERE  tablename = 'orders' AND attname = 'status';",
      "-- если планировщик путается на коррелирующих колонках (city + zip):\nCREATE STATISTICS s_orders_geo (dependencies, ndistinct)\n  ON city, zip FROM orders;\nANALYZE orders;",
      "-- ручной ANALYZE после большой загрузки:\nANALYZE VERBOSE orders;     -- обновит статистику конкретной таблицы\nVACUUM ANALYZE orders;      -- VACUUM + ANALYZE одной командой"
    ],
    pitfalls: [
      "После массовой загрузки (COPY, restore) обязательно ANALYZE — autovacuum дойдёт через минуты, а до этого планировщик слепой",
      "Поднять default_statistics_target до 1000 глобально — выстрел в ногу: ANALYZE станет долгим, pg_statistic распухнет",
      "n_distinct в pg_stats иногда неточен (отрицательное значение — отношение к числу строк, не абсолют). Можно зафиксировать вручную: ALTER COLUMN … SET (n_distinct = ...)",
      "Расширенная статистика (CREATE STATISTICS) — единственный способ сказать планировщику «эти колонки коррелируют»"
    ],
    learningGoals: [
      "понимать связь default_statistics_target и качества планов",
      "лечить мисс-эстимейт через SET STATISTICS и CREATE STATISTICS",
      "знать, когда нужен ручной ANALYZE"
    ],
    relatedTopics: ["analyze", "stats-extended", "selectivity", "sr-explain-deep"]
  },

  "sr-parallel-query": {
    title: "Параллельные планы",
    summary: "С PG 9.6 один запрос может использовать несколько CPU. Это бесплатно для аналитики, бесполезно для OLTP и иногда вредно при перегрузке.",
    examples: [
      "-- основные ручки:\nSHOW max_parallel_workers;            -- бюджет на весь кластер\nSHOW max_parallel_workers_per_gather; -- максимум на один запрос\nSHOW min_parallel_table_scan_size;    -- ниже этого порога parallel не включится\nSHOW parallel_setup_cost;             -- штраф за запуск воркеров",
      "-- посмотреть, что планировщик решил параллелить:\nEXPLAIN (ANALYZE, VERBOSE)\nSELECT user_id, sum(total)\nFROM   orders\nWHERE  created_at >= now() - interval '30 days'\nGROUP  BY user_id;\n-- ищи в плане: Gather, Parallel Seq Scan, Parallel Hash Join, Workers Launched",
      "-- временно отключить для конкретного запроса:\nSET LOCAL max_parallel_workers_per_gather = 0;\nSELECT ...;",
      "-- расширить под аналитический отчёт:\nSET LOCAL max_parallel_workers_per_gather = 4;\nSET LOCAL parallel_tuple_cost = 0.01;\nSELECT ...;"
    ],
    pitfalls: [
      "OLTP-запросы (точечный SELECT по PK) параллелизм только замедляет — стоимость запуска воркеров больше выигрыша",
      "Parallel-aware узлы НЕ все: триггеры, функции с VOLATILE, CTE-MATERIALIZED, CURSOR — отрубают параллелизм",
      "Worker process = отдельное соединение к Postgres. На занятом кластере параллелизм быстро упирается в max_worker_processes",
      "Workers Launched: 0 в EXPLAIN — планировщик решил параллелить, но мест не нашлось. Не путать с «не хотел»"
    ],
    learningGoals: [
      "включать/выключать параллелизм для конкретного запроса",
      "читать Gather / Parallel Seq Scan в EXPLAIN",
      "оценивать, окупится ли параллелизм для конкретной нагрузки"
    ],
    relatedTopics: ["sr-explain-deep", "sr-planner-knobs", "sr-pg-stat-statements"]
  },

  "sr-wal-checkpoints": {
    title: "WAL и контрольные точки",
    summary: "Каждое изменение сначала пишется в WAL (write-ahead log), и только потом разрешён COMMIT. Без понимания этого нельзя ни тюнить запись, ни читать графики I/O.",
    examples: [
      "SHOW wal_level;          -- minimal / replica / logical\nSHOW checkpoint_timeout; -- частота автоматических чекпойнтов\nSHOW max_wal_size;       -- мягкий лимит, после которого чекпойнт срабатывает раньше",
      "-- настройки записи WAL\nALTER SYSTEM SET wal_compression = on;       -- сжатие full-page writes\nALTER SYSTEM SET checkpoint_timeout = '15min';\nALTER SYSTEM SET max_wal_size = '8GB';\nALTER SYSTEM SET checkpoint_completion_target = 0.9;\nSELECT pg_reload_conf();",
      "-- архивация WAL (для PITR и реплик)\nALTER SYSTEM SET archive_mode = on;\nALTER SYSTEM SET archive_command = 'pgbackrest --stanza=main archive-push %p';\n-- посмотреть текущий LSN и сколько WAL накоплено:\nSELECT pg_current_wal_lsn(),\n       pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), '0/0')) AS wal_total;",
      "-- стрим WAL с реплики или backup-узла:\npg_receivewal -h primary -U replicator -D /backup/wal --slot=wal_receiver"
    ],
    pitfalls: [
      "Чекпойнт пишет ВСЕ грязные страницы на диск — это пик I/O. Слишком частые чекпойнты убивают пропускную способность; слишком редкие — увеличивают время recovery после сбоя",
      "Full-page writes: первое изменение страницы после чекпойнта пишется в WAL целиком, не дельтой. wal_compression сжимает эти страницы — на HDD-проде даёт +20–30% TPS бесплатно",
      "wal_keep_size без слотов: если реплика отстаёт и старый WAL ротировался — реплика навсегда сломалась и нужен basebackup заново. С replication slot — primary не выкинет WAL, но рискует забить диск",
      "archive_command должен быть НАДЁЖНЫМ: если он падает, Postgres хранит WAL и в итоге останавливает запись. Простой rsync без --partial может оставить полуфайл"
    ],
    learningGoals: [
      "читать pg_stat_bgwriter и понимать частоту чекпойнтов",
      "настраивать checkpoint_timeout / max_wal_size без всплесков I/O",
      "выбирать между wal_keep_size и replication slot"
    ],
    relatedTopics: ["sr-explain-deep", "sr-replication", "sr-backup-pitr", "cfg-checkpoint", "cfg-wal-level"]
  },

  "sr-pg-locks-waits": {
    title: "pg_locks и wait events",
    summary: "Кто кого ждёт и почему. Классы блокировок от AccessShare (SELECT) до AccessExclusive (DROP/ALTER), и pg_stat_activity.wait_event как первый шаг диагностики «всё тормозит».",
    examples: [
      "-- кто что держит и кто чего ждёт прямо сейчас:\nSELECT a.pid, a.usename, a.state, a.wait_event_type, a.wait_event,\n       a.query, age(now(), a.xact_start) AS xact_age,\n       l.mode, l.relation::regclass, l.granted\nFROM   pg_stat_activity a\nLEFT JOIN pg_locks l ON l.pid = a.pid\nWHERE  a.state <> 'idle' OR l.pid IS NOT NULL\nORDER  BY a.xact_start NULLS LAST;",
      "-- классическая цепочка блокировок (кто кого блокирует):\nSELECT blocked.pid AS blocked_pid,\n       blocked.query AS blocked_query,\n       blocking.pid AS blocking_pid,\n       blocking.query AS blocking_query\nFROM   pg_stat_activity blocked\nJOIN   pg_stat_activity blocking ON blocking.pid = ANY(pg_blocking_pids(blocked.pid))\nWHERE  blocked.wait_event_type = 'Lock';",
      "-- защита от мёртвых блокировок:\nSET LOCAL lock_timeout = '2s';        -- падать, если не получил лок за 2 сек\nSET LOCAL deadlock_timeout = '500ms'; -- как часто проверять deadlock\nSET LOCAL statement_timeout = '30s';  -- ограничить весь запрос"
    ],
    pitfalls: [
      "AccessExclusive (DROP, ALTER без CONCURRENTLY, VACUUM FULL) блокирует ВСЁ — даже SELECT — выстраивая за собой очередь. Под нагрузкой это инцидент",
      "Long-running transaction = пробка: держит row-locks и не даёт VACUUM убирать мёртвые tuples. Идём через pg_stat_activity по xact_start",
      "Wait event ≠ блокировка строки. ClientRead — ждём от клиента, LWLock:BufferContent — внутренний лок Postgres, IO:DataFileRead — диск. Тип проблемы разный",
      "lock_timeout без SET LOCAL — настройка сессии; чаще ставят на отдельный мигратор, а не глобально"
    ],
    learningGoals: [
      "читать pg_locks и связку через pg_blocking_pids",
      "отличать row-level lock от relation-level и от wait_event",
      "пользоваться lock_timeout / statement_timeout для миграций"
    ],
    relatedTopics: ["locks", "sr-mvcc-snapshot", "sr-advisory-locks", "err-deadlock"]
  },

  "sr-mvcc-snapshot": {
    title: "MVCC и снимки",
    summary: "xmin/xmax, видимость строк, snapshot isolation.",
    examples: [
      "SELECT xmin, xmax, * FROM users WHERE id = 1;",
      "SELECT txid_current(), pg_current_snapshot();"
    ],
    pitfalls: [
      "Долгая транзакция блокирует уборку — растёт bloat",
      "В REPEATABLE READ снимок берётся один раз и всё видно «как было»",
      "В READ COMMITTED каждый запрос получает свой снимок"
    ],
    learningGoals: [
      "понимать, как Postgres решает «видна ли строка»",
      "связывать долгие транзакции и bloat"
    ],
    relatedTopics: ["iso-summary", "vacuum-basic"]
  },
  "sr-advisory-locks": {
    title: "Advisory locks",
    summary: "Прикладные блокировки на произвольные ключи.",
    examples: [
      "SELECT pg_try_advisory_xact_lock(hashtext('cron:nightly'));",
      "SELECT pg_advisory_unlock(42);"
    ],
    pitfalls: [
      "advisory_xact — снимаются автоматически в конце транзакции, _lock — вручную",
      "Удобно для leader-election и idempotent cron",
      "Ключ — bigint; для строки используют hashtext()"
    ],
    learningGoals: [
      "обеспечить «один воркер на задачу»",
      "не переусложнять там, где хватает уникального индекса"
    ],
    relatedTopics: ["locks", "sr-outbox"]
  },
  "sr-listen-notify": {
    title: "LISTEN / NOTIFY",
    summary: "Лёгкая шина событий прямо в Postgres: одна сессия делает NOTIFY, другие через LISTEN получают уведомления. Хорошо для cache-invalidation, плохо для гарантированной доставки.",
    examples: [
      "LISTEN order_created;",
      "NOTIFY order_created, '{\"id\": 42}';",
      "-- в приложении: pg-драйвер сам читает уведомления"
    ],
    pitfalls: [
      "Сообщения не сохраняются — пропустил подключение, пропустил событие",
      "Не подходит для гарантированной доставки",
      "Полезно для cache-invalidation и dev-инструментов"
    ],
    learningGoals: [
      "выбирать NOTIFY vs очередь",
      "понимать ограничения доставки"
    ],
    relatedTopics: ["sr-outbox"]
  },
  "sr-outbox": {
    title: "Транзакционный outbox",
    summary: "Атомарность бизнес-операции и публикации события.",
    examples: [
      "BEGIN;\n  INSERT INTO orders (...) VALUES (...) RETURNING id;\n  INSERT INTO outbox (topic, payload) VALUES ('order_created', $1);\nCOMMIT;\n-- отдельный воркер читает outbox с FOR UPDATE SKIP LOCKED и публикует наружу"
    ],
    pitfalls: [
      "Без outbox двойная запись (БД + брокер) даёт рассинхрон при падении",
      "Воркер должен быть идемпотентным — события могут повторяться",
      "Чисти outbox: партиции по дате или TTL"
    ],
    learningGoals: [
      "решать «atomic publish» без распределённых транзакций",
      "проектировать идемпотентного потребителя"
    ],
    relatedTopics: ["sr-listen-notify", "sr-advisory-locks"]
  },

  "sr-zero-downtime-migrations": {
    title: "Безопасные миграции без даунтайма",
    summary: "Паттерн expand/contract: код и схема меняются последовательно.",
    examples: [
      "-- 1. expand: добавляем новый столбец и пишем в оба\nALTER TABLE users ADD COLUMN email_norm text;\n\n-- 2. backfill маленькими батчами\nUPDATE users SET email_norm = lower(email)\nWHERE  id BETWEEN $1 AND $2 AND email_norm IS NULL;\n\n-- 3. constraint NOT VALID, потом VALIDATE\nALTER TABLE users\n  ADD CONSTRAINT users_email_norm_nn CHECK (email_norm IS NOT NULL) NOT VALID;\nALTER TABLE users VALIDATE CONSTRAINT users_email_norm_nn;\n\n-- 4. contract: код переходит на email_norm, старый столбец дропается"
    ],
    pitfalls: [
      "ALTER TABLE ... SET NOT NULL без NOT VALID/VALIDATE может надолго заблокировать таблицу",
      "Длинные ACCESS EXCLUSIVE-блокировки выстраивают очередь — все запросы ждут",
      "Большие backfill-ы делай батчами, иначе раздуется WAL и лаг репликации"
    ],
    learningGoals: [
      "выкатывать миграции без окон обслуживания",
      "не превращать ALTER в инцидент"
    ],
    relatedTopics: ["alter-table", "sr-pgbouncer"]
  },
  "sr-partitioning": {
    title: "Декларативное партиционирование",
    summary: "PARTITION BY RANGE/LIST/HASH для очень больших таблиц.",
    examples: [
      "CREATE TABLE events (\n  id  bigint GENERATED ALWAYS AS IDENTITY,\n  ts  timestamptz NOT NULL,\n  data jsonb\n) PARTITION BY RANGE (ts);\n\nCREATE TABLE events_2026_05 PARTITION OF events\n  FOR VALUES FROM ('2026-05-01') TO ('2026-06-01');"
    ],
    pitfalls: [
      "PRIMARY KEY должен включать столбец секционирования",
      "Удобно дропать партицию целиком (моментально), вместо DELETE",
      "Локальные индексы у каждой партиции — следи за их количеством"
    ],
    learningGoals: [
      "решать, нужна ли таблице секционность",
      "проектировать ключ секционирования под запросы"
    ],
    relatedTopics: ["create-index-btree", "sr-replication"]
  },
  "sr-replication": {
    title: "Репликация: streaming и logical",
    summary: "Read-replica, failover, логические подписки.",
    examples: [
      "-- streaming (физическая):\n-- основная: wal_level=replica, max_wal_senders, slot_name\n-- реплика: pg_basebackup или pg_basebackup --slot\n\n-- логическая:\nCREATE PUBLICATION app_pub FOR TABLE orders, users;\nCREATE SUBSCRIPTION app_sub\n  CONNECTION 'host=primary dbname=app user=repl' PUBLICATION app_pub;"
    ],
    pitfalls: [
      "hot_standby_feedback избавляет от ошибок recovery, но тормозит уборку на primary",
      "Логическая репликация не передаёт DDL — миграции применяй на обеих сторонах",
      "Кворум синхронной репликации повышает надёжность, но снижает доступность"
    ],
    learningGoals: [
      "выбирать тип репликации под задачу",
      "видеть лаг и его причины"
    ],
    relatedTopics: ["sr-physical-vs-logical", "sr-sync-async", "sr-replication-slots", "sr-failover"]
  },
  "sr-pgbouncer": {
    title: "PgBouncer и пулы соединений",
    summary: "Pool modes: session, transaction, statement.",
    examples: [
      "; pgbouncer.ini\n[databases]\napp = host=127.0.0.1 dbname=app\n\n[pgbouncer]\npool_mode = transaction\nmax_client_conn = 5000\ndefault_pool_size = 20"
    ],
    pitfalls: [
      "В transaction-mode нельзя пользоваться сессионными возможностями (prepared statements, LISTEN, SET) без оговорок",
      "max_connections в Postgres надо держать ≈ default_pool_size × числу пулов",
      "Без пула 1000+ клиентов уронят сервер по памяти"
    ],
    learningGoals: [
      "выбирать pool_mode осознанно",
      "проектировать ёмкость по подключениям"
    ],
    relatedTopics: ["cfg-max-connections", "sr-app-orm"]
  },
  "sr-backup-pitr": {
    title: "Бэкапы и PITR",
    summary: "pg_dump vs pg_basebackup vs WAL-архивирование.",
    examples: [
      "pg_dump -Fc -f /backup/app.dump app",
      "pg_basebackup -D /backup/base -X stream -P -R",
      "# pgBackRest / WAL-G — продакшн-инструменты для PITR"
    ],
    pitfalls: [
      "pg_dump — логический бэкап одной БД, не годится для крупных кластеров",
      "Для PITR нужен непрерывный архив WAL и базовая копия",
      "Регулярно проверяй восстановление, а не только наличие бэкапа"
    ],
    learningGoals: [
      "выбирать стратегию резервирования",
      "понимать RTO/RPO"
    ],
    relatedTopics: ["sr-pgdump-formats", "sr-pgrestore-parallel", "sr-pgbackrest-walg", "sr-recovery-checklist"]
  },

  "sr-rls": {
    title: "Row-Level Security",
    summary: "Row-Level Security — фильтры доступа на уровне строк, прозрачные для приложения. Основа multi-tenant: один и тот же SELECT * FROM documents у разных арендаторов вернёт разное.",
    examples: [
      "ALTER TABLE documents ENABLE ROW LEVEL SECURITY;\n\nCREATE POLICY tenant_isolation ON documents\n  USING (tenant_id = current_setting('app.tenant_id')::bigint);\n\n-- из приложения перед запросами:\nSET app.tenant_id = '42';"
    ],
    pitfalls: [
      "Суперпользователь и владелец таблицы обходят RLS — нужен FORCE ROW LEVEL SECURITY",
      "USING vs WITH CHECK: первое для чтения, второе для записи",
      "Плохо написанная политика убивает план запроса"
    ],
    learningGoals: [
      "реализовать multi-tenant изоляцию на уровне БД",
      "тестировать политики обеими ролями"
    ],
    relatedTopics: ["sr-security-definer", "sec-grant-patterns"]
  },
  "sr-security-definer": {
    title: "Безопасные функции SECURITY DEFINER",
    summary: "Функции, выполняющиеся от имени владельца.",
    examples: [
      "CREATE OR REPLACE FUNCTION audit_log(text)\nRETURNS void\nLANGUAGE sql\nSECURITY DEFINER\nSET search_path = pg_catalog, public\nAS $$\n  INSERT INTO audit (msg, who, ts) VALUES ($1, current_user, now());\n$$;"
    ],
    pitfalls: [
      "Без SET search_path вызывающий может подменить функцию через свою схему — классический вектор атаки",
      "Оставляй EXECUTE только нужным ролям",
      "Не делай SECURITY DEFINER там, где хватает обычной функции"
    ],
    learningGoals: [
      "писать безопасные привилегированные функции",
      "понимать риск search_path-инъекций"
    ],
    relatedTopics: ["sr-rls", "sec-grant-revoke", "raise-using"]
  },
  "sr-prepared-statements": {
    title: "Prepared statements и SQL-инъекции",
    summary: "PREPARE + EXECUTE: параметризованный SQL. Одновременно защита от инъекций (значение не клеится в текст запроса) и переиспользование плана между вызовами.",
    examples: [
      "PREPARE p (bigint) AS SELECT * FROM orders WHERE user_id = $1;\nEXECUTE p (42);\nDEALLOCATE p;",
      "-- В приложении используй placeholders драйвера, никогда не клей строки SQL"
    ],
    pitfalls: [
      "Конкатенация строк в SQL = риск инъекции",
      "После 5 EXECUTE планировщик может перейти на generic plan — иногда хуже custom",
      "В transaction-mode PgBouncer prepared-statements ломаются (нужен server-side prepared с PgBouncer ≥ 1.21)"
    ],
    learningGoals: [
      "понимать стоимость generic vs custom plan",
      "избегать инъекций на уровне кода"
    ],
    relatedTopics: ["dynamic-sql", "sr-rls"]
  },

  "sr-fulltext": {
    title: "Полнотекстовый поиск",
    summary: "Полнотекстовый поиск в Postgres: tsvector хранит «слова», tsquery — запрос, GIN-индекс ищет за миллисекунды. Часто заменяет Elasticsearch.",
    examples: [
      "ALTER TABLE articles ADD COLUMN tsv tsvector\n  GENERATED ALWAYS AS (to_tsvector('russian', coalesce(title,'') || ' ' || coalesce(body,''))) STORED;\n\nCREATE INDEX idx_articles_tsv ON articles USING gin (tsv);\n\nSELECT id, ts_rank(tsv, q) AS rank\nFROM   articles, plainto_tsquery('russian', $1) q\nWHERE  tsv @@ q\nORDER  BY rank DESC\nLIMIT  20;"
    ],
    pitfalls: [
      "Конфигурация словарей зависит от языка — 'russian' и 'english' дают разные результаты",
      "Для подстрочного поиска нужен pg_trgm, а не FTS",
      "На больших объёмах рассмотри Meilisearch/Elastic"
    ],
    learningGoals: [
      "решить, хватает ли FTS Postgres",
      "строить индексы под запросы"
    ],
    relatedTopics: ["sr-pg-trgm", "gin-index"]
  },
  "sr-pg-trgm": {
    title: "pg_trgm — нечёткий и подстрочный поиск",
    summary: "LIKE '%foo%' и similarity() с GIN/GiST индексом.",
    examples: [
      "CREATE EXTENSION IF NOT EXISTS pg_trgm;\nCREATE INDEX idx_users_email_trgm ON users USING gin (email gin_trgm_ops);\n\nSELECT * FROM users WHERE email ILIKE '%example%';\nSELECT *, similarity(name, $1) FROM users ORDER BY similarity DESC LIMIT 10;"
    ],
    pitfalls: [
      "GIN trgm-индекс крупный — следи за размером",
      "similarity медленнее равенства — не пихай в горячий путь без причины"
    ],
    learningGoals: [
      "ускорять LIKE/ILIKE",
      "выбирать GIN vs GiST для trgm"
    ],
    relatedTopics: ["sr-fulltext", "gin-index"]
  },

  "sr-app-orm": {
    title: "Postgres из приложения: ORM vs raw SQL",
    summary: "ORM удобен для CRUD, но молча генерирует N+1 на любой связи и плохо переводит сложные отчёты. Главный навык — видеть, где он мешает.",
    examples: [
      "-- N+1: ORM генерит по одному SELECT на каждую сущность\n-- решение: include/eager-load или ручной JOIN\n\n-- raw SQL уместен для отчётов, оконок, CTE, EXPLAIN-чувствительных мест"
    ],
    pitfalls: [
      "Lazy-loading без знаний драйвера = N+1",
      "ORM прячет, какие именно SQL уходят — включай логирование",
      "Не пиши через ORM то, что в SQL короче и яснее"
    ],
    learningGoals: [
      "распознавать N+1",
      "проектировать слой данных под смешанный подход"
    ],
    relatedTopics: ["sr-observability", "sr-pgbouncer", "json-agg-vs-orm"]
  },
  "sr-observability": {
    title: "Наблюдаемость PostgreSQL",
    summary: "Что мониторить со стороны БД: pg_stat_database, pg_stat_statements, slow log, ожидания блокировок, лаг репликации. Без этих метрик инциденты разбираются вслепую.",
    examples: [
      "SELECT datname, numbackends, xact_commit, xact_rollback,\n       blks_read, blks_hit, deadlocks\nFROM   pg_stat_database\nORDER  BY datname;",
      "ALTER SYSTEM SET log_min_duration_statement = '500ms';",
      "ALTER SYSTEM SET log_lock_waits = on;"
    ],
    pitfalls: [
      "Логи с PII — следи за тем, что попадает в slow-log",
      "log_lock_waits помогает увидеть очереди блокировок",
      "Метрики без алертов бесполезны"
    ],
    learningGoals: [
      "видеть здоровье БД одним взглядом",
      "ставить осмысленные алерты"
    ],
    relatedTopics: ["sr-pg-stat-statements", "sr-app-orm"]
  },

  "err-role-exists": {
    title: "Ошибка: role \"X\" already exists / does not exist",
    summary: "Конфликт имени роли или попытка обратиться к несуществующей роли.",
    examples: [
      "CREATE ROLE app_user LOGIN PASSWORD 'secret';",
      "DROP ROLE IF EXISTS app_user;"
    ],
    pitfalls: [
      "Прежде чем DROP ROLE, нужно отозвать права и переназначить владение объектами",
      "REASSIGN OWNED и DROP OWNED помогут с зачисткой"
    ],
    learningGoals: [
      "удалять роли без следов",
      "знать REASSIGN OWNED / DROP OWNED"
    ]
  },

  // ===== Итерация 1: Основы, установка, типы =====

  // --- basics.html ---
  "why-dbms": {
    title: "Зачем нам СУБД",
    summary: "Чем СУБД отличается от файлов и почему это удобнее, чем «хранить всё в JSON».",
    examples: [
      "Сценарий: 100 пользователей одновременно покупают последний товар. Без СУБД нужен лок на файл, обработка очереди и страх потери данных при крэше. С СУБД — UPDATE products SET in_stock = in_stock - 1 WHERE id = $1 AND in_stock > 0 RETURNING id; и одна транзакция за неуспешные.",
      "Сравни «папка с CSV» и таблица: добавить новую колонку в CSV — переписать все строки, индекс отсутствует, поиск — full scan; в БД — ALTER TABLE добавляет колонку метаданно за миллисекунды и индекс создаётся отдельно.",
      "Гарантии, которые даёт СУБД и которые сами не появятся: атомарность транзакций, согласованность, изоляция параллельных операций, восстановление после сбоя, контроль типов и ограничений."
    ],
    pitfalls: [
      "Файлы не дают конкурентного доступа без блокировок",
      "Самописное хранилище сложно сделать ACID-надёжным",
      "Поиск без индекса = чтение всего файла"
    ],
    learningGoals: [
      "перечислять задачи, которые решает СУБД",
      "понимать разницу между файлом, key-value и реляционной БД"
    ],
    relatedTopics: ["dbms-cluster-db", "about-postgres", "relational-vs-nosql"]
  },
  "dbms-cluster-db": {
    title: "СУБД, база данных, кластер",
    summary: "Различай: процесс СУБД, кластер (один сервер с несколькими БД), отдельная БД и подключение.",
    examples: [
      "psql -h localhost -U postgres   -- подключение к кластеру\n\\l                              -- список баз внутри кластера\n\\c mydb                         -- переключение в БД"
    ],
    pitfalls: [
      "Один сервер postgres = один кластер, в нём может быть много БД",
      "Каждая БД — отдельное пространство таблиц, ролей и прав",
      "Параметры postgresql.conf и pg_hba.conf — общие на весь кластер"
    ],
    learningGoals: [
      "правильно использовать слова «кластер» и «БД»",
      "видеть границы между уровнями"
    ]
  },
  "about-postgres": {
    title: "О PostgreSQL",
    summary: "Что такое Postgres: лицензия, история, чем он отличается от MySQL и Oracle.",
    examples: [
      "Postgres — реляционная СУБД с открытой лицензией (PostgreSQL License, BSD-подобная), без копилефта. Не делают патчей под отдельные облака, но облака предлагают managed Postgres (Aurora, Cloud SQL, Azure DB).",
      "Сильные стороны: типы данных (jsonb, range, array, PostGIS), оконные функции, расширения, MVCC. Слабая (но решаемая) сторона: read-replica всегда async; sync — только если явно настроишь.",
      "Версионирование: один major-релиз в год (16, 17, 18 …), поддержка 5 лет. Major — это новый каталог данных, нужен pg_upgrade или dump/restore. Minor (16.2 → 16.3) — без миграции."
    ],
    pitfalls: [
      "PostgreSQL ≠ Postgres Pro: последний — отдельный коммерческий форк",
      "MVCC и расширяемость типов — два главных архитектурных козыря"
    ],
    learningGoals: [
      "понимать позицию Postgres среди других СУБД",
      "знать, под какой лицензией он распространяется"
    ]
  },
  "terminology": {
    title: "Термины: настоящие и сленговые",
    summary: "tuple/row, relation/table, attribute/column, predicate, query plan, MVCC.",
    examples: [
      "Реляция = таблица. Кортеж = строка (tuple, row). Атрибут = столбец. Это академические синонимы — в коде ты пишешь TABLE, ROW, COLUMN, но в литературе встретишь и первое.",
      "Сленг команды: «база» обычно значит «БД внутри кластера» (postgres / app / staging), реже — весь кластер. «Запрос» — это и SELECT, и INSERT/UPDATE, и DDL. «Курсор» в SQL и в IDE — разные сущности.",
      "Особенно путают: schema (логическое пространство имён внутри БД, типа public) vs database (отдельная БД в кластере) vs cluster (набор БД, обслуживаемый одним postgres-процессом)."
    ],
    pitfalls: [
      "В академической литературе «relation» — это таблица; в обиходе — связь между ними",
      "tuple ≈ row, но tuple включает «версию строки» в MVCC"
    ],
    learningGoals: [
      "не теряться в чужой документации",
      "уверенно читать сообщения и логи Postgres"
    ]
  },
  "sql-categories": {
    title: "DDL, DML, DCL, TCL",
    summary: "Категории SQL-команд: схема (DDL), данные (DML), права (DCL), транзакции (TCL).",
    examples: [
      "-- DDL: структура\nCREATE TABLE t (id int);\n\n-- DML: данные\nINSERT INTO t VALUES (1);\nSELECT * FROM t;\n\n-- DCL: права\nGRANT SELECT ON t TO readonly;\n\n-- TCL: транзакции\nBEGIN; UPDATE t SET id = 2; COMMIT;"
    ],
    pitfalls: [
      "DDL в Postgres транзакционен — можно откатить ROLLBACK",
      "TRUNCATE формально DDL, но влияет на данные"
    ],
    learningGoals: [
      "по виду запроса понимать его категорию",
      "ориентироваться в правах по категориям"
    ],
    relatedTopics: ["sql-declarative", "sql-comments"]
  },
  "keys-pk-fk": {
    title: "Первичный и внешний ключи",
    summary: "PRIMARY KEY однозначно идентифицирует строку, FOREIGN KEY гарантирует ссылочную целостность.",
    examples: [
      "CREATE TABLE users (\n  id    bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  email text UNIQUE NOT NULL\n);\n\nCREATE TABLE orders (\n  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE\n);"
    ],
    pitfalls: [
      "PK неявно создаёт UNIQUE-индекс и NOT NULL",
      "FK не строит индекс на ссылающемся столбце — это надо делать руками",
      "Композитный PK допустим, но усложняет JOIN-ы"
    ],
    learningGoals: [
      "проектировать ключи под бизнес-смысл",
      "знать, как FK взаимодействует с DELETE/UPDATE"
    ],
    relatedTopics: ["rel-one-to-many", "rel-many-to-many", "create-table-basic"]
  },
  "select-sources": {
    title: "Откуда ещё можно SELECT",
    summary: "VALUES, generate_series, set-returning функции, CTE, подзапросы.",
    examples: [
      "SELECT * FROM (VALUES (1,'a'),(2,'b')) AS v(id, name);\n\nSELECT generate_series(1, 5) AS n;\n\nSELECT * FROM regexp_split_to_table('a,b,c', ',') AS t(part);"
    ],
    pitfalls: [
      "VALUES без AS обычно невидим в столбцах — нужно дать псевдоним",
      "generate_series удобен для синтетических данных и календарей"
    ],
    learningGoals: [
      "генерировать данные в запросе без таблицы",
      "знать про set-returning функции"
    ]
  },
  "boolean-logic": {
    title: "Булева алгебра в SQL",
    summary: "AND/OR/NOT, операторы сравнения и трёхзначная логика с NULL.",
    examples: [
      "SELECT TRUE AND NULL;   -- NULL\nSELECT TRUE OR  NULL;   -- TRUE\nSELECT FALSE AND NULL;  -- FALSE\nSELECT NULL = NULL;     -- NULL"
    ],
    pitfalls: [
      "В SQL логика трёхзначная: TRUE / FALSE / NULL",
      "WHERE отбирает только TRUE — строки с NULL предикатом отбрасываются",
      "NOT IN с NULL внутри списка возвращает NULL → строка не попадёт"
    ],
    learningGoals: [
      "интуитивно работать с NULL в условиях",
      "не наступать на грабли NOT IN"
    ]
  },
  "null-coalesce": {
    title: "NULL и coalesce",
    summary: "NULL означает «неизвестно». coalesce/nullif — основные инструменты для борьбы с ним.",
    examples: [
      "SELECT coalesce(nickname, full_name, 'аноним') FROM users;\n\nSELECT a / NULLIF(b, 0) FROM t;\n\nSELECT * FROM users WHERE deleted_at IS NULL;"
    ],
    pitfalls: [
      "coalesce возвращает первый не-NULL аргумент",
      "NULLIF(x, y) → NULL, если x = y; иначе x",
      "agg-функции (sum, avg) игнорируют NULL; count(col) тоже"
    ],
    learningGoals: [
      "уверенно обрабатывать NULL",
      "выбирать coalesce vs CASE"
    ]
  },
  "order-by": {
    title: "Сортировка: ORDER BY",
    summary: "ASC/DESC, NULLS FIRST/LAST, сортировка по нескольким столбцам и выражениям.",
    examples: [
      "SELECT * FROM users\nORDER BY created_at DESC NULLS LAST, id;\n\nSELECT * FROM events\nORDER BY (data->>'priority')::int DESC, ts;"
    ],
    pitfalls: [
      "NULL по умолчанию идёт «больше» при ASC и «меньше» при DESC",
      "Сортировка по выражению — это работа на каждой строке; индекс на выражении спасает",
      "Сортировка большой выборки требует work_mem"
    ],
    learningGoals: [
      "управлять позицией NULL",
      "связывать ORDER BY и план запроса"
    ]
  },
  "sql-declarative": {
    title: "SQL — декларативный язык",
    summary: "Ты описываешь «что» получить, а не «как». «Как» решает планировщик.",
    examples: [
      "Декларативный: SELECT u.email FROM users u JOIN orders o ON o.user_id = u.id WHERE o.total > 1000; — ты сказал «что», планировщик решил, как (порядок join-а, использовать ли индекс, какой алгоритм соединения).",
      "Императивный аналог на псевдокоде: for u in users: for o in orders: if o.user_id == u.id and o.total > 1000: yield u.email — здесь ты задал и порядок, и алгоритм. Менять стратегию — переписывать код.",
      "Поэтому EXPLAIN — ключевой инструмент: ты сам не задаёшь план, но можешь его прочитать и понять, согласен ли с выбором планировщика."
    ],
    pitfalls: [
      "Один и тот же результат можно записать многими способами — план будет разным",
      "Подсказки планировщику в Postgres ограничены — рычаги через индексы и статистику"
    ],
    learningGoals: [
      "перестать думать «императивно» при чтении SQL",
      "доверять планировщику, но проверять"
    ]
  },
  "sql-comments": {
    title: "Комментарии в SQL и БД",
    summary: "Однострочные --, многострочные /* */, и постоянные через COMMENT ON.",
    examples: [
      "-- однострочный комментарий\n/* много-\n   строчный */\n\nCOMMENT ON TABLE users IS 'учётные записи';\nCOMMENT ON COLUMN users.email IS 'нормализованный e-mail';"
    ],
    pitfalls: [
      "COMMENT ON хранится в системном каталоге — виден в \\d+",
      "Комментарии не влияют на выполнение"
    ],
    learningGoals: [
      "оставлять контекст в коде и в БД",
      "находить описания через \\d+ и pg_description"
    ]
  },
  "relational-vs-nosql": {
    title: "Реляционные vs нереляционные СУБД",
    summary: "Когда нужен Postgres, когда — Mongo/Redis/Cassandra. Что Postgres умеет из «нереляционного».",
    examples: [
      "Postgres подходит, если: данные связаны (orders ↔ users ↔ products), нужны транзакции и foreign keys, нужны сложные выборки с JOIN и GROUP BY. 99% продуктовых БД именно такие.",
      "Mongo / DocumentDB — когда схема плавает между объектами, связи слабые, по большинству ключей доступ по точному совпадению. Можно делать то же на Postgres + jsonb, но мотив выбрать Mongo — не «он быстрее», а «у нас правда нет связей».",
      "Redis — горячий кэш и rate-limiter, не основное хранилище. Cassandra — write-heavy, eventual consistency, ключи и часть значений известны заранее. Если сомневаешься — начинай с Postgres."
    ],
    pitfalls: [
      "jsonb в Postgres часто закрывает 80% задач, для которых тянут отдельный документный store",
      "Нереляционные СУБД жертвуют согласованностью ради масштаба"
    ],
    learningGoals: [
      "выбирать инструмент под задачу",
      "понимать trade-offs CAP/PACELC"
    ]
  },
  "sequences": {
    title: "Последовательности (SEQUENCE)",
    summary: "Генератор уникальных чисел. Стоит за serial и identity.",
    examples: [
      "CREATE SEQUENCE order_no_seq START 1000;\nSELECT nextval('order_no_seq');\nSELECT currval('order_no_seq');\nALTER SEQUENCE order_no_seq RESTART WITH 1;"
    ],
    pitfalls: [
      "nextval работает вне транзакции — отменённый ROLLBACK не возвращает номер",
      "Шаги cache=N оптимизируют выдачу, но создают «дыры» в номерах",
      "При pg_dump/restore нужно SETVAL после загрузки данных"
    ],
    learningGoals: [
      "понимать, как работают serial и identity внутри",
      "управлять последовательностями руками"
    ],
    relatedTopics: ["dec-id-type", "uuid"]
  },
  "aliases": {
    title: "Псевдонимы (aliases)",
    summary: "AS для столбцов и таблиц. Делает запросы короче и читабельнее.",
    examples: [
      "SELECT u.id AS user_id, o.id AS order_id\nFROM users u\nJOIN orders o ON o.user_id = u.id;"
    ],
    pitfalls: [
      "AS можно опускать, но для столбцов лучше писать явно",
      "Псевдоним столбца не виден в WHERE/GROUP BY (он применяется позже логически), но виден в ORDER BY"
    ],
    learningGoals: [
      "сокращать длинные запросы",
      "помнить порядок логического выполнения SELECT"
    ]
  },
  "cluster-anatomy": {
    title: "Анатомия кластера",
    summary: "Кластер → БД → схема → табличное пространство → файл → страница (8 КБ).",
    examples: [
      "SHOW data_directory;\nSELECT spcname, pg_tablespace_location(oid) FROM pg_tablespace;\nSELECT current_setting('block_size');"
    ],
    pitfalls: [
      "Размер страницы 8 КБ — на этапе компиляции; обычно не меняется",
      "TOAST — отдельный механизм для больших значений, прозрачен для пользователя"
    ],
    learningGoals: [
      "представлять физическую раскладку данных",
      "понимать, что такое страница и зачем"
    ],
    relatedTopics: ["dbms-cluster-db", "vacuum-basic"]
  },

  // --- install.html ---
  "install-overview": {
    title: "Варианты установки",
    summary: "Пакетный менеджер ОС, Docker, бинарные сборки, исходники, managed-облако.",
    examples: [
      "Локальная разработка: Docker (postgres:16-alpine) — за 10 секунд, можно удалить целиком одной командой. Альтернатива на Mac — postgres.app, на Linux — apt/dnf-пакет.",
      "Прод: managed (RDS / Cloud SQL / Yandex Managed) — берут на себя бэкапы, мажорные апгрейды, мониторинг базового уровня. Свой сервер — больше контроля и дешевле в большом масштабе.",
      "Сборка из исходников нужна редко: для разработчиков Postgres, для нестандартного OS/архитектуры или специфических флагов компиляции."
    ],
    pitfalls: [
      "Версия из репозитория ОС часто отстаёт от актуальной",
      "Для прода обычно используют официальный pgdg-репозиторий или managed-сервис"
    ],
    learningGoals: [
      "выбирать способ установки под задачу",
      "знать про pgdg-репозитории"
    ]
  },
  "install-package": {
    title: "Установка из пакетного менеджера (Linux)",
    summary: "Через apt/dnf и официальный репозиторий PostgreSQL Global Development Group.",
    examples: [
      "# Ubuntu/Debian (pgdg):\nsudo install -d /usr/share/postgresql-common/pgdg\nsudo apt-get install -y curl ca-certificates\nsudo curl -o /usr/share/postgresql-common/pgdg/apt.postgresql.org.asc \\\n  https://www.postgresql.org/media/keys/ACCC4CF8.asc\nsudo sh -c 'echo \"deb [signed-by=/usr/share/postgresql-common/pgdg/apt.postgresql.org.asc] https://apt.postgresql.org/pub/repos/apt $(lsb_release -cs)-pgdg main\" > /etc/apt/sources.list.d/pgdg.list'\nsudo apt-get update\nsudo apt-get install -y postgresql-16\n\nsudo systemctl status postgresql"
    ],
    pitfalls: [
      "На macOS вместо apt — Homebrew (brew install postgresql@16)",
      "Postgres стартует под пользователем postgres; psql -U postgres"
    ],
    learningGoals: [
      "поднять локальный Postgres на чистой системе",
      "управлять службой через systemctl"
    ]
  },
  "install-docker": {
    title: "Установка в Docker",
    summary: "Один контейнер для разработки или быстрых тестов.",
    examples: [
      "docker run --name pg \\\n  -e POSTGRES_PASSWORD=secret \\\n  -e POSTGRES_DB=app \\\n  -p 5432:5432 \\\n  -v pg-data:/var/lib/postgresql/data \\\n  -d postgres:16\n\ndocker exec -it pg psql -U postgres -d app"
    ],
    pitfalls: [
      "Без -v данные теряются при удалении контейнера",
      "POSTGRES_PASSWORD обязателен; без него контейнер не стартует",
      "В проде вместо чистого docker — Kubernetes/StackGres/Patroni"
    ],
    learningGoals: [
      "поднять Postgres за минуту",
      "сохранять данные между перезапусками"
    ]
  },
  "install-source": {
    title: "Сборка из исходников",
    summary: "Когда нужны патчи, нестандартный --prefix или включение опций сборки.",
    examples: [
      "wget https://ftp.postgresql.org/pub/source/v16.0/postgresql-16.0.tar.gz\ntar xf postgresql-16.0.tar.gz\ncd postgresql-16.0\n./configure --prefix=/opt/pg16 --with-openssl --with-icu\nmake -j$(nproc)\nsudo make install\n\nsudo /opt/pg16/bin/initdb -D /opt/pg16/data\n/opt/pg16/bin/pg_ctl -D /opt/pg16/data -l logfile start"
    ],
    pitfalls: [
      "Не забудь --with-openssl и --with-icu для современных требований",
      "initdb создаёт каталог данных и системные таблицы",
      "Этот путь оправдан только для разработчиков ядра/расширений"
    ],
    learningGoals: [
      "понимать, что такое initdb",
      "знать стандартные опции configure"
    ]
  },

  // --- types.html ---
  "types-why": {
    title: "Зачем нужны типы данных",
    summary: "Типы — контракт. Они защищают от мусора, ускоряют сравнения и экономят место.",
    examples: [
      "Без типа все становится text — и теперь ты не можешь сделать orders.created_at + interval '1 day', потому что text не складывается с интервалами. И сравнение '2026-05-13' < '2026-5-13' даст true как строки, а не как даты.",
      "Тип = контракт + индекс-друг. b-tree по integer ищет за O(log n) и сравнивает байты напрямую; b-tree по text ищет так же, но collation добавляет накладные расходы.",
      "Типизация защищает приложение: если колонка email — domain с CHECK на формат, мусорная строка просто не попадёт в БД, и не нужно проверять на каждом слое выше."
    ],
    pitfalls: [
      "Хранение чисел в text — частый антипаттерн",
      "Типы влияют на план запроса и индексируемость"
    ],
    learningGoals: [
      "видеть связь типов и корректности",
      "не складывать всё в text"
    ]
  },
  "types-numbers": {
    title: "Числовые типы",
    summary: "smallint / int / bigint, numeric (точная), real / double precision (плавающая).",
    examples: [
      "CREATE TABLE money_demo (\n  qty       integer,\n  price     numeric(12,2),     -- точно\n  weight_kg double precision    -- быстро, но с погрешностью\n);"
    ],
    pitfalls: [
      "0.1 + 0.2 в double precision ≠ 0.3 — используй numeric для денег",
      "numeric точен, но дороже по CPU и месту",
      "Не путай smallserial/serial/bigserial с identity"
    ],
    learningGoals: [
      "выбирать тип для денег и количеств",
      "не использовать float там, где нужна точность"
    ]
  },
  "types-strings": {
    title: "Строковые типы",
    summary: "text, varchar(n), char(n), bytea для бинарных данных.",
    examples: [
      "CREATE TABLE t (\n  comment text,\n  code    varchar(16),\n  raw     bytea\n);\n\nSELECT length(comment), char_length(comment) FROM t;\nSELECT lower(comment), upper(comment) FROM t;"
    ],
    pitfalls: [
      "varchar(n) в Postgres не быстрее text — длина проверяется триггером",
      "char(n) дополняет до длины пробелами — почти всегда не то, что нужно",
      "bytea ≠ blob: для крупных файлов лучше внешнее хранилище"
    ],
    learningGoals: [
      "по умолчанию использовать text",
      "знать функции работы со строками"
    ]
  },
  "types-enum": {
    title: "Перечисления (ENUM)",
    summary: "Строгий список допустимых значений на уровне типа.",
    examples: [
      "CREATE TYPE order_status AS ENUM ('new','paid','shipped','cancelled');\n\nCREATE TABLE orders (\n  id     bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  status order_status NOT NULL DEFAULT 'new'\n);\n\nALTER TYPE order_status ADD VALUE 'returned';"
    ],
    pitfalls: [
      "Удалить значение ENUM нельзя — только пересоздать тип",
      "Альтернатива: text + CHECK или отдельная таблица справочника",
      "Сравнение ENUM идёт по порядку определения"
    ],
    learningGoals: [
      "выбирать ENUM vs справочная таблица",
      "понимать стоимость изменений ENUM"
    ],
    relatedTopics: ["constraints"]
  },
  "types-boolean": {
    title: "Тип boolean",
    summary: "boolean: TRUE / FALSE / NULL. Совет: NULL boolean — почти всегда симптом плохого моделирования; либо «не знаем» оправдано, либо надо разделить на два булевых.",
    examples: [
      "CREATE TABLE flags (is_active boolean NOT NULL DEFAULT true);\nSELECT * FROM flags WHERE is_active;       -- так короче\nSELECT * FROM flags WHERE is_active = TRUE; -- эквивалентно"
    ],
    pitfalls: [
      "Постгрес принимает 't','true','yes','1' и 'f','false','no','0' — но в коде лучше явные TRUE/FALSE",
      "WHERE flag отбирает только TRUE; NULL отбрасывается"
    ],
    learningGoals: [
      "писать условия без = TRUE",
      "помнить про трёхзначную логику"
    ]
  },
  "types-arrays": {
    title: "Массивы",
    summary: "Postgres-специфика: массив любой размерности из любого типа.",
    examples: [
      "CREATE TABLE posts (\n  id   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  tags text[] NOT NULL DEFAULT '{}'\n);\n\nSELECT * FROM posts WHERE 'sql' = ANY (tags);\nSELECT * FROM posts WHERE tags @> ARRAY['sql','db'];\nSELECT unnest(tags) FROM posts;"
    ],
    pitfalls: [
      "Массивы удобны, но плохо нормализуются — для большого списка нужна отдельная таблица",
      "GIN-индекс на tags ускоряет поиск через @> и ANY",
      "Индексы массива через []: tags[1] (1-based)"
    ],
    learningGoals: [
      "выбирать массив vs отдельная таблица",
      "пользоваться ANY/ALL/@>"
    ],
    relatedTopics: ["jsonb", "gin-index"]
  },
  "types-datetime": {
    title: "Дата и время",
    summary: "date, time, timestamp, timestamptz, interval — и почему timestamptz почти всегда дефолт.",
    examples: [
      "CREATE TABLE events (\n  start_at timestamptz NOT NULL,\n  duration interval NOT NULL DEFAULT '0'\n);",
      "SELECT now() - interval '7 days';",
      "SELECT date_trunc('hour', now());",
      "SELECT extract(epoch FROM (end_at - start_at)) AS seconds FROM sessions;"
    ],
    pitfalls: [
      "timestamp (без TZ) сравнивается «как написано» — легко получить смещение между серверами",
      "timestamptz хранит UTC и конвертирует в TZ клиента — для прикладных меток это и нужно",
      "interval нельзя индексировать как ключ; обычно нужен как смещение в выражении"
    ],
    learningGoals: [
      "выбирать между date / timestamp / timestamptz",
      "работать с interval и арифметикой времени"
    ],
    relatedTopics: ["datetime", "types-ranges"]
  },
  "types-uuid": {
    title: "UUID",
    summary: "128-битный идентификатор; ключевой выбор — v4 (рандом) или v7 (со временем).",
    examples: [
      "CREATE EXTENSION IF NOT EXISTS pgcrypto;",
      "CREATE TABLE accounts (\n  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  email text NOT NULL UNIQUE\n);",
      "SELECT uuid_version('01918b6a-7c45-7d31-9a3f-1a4b3c5d6e7f'::uuid);"
    ],
    pitfalls: [
      "uuid v4 как PK фрагментирует b-tree и медленнее bigint identity",
      "uuid v7 (timestamp+random) почти всегда лучше v4 для ключей",
      "uuid занимает 16 байт против 8 у bigint — индексы крупнее"
    ],
    learningGoals: [
      "выбирать между uuid v4, v7 и bigint identity",
      "видеть цену uuid в индексах"
    ],
    relatedTopics: ["uuid", "dec-id-type", "sequences"]
  },
  "types-jsonb": {
    title: "JSON и JSONB",
    summary: "Полуструктурированные данные. jsonb — бинарный с парсингом, json — текст as-is.",
    examples: [
      "CREATE TABLE docs (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  data jsonb NOT NULL\n);",
      "SELECT data->'user'->>'email' FROM docs;",
      "SELECT * FROM docs WHERE data @> '{\"role\":\"admin\"}';",
      "CREATE INDEX docs_data_gin ON docs USING gin (data jsonb_path_ops);"
    ],
    pitfalls: [
      "-> возвращает jsonb, ->> — text; путать опасно при сравнениях",
      "jsonb дороже на запись (парсинг), json — на чтение",
      "JSONB удобен, но не повод не нормализовывать давно сложившиеся поля"
    ],
    learningGoals: [
      "выбирать между json и jsonb",
      "индексировать jsonb через GIN"
    ],
    relatedTopics: ["jsonb", "jsonb-ops-vs-pathops", "gin-index"]
  },
  "types-bytea": {
    title: "bytea — двоичные данные",
    summary: "Массив байтов переменной длины. Для блобов «не очень больших»; крупные файлы держи во внешнем хранилище.",
    examples: [
      "CREATE TABLE files (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  sha256 bytea NOT NULL UNIQUE,\n  body bytea NOT NULL\n);",
      "INSERT INTO files (sha256, body) VALUES (decode('a1b2','hex'), decode('48656c6c6f','hex'));",
      "SELECT encode(sha256, 'hex') FROM files;",
      "SELECT octet_length(body) FROM files;"
    ],
    pitfalls: [
      "bytea-вывод по умолчанию hex (\\x...) — не путать с hex-литералом в SQL",
      "TOAST сожмёт большие значения, но при выборке тянет блоб целиком",
      "Для больших файлов — S3 / объектное хранилище, в БД только метаданные"
    ],
    learningGoals: [
      "хранить хеши и небольшие блобы без base64",
      "понимать ограничения хранения файлов в БД"
    ],
    relatedTopics: ["types-strings", "copy-formats"]
  },
  "types-network": {
    title: "Сетевые типы: inet, cidr, macaddr",
    summary: "IP-адрес ± маска, подсеть и MAC — со встроенной валидацией и операторами включения.",
    examples: [
      "CREATE TABLE access_log (\n  client inet NOT NULL,\n  network cidr NOT NULL,\n  mac macaddr\n);",
      "SELECT * FROM access_log WHERE client << cidr '192.168.0.0/16';",
      "SELECT host(client), masklen(client), family(client) FROM access_log;"
    ],
    pitfalls: [
      "cidr требует, чтобы хост-биты были нулями — иначе ошибка",
      "Хранить IP как text — путь к мусорным значениям",
      "Под индекс диапазонов сетей — GiST с inet_ops"
    ],
    learningGoals: [
      "выбирать inet vs cidr",
      "пользоваться операторами << / >> для подсетей"
    ],
    relatedTopics: ["types-strings"]
  },
  "types-ranges": {
    title: "Диапазоны: int4range, tstzrange, multirange",
    summary: "Интервал «от-до» как одно значение, с включением/исключением границ и GiST-индексом.",
    examples: [
      "CREATE TABLE bookings (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  room_id int NOT NULL,\n  during tstzrange NOT NULL,\n  EXCLUDE USING gist (room_id WITH =, during WITH &&)\n);",
      "INSERT INTO bookings (room_id, during) VALUES (1, tstzrange('2026-05-13 10:00+03','2026-05-13 12:00+03','[)'));",
      "SELECT * FROM bookings WHERE during && tstzrange(now(), now() + interval '1h');",
      "SELECT '{[1,4),[7,10)}'::int4multirange;"
    ],
    pitfalls: [
      "Каноничный дискретный диапазон в Postgres — [..) (закрытый слева, открытый справа)",
      "Без gist-индекса операторы && и @> работают медленно",
      "EXCLUDE USING gist — то, ради чего range-типы вообще нужны"
    ],
    learningGoals: [
      "запрещать наложения интервалов через EXCLUDE USING gist",
      "работать с операторами && и @> на range"
    ],
    relatedTopics: ["types-datetime", "gin-index"]
  },
  "types-geometric": {
    title: "Геометрические типы и PostGIS",
    summary: "Встроенные point/line/polygon хороши для простых сценариев; для геоданных — PostGIS.",
    examples: [
      "SELECT point(0,0) <-> point(3,4) AS distance;",
      "SELECT polygon '((0,0),(0,4),(4,4),(4,0))' @> point(1,1);",
      "CREATE EXTENSION IF NOT EXISTS postgis;",
      "SELECT name FROM places WHERE ST_DWithin(geom, ST_MakePoint(37.6,55.7)::geography, 1000);"
    ],
    pitfalls: [
      "Встроенная геометрия — плоскость, без учёта сферы; для геолокации это PostGIS",
      "В PostGIS две модели: geometry (быстрее) и geography (корректные расстояния на сфере)",
      "Под пространственные запросы — GiST или SP-GiST индекс"
    ],
    learningGoals: [
      "понимать, когда нужен PostGIS",
      "выбирать geometry vs geography"
    ],
    relatedTopics: ["gin-index"]
  },
  "types-composite": {
    title: "Композитные (row) типы",
    summary: "Свой тип с именованными полями. По сути — типизированная строка.",
    examples: [
      "CREATE TYPE address AS (city text, street text, zip text);",
      "CREATE TABLE customers (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text NOT NULL, addr address NOT NULL);",
      "INSERT INTO customers (name, addr) VALUES ('Анна', ROW('Москва','Тверская 1','125009'));",
      "SELECT name, (addr).city FROM customers;"
    ],
    pitfalls: [
      "Поля композита не видны через \\d таблицы — теряем «обзорность»",
      "Сложнее индексировать (через выражение), чем обычные колонки",
      "В большинстве случаев плоские колонки удобнее"
    ],
    learningGoals: [
      "видеть, когда композит оправдан, а когда нет",
      "обращаться к полям композита через (col).field"
    ],
    relatedTopics: ["create-table-basic"]
  },
  "types-domain": {
    title: "Доменные типы",
    summary: "Тип-алиас с собственным CHECK и значением по умолчанию.",
    examples: [
      "CREATE DOMAIN email AS text CHECK (VALUE ~* '^[^@]+@[^@]+\\.[^@]+$');",
      "CREATE TABLE users (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, email email NOT NULL UNIQUE);",
      "ALTER DOMAIN email DROP CONSTRAINT email_check;"
    ],
    pitfalls: [
      "Менять CHECK у домена с уже наполненной таблицей — операция дороже, чем менять CHECK на колонке",
      "Домены не наследуют операторы базового типа автоматически — иногда нужен явный cast",
      "Удобно для «общего справочника» (email, phone), но не делай домены для всего подряд"
    ],
    learningGoals: [
      "запрещать мусорные значения на уровне типа",
      "понимать, чем домен лучше CHECK на каждой колонке"
    ],
    relatedTopics: ["constraints", "types-composite"]
  },

  // ===== Итерация 2: Соединения и агрегации =====

  // --- joins.html ---
  "inner-join": {
    title: "INNER JOIN",
    summary: "Возвращает строки, у которых есть совпадение в обеих таблицах.",
    examples: [
      "SELECT u.email, o.id\nFROM users u\nJOIN orders o ON o.user_id = u.id;"
    ],
    pitfalls: [
      "Без условия ON получится CROSS JOIN — декартово произведение",
      "Тип столбцов в ON должен совпадать, иначе будет implicit cast и потеря индекса"
    ],
    learningGoals: ["писать корректное условие ON", "понимать порядок выполнения"],
    relatedTopics: ["left-right-join", "semi-join", "composite-index"]
  },
  "left-right-join": {
    title: "LEFT и RIGHT OUTER JOIN",
    summary: "Сохраняет все строки из «опорной» таблицы, даже если совпадения нет.",
    examples: [
      "SELECT u.email, o.id\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id;"
    ],
    pitfalls: [
      "Условие на правой таблице в WHERE превращает LEFT в INNER",
      "RIGHT JOIN — зеркало LEFT; чаще пишут LEFT, поменяв порядок таблиц"
    ],
    learningGoals: [
      "сохранять «осиротевшие» строки",
      "не превращать LEFT в INNER случайно"
    ],
    relatedTopics: ["inner-join", "full-outer-join", "semi-join"]
  },
  "full-outer-join": {
    title: "FULL OUTER JOIN",
    summary: "Все строки из обеих таблиц; NULL там, где совпадения нет.",
    examples: [
      "SELECT a.id AS a_id, b.id AS b_id\nFROM a FULL JOIN b ON a.key = b.key;"
    ],
    pitfalls: [
      "Часто избыточен — обычно нужен LEFT с другой стороны",
      "Удобен для сверки двух версий данных"
    ],
    learningGoals: [
      "находить расхождения между двумя таблицами",
      "понимать, когда FULL OUTER избыточен (обычно нужен LEFT с другой стороны)"
    ],
    relatedTopics: ["left-right-join", "inner-join"]
  },
  "cross-join": {
    title: "CROSS JOIN",
    summary: "Декартово произведение: каждая строка с каждой.",
    examples: [
      "SELECT s.id, c.code\nFROM sizes s CROSS JOIN colors c;",
      "-- генерим календарь × категории:\nSELECT d, cat\nFROM generate_series('2026-01-01'::date, '2026-12-31', '1 day') d\nCROSS JOIN unnest(ARRAY['food','tech']) cat;"
    ],
    pitfalls: [
      "На больших таблицах легко получить миллиарды строк",
      "Без CROSS JOIN тот же эффект даёт запятая в FROM (устаревший стиль)"
    ],
    learningGoals: [
      "понимать, когда декартово произведение оправдано (календарь × категории)",
      "избегать случайного CROSS JOIN от запятой в FROM"
    ]
  },
  "self-join": {
    title: "SELF JOIN",
    summary: "Соединение таблицы с самой собой через алиасы.",
    examples: [
      "-- иерархия сотрудников:\nSELECT e.name AS employee, m.name AS manager\nFROM employees e\nLEFT JOIN employees m ON m.id = e.manager_id;"
    ],
    pitfalls: [
      "Без разных алиасов запрос не парсится",
      "Для глубокой иерархии лучше WITH RECURSIVE"
    ],
    learningGoals: [
      "работать с самоссылающимися связями через алиасы",
      "выбирать SELF JOIN или WITH RECURSIVE по глубине иерархии"
    ],
    relatedTopics: ["recursive-cte", "multi-table-join"]
  },
  "natural-join": {
    title: "NATURAL JOIN",
    summary: "Автоматически соединяет по столбцам с одинаковыми именами.",
    examples: [
      "SELECT * FROM orders NATURAL JOIN users;",
      "-- эквивалентно: JOIN ... USING (общие_столбцы)"
    ],
    pitfalls: [
      "Ломается при добавлении нового одноимённого столбца",
      "В реальных проектах считают плохой практикой — пишут JOIN ... USING или ON явно"
    ],
    learningGoals: ["знать о существовании", "не использовать в прод-коде"]
  },
  "semi-join": {
    title: "SEMI JOIN (EXISTS, IN)",
    summary: "Фильтрует строки, у которых ЕСТЬ совпадение, не возвращая столбцы из второй таблицы.",
    examples: [
      "SELECT u.*\nFROM users u\nWHERE EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);",
      "SELECT * FROM users WHERE id IN (SELECT user_id FROM orders);"
    ],
    pitfalls: [
      "EXISTS обычно эффективнее IN с подзапросом",
      "В отличие от JOIN, не дублирует строки при нескольких совпадениях",
      "IN с NULL внутри списка — частая ловушка"
    ],
    learningGoals: ["выбирать EXISTS vs JOIN vs IN", "избегать дублей"],
    relatedTopics: ["anti-join", "left-right-join"]
  },
  "anti-join": {
    title: "ANTI JOIN (NOT EXISTS, LEFT JOIN ... IS NULL)",
    summary: "Строки без совпадения. Два идиоматичных способа.",
    examples: [
      "-- 1. NOT EXISTS — обычно лучший выбор:\nSELECT u.*\nFROM users u\nWHERE NOT EXISTS (SELECT 1 FROM orders o WHERE o.user_id = u.id);",
      "-- 2. LEFT JOIN + IS NULL:\nSELECT u.*\nFROM users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE o.id IS NULL;"
    ],
    pitfalls: [
      "NOT IN c подзапросом, возвращающим NULL → ничего не вернётся",
      "NOT EXISTS корректно работает с NULL и обычно эффективнее"
    ],
    learningGoals: ["находить «осиротевших»", "не наступать на NOT IN с NULL"],
    relatedTopics: ["semi-join", "left-right-join"]
  },
  "multi-table-join": {
    title: "Соединение более двух таблиц",
    summary: "JOIN-цепочки: порядок и стиль форматирования.",
    examples: [
      "SELECT u.email, o.id, p.name, oi.qty\nFROM users u\nJOIN orders      o  ON o.user_id    = u.id\nJOIN order_items oi ON oi.order_id  = o.id\nJOIN products    p  ON p.id         = oi.product_id\nWHERE u.is_active\n  AND o.created_at > now() - interval '30 days';"
    ],
    pitfalls: [
      "С тремя+ JOIN важнее всего читаемость — выравнивай условия",
      "Планировщик сам выбирает порядок соединений; join_collapse_limit ограничивает поиск"
    ],
    learningGoals: [
      "писать читаемые многотабличные запросы (порядок и форматирование)",
      "разбивать длинную цепочку через CTE, если она не помещается в голову"
    ],
    relatedTopics: ["inner-join", "left-right-join", "cte"]
  },
  "rel-one-to-many": {
    title: "Связь 1:N (один ко многим)",
    summary: "Самая частая связь: у пользователя много заказов.",
    examples: [
      "CREATE TABLE users (\n  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY\n);\n\nCREATE TABLE orders (\n  id      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,\n  user_id bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE\n);\n\nCREATE INDEX idx_orders_user ON orders (user_id);"
    ],
    pitfalls: [
      "Индекс на FK-столбце нужен почти всегда",
      "ON DELETE CASCADE удобен, но опасен — продумывай до проектирования"
    ],
    learningGoals: [
      "проектировать FK на стороне «многих»",
      "понимать, как 1:N выглядит в запросах JOIN"
    ],
    relatedTopics: ["keys-pk-fk", "left-right-join"]
  },
  "rel-many-to-many": {
    title: "Связь N:M (многие ко многим)",
    summary: "N:M через промежуточную таблицу с двумя FK и составным PK. Сюда же кладут метаданные связи (created_at, role, quantity).",
    examples: [
      "CREATE TABLE posts (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY);\nCREATE TABLE tags  (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text UNIQUE);\n\nCREATE TABLE post_tags (\n  post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,\n  tag_id  bigint NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,\n  PRIMARY KEY (post_id, tag_id)\n);\n\nCREATE INDEX idx_post_tags_tag ON post_tags (tag_id);"
    ],
    pitfalls: [
      "PRIMARY KEY (a, b) уже строит индекс по первому столбцу — на второй индекс нужен отдельно",
      "На промежуточной таблице иногда полезны дополнительные атрибуты (created_at, weight)"
    ],
    learningGoals: [
      "проектировать junction-таблицу с составным PK",
      "избегать прямого FK между двумя «многими»"
    ],
    relatedTopics: ["keys-pk-fk", "multi-table-join"]
  },
  "rel-one-to-one": {
    title: "Связь 1:1 (один к одному)",
    summary: "Реализуется через UNIQUE на FK-столбце или общий PK.",
    examples: [
      "CREATE TABLE users (id bigint PRIMARY KEY);\n\nCREATE TABLE user_profile (\n  user_id  bigint PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,\n  bio      text,\n  birthday date\n);"
    ],
    pitfalls: [
      "Если профиль есть всегда — его столбцы можно держать прямо в users",
      "1:1 оправдан, когда «дочерняя» часть редкая или сильно отличается по жизненному циклу"
    ],
    learningGoals: [
      "видеть, когда 1:1 действительно нужен, а когда это «толстая» строка",
      "реализовать 1:1 через UNIQUE FK или общий PK"
    ],
    relatedTopics: ["keys-pk-fk", "unique-index"]
  },

  // --- aggregates.html ---
  "aggregates-funcs": {
    title: "Агрегатные функции",
    summary: "count, sum, avg, min, max, bool_and/or, string_agg, array_agg.",
    examples: [
      "SELECT count(*)            AS rows_total,\n       count(email)        AS with_email,\n       count(DISTINCT user_id) AS uniq_users,\n       sum(amount)         AS total,\n       avg(amount)         AS avg_amount,\n       min(created_at)     AS first,\n       max(created_at)     AS last,\n       string_agg(email, ', ' ORDER BY email) AS list,\n       array_agg(id ORDER BY id)              AS ids\nFROM   orders;"
    ],
    pitfalls: [
      "count(*) считает строки, count(col) — не-NULL значения",
      "string_agg/array_agg поддерживают ORDER BY внутри",
      "FILTER (WHERE ...) — условные агрегаты без CASE"
    ],
    learningGoals: ["знать набор агрегатов", "пользоваться FILTER"]
  },
  "json-agg-vs-orm": {
    title: "json_agg vs ORM (борьба с N+1)",
    summary: "Один запрос с агрегацией в JSON часто заменяет N+1 на стороне приложения.",
    examples: [
      "SELECT u.id, u.email,\n       coalesce(\n         json_agg(\n           json_build_object('id', o.id, 'total', o.total)\n           ORDER BY o.created_at DESC\n         ) FILTER (WHERE o.id IS NOT NULL),\n         '[]'::json\n       ) AS orders\nFROM   users u\nLEFT JOIN orders o ON o.user_id = u.id\nGROUP  BY u.id, u.email;"
    ],
    pitfalls: [
      "Без FILTER (WHERE o.id IS NOT NULL) при LEFT JOIN получишь массив с одним null",
      "Огромные json_agg на серверной стороне могут есть память — следи за размером результата"
    ],
    learningGoals: ["лечить N+1 одним SQL", "выбирать json_agg vs jsonb_agg"],
    relatedTopics: ["sr-app-orm", "group-by"]
  },
  "case-when": {
    title: "CASE WHEN",
    summary: "Условное выражение в SQL: «если X, то Y, иначе Z».",
    examples: [
      "SELECT id, total,\n       CASE\n         WHEN total = 0           THEN 'free'\n         WHEN total < 1000        THEN 'small'\n         WHEN total < 10000       THEN 'medium'\n         ELSE                          'big'\n       END AS bucket\nFROM   orders;",
      "-- условный агрегат через CASE:\nSELECT count(*) FILTER (WHERE status = 'paid')   AS paid,\n       count(*) FILTER (WHERE status = 'cancel') AS cancelled\nFROM   orders;"
    ],
    pitfalls: [
      "Без ELSE возвращается NULL для непокрытых случаев",
      "FILTER (WHERE ...) обычно читабельнее CASE для условных агрегатов"
    ],
    learningGoals: [
      "писать читаемые ветвления внутри SELECT",
      "комбинировать CASE с агрегатами для сводных колонок"
    ],
    relatedTopics: ["group-by", "having"]
  },
  "having": {
    title: "HAVING — фильтр после агрегации",
    summary: "WHERE фильтрует строки до GROUP BY, HAVING — после.",
    examples: [
      "SELECT user_id, count(*) AS orders_total\nFROM   orders\nWHERE  created_at >= now() - interval '30 days'   -- до агрегации\nGROUP  BY user_id\nHAVING count(*) > 5;                              -- после агрегации"
    ],
    pitfalls: [
      "В HAVING можно использовать агрегаты, в WHERE — нельзя",
      "Часто соблазн всё писать в HAVING — не стоит, WHERE дешевле"
    ],
    learningGoals: [
      "разделять WHERE (до агрегации) и HAVING (после)",
      "не использовать HAVING там, где хватает WHERE"
    ],
    relatedTopics: ["group-by", "win-intro"]
  },
  "distinct": {
    title: "DISTINCT и DISTINCT ON",
    summary: "Убирает дубли по всем столбцам или по подмножеству.",
    examples: [
      "SELECT DISTINCT country FROM customers;\n\n-- DISTINCT ON: первая строка для каждой группы\nSELECT DISTINCT ON (user_id) user_id, id, created_at\nFROM   orders\nORDER  BY user_id, created_at DESC;"
    ],
    pitfalls: [
      "DISTINCT — это сортировка/хэш, не бесплатно",
      "DISTINCT ON требует ORDER BY, начинающегося с тех же столбцов",
      "Часто DISTINCT прячет ошибку в JOIN-условии"
    ],
    learningGoals: ["выбирать DISTINCT vs GROUP BY", "знать DISTINCT ON"],
    relatedTopics: ["group-by", "win-dedupe"]
  },
  "grouping-sets": {
    title: "GROUPING SETS, ROLLUP, CUBE",
    summary: "Несколько уровней группировки в одном запросе.",
    examples: [
      "-- ROLLUP даёт промежуточные итоги:\nSELECT country, city, count(*)\nFROM   customers\nGROUP  BY ROLLUP (country, city);\n\n-- CUBE — все комбинации:\nSELECT country, gender, count(*)\nFROM   customers\nGROUP  BY CUBE (country, gender);\n\n-- GROUPING SETS — точный список:\nSELECT country, gender, count(*)\nFROM   customers\nGROUP  BY GROUPING SETS ((country), (gender), ());"
    ],
    pitfalls: [
      "Строка-итог отличается NULL в столбце — используй grouping() для надёжного распознавания",
      "Эквивалент UNION ALL по нескольким GROUP BY — но компактнее и быстрее"
    ],
    learningGoals: [
      "считать итоги и подытоги одним запросом",
      "отличать GROUPING SETS от UNION ALL по производительности"
    ],
    relatedTopics: ["group-by", "win-intro"]
  },
  "subqueries": {
    title: "Подзапросы",
    summary: "Скалярные, табличные, коррелированные. IN, ANY/ALL, EXISTS.",
    examples: [
      "-- скалярный подзапрос:\nSELECT u.id, u.email,\n       (SELECT count(*) FROM orders o WHERE o.user_id = u.id) AS orders_total\nFROM   users u;\n\n-- табличный (FROM):\nSELECT *\nFROM   (SELECT user_id, count(*) c FROM orders GROUP BY user_id) t\nWHERE  t.c > 10;\n\n-- ANY/ALL:\nSELECT * FROM products\nWHERE  price > ALL (SELECT price FROM products WHERE category = 'budget');"
    ],
    pitfalls: [
      "Скалярный подзапрос должен возвращать ровно одну строку и столбец",
      "Коррелированные подзапросы выполняются для каждой внешней строки — иногда дороже JOIN-а",
      "CTE нередко читабельнее, чем вложенные подзапросы"
    ],
    learningGoals: ["видеть три вида подзапросов", "выбирать между подзапросом, JOIN и CTE"],
    relatedTopics: ["cte", "lateral-join"]
  },
  "set-ops": {
    title: "UNION, EXCEPT, INTERSECT",
    summary: "Объединение, вычитание и пересечение результатов запросов.",
    examples: [
      "SELECT id FROM a UNION     SELECT id FROM b;\nSELECT id FROM a UNION ALL SELECT id FROM b;\nSELECT id FROM a EXCEPT    SELECT id FROM b;\nSELECT id FROM a INTERSECT SELECT id FROM b;"
    ],
    pitfalls: [
      "UNION без ALL дороже — он сортирует и убирает дубли",
      "Количество и типы столбцов должны совпадать",
      "ORDER BY ставится в конце финального запроса"
    ],
    learningGoals: ["использовать UNION ALL по умолчанию", "знать EXCEPT/INTERSECT"],
    relatedTopics: ["subqueries", "cte"]
  },

  // ===== Итерация 3: Транзакции и индексы =====

  // --- transactions.html ---
  "cte-materialized": {
    title: "CTE: MATERIALIZED vs NOT MATERIALIZED",
    summary: "С PG 12+ planner может встраивать CTE в запрос. Иногда это плохо — тогда нужен барьер.",
    examples: [
      "-- по умолчанию (PG 12+): CTE может быть встроен в основной запрос\nWITH heavy AS (\n  SELECT id, expensive_func(x) AS v FROM big\n)\nSELECT * FROM heavy WHERE v > 0;\n\n-- явно материализуем (выполняется один раз, результат во временной структуре):\nWITH heavy AS MATERIALIZED (\n  SELECT id, expensive_func(x) AS v FROM big\n)\nSELECT * FROM heavy WHERE v > 0;\n\n-- явно встраиваем — даже если ссылка единственная:\nWITH heavy AS NOT MATERIALIZED (...)"
    ],
    pitfalls: [
      "До PG 12 CTE всегда были оптимизационным барьером",
      "MATERIALIZED полезен, если внутри тяжёлая функция и ты не хочешь, чтобы её вычисляли несколько раз"
    ],
    learningGoals: [
      "понимать, когда нужен MATERIALIZED",
      "видеть в плане CTE Scan vs встроенный запрос"
    ]
  },
  "acid": {
    title: "ACID",
    summary: "Atomicity, Consistency, Isolation, Durability — четыре гарантии транзакций.",
    examples: [
      "Atomicity: BEGIN; UPDATE accounts SET balance = balance - 100 WHERE id = 1; UPDATE accounts SET balance = balance + 100 WHERE id = 2; COMMIT; — если второй UPDATE упадёт, первый откатывается, денег ни у кого не пропадёт.",
      "Consistency: ограничения (PK, FK, CHECK, UNIQUE) проверяются на COMMIT. Если перевод нарушает CHECK (balance >= 0), вся транзакция откатится — состояние БД остаётся валидным.",
      "Isolation: две сессии одновременно перевели деньги — в Postgres под READ COMMITTED каждая видит свою «версию» данных, не блокирует читателей. Под SERIALIZABLE — каждая видит как будто работает одна.",
      "Durability: после COMMIT данные на диске. Postgres делает это через WAL (write-ahead log) + fsync — даже если процесс упадёт через миллисекунду после COMMIT, перезапуск восстановит данные из WAL."
    ],
    pitfalls: [
      "C из ACID — это не «согласованность распределённой системы», а «не нарушаются ограничения БД»",
      "Isolation в реальности — спектр уровней с разной строгостью",
      "Durability работает, только если включён fsync — не отключай"
    ],
    learningGoals: [
      "переводить каждую букву в практический смысл",
      "не путать C с CAP-Consistency"
    ],
    relatedTopics: ["transactions", "iso-summary"]
  },
  "savepoints": {
    title: "Savepoints — точки сохранения",
    summary: "SAVEPOINT — точка внутри транзакции, к которой можно откатиться без отмены всей. Часто используется внутри PL/pgSQL для try-catch.",
    examples: [
      "BEGIN;\n  INSERT INTO orders (...) VALUES (...);\n  SAVEPOINT before_items;\n  INSERT INTO order_items (...) VALUES (...);\n  -- если что-то пошло не так:\n  ROLLBACK TO SAVEPOINT before_items;\n  -- продолжаем работу:\n  INSERT INTO order_items (...) VALUES (...);\nCOMMIT;"
    ],
    pitfalls: [
      "Savepoint живёт до COMMIT/ROLLBACK всей транзакции",
      "Каждый savepoint — это subtransaction; в большом количестве они бьют по производительности",
      "ORM-ы используют savepoints для вложенных транзакций"
    ],
    learningGoals: [
      "делать частичный откат",
      "не злоупотреблять — десятки тысяч savepoint в одной транзакции тормозят"
    ],
    relatedTopics: ["transactions", "acid"]
  },
  "iso-read-uncommitted-committed": {
    title: "READ UNCOMMITTED / READ COMMITTED",
    summary: "В Postgres READ UNCOMMITTED работает как READ COMMITTED. Это уровень по умолчанию.",
    examples: [
      "BEGIN ISOLATION LEVEL READ COMMITTED;\nSELECT balance FROM accounts WHERE id = 1;  -- видит закоммиченные изменения\n-- ... другая транзакция COMMIT-ит ...\nSELECT balance FROM accounts WHERE id = 1;  -- может вернуть другое значение\nCOMMIT;"
    ],
    pitfalls: [
      "В READ COMMITTED каждый запрос получает свой снимок — non-repeatable read возможен",
      "В Postgres dirty read невозможен ни на одном уровне (даже READ UNCOMMITTED ведёт себя как READ COMMITTED)",
      "Уровень по умолчанию — READ COMMITTED"
    ],
    learningGoals: [
      "понимать non-repeatable read",
      "осознанно выбирать уровень"
    ]
  },
  "iso-repeatable-read": {
    title: "REPEATABLE READ",
    summary: "Снимок берётся один раз в начале транзакции и не меняется.",
    examples: [
      "BEGIN ISOLATION LEVEL REPEATABLE READ;\nSELECT balance FROM accounts WHERE id = 1;  -- например, 1000\n-- другая транзакция COMMIT-ит изменение\nSELECT balance FROM accounts WHERE id = 1;  -- всё ещё 1000\nCOMMIT;"
    ],
    pitfalls: [
      "Защищает от non-repeatable read и phantom read внутри одного снимка",
      "При параллельных модификациях возможна ошибка SQLSTATE 40001 — нужен retry",
      "Не защищает от write skew (две транзакции читают одно и пишут разное — и обе коммитят)"
    ],
    learningGoals: [
      "видеть «застывший» снимок данных",
      "ловить и обрабатывать serialization_failure"
    ]
  },
  "iso-serializable": {
    title: "SERIALIZABLE",
    summary: "Самый строгий уровень: эффект параллельных транзакций должен совпадать с каким-то их последовательным выполнением.",
    examples: [
      "BEGIN ISOLATION LEVEL SERIALIZABLE;\n-- запросы и обновления;\nCOMMIT;\n\n-- В клиенте — обработка SQLSTATE 40001:\n-- сделать backoff, повторить транзакцию"
    ],
    pitfalls: [
      "Implementation в Postgres называется SSI (Serializable Snapshot Isolation)",
      "Гарантирует корректность в обмен на retry: serialization_failure возможен у обеих сторон конфликта",
      "Не любой набор запросов выгоден — для горячих счётчиков лучше явные блокировки"
    ],
    learningGoals: [
      "получать «как будто последовательное» выполнение",
      "правильно ретраить транзакции"
    ]
  },
  "iso-summary": {
    title: "Итог по уровням изоляции",
    summary: "Сравнительная таблица аномалий и поведения в Postgres.",
    examples: [
      "READ COMMITTED (default): каждое statement видит свой свежий снимок. Проблемы: non-repeatable read (один и тот же SELECT внутри транзакции может вернуть разное), phantom read.",
      "REPEATABLE READ: вся транзакция видит снимок на момент начала. Защищает от non-repeatable read и (в Postgres) от phantom read. При конфликте — ошибка serialization_failure, нужно повторить.",
      "SERIALIZABLE: эквивалент последовательного выполнения. Защищает от write skew (две транзакции читают одно, пишут разное, обе валидны по одиночке, но вместе ломают инвариант). Дороже всех.",
      "Правило: начинай с READ COMMITTED, поднимай уровень там, где появилась проблема. Не делай SERIALIZABLE «на всякий случай»."
    ],
    pitfalls: [
      "READ UNCOMMITTED в Postgres = READ COMMITTED",
      "Phantom read в SQL-стандарте отделён от non-repeatable read; в Postgres REPEATABLE READ закрывает оба",
      "SERIALIZABLE даёт write skew, REPEATABLE READ — нет"
    ],
    learningGoals: [
      "выбирать уровень осознанно",
      "знать, какие аномалии где возможны"
    ],
    relatedTopics: ["iso-read-uncommitted-committed", "iso-repeatable-read", "iso-serializable", "dec-isolation"]
  },

  // --- indexes.html ---
  "sr-index-concurrently": {
    title: "CREATE INDEX CONCURRENTLY и REINDEX CONCURRENTLY",
    summary: "В проде индекс строится только так. Без CONCURRENTLY команда блокирует таблицу на запись на всё время постройки — а это могут быть часы.",
    examples: [
      "-- безопасное создание под нагрузкой:\nCREATE INDEX CONCURRENTLY idx_orders_user_created\n  ON orders (user_id, created_at DESC);\n\n-- проверка, что индекс валиден:\nSELECT relname, indisvalid, indisready\nFROM   pg_class c\nJOIN   pg_index i ON i.indexrelid = c.oid\nWHERE  relname = 'idx_orders_user_created';",
      "-- если построение упало (например, по UNIQUE-конфликту) — остался INVALID-индекс:\nSELECT c.relname\nFROM   pg_index i\nJOIN   pg_class c ON c.oid = i.indexrelid\nWHERE  NOT i.indisvalid;\n\nDROP INDEX CONCURRENTLY idx_orders_user_created;\nCREATE INDEX CONCURRENTLY idx_orders_user_created ON orders (user_id, created_at DESC);",
      "-- перестроить распухший индекс без блокировки чтения:\nREINDEX INDEX CONCURRENTLY idx_orders_user_created;\nREINDEX TABLE CONCURRENTLY orders;          -- все индексы таблицы\nREINDEX SCHEMA CONCURRENTLY public;         -- все индексы схемы"
    ],
    pitfalls: [
      "CONCURRENTLY делает 2 прохода по таблице и ждёт окончания всех параллельных транзакций — постройка длиннее обычной в 2–3 раза, но без блокировки",
      "Нельзя внутри транзакции (BEGIN/COMMIT) — Postgres откажет. Только отдельным statement",
      "Если упало — остался INVALID-индекс, он НЕ используется планировщиком, но место занимает. Найти его и дропнуть — отдельная задача дежурного",
      "REINDEX CONCURRENTLY появился только в PG 12. На 11 и старше — стандартный костыль: CREATE NEW + DROP OLD + RENAME"
    ],
    learningGoals: [
      "строить индекс под нагрузкой без даунтайма",
      "находить и чистить INVALID-индексы",
      "знать, когда REINDEX действительно нужен (bloat, corruption)"
    ],
    relatedTopics: ["create-index-btree", "composite-index", "sr-zero-downtime-migrations", "sr-bloat"]
  },

  "composite-index": {
    title: "Составные индексы (несколько колонок)",
    summary: "Один индекс по нескольким столбцам и правило «leftmost prefix».",
    examples: [
      "CREATE INDEX idx_orders_user_created\n  ON orders (user_id, created_at DESC);\n\n-- использует индекс:\nSELECT * FROM orders WHERE user_id = 1;\nSELECT * FROM orders WHERE user_id = 1 AND created_at >= now() - interval '7 days';\n\n-- НЕ использует (нет лидирующего столбца):\nSELECT * FROM orders WHERE created_at >= now() - interval '7 days';"
    ],
    pitfalls: [
      "Порядок столбцов в индексе — критичен",
      "Чаще всего: сначала равенство, потом диапазон",
      "DESC vs ASC влияет на ORDER BY — индекс должен совпадать с сортировкой запроса"
    ],
    learningGoals: ["проектировать индекс под конкретный запрос", "видеть use в EXPLAIN"],
    relatedTopics: ["inner-join", "covering-index", "selectivity"]
  },
  "unique-index": {
    title: "Индекс на уникальность",
    summary: "UNIQUE-ограничение и UNIQUE-индекс — две стороны одного.",
    examples: [
      "-- через ограничение (рекомендуется):\nALTER TABLE users ADD CONSTRAINT users_email_uq UNIQUE (email);\n\n-- через индекс — то же самое физически, но без имени constraint:\nCREATE UNIQUE INDEX idx_users_email_lower ON users (lower(email));\n\n-- частичный уникальный индекс — уникальность только для подмножества:\nCREATE UNIQUE INDEX idx_users_email_active\n  ON users (email) WHERE deleted_at IS NULL;"
    ],
    pitfalls: [
      "В UNIQUE несколько NULL допустимы по стандарту SQL",
      "Уникальный индекс по выражению — единственный способ принудить «email без учёта регистра»",
      "ON CONFLICT (col) ловит только UNIQUE/PK по этим столбцам"
    ],
    learningGoals: [
      "выбирать UNIQUE constraint vs UNIQUE INDEX",
      "пользоваться частичным UNIQUE"
    ],
    relatedTopics: ["constraints", "composite-index"]
  },
  "selectivity": {
    title: "Селективность",
    summary: "Что такое селективность индекса и почему планировщик выбирает Seq Scan.",
    examples: [
      "-- селективность 1% — индекс точно нужен:\nSELECT * FROM users WHERE id = 42;\n\n-- селективность 50% — Seq Scan дешевле:\nSELECT * FROM users WHERE is_active;",
      "-- посмотреть статистику:\nSELECT attname, n_distinct, most_common_vals\nFROM   pg_stats\nWHERE  schemaname = 'public' AND tablename = 'users';"
    ],
    pitfalls: [
      "Низко селективные предикаты (TRUE/FALSE, 'active') почти не выигрывают от обычного индекса",
      "Помогает частичный индекс или включение редкого столбца в составной",
      "Планировщик опирается на pg_stats — старая статистика = плохой план"
    ],
    learningGoals: ["понимать связь селективности и плана", "не удивляться Seq Scan"],
    relatedTopics: ["stats-extended", "composite-index"]
  },
  "expression-index": {
    title: "Индекс по выражению",
    summary: "Индексируем не сам столбец, а функцию от него.",
    examples: [
      "CREATE INDEX idx_users_email_lower ON users (lower(email));\n\n-- использует индекс:\nSELECT * FROM users WHERE lower(email) = lower($1);\n\n-- НЕ использует (другое выражение):\nSELECT * FROM users WHERE email = $1;"
    ],
    pitfalls: [
      "Выражение в WHERE должно совпадать с выражением в индексе побайтово",
      "Функция должна быть IMMUTABLE",
      "Generated column + индекс — современная альтернатива"
    ],
    learningGoals: ["ускорять регистронезависимый поиск", "поддерживать одинаковые выражения"],
    relatedTopics: ["partial-index", "jsonb-expression-index"]
  },
  "covering-index": {
    title: "Покрывающие индексы (INCLUDE)",
    summary: "INCLUDE добавляет столбцы в индекс без участия в ключе — Index-Only Scan становится возможным.",
    examples: [
      "CREATE INDEX idx_orders_user_created_inc\n  ON orders (user_id, created_at DESC)\n  INCLUDE (total, status);\n\n-- запрос целиком отвечает индексом, без чтения таблицы:\nSELECT total, status\nFROM   orders\nWHERE  user_id = 1\n  AND  created_at >= now() - interval '30 days';"
    ],
    pitfalls: [
      "INCLUDE-столбцы не участвуют в сортировке и ключе — они просто хранятся в индексе",
      "Index-Only Scan работает, только если visibility map говорит, что страница «всё-видима»",
      "Слишком большие INCLUDE раздувают индекс — теряется смысл"
    ],
    learningGoals: ["добиваться Index-Only Scan", "выбирать INCLUDE-столбцы"],
    relatedTopics: ["composite-index", "create-index-btree"]
  },
  "index-types": {
    title: "Типы индексов: B-tree, GIN, GiST, SP-GiST, BRIN, Hash",
    summary: "Каждый тип под свой класс операторов и данных.",
    examples: [
      "-- B-tree (по умолчанию): равенство, диапазоны, сортировка\nCREATE INDEX idx_orders_user ON orders (user_id);\n\n-- GIN: jsonb, массивы, FTS\nCREATE INDEX idx_docs_data ON docs USING gin (data);\n\n-- GiST: геометрия, диапазоны, FTS\nCREATE INDEX idx_events_tsr ON events USING gist (tsrange);\n\n-- SP-GiST: дерево пространственного разбиения\nCREATE INDEX idx_phones_prefix ON phones USING spgist (number text_pattern_ops);\n\n-- BRIN: огромные таблицы с естественным порядком (по времени)\nCREATE INDEX idx_events_time_brin ON events USING brin (created_at);\n\n-- Hash: только равенство, нишевый\nCREATE INDEX idx_sessions_token ON sessions USING hash (token);"
    ],
    pitfalls: [
      "Hash в Postgres < 10 не журналировался — сейчас уже надёжен",
      "BRIN полезен, когда строки физически упорядочены по индексируемому столбцу",
      "GIN с jsonb_path_ops компактнее, но поддерживает только @>"
    ],
    learningGoals: ["выбирать тип под структуру данных", "знать про BRIN для time-series"],
    relatedTopics: ["create-index-btree", "gin-index"]
  },
  "stats-extended": {
    title: "Расширенная статистика",
    summary: "CREATE STATISTICS — для коррелирующих столбцов.",
    examples: [
      "-- классический случай: country и city зависимы\nCREATE STATISTICS idx_geo (dependencies, ndistinct)\n  ON country, city FROM customers;\n\nANALYZE customers;\n\n-- посмотреть:\nSELECT stxname, stxkind FROM pg_statistic_ext;"
    ],
    pitfalls: [
      "Без extended stats планировщик считает столбцы независимыми и сильно ошибается в оценках",
      "Виды: ndistinct, dependencies, mcv (с PG 12)"
    ],
    learningGoals: [
      "лечить мисс-эстимейт на коррелирующих столбцах",
      "знать, когда обычной ANALYZE-статистики не хватает"
    ],
    relatedTopics: ["analyze", "selectivity"]
  },
  "shopping-list-problem": {
    title: "Проблема списка покупок (N+1)",
    summary: "Классика: «для каждого пользователя получим его заказы» в цикле — десятки тысяч запросов.",
    examples: [
      "-- ПЛОХО: N+1\nfor user in users:\n    orders[user] = SELECT * FROM orders WHERE user_id = user.id;\n\n-- ХОРОШО: один запрос с агрегацией:\nSELECT user_id, json_agg(o.*) AS orders\nFROM   orders o\nWHERE  user_id = ANY ($1::bigint[])\nGROUP  BY user_id;"
    ],
    pitfalls: [
      "Lazy-loading в ORM — главный источник N+1",
      "Включай SQL-логирование в dev — увидишь проблему сразу",
      "Альтернатива: dataloader / batch + IN (...)"
    ],
    learningGoals: ["распознавать N+1", "лечить через batch или агрегацию"]
  },

  // ===== Итерация 4: Масштабирование, программирование, тулинг =====

  // --- scaling.html ---
  "scaling-h-v": {
    title: "Горизонтальное и вертикальное масштабирование",
    summary: "Vertical: больше CPU/RAM/SSD одной машине. Horizontal: больше машин.",
    examples: [
      "Vertical: тот же сервер, больше CPU/RAM/SSD. Один Postgres-кластер, одна точка администрирования. Потолок — самая большая VM у облака (сейчас ~256 vCPU, ~2 TB RAM).",
      "Horizontal — replicas: одна primary пишет, несколько replicas читают. Снимает чтение, не снимает запись. Подходит, когда 80% трафика — SELECT.",
      "Horizontal — sharding: данные разрезаны по ключу (user_id mod 16), несколько primary одновременно. Сложно: cross-shard JOIN, миграция шардов, координация транзакций. Берут, когда vertical и replicas уже выжаты.",
      "Правило: vertical → replicas → partitioning → sharding. Большинство сервисов навсегда останавливаются на «vertical + 1 replica»."
    ],
    pitfalls: [
      "Postgres сам по себе — single-master; «горизонтально» — это реплики на чтение и шардирование",
      "Вертикалка проще, но имеет физический потолок и стоит нелинейно дорого",
      "Перед масштабированием — оптимизация запросов и индексов"
    ],
    learningGoals: [
      "видеть, какой путь оправдан в твоём сценарии",
      "понимать, что вертикальный почти всегда дешевле горизонтального"
    ]
  },
  "sharding": {
    title: "Шардирование",
    summary: "Разбиение данных по ключу между несколькими БД/кластерами.",
    examples: [
      "-- application-level sharding по user_id:\n-- shard_id = user_id % N\n-- роутинг запросов делает приложение или прокси (Vitess-подобные)\n\n-- Citus (расширение Postgres):\nCREATE EXTENSION citus;\nSELECT create_distributed_table('orders', 'user_id');"
    ],
    pitfalls: [
      "Cross-shard JOIN и транзакции дороги — проектируй ключ так, чтобы запросы укладывались в один шард",
      "Решардинг — операция уровня недели/месяца, не бери шардирование без необходимости",
      "Citus снимает много рутины, но это уже другой эксплуатационный режим"
    ],
    learningGoals: ["выбирать ключ шардирования", "понимать стоимость cross-shard запросов"],
    relatedTopics: ["sr-partitioning", "dec-partition-shard"]
  },
  "cap-theorem": {
    title: "CAP / PACELC",
    summary: "При сетевом сбое распределённая система выбирает между Consistency и Availability. PACELC — расширение для штатной работы.",
    examples: [
      "CAP: при network partition распределённая БД выбирает между C (consistency) и A (availability). Не «обычно», а в момент сбоя сети.",
      "Postgres в HA-настройке (sync replication + Patroni) — это CP: при потере связи с репликой primary блокирует записи (или отказывает реплике в подтверждении) — целостность важнее доступности.",
      "Eventually-consistent системы (Cassandra, DynamoDB по умолчанию) — AP: продолжат принимать записи на обеих сторонах, потом разрулят. Подходит, если бизнес терпит расхождения и умеет их мёржить.",
      "PACELC расширяет: если partition (P) — выбор A или C; else (E) — выбор Latency (L) или Consistency (C). Постгрес-репликации обычно EL/CP: в норме оптимизируют латенси за счёт строгой согласованности."
    ],
    pitfalls: [
      "Postgres-кластер с синхронной репликацией — CP при отказе реплики; асинхронной — CA для чтений на реплике с возможной устаревшей видимостью",
      "C из CAP — не C из ACID. Это linearizability, не «целостность ограничений»",
      "PACELC: даже без сбоев есть выбор Latency vs Consistency"
    ],
    learningGoals: [
      "переводить теорему в инженерные решения",
      "не путать CAP с гарантиями ACID одиночной БД"
    ]
  },
  "pk-choice": {
    title: "Что использовать в качестве PRIMARY KEY",
    summary: "bigint identity vs uuid v4 vs uuid v7 vs natural key.",
    examples: [
      "-- современный default — bigint identity:\nid bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY\n\n-- uuid v4 (случайный):\nid uuid PRIMARY KEY DEFAULT gen_random_uuid()\n\n-- uuid v7 (сортируемый по времени) через расширение или приложение:\n-- предпочтительно для распределённых систем"
    ],
    pitfalls: [
      "uuid v4 убивает локальность B-tree — на больших таблицах ощутимо медленнее bigint",
      "uuid v7 / ULID решают проблему за счёт временной части в начале",
      "Natural key (email, slug) — нестабилен и неудобен для FK"
    ],
    learningGoals: ["осознанно выбирать тип PK", "понимать стоимость uuid v4"]
  },
  "uuid": {
    title: "UUID в PostgreSQL",
    summary: "Тип uuid и функция gen_random_uuid (с PG 13+ встроена).",
    examples: [
      "-- встроено с PG 13:\nSELECT gen_random_uuid();\n\n-- до PG 13 — через pgcrypto:\nCREATE EXTENSION IF NOT EXISTS pgcrypto;\n\nCREATE TABLE events (\n  id   uuid PRIMARY KEY DEFAULT gen_random_uuid(),\n  data jsonb\n);"
    ],
    pitfalls: [
      "uuid v4 — случайный → плохая локальность вставок в B-tree",
      "uuid v7 — упорядочен по времени, дружит с индексами; но в Postgres его пока нет «из коробки»",
      "Размер uuid — 16 байт против 8 у bigint; индексы у uuid в полтора-два раза больше"
    ],
    learningGoals: ["знать различия v4/v7", "оценивать стоимость uuid в индексах"]
  },
  "uuid-short": {
    title: "Сокращение UUID для UI",
    summary: "Base58/Base64 представление в URL/идентификаторах вместо 36-символьного канона.",
    examples: [
      "-- 22 символа base64url вместо 36 символов классического UUID:\nSELECT replace(\n         replace(\n           encode(uuid_send(gen_random_uuid()), 'base64'),\n         '+','-'),\n       '/','_')\n  AS short_id;"
    ],
    pitfalls: [
      "Помни про padding: base64 от 16 байт даёт 24 символа; обрезка двух '=' даёт 22",
      "Base58 (без 0/O/I/l) удобнее для пользователей, но требует кода на стороне приложения"
    ],
    learningGoals: [
      "сокращать uuid для пользовательских URL",
      "помнить, что в БД храним полный UUID, а не сокращение"
    ]
  },
  "oltp-olap": {
    title: "OLTP и OLAP",
    summary: "Транзакционные системы (много мелких операций) и аналитические (тяжёлые SELECT).",
    examples: [
      "OLTP: «найти заказ по id, обновить статус» — миллионы коротких операций в секунду. Профиль: точечные SELECT + UPDATE по PK/FK, индексы решают всё.",
      "OLAP: «сколько мы заработали в каждой стране по дням за год» — десятки тысяч операций, но каждая читает миллионы строк. Профиль: GROUP BY, агрегаты, JOIN больших таблиц, индексы помогают слабо.",
      "Postgres покрывает оба, но плохо ставить тяжёлые отчёты рядом с OLTP — отчёт «съест» работу планировщику. Решение: отдельная read-replica под отчёты или отдельный аналитический warehouse (ClickHouse, BigQuery).",
      "HTAP — попытка совместить оба в одной БД. Реальная практика — всё-таки разделять, потому что профили нагрузки слишком разные."
    ],
    pitfalls: [
      "PostgreSQL — отличный OLTP; для тяжёлой аналитики чаще берут колоночные store-ы (ClickHouse, DuckDB) или специализированные хранилища",
      "Часто ставят реплику Postgres под аналитические запросы, чтобы не мешать продовому OLTP",
      "TimescaleDB — расширение Postgres для time-series, лежит между OLTP и OLAP"
    ],
    learningGoals: [
      "видеть, какой профиль нагрузки у твоего сервиса",
      "понимать, зачем под OLAP выносят отдельную реплику или хранилище"
    ]
  },

  // --- programming.html ---
  "plpgsql": {
    title: "Основы PL/pgSQL",
    summary: "Процедурный язык внутри Postgres: переменные, IF/LOOP, исключения.",
    examples: [
      "CREATE OR REPLACE FUNCTION grant_bonus(uid bigint, amount numeric)\nRETURNS numeric\nLANGUAGE plpgsql AS $$\nDECLARE\n  new_balance numeric;\nBEGIN\n  UPDATE accounts SET balance = balance + amount\n  WHERE  user_id = uid\n  RETURNING balance INTO new_balance;\n\n  IF NOT FOUND THEN\n    RAISE EXCEPTION 'нет аккаунта user_id=%', uid;\n  END IF;\n\n  RETURN new_balance;\nEXCEPTION WHEN check_violation THEN\n  RAISE NOTICE 'нарушено ограничение';\n  RETURN NULL;\nEND;\n$$;"
    ],
    pitfalls: [
      "PL/pgSQL не оптимизируется так агрессивно, как чистый SQL — где можно, оставайся в SQL",
      "BEGIN/END в PL/pgSQL — это блок кода, а не транзакция",
      "RAISE NOTICE — для логов; RAISE EXCEPTION — прерывает с откатом"
    ],
    learningGoals: ["писать простые серверные процедуры", "не злоупотреблять PL/pgSQL"],
    relatedTopics: ["functions-procedures", "triggers"]
  },
  "functions-procedures": {
    title: "Функции и процедуры",
    summary: "FUNCTION возвращает значение и работает в одной транзакции; PROCEDURE может управлять транзакцией.",
    examples: [
      "-- функция:\nCREATE OR REPLACE FUNCTION user_orders_count(uid bigint)\nRETURNS bigint LANGUAGE sql AS $$\n  SELECT count(*) FROM orders WHERE user_id = uid;\n$$;\n\nSELECT user_orders_count(42);\n\n-- процедура:\nCREATE OR REPLACE PROCEDURE archive_old_orders(days_old int)\nLANGUAGE plpgsql AS $$\nBEGIN\n  DELETE FROM orders WHERE created_at < now() - (days_old || ' days')::interval;\n  COMMIT;                       -- разрешено в PROCEDURE\nEND;\n$$;\n\nCALL archive_old_orders(365);"
    ],
    pitfalls: [
      "Procedure появилась в PG 11 и не вызывается через SELECT — только CALL",
      "В PROCEDURE можно делать COMMIT/ROLLBACK; в FUNCTION — нельзя",
      "Безопасные SECURITY DEFINER-функции требуют SET search_path"
    ],
    learningGoals: ["выбирать FUNCTION vs PROCEDURE", "знать, чем процедура отличается"],
    relatedTopics: ["plpgsql", "returns-table-setof"]
  },
  "triggers": {
    title: "Триггеры и правила",
    summary: "Триггер вызывает функцию на BEFORE/AFTER INSERT/UPDATE/DELETE/TRUNCATE.",
    examples: [
      "CREATE OR REPLACE FUNCTION set_updated_at()\nRETURNS trigger LANGUAGE plpgsql AS $$\nBEGIN\n  NEW.updated_at := now();\n  RETURN NEW;\nEND;\n$$;\n\nCREATE TRIGGER trg_users_updated_at\nBEFORE UPDATE ON users\nFOR EACH ROW\nWHEN (OLD.* IS DISTINCT FROM NEW.*)\nEXECUTE FUNCTION set_updated_at();"
    ],
    pitfalls: [
      "BEFORE-триггер видит NEW и может изменять его; AFTER — уже после записи",
      "STATEMENT-триггеры срабатывают раз на запрос; ROW — на каждую строку",
      "Триггеры — «магия»: тяжело отлаживать через год; в современных проектах часто заменяют логикой в приложении или generated columns"
    ],
    learningGoals: ["писать BEFORE UPDATE для updated_at", "знать про STATEMENT vs ROW"],
    relatedTopics: ["plpgsql", "sr-outbox"]
  },

  // --- tooling.html ---
  "tools-overview": {
    title: "Инструменты: psql, pgcli, DBeaver, PyCharm",
    summary: "CLI и GUI клиенты для повседневной работы.",
    examples: [
      "psql -h 127.0.0.1 -U postgres -d app   # стандартный CLI\npip install pgcli && pgcli postgres://user:pass@host/db   # CLI с автодополнением\n# DBeaver — кросс-платформенный GUI, поддерживает все мажорные СУБД\n# PyCharm/IntelliJ — встроенный Database Tools, удобен внутри IDE"
    ],
    pitfalls: [
      "psql установлен везде, где есть Postgres-клиент — самый портативный вариант",
      "pgcli приятен в интерактиве, но в скриптах ничего не даёт",
      "GUI хороши для просмотра, но крупные миграции лучше через psql + файлы"
    ],
    learningGoals: [
      "иметь под рукой 1–2 удобных клиента (CLI и/или GUI)",
      "знать, в чём pgcli удобнее psql и где DBeaver выигрывает"
    ],
    relatedTopics: ["psql-tricks", "pgpass"]
  },
  "psql-tricks": {
    title: "Хитрости psql и pgcli",
    summary: "\\watch, \\edit, \\timing, \\gset, \\copy, \\set HISTSIZE.",
    examples: [
      "\\timing on                    -- показывать время выполнения\n\\watch 2                      -- повторять последний запрос каждые 2 сек\n\\edit                         -- открыть последний запрос в $EDITOR\n\\copy users TO 'users.csv' CSV HEADER\n\\copy users FROM 'users.csv' CSV HEADER\n\\set ECHO_HIDDEN on           -- показывать SQL за метакомандами\n\\gexec                        -- выполнить результат предыдущего SELECT как SQL\n\\set HISTSIZE 100000          -- увеличить историю команд"
    ],
    pitfalls: [
      "\\copy идёт через клиент (быстрее всего из локального файла), COPY — через сервер",
      "\\gexec — мощный, но опасный: один лишний пробел, и ты выполнил не то",
      "\\watch не поддерживает SET — там обычная команда зацикленно повторяется"
    ],
    learningGoals: ["сократить рутину в psql", "знать про \\copy"],
    relatedTopics: ["tools-overview", "pgpass"]
  },
  "pgpass": {
    title: ".pgpass — файл с паролями",
    summary: "Безопаснее переменных окружения, не светится в ps.",
    examples: [
      "# ~/.pgpass\n# hostname:port:database:username:password\n127.0.0.1:5432:*:postgres:secret\nproduction-db.example.com:5432:app:app_user:abc123\n\n# Права обязательны:\nchmod 600 ~/.pgpass\n\n# Теперь можно без -W:\npsql -h 127.0.0.1 -U postgres -d app"
    ],
    pitfalls: [
      "Без chmod 600 psql проигнорирует файл и не предупредит",
      "* допустим в любом поле как wildcard",
      "Альтернатива — переменные PGPASSWORD/PGUSER/PGDATABASE, но они видны в `ps -ef`"
    ],
    learningGoals: ["избавиться от ввода пароля каждый раз", "не светить пароли в process list"],
    relatedTopics: ["psql-connect", "psql-tricks"]
  },
  "db-sizes": {
    title: "Размер БД, таблиц и индексов",
    summary: "Функции pg_database_size, pg_total_relation_size, pg_size_pretty.",
    examples: [
      "-- по БД:\nSELECT datname, pg_size_pretty(pg_database_size(datname)) AS size\nFROM   pg_database\nORDER  BY pg_database_size(datname) DESC;\n\n-- топ-20 таблиц по полному размеру (heap+toast+индексы):\nSELECT n.nspname || '.' || c.relname AS rel,\n       pg_size_pretty(pg_total_relation_size(c.oid))   AS total,\n       pg_size_pretty(pg_relation_size(c.oid))         AS heap,\n       pg_size_pretty(pg_indexes_size(c.oid))          AS idx\nFROM   pg_class c\nJOIN   pg_namespace n ON n.oid = c.relnamespace\nWHERE  c.relkind = 'r'\n  AND  n.nspname NOT IN ('pg_catalog','information_schema')\nORDER  BY pg_total_relation_size(c.oid) DESC\nLIMIT  20;"
    ],
    pitfalls: [
      "pg_relation_size — только heap; pg_total_relation_size — heap + toast + индексы",
      "Раздутый индекс — кандидат на REINDEX CONCURRENTLY",
      "Размер БД не уменьшится после DELETE — нужен VACUUM (не FULL — он переписывает таблицу)"
    ],
    learningGoals: [
      "находить «толстые» таблицы и индексы",
      "отличать pg_relation_size от pg_total_relation_size"
    ]
  },
  "sqlite-comparison": {
    title: "SQLite vs PostgreSQL",
    summary: "Когда хватит SQLite, а когда нужен Postgres.",
    examples: [
      "SQLite: embedded, один файл, без сервера. Идеально для desktop-приложений, мобильных, тестов, локальных утилит. Поддерживает SQL-92 с расширениями.",
      "Postgres: клиент-сервер, многопользовательский, ACID на уровне продакшна, расширения (PostGIS, pg_trgm, fdw), репликация. Нужен отдельный процесс / контейнер / сервис.",
      "Когда SQLite ок: один писатель, до ~миллиона записей, не требуется сетевой доступ. Когда нужен Postgres: одновременные писатели, дальше развитие, веб-приложение, нужны типы вроде jsonb или array.",
      "Миграция SQLite → Postgres почти всегда «не сейчас» — но она будет проще, если изначально не используешь SQLite-специфичные фичи (типы AUTOINCREMENT, datetime через text)."
    ],
    pitfalls: [
      "SQLite — встраиваемая, файл на диске; писатель один за раз",
      "Postgres — клиент-сервер, конкурентные writers, расширения, репликация",
      "SQLite отлично подходит для мобильных приложений, локальных кешей, тестов; Postgres — для бэкенд-сервисов"
    ],
    learningGoals: ["видеть, когда SQLite — лучший выбор", "не тащить Postgres туда, где не нужен"]
  },

  "explain-before-after": {
    title: "EXPLAIN до и после индекса",
    summary: "Сравнение Seq Scan и Index Scan на одном запросе.",
    examples: [
      "EXPLAIN (ANALYZE, BUFFERS) SELECT * FROM orders WHERE user_id = 1;"
    ],
    pitfalls: [
      "Rows Removed by Filter — признак, что индекс не задействован",
      "Buffers shared hit/read важнее «времени»: время плавает между прогонами"
    ],
    learningGoals: ["читать актуальные строки плана", "видеть эффект индекса"],
    relatedTopics: ["explain", "composite-index"]
  },

  // ===== decisions.html =====
  "dec-index": {
    title: "Какой индекс выбрать",
    summary: "Дерево решений для подбора индекса под запрос.",
    examples: [
      "Дерево решений: запрос с равенством по 1 столбцу + сортировкой → b-tree на (eq_col, sort_col). Запрос ILIKE '%foo%' → gin_trgm_ops. JSONB-поиск по @> → GIN.",
      "Range-запрос (created_at BETWEEN ...) на гигантской упорядоченной таблице → BRIN. Полнотекст → GIN на tsvector. «Найти ближайший геометрически» → GiST.",
      "Скрытый совет: иногда лучший индекс — partial. WHERE status = 'pending' и пишут только в pending-строки 1% времени → CREATE INDEX … WHERE status = 'pending' гораздо компактнее и быстрее.",
      "Когда индекс не нужен: маленькая таблица (<10k строк) или сильно неселективный предикат (status = 'active' и таких 90% строк)."
    ],
    pitfalls: ["Композитный индекс работает по leftmost prefix", "GIN/jsonb_path_ops — только для @>"],
    learningGoals: [
      "сопоставлять запрос и тип индекса (b-tree / GIN / BRIN / hash)",
      "видеть, когда индекс не нужен совсем"
    ],
    relatedTopics: ["composite-index", "gin-index", "selectivity"]
  },
  "dec-isolation": {
    title: "Какой уровень изоляции выбрать",
    summary: "READ COMMITTED / REPEATABLE READ / SERIALIZABLE.",
    examples: [
      "READ COMMITTED — дефолт. Берёшь, если транзакция короткая и не требует «увидеть всё то же самое второй раз внутри себя».",
      "REPEATABLE READ — берёшь, если внутри одной транзакции делаешь несколько SELECT и не хочешь, чтобы ответы между ними изменились. Хорошо для отчётов и сложных вычислений.",
      "SERIALIZABLE — берёшь там, где есть инвариант, который ломается параллельной транзакцией (классический write skew: «врачей в смене не меньше двух»). Готовься обрабатывать serialization_failure и повторять транзакцию.",
      "Правило: начинай с READ COMMITTED, поднимай уровень там, где появилась гонка. Не «на всякий случай»."
    ],
    pitfalls: ["SERIALIZABLE может бросать 40001 — приложение должно ретраить", "Lost update лечится FOR UPDATE, а не более высоким уровнем"],
    learningGoals: [
      "выбирать минимально достаточный уровень изоляции",
      "знать симптомы phantom read и lost update"
    ],
    relatedTopics: ["iso-summary", "iso-serializable"]
  },
  "dec-id-type": {
    title: "Какой тип ID для PK",
    summary: "Выбор между bigint identity (компактно, монотонно), UUID v4 (рандом, фрагментирует индекс) и UUID v7 (рандом + время, лучшее из двух миров).",
    examples: [
      "bigint identity: 8 байт, монотонный, идеален для b-tree, видно «как давно создано». Минус — нужно roundtrip к БД для получения id (если генерится в БД).",
      "UUID v4: случайный, 16 байт. Можно генерить на клиенте без roundtrip. Минус: фрагментирует b-tree, индексы пухнут, ID непредсказуемы — что иногда плюс (защита от перебора), иногда минус.",
      "UUID v7: timestamp + random в 128 бит. Локально упорядочен, генерится на клиенте — лучшие свойства обоих миров. Стандартизован, поддержка в библиотеках растёт.",
      "Правило: внутренний сервис без публичных id → bigint identity. API с публичными id, которые не должны угадываться → UUID v7. UUID v4 → если уже legacy."
    ],
    pitfalls: ["UUID v4 рассыпает индекс случайно — медленнее вставки", "money тип в Postgres — антипаттерн"],
    learningGoals: [
      "выбирать ID под предсказуемость, видимость и распределённость",
      "понимать, почему UUID v4 плох для b-tree-индекса"
    ],
    relatedTopics: ["sequences", "uuid", "pk-choice"]
  },
  "dec-partition-shard": {
    title: "Партиционирование vs шардинг",
    summary: "Когда хватит partition, а когда нужен шардинг.",
    examples: [
      "Partitioning: одна БД, одна primary; таблица events разделена на events_2026_05 / events_2026_06 / … по ts. Старые партиции дропаются мгновенно. Размер БД: единицы TB.",
      "Sharding: несколько отдельных БД-кластеров; данные разрезаны по ключу (например, user_id mod 16). Каждый кластер самостоятельный. Размер: десятки-сотни TB, или нагрузка превышает один сервер.",
      "Между ними: реплики. Primary + 3 read-replicas снимут 80% чтений и часто хватает до серьёзных масштабов.",
      "Шардинг — это не «следующий шаг после партиций». Шардинг ломает JOIN, миграции, транзакции. Берёшь его только когда vertical, replicas и partitioning уже исчерпаны."
    ],
    pitfalls: ["Шардинг — дорого; индексы и партиции часто решают", "PARTITION BY RANGE/LIST помогает с DROP старых данных"],
    learningGoals: [
      "оценивать масштабы прежде, чем тянуться к шардингу",
      "видеть, что партиционирование решает локальные проблемы, а шардинг — нет"
    ],
    relatedTopics: ["sr-partitioning", "sharding"]
  },
  "dec-money-types": {
    title: "Какой тип для денег",
    summary: "numeric vs bigint в копейках vs money vs float.",
    examples: ["numeric(12, 2) NOT NULL CHECK (price >= 0)"],
    pitfalls: ["float — approximate, нельзя для финансовых расчётов", "money зависит от lc_monetary"],
    learningGoals: [
      "хранить деньги без сюрпризов округления",
      "выбирать между numeric и копейками в bigint осознанно"
    ],
    relatedTopics: ["types-numbers"]
  },

  // ===== copy.html =====
  "copy-formats": {
    title: "Форматы COPY: TEXT, CSV, BINARY",
    summary: "TEXT — компактен, по умолчанию. CSV — для интероп с Excel/таблицами. BINARY — самый быстрый, но не читается глазами и не переносим между архитектурами.",
    examples: [
      "COPY users FROM '/tmp/users.csv' WITH (FORMAT csv, HEADER);",
      "COPY orders TO '/tmp/orders.bin' WITH (FORMAT binary);"
    ],
    pitfalls: [
      "TEXT — tab-separated с escape; не путай с CSV",
      "BINARY быстрее, но нечитаем и привязан к версии/архитектуре",
      "FORMAT csv требует HEADER, если файл с заголовками"
    ],
    learningGoals: [
      "выбирать формат COPY под задачу (TEXT / CSV / BINARY)",
      "понимать, чем BINARY быстрее и в чём минусы"
    ],
    relatedTopics: ["copy-stdin", "copy-tuning"]
  },
  "copy-stdin": {
    title: "\\copy и COPY FROM STDIN",
    summary: "Загрузка с клиента, без доступа сервера к файлам.",
    examples: [
      "psql -d app -c \"\\copy users FROM '/local/users.csv' WITH (FORMAT csv, HEADER)\"",
      "cat users.csv | psql -d app -c \"COPY users FROM STDIN WITH (FORMAT csv, HEADER)\""
    ],
    pitfalls: [
      "COPY 'path' читает файл на сервере, нужны права",
      "\\copy — это команда psql, не SQL"
    ],
    learningGoals: [
      "загружать локальные файлы без серверных прав",
      "знать различие \\copy (клиент) и COPY (сервер)"
    ],
    relatedTopics: ["copy-formats", "copy-vs-pgdump"]
  },
  "copy-tuning": {
    title: "Тюнинг массовой загрузки",
    summary: "UNLOGGED, удаление индексов, maintenance_work_mem.",
    examples: [
      "ALTER TABLE big_table SET UNLOGGED;\nDROP INDEX ...;\nSET maintenance_work_mem = '1GB';\nCOPY big_table FROM '/data/big.csv' WITH (FORMAT csv, HEADER);\nALTER TABLE big_table SET LOGGED;\nCREATE INDEX ...;\nANALYZE big_table;"
    ],
    pitfalls: [
      "UNLOGGED не реплицируется и теряется при крэше",
      "FK и индексы во время COPY дорого; ребилди после",
      "Без ANALYZE планировщик слепой"
    ],
    learningGoals: ["ускорять разовые загрузки", "возвращать ограничения после"],
    relatedTopics: ["copy-formats", "sr-pgrestore-parallel"]
  },
  "copy-from-program": {
    title: "COPY FROM PROGRAM",
    summary: "Принимаем stdout произвольной команды как вход COPY.",
    examples: [
      "COPY users FROM PROGRAM 'gunzip -c /data/users.csv.gz' WITH (FORMAT csv, HEADER);"
    ],
    pitfalls: [
      "Команда выполняется на сервере от имени postgres — мощная и опасная функция",
      "С PG 11 — роль pg_execute_server_program вместо полного SUPERUSER"
    ],
    learningGoals: [
      "применять COPY FROM PROGRAM с пониманием угроз",
      "избегать его в untrusted-контекстах"
    ],
    relatedTopics: ["copy-formats"]
  },
  "copy-vs-pgdump": {
    title: "COPY vs pg_dump",
    summary: "COPY — про одну таблицу без схемы (быстрая загрузка). pg_dump — про целую БД со схемой, индексами, FK и владельцами. Сценарии не пересекаются.",
    examples: [
      "COPY: про одну таблицу, без схемы. Очень быстро, потоковый ввод/вывод, формат TEXT / CSV / BINARY. Не сохраняет индексы / триггеры / FK.",
      "pg_dump: про целую БД (или её часть). Сохраняет DDL, последовательности, разрешения, владельцев. Формат plain (читаемый), custom (-Fc, для pg_restore), directory (-Fd, параллельный).",
      "Сценарий «загрузить 50M строк из CSV в существующую таблицу» — COPY. Сценарий «перенести БД на новый сервер» — pg_dump -Fc + pg_restore -j 8.",
      "Гибрид: pg_dump --schema-only для DDL + COPY на каждую таблицу — позволяет параллелить переезд гигантских БД, когда стандартный pg_restore не справляется."
    ],
    pitfalls: [
      "pg_dump — структура + данные одной БД; COPY — только данные",
      "pg_restore -j параллелит данные и индексы; COPY однопоточный"
    ],
    learningGoals: [
      "выбирать инструмент под сценарий переноса",
      "понимать, что COPY — про таблицы, pg_dump — про схему и данные целиком"
    ],
    relatedTopics: ["sr-pgdump-formats", "copy-stdin"]
  },

  // ===== JSONB углубление =====
  "jsonb-ops-vs-pathops": {
    title: "jsonb_ops vs jsonb_path_ops",
    summary: "Два operator class-а для GIN-индекса по jsonb.",
    examples: [
      "CREATE INDEX ... ON docs USING GIN (data);                  -- jsonb_ops",
      "CREATE INDEX ... ON docs USING GIN (data jsonb_path_ops);   -- меньше, быстрее на @>"
    ],
    pitfalls: [
      "jsonb_path_ops поддерживает только @>",
      "jsonb_ops крупнее, но универсальнее"
    ],
    learningGoals: [
      "выбирать operator class под нагрузку",
      "учитывать стоимость поддержки индекса при изменениях"
    ],
    relatedTopics: ["jsonb", "gin-index"]
  },
  "jsonb-jsonpath": {
    title: "JSONPath: jsonb_path_query и @@",
    summary: "JSONPath (@@, @?) — стандартный язык запросов внутри jsonb. Похож на XPath: «найди всех пользователей, у которых tag = 'pro' и at least one orders.total > 100».",
    examples: [
      "SELECT * FROM docs WHERE data @@ '$.priority > 5';",
      "SELECT jsonb_path_query(data, '$.items[*].sku') FROM docs;"
    ],
    pitfalls: [
      "@@ — boolean-предикат; @? — существование пути",
      "JSONPath ≠ JSON Pointer; синтаксис свой"
    ],
    learningGoals: ["писать выборки JSONPath", "видеть разницу между @@ и @?"],
    relatedTopics: ["jsonb", "jsonb-ops-vs-pathops"]
  },
  "jsonb-expression-index": {
    title: "Индекс по выражению из jsonb",
    summary: "B-tree по конкретному пути — дешевле GIN, если запросы фиксированы.",
    examples: [
      "CREATE INDEX idx_docs_role ON docs ((data->>'role'));",
      "CREATE INDEX idx_docs_priority ON docs (((data->>'priority')::int));"
    ],
    pitfalls: [
      "Тип ->>'...' — text; для чисел нужен явный cast и тот же cast в запросе"
    ],
    learningGoals: ["когда B-tree дешевле GIN", "писать соответствующий WHERE"],
    relatedTopics: ["jsonb", "expression-index"]
  },

  // ===== window.html =====
  "win-intro": {
    title: "OVER — окно для каждой строки",
    summary: "Агрегат + OVER = считаем по группе, но не схлопываем строки.",
    examples: [
      "SELECT id, total, sum(total) OVER (PARTITION BY user_id) FROM orders;"
    ],
    pitfalls: [
      "Без OVER агрегат схлопывает строки",
      "PARTITION BY делит на группы, ORDER BY — задаёт порядок внутри"
    ],
    learningGoals: [
      "отличать обычные агрегаты от оконных",
      "понимать роль OVER и пустого OVER()"
    ],
    relatedTopics: ["win-ranking", "win-running-total", "group-by"]
  },
  "win-frames": {
    title: "Кадры окна: ROWS / RANGE / GROUPS",
    summary: "Frame — окно строк, по которым считается оконная функция. ROWS BETWEEN n PRECEDING AND CURRENT ROW для скользящего среднего, RANGE для интервалов значений.",
    examples: [
      "ROWS BETWEEN 2 PRECEDING AND CURRENT ROW",
      "RANGE BETWEEN INTERVAL '7 days' PRECEDING AND CURRENT ROW",
      "GROUPS BETWEEN 1 PRECEDING AND CURRENT ROW"
    ],
    pitfalls: [
      "Дефолтный кадр часто работает не так, как ожидаешь — задавай явно",
      "RANGE объединяет строки с одинаковым ключом ORDER BY",
      "GROUPS появился в PG 11"
    ],
    learningGoals: ["задавать кадр точно", "выбирать тип под задачу"],
    relatedTopics: ["win-intro", "win-running-total"]
  },
  "win-lag-lead": {
    title: "LAG / LEAD",
    summary: "LAG(x, n) даёт значение x из n строк назад внутри окна, LEAD — на n вперёд. Базовый инструмент для diff-ов «по сравнению с прошлым месяцем».",
    examples: [
      "lag(total) OVER (PARTITION BY user_id ORDER BY created_at)",
      "lead(created_at) OVER (...)"
    ],
    pitfalls: [
      "lag без offset — это lag(col, 1)",
      "lag(col, 1, default) — третий аргумент защищает от NULL"
    ],
    learningGoals: ["считать дельты", "находить gaps между событиями"],
    relatedTopics: ["win-running-total", "win-intro"]
  },
  "win-first-last-value": {
    title: "FIRST_VALUE / LAST_VALUE / NTH_VALUE",
    summary: "FIRST_VALUE / LAST_VALUE / NTH_VALUE — взять значение из конкретной позиции окна. Внимание: LAST_VALUE без явного frame даёт текущую строку, а не последнюю.",
    examples: [
      "first_value(id) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)"
    ],
    pitfalls: [
      "LAST_VALUE с дефолтным RANGE возвращает текущую строку, а не последнюю — нужен явный frame UNBOUNDED ... UNBOUNDED"
    ],
    learningGoals: [
      "задавать симметричный frame для корректного LAST_VALUE",
      "знать, что NTH_VALUE — это не RANK"
    ],
    relatedTopics: ["win-intro", "win-frames"]
  },
  "win-ranking": {
    title: "ROW_NUMBER / RANK / DENSE_RANK",
    summary: "Три способа пронумеровать строки внутри окна.",
    examples: [
      "row_number() OVER (PARTITION BY user_id ORDER BY total DESC)"
    ],
    pitfalls: [
      "row_number — всегда уникален; rank — пропуски после ничьих; dense_rank — без пропусков"
    ],
    learningGoals: [
      "выбирать ROW_NUMBER vs RANK vs DENSE_RANK по требованиям",
      "знать поведение всех трёх при равных значениях"
    ],
    relatedTopics: ["win-intro", "win-top-n"]
  },
  "win-running-total": {
    title: "Running totals",
    summary: "Нарастающий итог, нарастающее число событий.",
    examples: [
      "sum(total) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)"
    ],
    pitfalls: ["Без явного frame можно получить «весь partition» вместо нарастающего итога"],
    learningGoals: [
      "писать классический running total через SUM() OVER",
      "помнить про порядок ORDER BY в окне"
    ],
    relatedTopics: ["win-intro", "win-frames"]
  },
  "win-top-n": {
    title: "Top-N per group",
    summary: "Дай мне 3 лучших заказа на каждого пользователя.",
    examples: [
      "SELECT * FROM (SELECT *, row_number() OVER (PARTITION BY user_id ORDER BY total DESC) rn FROM orders) WHERE rn <= 3;",
      "SELECT u.email, t.* FROM users u JOIN LATERAL (SELECT id FROM orders o WHERE o.user_id = u.id ORDER BY total DESC LIMIT 3) t ON true;"
    ],
    pitfalls: ["LATERAL часто эффективнее window-функции на огромных таблицах"],
    learningGoals: [
      "писать top-N через row_number и через LATERAL JOIN",
      "выбирать между ними по плану EXPLAIN"
    ],
    relatedTopics: ["win-ranking", "win-dedupe", "lateral-join"]
  },
  "win-dedupe": {
    title: "Dedupe — оставить одну строку из дубликатов",
    summary: "Оставить из набора дублей одну запись (самую свежую, самую полную). ROW_NUMBER() OVER (PARTITION BY ключ ORDER BY критерий) + WHERE rn = 1.",
    examples: [
      "WITH ranked AS (SELECT id, row_number() OVER (PARTITION BY lower(email) ORDER BY created_at DESC) rn FROM users)\nDELETE FROM users u USING ranked r WHERE u.id = r.id AND r.rn > 1;"
    ],
    pitfalls: ["Перед DELETE — обязательно SELECT-проверка с тем же CTE"],
    learningGoals: [
      "безопасно чистить дубли через ROW_NUMBER",
      "проверять выборку перед DELETE на проде"
    ],
    relatedTopics: ["win-top-n", "win-ranking"]
  },
  "win-named": {
    title: "Именованные окна (WINDOW)",
    summary: "Один WINDOW — несколько функций над тем же кадром.",
    examples: [
      "SELECT sum(total) OVER w, row_number() OVER w FROM orders WINDOW w AS (PARTITION BY user_id ORDER BY created_at);"
    ],
    pitfalls: ["Без именованного окна одинаковая спецификация в нескольких местах — копипаста"],
    learningGoals: [
      "использовать WINDOW для DRY, когда несколько функций над тем же кадром",
      "повышать читаемость запроса"
    ],
    relatedTopics: ["win-intro", "win-frames"]
  },

  // ===== Расширенная репликация =====
  "sr-physical-vs-logical": {
    title: "Физическая vs логическая репликация",
    summary: "Что копируется, ограничения, типичные применения.",
    examples: [
      "CREATE PUBLICATION app_pub FOR TABLE users, orders;\nCREATE SUBSCRIPTION app_sub CONNECTION '...' PUBLICATION app_pub;"
    ],
    pitfalls: [
      "Логическая не передаёт DDL — миграции вручную с обеих сторон",
      "Физическая требует совпадения мажорной версии и архитектуры",
      "Логическая поверх физической — для неё нужен wal_level = logical и slot"
    ],
    learningGoals: ["выбирать тип под задачу", "понимать ограничения каждой"],
    relatedTopics: ["sr-replication", "sr-sync-async"]
  },
  "sr-sync-async": {
    title: "Синхронная vs асинхронная репликация",
    summary: "synchronous_commit и synchronous_standby_names.",
    examples: [
      "synchronous_standby_names = 'ANY 1 (replica1, replica2)'",
      "SET LOCAL synchronous_commit = local;"
    ],
    pitfalls: [
      "Async — возможна потеря последних транзакций при крэше",
      "Sync без живой реплики — primary встаёт",
      "remote_apply дороже всего, но даёт read-after-write на реплике"
    ],
    learningGoals: ["понимать уровни synchronous_commit", "разделять чувствительные и нет транзакции"],
    relatedTopics: ["sr-replication", "sr-replication-slots"]
  },
  "sr-replication-slots": {
    title: "Replication slots, wal_keep_size",
    summary: "Слот — запрос реплики «держи WAL, пока я не догоню». Без слота реплика отстаёт и навсегда теряется; со слотом — primary держит WAL, заброшенный слот забивает диск.",
    examples: [
      "SELECT pg_create_physical_replication_slot('replica1');",
      "SELECT slot_name, slot_type, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal FROM pg_replication_slots;"
    ],
    pitfalls: [
      "Заброшенный слот пухнет и забивает диск",
      "max_slot_wal_keep_size — обязательная защита",
      "wal_keep_size заменил wal_keep_segments с PG 13"
    ],
    learningGoals: ["управлять слотами", "следить за объёмом WAL"],
    relatedTopics: ["sr-replication", "sr-failover"]
  },
  "sr-failover": {
    title: "Failover и оркестрация",
    summary: "Patroni, pg_auto_failover, repmgr — что делает каждый.",
    examples: [
      "patronictl -c patroni.yml list\npatronictl -c patroni.yml switchover"
    ],
    pitfalls: [
      "Patroni требует DCS (etcd / Consul / ZooKeeper)",
      "pg_rewind дешевле, чем basebackup, для возврата старого primary",
      "Switchover — управляемый, failover — аварийный"
    ],
    learningGoals: ["понимать роль оркестратора", "выбирать решение под инфраструктуру"],
    relatedTopics: ["sr-replication", "sr-pgbouncer"]
  },

  // ===== Расширенные бэкапы =====
  "sr-pgdump-formats": {
    title: "pg_dump / pg_dumpall: форматы",
    summary: "Plain SQL, custom (-Fc), directory (-Fd), tar (-Ft).",
    examples: [
      "pg_dump -Fc -f app.dump app",
      "pg_dump -Fd -j 4 -f /backup/app_dir app",
      "pg_dumpall --globals-only > globals.sql"
    ],
    pitfalls: [
      "Plain нельзя восстанавливать частично",
      "pg_dumpall — единственный, кто экспортирует роли и табл-пространства",
      "Custom уже сжат, ещё раз gzip-ом не нужно"
    ],
    learningGoals: ["выбирать формат под задачу", "разделять кластерные и БД-объекты"],
    relatedTopics: ["sr-pgrestore-parallel", "sr-backup-pitr"]
  },
  "sr-pgrestore-parallel": {
    title: "pg_restore -j: параллельное восстановление",
    summary: "pg_restore -j N разворачивает таблицы и индексы из custom/directory-дампа в N потоков. Самый дешёвый способ ускорить восстановление большой БД.",
    examples: [
      "pg_restore -d app -j 8 /backup/app.dump",
      "pg_restore -d app --section=pre-data /backup/app.dump\npg_restore -d app --section=data -j 8 /backup/app.dump\npg_restore -d app --section=post-data -j 8 /backup/app.dump"
    ],
    pitfalls: [
      "-j работает только с -Fc и -Fd, не с plain SQL",
      "Перед массовым restore — поднять max_wal_size, maintenance_work_mem",
      "После restore нужен ANALYZE — иначе планировщик слепой"
    ],
    learningGoals: ["распараллеливать восстановление", "разбивать на секции pre/data/post"],
    relatedTopics: ["sr-pgdump-formats", "copy-vs-pgdump"]
  },
  "sr-pgbackrest-walg": {
    title: "pgBackRest и WAL-G",
    summary: "Промышленные инструменты физических бэкапов и PITR.",
    examples: [
      "pgbackrest --stanza=main backup --type=full\npgbackrest --stanza=main restore --target='2026-05-09 12:00:00' --type=time",
      "wal-g backup-push /var/lib/postgresql/16/main\nwal-g backup-fetch /var/lib/postgresql/16/main LATEST"
    ],
    pitfalls: [
      "archive_command должен быть надёжным — иначе WAL копится на сервере",
      "Шифрование repo — обязательно для облака",
      "Бэкап без проверки restore — это не бэкап"
    ],
    learningGoals: ["настроить промышленный бэкап с PITR", "понимать full/diff/incremental"],
    relatedTopics: ["sr-backup-pitr", "sr-backup-retention"]
  },
  "sr-backup-retention": {
    title: "Retention и тестирование бэкапов",
    summary: "Сколько хранить и как убедиться, что разворачивается.",
    examples: [
      "repo1-retention-full=2\nrepo1-retention-diff=7\nrepo1-retention-archive=2",
      "pgbackrest --stanza=main verify"
    ],
    pitfalls: [
      "RPO и RTO — два разных KPI; путать их — классика",
      "DR-учения раз в квартал, иначе план «восстановления» — фикция",
      "Контрольные суммы страниц нужны, чтобы битый сектор не уехал в бэкапы"
    ],
    learningGoals: ["задавать политику хранения", "отрабатывать DR-сценарий"],
    relatedTopics: ["sr-backup-pitr", "sr-recovery-checklist"]
  },
  "sr-recovery-checklist": {
    title: "Чек-лист восстановления",
    summary: "Порядок действий при инциденте: фиксация → план → изоляция → restore → проверка → переключение → postmortem.",
    examples: [
      "Час Х: упало в 14:32, кто-то заметил в 14:45. Первое — НЕ трогать прод до плана. Второе — определить: что упало (одна таблица? кластер? сеть?), что надо вернуть (данные? сервис? оба?), куда (тот же сервер? новый?).",
      "Не разворачивай восстановление поверх кривого прода — потеряешь и его. Всегда новое окружение: staging-сервер, новый каталог, новый кластер.",
      "PITR (point-in-time recovery): pgbackrest restore --target='2026-05-13 14:30:00' --type=time — раскатать состояние на минуту до инцидента. Требует архивации WAL и предыдущего полного бэкапа.",
      "После восстановления — обязательная проверка целостности (SELECT count(*) по ключевым таблицам, последние транзакции, чек-сы) и только потом переключение трафика. И постмортем."
    ],
    pitfalls: [
      "Не лей restore поверх боевого $PGDATA — потеряешь и текущее состояние",
      "Перед любыми правками — снимок «места преступления» (логи, $PGDATA)",
      "Старый кластер выключить, но не удалять — пригодится для разбора"
    ],
    learningGoals: ["восстанавливать без импровизации", "разделять рестор и переключение трафика"],
    relatedTopics: ["sr-backup-pitr", "sr-pgbackrest-walg"]
  },

  // ===== tuning.html =====
  "cfg-shared-buffers": {
    title: "shared_buffers",
    summary: "Размер буфер-пула Postgres — внутреннего кеша страниц. Дефолт 128 МБ; на проде ставят 25% RAM. Слишком большое значение конкурирует с ОС-кешем.",
    examples: [
      "SHOW shared_buffers;",
      "shared_buffers = 8GB"
    ],
    pitfalls: [
      "Требует рестарта (shared memory)",
      "Больше 32 ГБ обычно не растёт эффект",
      "Слишком большой = двойное буферирование с кешем ОС"
    ],
    learningGoals: ["видеть hit-ratio", "понимать связь с кешем ОС"],
    relatedTopics: ["cfg-effective-cache-size", "cfg-work-mem"]
  },
  "cfg-work-mem": {
    title: "work_mem",
    summary: "Лимит памяти на каждую сортировку/хеш-операцию.",
    examples: [
      "SET work_mem = '64MB';",
      "EXPLAIN (ANALYZE) ... -- ищем 'external merge'"
    ],
    pitfalls: [
      "Это лимит на каждую операцию, а не на запрос",
      "Реальный пик: max_connections × запросы × work_mem × кол-во операций",
      "Поднимай локально (SET LOCAL), а не глобально"
    ],
    learningGoals: ["читать Sort Method в EXPLAIN", "ставить work_mem на сессию"],
    relatedTopics: ["cfg-maintenance-work-mem", "sr-planner-knobs"]
  },
  "cfg-effective-cache-size": {
    title: "effective_cache_size",
    summary: "Подсказка планировщику о том, сколько памяти доступно под кеш (Postgres + ОС суммарно). Не выделяет память — только влияет на оценку стоимости плана.",
    examples: [
      "effective_cache_size = 24GB"
    ],
    pitfalls: [
      "Это не выделение памяти, а оценка",
      "Слишком мало → лишние seq-scan",
      "Меняется на лету (SIGHUP)"
    ],
    learningGoals: ["задавать 50–75% RAM", "понимать влияние на выбор плана"],
    relatedTopics: ["cfg-shared-buffers", "sr-planner-knobs"]
  },
  "cfg-maintenance-work-mem": {
    title: "maintenance_work_mem",
    summary: "Память для VACUUM, CREATE INDEX, REINDEX, ALTER TABLE.",
    examples: [
      "SET maintenance_work_mem = '1GB';\nREINDEX INDEX CONCURRENTLY idx_orders_user_id;"
    ],
    pitfalls: [
      "autovacuum использует autovacuum_work_mem (по умолчанию = maintenance_work_mem)",
      "Поднимать перед миграциями и ребилдами"
    ],
    learningGoals: [
      "ускорять разовые операции (CREATE INDEX, VACUUM)",
      "поднимать локально через SET для сессии-мигратора"
    ],
    relatedTopics: ["cfg-work-mem", "vacuum-basic"]
  },
  "cfg-checkpoint": {
    title: "checkpoint_timeout, max_wal_size, completion_target",
    summary: "Размазываем запись «грязных» страниц во времени.",
    examples: [
      "checkpoint_timeout = '15min'\nmax_wal_size = '8GB'\ncheckpoint_completion_target = 0.9",
      "SELECT * FROM pg_stat_bgwriter;"
    ],
    pitfalls: [
      "Много checkpoints_req = max_wal_size мал",
      "Слишком большой timeout = долгий recovery",
      "full_page_writes должен быть on на проде"
    ],
    learningGoals: ["читать pg_stat_bgwriter", "балансировать IO и recovery time"],
    relatedTopics: ["cfg-wal-level", "cfg-shared-buffers"]
  },
  "cfg-wal-level": {
    title: "wal_level",
    summary: "minimal / replica / logical — что писать в WAL.",
    examples: [
      "wal_level = replica",
      "archive_mode = on\narchive_command = 'pgbackrest --stanza=main archive-push %p'"
    ],
    pitfalls: [
      "logical больше по объёму; включай только если нужен CDC/logical replication",
      "minimal не даст ни PITR, ни реплик"
    ],
    learningGoals: [
      "выбирать уровень под задачу (replica для streaming, logical для CDC)",
      "не оставлять logical, если он не нужен — это лишняя нагрузка"
    ],
    relatedTopics: ["sr-replication", "sr-physical-vs-logical"]
  },
  "cfg-autovacuum": {
    title: "autovacuum: пороги срабатывания",
    summary: "Глобальные параметры + per-table тюнинг.",
    examples: [
      "ALTER TABLE orders SET (\n  autovacuum_vacuum_scale_factor = 0.05,\n  autovacuum_analyze_scale_factor = 0.02\n);",
      "SELECT relname, n_live_tup, n_dead_tup, last_autovacuum FROM pg_stat_user_tables ORDER BY n_dead_tup DESC LIMIT 10;"
    ],
    pitfalls: [
      "scale_factor 0.2 для огромной таблицы — слишком редко",
      "Никогда не выключай autovacuum — только перенастраивай",
      "cost_delay тормозит autovacuum; на горячих таблицах нужно его уменьшать"
    ],
    learningGoals: ["per-table тюнинг", "видеть n_dead_tup"],
    relatedTopics: ["vacuum-basic", "analyze"]
  },
  "cfg-max-connections": {
    title: "max_connections",
    summary: "Каждое соединение — процесс и память. Высокий лимит дорог.",
    examples: [
      "SHOW max_connections;",
      "SELECT state, count(*) FROM pg_stat_activity GROUP BY state;"
    ],
    pitfalls: [
      "Эмпирика: max_connections ≈ 4 × CPU cores; дальше пул",
      "Сотни idle = нет пула на стороне приложения",
      "Поднимать без необходимости — терять память на shared structures"
    ],
    learningGoals: [
      "видеть текущую нагрузку через pg_stat_activity",
      "знать, что после ~200 коннекций имеет смысл PgBouncer"
    ],
    relatedTopics: ["sr-pgbouncer", "sr-observability"]
  },
  "cfg-pgbouncer": {
    title: "PgBouncer: режимы пулинга",
    summary: "session / transaction / statement — что они меняют.",
    examples: [
      "pool_mode = transaction\ndefault_pool_size = 25\nmax_client_conn = 2000",
      "psql -h 127.0.0.1 -p 6432 pgbouncer -U pgbouncer -c 'SHOW POOLS;'"
    ],
    pitfalls: [
      "transaction-режим ломает LISTEN, временные таблицы, SET вне транзакции",
      "prepared statements клиента в transaction-режиме без поддержки protocol-level — не работают",
      "statement-режим запрещает мульти-stmt транзакции"
    ],
    learningGoals: ["выбирать режим под драйвер", "читать SHOW POOLS"],
    relatedTopics: ["sr-pgbouncer", "cfg-max-connections"]
  },
  "cfg-planner-io": {
    title: "random_page_cost, effective_io_concurrency",
    summary: "Стоимости IO для планировщика; параллельное случайное чтение.",
    examples: [
      "random_page_cost = 1.1\neffective_io_concurrency = 200"
    ],
    pitfalls: [
      "Дефолт 4.0 для HDD; на SSD «боится» индекс-сканов",
      "effective_io_concurrency для NVMe — 100–300",
      "jit = on иногда замедляет короткие OLTP"
    ],
    learningGoals: ["настроить cost под SSD", "понимать влияние на выбор плана"],
    relatedTopics: ["sr-planner-knobs", "sr-explain-deep"]
  },

  // ===== security.html =====
  "sec-pg-hba": {
    title: "pg_hba.conf и порядок правил",
    summary: "Кто, откуда, в какую БД и под какой ролью может подключаться.",
    examples: [
      "host    all       app           10.0.0.0/8      scram-sha-256",
      "hostssl all       all           0.0.0.0/0       scram-sha-256",
      "SELECT * FROM pg_hba_file_rules;"
    ],
    pitfalls: [
      "Правила применяются по порядку — первая подходящая выигрывает",
      "trust на проде — это дыра; используй scram-sha-256",
      "После правки нужен SELECT pg_reload_conf(); перезапуск не требуется"
    ],
    learningGoals: ["читать pg_hba.conf", "понимать local/host/hostssl/hostnossl"],
    relatedTopics: ["sec-auth-methods", "sec-tls"]
  },
  "sec-auth-methods": {
    title: "Методы аутентификации",
    summary: "scram-sha-256, md5, peer, cert, gss/sspi.",
    examples: [
      "ALTER SYSTEM SET password_encryption = 'scram-sha-256';\nALTER ROLE app WITH PASSWORD 'newpass';"
    ],
    pitfalls: [
      "md5 — устаревший; меняй на scram-sha-256",
      "peer работает только для local-сокетов",
      "cert требует клиентский сертификат; имя CN мапится на роль"
    ],
    learningGoals: [
      "выбирать метод аутентификации под сценарий",
      "переводить наследие с md5 на scram-sha-256"
    ],
    relatedTopics: ["sec-pg-hba", "sec-roles"]
  },
  "sec-tls": {
    title: "TLS / SSL для подключений",
    summary: "Шифрование канала, проверка сертификата клиента.",
    examples: [
      "ssl = on\nssl_cert_file = '/etc/postgresql/server.crt'\nssl_key_file = '/etc/postgresql/server.key'",
      "SELECT ssl, version, cipher FROM pg_stat_ssl WHERE pid = pg_backend_pid();"
    ],
    pitfalls: [
      "sslmode=require не защищает от MITM; нужен verify-full",
      "self-signed сертификат без verify-full — ложное чувство безопасности",
      "hostnossl ... reject — гарантия, что в обход TLS не зайдёт никто"
    ],
    learningGoals: [
      "настроить TLS на сервере и клиенте",
      "понимать разницу sslmode=require и verify-full"
    ],
    relatedTopics: ["sec-pg-hba", "sec-auth-methods"]
  },
  "sec-roles": {
    title: "Роли, группы, SET ROLE",
    summary: "В Postgres нет отдельных пользователей и групп — только роли.",
    examples: [
      "CREATE ROLE app_readonly NOLOGIN;\nGRANT app_readonly TO alice;\nSET ROLE app_readonly;",
      "SELECT current_user, session_user;"
    ],
    pitfalls: [
      "session_user vs current_user — после SET ROLE они разные",
      "INHERIT — права групп активны автоматически, иначе нужно SET ROLE",
      "SUPERUSER обходит RLS и все проверки прав"
    ],
    learningGoals: ["строить иерархию ролей", "не выдавать SUPERUSER приложениям"],
    relatedTopics: ["sec-grant-revoke", "sec-grant-patterns"]
  },
  "sec-grant-revoke": {
    title: "GRANT и REVOKE",
    summary: "Права на БД, схему, таблицу, колонку; роль PUBLIC.",
    examples: [
      "REVOKE ALL ON SCHEMA public FROM PUBLIC;\nGRANT USAGE ON SCHEMA public TO app_readonly;\nGRANT SELECT ON ALL TABLES IN SCHEMA public TO app_readonly;",
      "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO app_readonly;"
    ],
    pitfalls: [
      "Без USAGE на схему ни один SELECT внутри не сработает",
      "GRANT ON ALL TABLES — снимок, новые таблицы прав не получат",
      "PUBLIC — псевдо-роль «все остальные», по умолчанию у неё много прав"
    ],
    learningGoals: ["раздавать минимально нужные права", "пользоваться ALTER DEFAULT PRIVILEGES"],
    relatedTopics: ["sec-roles", "sec-grant-patterns"]
  },
  "sec-grant-patterns": {
    title: "Паттерны: readonly / writer / migrator",
    summary: "Готовая раскладка ролей под типичный сервис.",
    examples: [
      "CREATE ROLE app_readonly NOLOGIN;\nCREATE ROLE app_writer NOLOGIN;\nCREATE ROLE app_migrator NOLOGIN;\nCREATE ROLE svc_app LOGIN PASSWORD '...' IN ROLE app_writer;"
    ],
    pitfalls: [
      "BI-сервис не должен ходить под тем же логином, что и пишущий",
      "Деплой/миграции — отдельный пароль, который можно ротировать",
      "Без INHERIT в роли логина права групп не подхватятся автоматически"
    ],
    learningGoals: [
      "разделять роли по обязанностям (readonly / writer / migrator)",
      "выдавать привилегии группе, а не отдельным пользователям"
    ],
    relatedTopics: ["sec-grant-revoke", "sr-rls"]
  },
  "sec-audit": {
    title: "Логирование и аудит",
    summary: "log_connections, log_statement, pgaudit, pg_event_trigger.",
    examples: [
      "log_connections = on\nlog_disconnections = on\nlog_statement = 'ddl'\nlog_min_duration_statement = 200ms",
      "CREATE EXTENSION pgaudit;\n-- shared_preload_libraries = 'pgaudit'\n-- pgaudit.log = 'ddl, role, write'"
    ],
    pitfalls: [
      "log_statement = 'all' — это много гигабайт и потенциальная утечка PII",
      "pgaudit требует shared_preload_libraries и рестарта",
      "Логи и БД должны быть с разным доступом, иначе компрометация снимает аудит"
    ],
    learningGoals: ["настроить базовый аудит", "не утопить диск логом"],
    relatedTopics: ["sr-observability"]
  },

  // ===== Расширения programming.html =====
  "cursors": {
    title: "Курсоры в PostgreSQL",
    summary: "DECLARE/FETCH/CLOSE; когда нужны и когда не нужны.",
    examples: [
      "DECLARE c1 CURSOR FOR SELECT id, email FROM users WHERE is_active;\nFETCH 5 FROM c1;\nCLOSE c1;",
      "FOR r IN SELECT id FROM users LOOP ... END LOOP;  -- сахар PL/pgSQL"
    ],
    pitfalls: [
      "Серверный курсор живёт в транзакции; для жизни после COMMIT — WITH HOLD",
      "Большинство драйверов умеют ленивое чтение без явного курсора (libpq single-row, JDBC fetchSize)",
      "MOVE и FETCH не возвращают строки в один аккумулятор — это императивный обход"
    ],
    learningGoals: ["понимать, когда курсор реально нужен", "отличать DECLARE … CURSOR от FOR … IN"],
    relatedTopics: ["plpgsql"]
  },
  "dynamic-sql": {
    title: "Динамический SQL: EXECUTE",
    summary: "EXECUTE + format() для безопасной сборки запросов с переменными именами объектов.",
    examples: [
      "EXECUTE format('SELECT count(*) FROM %s', tbl) INTO n;",
      "EXECUTE 'SELECT * FROM users WHERE email = $1' INTO u USING addr;"
    ],
    pitfalls: [
      "Идентификаторы — через format(%I) или regclass; не через конкатенацию",
      "Значения — через USING, не через format(%L) и не через ||",
      "Конкатенация пользовательского ввода в SQL — классический injection"
    ],
    learningGoals: ["писать безопасный динамический SQL", "разделять идентификаторы и значения"],
    relatedTopics: ["sr-prepared-statements", "plpgsql"]
  },
  "sqlstate": {
    title: "Классы ошибок (SQLSTATE)",
    summary: "5-символьные коды ошибок, имена условий, ловля в EXCEPTION WHEN.",
    examples: [
      "EXCEPTION\n  WHEN unique_violation THEN\n    SELECT id INTO uid FROM users WHERE email = lower(email_in);\n    RETURN uid;",
      "-- 23505 unique_violation, 40001 serialization_failure, 40P01 deadlock_detected"
    ],
    pitfalls: [
      "WHEN OTHERS THEN съедает диагностику — используй редко и обязательно RAISE дальше",
      "Блок с EXCEPTION — это неявный SAVEPOINT, его постоянное использование дорого",
      "P0001 — это RAISE EXCEPTION без указания SQLSTATE"
    ],
    learningGoals: ["понимать классы 22/23/40/42", "выбирать имя условия, а не код"],
    relatedTopics: ["raise-using", "err-deadlock"]
  },
  "raise-using": {
    title: "Кастомные ошибки: RAISE … USING",
    summary: "Свой текст, свой SQLSTATE, поля HINT/DETAIL/COLUMN/TABLE.",
    examples: [
      "RAISE EXCEPTION 'amount must be positive: %', amt\n  USING ERRCODE = 'invalid_parameter_value',\n        HINT    = 'передавай число > 0',\n        DETAIL  = format('from=%s to=%s', from_id, to_id);"
    ],
    pitfalls: [
      "Не клади секреты в текст — он попадёт в логи",
      "ERRCODE можно задавать именем ('invalid_parameter_value') или 5-символьным кодом",
      "RAISE без аргументов внутри EXCEPTION — перевыбросить текущую ошибку"
    ],
    learningGoals: ["писать осмысленные ошибки", "пользоваться полями HINT/DETAIL"],
    relatedTopics: ["plpgsql", "sqlstate"]
  },
  "returns-table-setof": {
    title: "RETURNS TABLE vs SETOF",
    summary: "Способы описать форму результата функции, возвращающей набор строк.",
    examples: [
      "CREATE FUNCTION active_users() RETURNS SETOF users LANGUAGE sql AS $$\n  SELECT * FROM users WHERE is_active;\n$$;",
      "CREATE FUNCTION user_summary()\nRETURNS TABLE (id bigint, email text, orders_count bigint)\nLANGUAGE sql AS $$ ... $$;"
    ],
    pitfalls: [
      "RETURNS SETOF record без описания требует AS t(...) при каждом вызове",
      "RETURNS TABLE — это сахар над OUT-параметрами + SETOF record",
      "Меняя тип таблицы, ты можешь сломать все RETURNS SETOF этой таблицы"
    ],
    learningGoals: ["выбирать форму результата сознательно", "понимать связь TABLE и OUT"],
    relatedTopics: ["functions-procedures", "lateral-join"]
  },

  // ===== Упражнения =====
  // Каждое упражнение — отдельная "тема" для чата. Стартовый prompt
  // обогащается условием задачи и попыткой ученика (см. chat.js / prompts.js).
  "ex-basics-select": {
    kind: "exercise",
    title: "Упражнение: первые SELECT и WHERE",
    summary: "Выбери активных пользователей и отсортируй их по дате регистрации.",
    task: "Из таблицы `users` выведи `id`, `email`, `created_at` для всех пользователей, у которых `is_active = true` и `deleted_at IS NULL`. Отсортируй по дате регистрации, более свежие — сверху.",
    solution: "SELECT id, email, created_at\nFROM   users\nWHERE  is_active = true\n  AND  deleted_at IS NULL\nORDER  BY created_at DESC;",
    solutionNote: "Условие `deleted_at IS NULL` нельзя писать как `deleted_at = NULL` — сравнение с NULL всегда даёт NULL, а WHERE отбирает только TRUE.",
    examples: [],
    pitfalls: ["сравнение с NULL через = не работает", "не путай булеву is_active с проверкой на NULL"],
    learningGoals: ["писать корректные WHERE с NULL", "использовать ORDER BY"]
  },
  "ex-basics-coalesce": {
    kind: "exercise",
    title: "Упражнение: COALESCE для отображаемого имени",
    summary: "Сформируй человекочитаемое имя пользователя.",
    task: "Из `users` выведи `id` и одно поле `display_name`. Логика: если есть `nickname` — берём его; иначе `full_name`; иначе строку `'аноним'`. Только активные пользователи (`is_active = true`).",
    solution: "SELECT id,\n       coalesce(nickname, full_name, 'аноним') AS display_name\nFROM   users\nWHERE  is_active = true\nORDER  BY id;",
    solutionNote: "`coalesce` возвращает первый аргумент, не равный NULL. Часто его используют для дефолтов на стороне SQL.",
    examples: [],
    pitfalls: ["пустая строка '' и NULL — разные вещи; coalesce пустую строку не «спасёт»"],
    learningGoals: ["применять coalesce", "понимать порядок аргументов"]
  },
  "ex-basics-count": {
    kind: "exercise",
    title: "Упражнение: считаем активных",
    summary: "Сколько активных и сколько всего пользователей.",
    task: "Одним запросом получи две колонки: `total` — общее число строк в `users`, `active` — число тех, у кого `is_active = true` и `deleted_at IS NULL`.",
    solution: "SELECT count(*)                                              AS total,\n       count(*) FILTER (WHERE is_active AND deleted_at IS NULL) AS active\nFROM   users;",
    solutionNote: "`FILTER (WHERE …)` — стандартный способ условной агрегации в PostgreSQL. Альтернатива: `count(*) FILTER (WHERE …)` ↔ `sum(CASE WHEN … THEN 1 ELSE 0 END)`.",
    examples: [],
    pitfalls: ["count(col) пропускает NULL, count(*) — нет", "не пиши count(is_active) — оно посчитает все не-NULL, даже false"],
    learningGoals: ["условная агрегация через FILTER"]
  },

  "ex-joins-inner": {
    kind: "exercise",
    title: "Упражнение: INNER JOIN заказов и пользователей",
    summary: "Выведи заказы вместе с email покупателя.",
    task: "Покажи `o.id`, `u.email`, `o.status`, `o.total` для всех заказов. Соедини `orders` и `users` по `user_id`. Отсортируй по `o.created_at` от свежих к старым.",
    solution: "SELECT o.id, u.email, o.status, o.total\nFROM   orders o\nJOIN   users  u ON u.id = o.user_id\nORDER  BY o.created_at DESC;",
    solutionNote: "INNER JOIN отбрасывает строки без совпадения. Здесь это безопасно — у каждого заказа всегда есть `user_id` (NOT NULL + FK).",
    examples: [],
    pitfalls: ["алиасы таблиц нужны, иначе придётся писать orders.id и users.id"],
    learningGoals: ["писать INNER JOIN с алиасами", "выбирать поля из двух таблиц"]
  },
  "ex-joins-left": {
    kind: "exercise",
    title: "Упражнение: пользователи без заказов (LEFT JOIN)",
    summary: "Найди пользователей, у которых нет ни одного заказа.",
    task: "Через `LEFT JOIN` выведи `u.id`, `u.email` пользователей, у которых нет ни одной строки в `orders`. Не используй `NOT IN` — он коварен на NULL.",
    solution: "SELECT u.id, u.email\nFROM   users u\nLEFT JOIN orders o ON o.user_id = u.id\nWHERE  o.id IS NULL\nORDER  BY u.id;",
    solutionNote: "Классический паттерн «anti-join через LEFT JOIN + IS NULL». Альтернатива — `NOT EXISTS`. Оба плана обычно одинаково хороши; `NOT IN` опасен, если правый набор содержит NULL.",
    examples: [],
    pitfalls: ["условие `o.user_id IS NULL` тоже сработает, но логичнее проверять PK правой таблицы", "не путай с INNER JOIN — он бы выкинул как раз искомые строки"],
    learningGoals: ["реализовывать anti-join", "видеть подвох NOT IN"]
  },
  "ex-joins-aggregate": {
    kind: "exercise",
    title: "Упражнение: топ покупателей по сумме",
    summary: "JOIN + GROUP BY + ORDER BY с агрегатом.",
    task: "Выведи `email` пользователя и сумму его доставленных заказов (`status = 'delivered'`). Покажи только тех, у кого хотя бы один доставленный заказ. Отсортируй по сумме по убыванию, верхние 3.",
    solution: "SELECT u.email,\n       sum(o.total) AS spent\nFROM   users  u\nJOIN   orders o ON o.user_id = u.id\nWHERE  o.status = 'delivered'\nGROUP  BY u.id, u.email\nORDER  BY spent DESC\nLIMIT  3;",
    solutionNote: "В GROUP BY — все не-агрегированные поля SELECT. Для уникальности достаточно `u.id`, но `u.email` тоже разрешён, т. к. функционально зависит от PK.",
    examples: [],
    pitfalls: ["забыть фильтр по status — посчитаются и cancelled", "пропустить u.email в GROUP BY на старом Postgres даст ошибку"],
    learningGoals: ["комбинировать JOIN, WHERE, GROUP BY, ORDER BY, LIMIT"]
  },

  "ex-indexes-pick": {
    kind: "exercise",
    title: "Упражнение: какой индекс ускорит запрос",
    summary: "Подбери индекс под конкретный запрос.",
    task: "Запрос: `SELECT * FROM orders WHERE user_id = $1 AND created_at >= now() - interval '30 days' ORDER BY created_at DESC;`. Какой индекс будет наиболее полезен? Напиши `CREATE INDEX …`.",
    solution: "CREATE INDEX idx_orders_user_created\n  ON orders (user_id, created_at DESC);",
    solutionNote: "Композитный индекс по `(user_id, created_at DESC)` поддерживает и фильтр, и сортировку. Порядок столбцов важен: сначала равенство (`user_id`), потом диапазон/сортировка (`created_at`).",
    examples: [],
    pitfalls: ["индекс на одно `user_id` тоже подойдёт, но придётся сортировать вручную", "DESC в индексе не обязательно для диапазона, но помогает ORDER BY DESC без Sort"],
    learningGoals: ["правило «равенство → диапазон» в композитном индексе"]
  },
  "ex-indexes-partial": {
    kind: "exercise",
    title: "Упражнение: частичный индекс",
    summary: "Маленький индекс под «горячую» часть таблицы.",
    task: "Большая часть заказов имеет статус `delivered`, но рабочий запрос ищет только `pending` и `paid`. Напиши частичный индекс, который ускорит этот запрос: `SELECT * FROM orders WHERE status IN ('pending','paid') ORDER BY created_at;`.",
    solution: "CREATE INDEX idx_orders_active_status\n  ON orders (created_at)\n  WHERE status IN ('pending', 'paid');",
    solutionNote: "Частичный индекс хранит только нужные строки — он меньше, быстрее обновляется и реально полезен под конкретный запрос.",
    examples: [],
    pitfalls: ["условие индекса должно быть IMMUTABLE — `now()` туда нельзя", "запрос обязан включать то же условие, иначе планировщик индекс не выберет"],
    learningGoals: ["писать партикулярные индексы", "понимать совпадение predicate"]
  },
  "ex-indexes-functional": {
    kind: "exercise",
    title: "Упражнение: индекс по выражению",
    summary: "Регистронезависимый поиск email.",
    task: "Приложение делает запрос: `SELECT * FROM users WHERE lower(email) = lower($1);`. Обычный индекс по `email` тут не сработает. Создай функциональный индекс, который ускорит этот запрос.",
    solution: "CREATE INDEX idx_users_email_lower\n  ON users (lower(email));",
    solutionNote: "Функциональный (выражение) индекс хранит результат выражения. Запрос обязан использовать ровно то же выражение — `lower(email)` — иначе индекс не подхватится.",
    examples: [],
    pitfalls: ["UNIQUE индекс по `email` не подойдёт — это другое выражение", "выражение в индексе должно быть IMMUTABLE"],
    learningGoals: ["создавать функциональные индексы", "видеть несовпадение выражений"]
  },

  "ex-tx-rollback": {
    kind: "exercise",
    title: "Упражнение: BEGIN / COMMIT / ROLLBACK",
    summary: "Перенос денег между двумя строками — атомарно.",
    task: "Напиши транзакцию, которая увеличивает `in_stock` товара с `id=1` на 5 и уменьшает у товара с `id=2` на 5. Если у второго товара после операции `in_stock < 0`, всё надо откатить.",
    solution: "BEGIN;\n\nUPDATE products SET in_stock = in_stock + 5 WHERE id = 1;\nUPDATE products SET in_stock = in_stock - 5 WHERE id = 2;\n\n-- Проверка инварианта; CHECK на колонке тоже бы сработал.\nDO $$\nBEGIN\n  IF (SELECT in_stock FROM products WHERE id = 2) < 0 THEN\n    RAISE EXCEPTION 'in_stock would go negative';\n  END IF;\nEND $$;\n\nCOMMIT;",
    solutionNote: "Транзакция объединяет обе записи в один атом: либо обе применятся, либо ни одна. CHECK-constraint на колонке (`CHECK (in_stock >= 0)`) сделал бы проверку автоматической — RAISE EXCEPTION приведёт к ROLLBACK всей транзакции.",
    examples: [],
    pitfalls: ["без BEGIN каждый UPDATE — отдельная транзакция и автоматически коммитится", "после ошибки внутри транзакции остальные команды не выполнятся, нужен ROLLBACK или SAVEPOINT"],
    learningGoals: ["обрамлять связанные команды в одну транзакцию", "понимать атомарность"]
  },
  "ex-tx-for-update": {
    kind: "exercise",
    title: "Упражнение: SELECT FOR UPDATE",
    summary: "Защита от конкурентной модификации.",
    task: "В транзакции: прочитай `total` заказа `id = 3`, и если он меньше 1000, увеличь его на 100. Сделай так, чтобы между чтением и записью никакая другая сессия не смогла изменить эту строку.",
    solution: "BEGIN;\n\nSELECT total FROM orders WHERE id = 3 FOR UPDATE;\n\nUPDATE orders\n   SET total = total + 100\n WHERE id = 3\n   AND total < 1000;\n\nCOMMIT;",
    solutionNote: "`FOR UPDATE` берёт row-level lock на читаемые строки до конца транзакции. Альтернатива — оптимистичная блокировка через версионирование (колонка `version` + проверка в WHERE).",
    examples: [],
    pitfalls: ["без FOR UPDATE возможна гонка: оба воркера прочтут старое значение и затрут друг друга (lost update)", "FOR UPDATE без транзакции — синтаксически валиден, но бесполезен: блокировка снимется немедленно"],
    learningGoals: ["использовать row-level locks", "понимать lost update"]
  },
  "ex-tx-isolation": {
    kind: "exercise",
    title: "Упражнение: какой уровень изоляции",
    summary: "Подбери минимально достаточный уровень.",
    task: "Сценарий: отчёт «активные пользователи и их сумма заказов» делает 2 запроса в одной транзакции — count активных и sum по доставленным. Между запросами не должны появляться/исчезать строки. Какой минимально достаточный `ISOLATION LEVEL`? Напиши команду установки.",
    solution: "BEGIN ISOLATION LEVEL REPEATABLE READ;\n\n-- запрос 1: count active users\nSELECT count(*) FROM users WHERE is_active AND deleted_at IS NULL;\n\n-- запрос 2: sum delivered\nSELECT sum(total) FROM orders WHERE status = 'delivered';\n\nCOMMIT;",
    solutionNote: "`REPEATABLE READ` фиксирует снимок данных на момент начала транзакции — все запросы внутри видят одну и ту же версию БД. `SERIALIZABLE` дал бы то же и плюс защиту от write skew, но он дороже и здесь не нужен.",
    examples: [],
    pitfalls: ["READ COMMITTED (по умолчанию) допускает фантомы между запросами", "SERIALIZABLE может бросить serialization_failure — приложение должно уметь повторять транзакцию"],
    learningGoals: ["понимать уровни изоляции", "выбирать минимально нужный"]
  },
};
