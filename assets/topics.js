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
};
