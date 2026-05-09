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
    summary: "Базовые операторы и работа с NULL.",
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
    ]
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
    summary: "Обход иерархий и графов.",
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
    ]
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
    ]
  },
  "gin-index": {
    title: "GIN-индексы для jsonb и массивов",
    summary: "Индексирование составных значений.",
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
    ]
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
    ]
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
    ]
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
    summary: "MATERIALIZED VIEW и REFRESH.",
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
    summary: "План запроса и фактические тайминги.",
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
    ]
  },

  // 19. JSON / JSONB
  "jsonb": {
    title: "JSONB — операции и индексы",
    summary: "Доступ ->, ->>, поиск @>, индексы GIN.",
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
    ]
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
    summary: "В обязательный столбец пришёл NULL.",
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
    summary: "Деление на ноль в выражении.",
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },
  "sr-listen-notify": {
    title: "LISTEN / NOTIFY",
    summary: "Лёгкая шина событий внутри Postgres.",
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
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
    ]
  },

  "sr-rls": {
    title: "Row-Level Security",
    summary: "Политики доступа на уровне строк.",
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
    ]
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
    ]
  },
  "sr-prepared-statements": {
    title: "Prepared statements и SQL-инъекции",
    summary: "Параметризация — защита и кэш плана.",
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
    ]
  },

  "sr-fulltext": {
    title: "Полнотекстовый поиск",
    summary: "tsvector, tsquery, GIN-индекс.",
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
    ]
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
    ]
  },

  "sr-app-orm": {
    title: "Postgres из приложения: ORM vs raw SQL",
    summary: "Когда ORM помогает, а когда мешает.",
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
    ]
  },
  "sr-observability": {
    title: "Наблюдаемость PostgreSQL",
    summary: "pg_stat_*, slow log, метрики, алерты.",
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
    ]
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
    examples: [],
    pitfalls: [
      "Файлы не дают конкурентного доступа без блокировок",
      "Самописное хранилище сложно сделать ACID-надёжным",
      "Поиск без индекса = чтение всего файла"
    ],
    learningGoals: [
      "перечислять задачи, которые решает СУБД",
      "понимать разницу между файлом, key-value и реляционной БД"
    ]
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
    examples: [],
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
    examples: [],
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
    ]
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
    ]
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
    examples: [],
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
    examples: [],
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
    ]
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
    ]
  },

  // --- install.html ---
  "install-overview": {
    title: "Варианты установки",
    summary: "Пакетный менеджер ОС, Docker, бинарные сборки, исходники, managed-облако.",
    examples: [],
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
    examples: [],
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
    ]
  },
  "types-boolean": {
    title: "Тип boolean",
    summary: "TRUE/FALSE/NULL и удобные литералы.",
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
    ]
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
    learningGoals: ["писать корректное условие ON", "понимать порядок выполнения"]
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
    ]
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
    learningGoals: ["находить расхождения между таблицами"]
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
    learningGoals: ["понимать, когда декартово произведение оправдано"]
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
    learningGoals: ["работать с самоссылающимися связями"]
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
    learningGoals: ["выбирать EXISTS vs JOIN vs IN", "избегать дублей"]
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
    learningGoals: ["находить «осиротевших»", "не наступать на NOT IN с NULL"]
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
    learningGoals: ["писать читаемые многотабличные запросы"]
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
    learningGoals: ["проектировать FK правильно"]
  },
  "rel-many-to-many": {
    title: "Связь N:M (многие ко многим)",
    summary: "Через промежуточную таблицу с двумя FK.",
    examples: [
      "CREATE TABLE posts (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY);\nCREATE TABLE tags  (id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name text UNIQUE);\n\nCREATE TABLE post_tags (\n  post_id bigint NOT NULL REFERENCES posts(id) ON DELETE CASCADE,\n  tag_id  bigint NOT NULL REFERENCES tags(id)  ON DELETE CASCADE,\n  PRIMARY KEY (post_id, tag_id)\n);\n\nCREATE INDEX idx_post_tags_tag ON post_tags (tag_id);"
    ],
    pitfalls: [
      "PRIMARY KEY (a, b) уже строит индекс по первому столбцу — на второй индекс нужен отдельно",
      "На промежуточной таблице иногда полезны дополнительные атрибуты (created_at, weight)"
    ],
    learningGoals: ["проектировать junction-таблицу"]
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
    learningGoals: ["видеть, когда 1:1 действительно нужен"]
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
    learningGoals: ["лечить N+1 одним SQL", "выбирать json_agg vs jsonb_agg"]
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
    learningGoals: ["писать читаемые ветвления в SELECT"]
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
    learningGoals: ["разделять фильтры до и после"]
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
    learningGoals: ["выбирать DISTINCT vs GROUP BY", "знать DISTINCT ON"]
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
    learningGoals: ["считать итоги и подытоги одним запросом"]
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
    learningGoals: ["видеть три вида подзапросов", "выбирать между подзапросом, JOIN и CTE"]
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
    learningGoals: ["использовать UNION ALL по умолчанию", "знать EXCEPT/INTERSECT"]
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
    examples: [],
    pitfalls: [
      "C из ACID — это не «согласованность распределённой системы», а «не нарушаются ограничения БД»",
      "Isolation в реальности — спектр уровней с разной строгостью",
      "Durability работает, только если включён fsync — не отключай"
    ],
    learningGoals: [
      "переводить каждую букву в практический смысл",
      "не путать C с CAP-Consistency"
    ]
  },
  "savepoints": {
    title: "Savepoints — точки сохранения",
    summary: "Частичный откат внутри транзакции.",
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
    ]
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
    examples: [],
    pitfalls: [
      "READ UNCOMMITTED в Postgres = READ COMMITTED",
      "Phantom read в SQL-стандарте отделён от non-repeatable read; в Postgres REPEATABLE READ закрывает оба",
      "SERIALIZABLE даёт write skew, REPEATABLE READ — нет"
    ],
    learningGoals: [
      "выбирать уровень осознанно",
      "знать, какие аномалии где возможны"
    ]
  },

  // --- indexes.html ---
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
    learningGoals: ["проектировать индекс под конкретный запрос", "видеть use в EXPLAIN"]
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
    ]
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
    learningGoals: ["понимать связь селективности и плана", "не удивляться Seq Scan"]
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
    learningGoals: ["ускорять регистронезависимый поиск", "поддерживать одинаковые выражения"]
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
    learningGoals: ["добиваться Index-Only Scan", "выбирать INCLUDE-столбцы"]
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
    learningGoals: ["выбирать тип под структуру данных", "знать про BRIN для time-series"]
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
    learningGoals: ["лечить мисс-эстимейт на коррелирующих столбцах"]
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
    examples: [],
    pitfalls: [
      "Postgres сам по себе — single-master; «горизонтально» — это реплики на чтение и шардирование",
      "Вертикалка проще, но имеет физический потолок и стоит нелинейно дорого",
      "Перед масштабированием — оптимизация запросов и индексов"
    ],
    learningGoals: ["видеть, какой путь оправдан в твоём сценарии"]
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
    learningGoals: ["выбирать ключ шардирования", "понимать стоимость cross-shard запросов"]
  },
  "cap-theorem": {
    title: "CAP / PACELC",
    summary: "При сетевом сбое распределённая система выбирает между Consistency и Availability. PACELC — расширение для штатной работы.",
    examples: [],
    pitfalls: [
      "Postgres-кластер с синхронной репликацией — CP при отказе реплики; асинхронной — CA для чтений на реплике с возможной устаревшей видимостью",
      "C из CAP — не C из ACID. Это linearizability, не «целостность ограничений»",
      "PACELC: даже без сбоев есть выбор Latency vs Consistency"
    ],
    learningGoals: ["переводить теорему в инженерные решения"]
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
    learningGoals: ["сокращать uuid для пользовательских URL"]
  },
  "oltp-olap": {
    title: "OLTP и OLAP",
    summary: "Транзакционные системы (много мелких операций) и аналитические (тяжёлые SELECT).",
    examples: [],
    pitfalls: [
      "PostgreSQL — отличный OLTP; для тяжёлой аналитики чаще берут колоночные store-ы (ClickHouse, DuckDB) или специализированные хранилища",
      "Часто ставят реплику Postgres под аналитические запросы, чтобы не мешать продовому OLTP",
      "TimescaleDB — расширение Postgres для time-series, лежит между OLTP и OLAP"
    ],
    learningGoals: ["видеть, какой профиль нагрузки у твоего сервиса"]
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
    learningGoals: ["писать простые серверные процедуры", "не злоупотреблять PL/pgSQL"]
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
    learningGoals: ["выбирать FUNCTION vs PROCEDURE", "знать, чем процедура отличается"]
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
    learningGoals: ["писать BEFORE UPDATE для updated_at", "знать про STATEMENT vs ROW"]
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
    learningGoals: ["иметь под рукой 1–2 удобных клиента"]
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
    learningGoals: ["сократить рутину в psql", "знать про \\copy"]
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
    learningGoals: ["избавиться от ввода пароля каждый раз", "не светить пароли в process list"]
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
    learningGoals: ["находить «толстые» таблицы и индексы"]
  },
  "sqlite-comparison": {
    title: "SQLite vs PostgreSQL",
    summary: "Когда хватит SQLite, а когда нужен Postgres.",
    examples: [],
    pitfalls: [
      "SQLite — встраиваемая, файл на диске; писатель один за раз",
      "Postgres — клиент-сервер, конкурентные writers, расширения, репликация",
      "SQLite отлично подходит для мобильных приложений, локальных кешей, тестов; Postgres — для бэкенд-сервисов"
    ],
    learningGoals: ["видеть, когда SQLite — лучший выбор", "не тащить Postgres туда, где не нужен"]
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
    learningGoals: ["отличать обычные агрегаты от оконных"]
  },
  "win-frames": {
    title: "Кадры окна: ROWS / RANGE / GROUPS",
    summary: "Что попадает в кадр расчёта функции.",
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
    learningGoals: ["задавать кадр точно", "выбирать тип под задачу"]
  },
  "win-lag-lead": {
    title: "LAG / LEAD",
    summary: "Заглянуть на N строк назад/вперёд.",
    examples: [
      "lag(total) OVER (PARTITION BY user_id ORDER BY created_at)",
      "lead(created_at) OVER (...)"
    ],
    pitfalls: [
      "lag без offset — это lag(col, 1)",
      "lag(col, 1, default) — третий аргумент защищает от NULL"
    ],
    learningGoals: ["считать дельты", "находить gaps между событиями"]
  },
  "win-first-last-value": {
    title: "FIRST_VALUE / LAST_VALUE / NTH_VALUE",
    summary: "Первая / последняя / N-я строка кадра.",
    examples: [
      "first_value(id) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING)"
    ],
    pitfalls: [
      "LAST_VALUE с дефолтным RANGE возвращает текущую строку, а не последнюю — нужен явный frame UNBOUNDED ... UNBOUNDED"
    ],
    learningGoals: ["задавать симметричный frame для last_value"]
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
    learningGoals: ["выбирать правильный тип нумерации"]
  },
  "win-running-total": {
    title: "Running totals",
    summary: "Нарастающий итог, нарастающее число событий.",
    examples: [
      "sum(total) OVER (PARTITION BY user_id ORDER BY created_at ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW)"
    ],
    pitfalls: ["Без явного frame можно получить «весь partition» вместо нарастающего итога"],
    learningGoals: ["писать классический running total"]
  },
  "win-top-n": {
    title: "Top-N per group",
    summary: "Дай мне 3 лучших заказа на каждого пользователя.",
    examples: [
      "SELECT * FROM (SELECT *, row_number() OVER (PARTITION BY user_id ORDER BY total DESC) rn FROM orders) WHERE rn <= 3;",
      "SELECT u.email, t.* FROM users u JOIN LATERAL (SELECT id FROM orders o WHERE o.user_id = u.id ORDER BY total DESC LIMIT 3) t ON true;"
    ],
    pitfalls: ["LATERAL часто эффективнее window-функции на огромных таблицах"],
    learningGoals: ["писать top-N через row_number и через LATERAL"]
  },
  "win-dedupe": {
    title: "Dedupe — оставить одну строку из дубликатов",
    summary: "Удалить дубли, сохранив самую свежую.",
    examples: [
      "WITH ranked AS (SELECT id, row_number() OVER (PARTITION BY lower(email) ORDER BY created_at DESC) rn FROM users)\nDELETE FROM users u USING ranked r WHERE u.id = r.id AND r.rn > 1;"
    ],
    pitfalls: ["Перед DELETE — обязательно SELECT-проверка с тем же CTE"],
    learningGoals: ["безопасно чистить дубли"]
  },
  "win-named": {
    title: "Именованные окна (WINDOW)",
    summary: "Один WINDOW — несколько функций над тем же кадром.",
    examples: [
      "SELECT sum(total) OVER w, row_number() OVER w FROM orders WINDOW w AS (PARTITION BY user_id ORDER BY created_at);"
    ],
    pitfalls: ["Без именованного окна одинаковая спецификация в нескольких местах — копипаста"],
    learningGoals: ["использовать WINDOW для DRY"]
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
    learningGoals: ["выбирать тип под задачу", "понимать ограничения каждой"]
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
    learningGoals: ["понимать уровни synchronous_commit", "разделять чувствительные и нет транзакции"]
  },
  "sr-replication-slots": {
    title: "Replication slots, wal_keep_size",
    summary: "Гарантия сохранения WAL для подписчика.",
    examples: [
      "SELECT pg_create_physical_replication_slot('replica1');",
      "SELECT slot_name, slot_type, active, pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), restart_lsn)) AS retained_wal FROM pg_replication_slots;"
    ],
    pitfalls: [
      "Заброшенный слот пухнет и забивает диск",
      "max_slot_wal_keep_size — обязательная защита",
      "wal_keep_size заменил wal_keep_segments с PG 13"
    ],
    learningGoals: ["управлять слотами", "следить за объёмом WAL"]
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
    learningGoals: ["понимать роль оркестратора", "выбирать решение под инфраструктуру"]
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
    learningGoals: ["выбирать формат под задачу", "разделять кластерные и БД-объекты"]
  },
  "sr-pgrestore-parallel": {
    title: "pg_restore -j: параллельное восстановление",
    summary: "Ускоряем восстановление большой БД.",
    examples: [
      "pg_restore -d app -j 8 /backup/app.dump",
      "pg_restore -d app --section=pre-data /backup/app.dump\npg_restore -d app --section=data -j 8 /backup/app.dump\npg_restore -d app --section=post-data -j 8 /backup/app.dump"
    ],
    pitfalls: [
      "-j работает только с -Fc и -Fd, не с plain SQL",
      "Перед массовым restore — поднять max_wal_size, maintenance_work_mem",
      "После restore нужен ANALYZE — иначе планировщик слепой"
    ],
    learningGoals: ["распараллеливать восстановление", "разбивать на секции pre/data/post"]
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
    learningGoals: ["настроить промышленный бэкап с PITR", "понимать full/diff/incremental"]
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
    learningGoals: ["задавать политику хранения", "отрабатывать DR-сценарий"]
  },
  "sr-recovery-checklist": {
    title: "Чек-лист восстановления",
    summary: "Порядок действий при инциденте: фиксация → план → изоляция → restore → проверка → переключение → postmortem.",
    examples: [],
    pitfalls: [
      "Не лей restore поверх боевого $PGDATA — потеряешь и текущее состояние",
      "Перед любыми правками — снимок «места преступления» (логи, $PGDATA)",
      "Старый кластер выключить, но не удалять — пригодится для разбора"
    ],
    learningGoals: ["восстанавливать без импровизации", "разделять рестор и переключение трафика"]
  },

  // ===== tuning.html =====
  "cfg-shared-buffers": {
    title: "shared_buffers",
    summary: "Размер буфер-пула Postgres.",
    examples: [
      "SHOW shared_buffers;",
      "shared_buffers = 8GB"
    ],
    pitfalls: [
      "Требует рестарта (shared memory)",
      "Больше 32 ГБ обычно не растёт эффект",
      "Слишком большой = двойное буферирование с кешем ОС"
    ],
    learningGoals: ["видеть hit-ratio", "понимать связь с кешем ОС"]
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
    learningGoals: ["читать Sort Method в EXPLAIN", "ставить work_mem на сессию"]
  },
  "cfg-effective-cache-size": {
    title: "effective_cache_size",
    summary: "Подсказка планировщику о размере кеша.",
    examples: [
      "effective_cache_size = 24GB"
    ],
    pitfalls: [
      "Это не выделение памяти, а оценка",
      "Слишком мало → лишние seq-scan",
      "Меняется на лету (SIGHUP)"
    ],
    learningGoals: ["задавать 50–75% RAM", "понимать влияние на выбор плана"]
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
    learningGoals: ["ускорять разовые операции"]
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
    learningGoals: ["читать pg_stat_bgwriter", "балансировать IO и recovery time"]
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
    learningGoals: ["выбирать уровень под задачу"]
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
    learningGoals: ["per-table тюнинг", "видеть n_dead_tup"]
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
    learningGoals: ["видеть нагрузку через pg_stat_activity"]
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
    learningGoals: ["выбирать режим под драйвер", "читать SHOW POOLS"]
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
    learningGoals: ["настроить cost под SSD", "понимать влияние на выбор плана"]
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
    learningGoals: ["читать pg_hba.conf", "понимать local/host/hostssl/hostnossl"]
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
    learningGoals: ["выбирать метод аутентификации под сценарий"]
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
    learningGoals: ["настроить TLS на сервере и клиенте"]
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
    learningGoals: ["строить иерархию ролей", "не выдавать SUPERUSER приложениям"]
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
    learningGoals: ["раздавать минимально нужные права", "пользоваться ALTER DEFAULT PRIVILEGES"]
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
    learningGoals: ["разделять группы по обязанностям"]
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
    learningGoals: ["настроить базовый аудит", "не утопить диск логом"]
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
    learningGoals: ["понимать, когда курсор реально нужен", "отличать DECLARE … CURSOR от FOR … IN"]
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
    learningGoals: ["писать безопасный динамический SQL", "разделять идентификаторы и значения"]
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
    learningGoals: ["понимать классы 22/23/40/42", "выбирать имя условия, а не код"]
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
    learningGoals: ["писать осмысленные ошибки", "пользоваться полями HINT/DETAIL"]
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
    learningGoals: ["выбирать форму результата сознательно", "понимать связь TABLE и OUT"]
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
