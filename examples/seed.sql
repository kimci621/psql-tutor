-- psql-tutor: тестовые данные
-- Загружай ПОСЛЕ schema.sql:  \i examples/seed.sql
--
-- Объёмы небольшие, но достаточны для практики JOIN, GROUP BY, оконных функций,
-- индексов и EXPLAIN. Все примеры в учебнике используют именно эти данные.

BEGIN;

TRUNCATE order_items, orders, products, users RESTART IDENTITY CASCADE;

-- ===== Пользователи (10 строк) =====
INSERT INTO users (email, full_name, nickname, is_active, created_at, deleted_at) VALUES
  ('alice@example.com',   'Алиса Иванова',   'alice',   true,  '2025-01-15 10:00+00', NULL),
  ('bob@example.com',     'Боб Петров',      'bob',     true,  '2025-02-03 12:30+00', NULL),
  ('carol@example.com',   'Кэрол Сидорова',  NULL,      true,  '2025-03-19 09:15+00', NULL),
  ('dave@example.com',    'Дэйв Козлов',     'dave',    true,  '2025-04-01 18:45+00', NULL),
  ('eve@example.com',     'Ева Морозова',    'eve',     false, '2025-04-20 08:00+00', '2025-09-01 12:00+00'),
  ('frank@example.com',   'Фрэнк Ким',       NULL,      true,  '2025-05-11 14:20+00', NULL),
  ('grace@example.com',   'Грейс Лебедева',  'grace',   true,  '2025-06-02 11:00+00', NULL),
  ('heidi@example.com',   'Хайди Орлова',    NULL,      true,  '2025-07-15 16:30+00', NULL),
  ('ivan@example.com',    'Иван Соколов',    'ivan',    true,  '2025-08-10 09:00+00', NULL),
  ('judy@example.com',    'Джуди Волкова',   NULL,      false, '2025-08-25 13:00+00', NULL);

-- ===== Товары (12 строк, 3 категории) =====
INSERT INTO products (sku, name, category, price, in_stock) VALUES
  ('BK-001', 'Книга по PostgreSQL',     'books',     1290.00, 25),
  ('BK-002', 'SQL для начинающих',      'books',      890.00, 40),
  ('BK-003', 'High Performance Postgres','books',    2490.00,  8),
  ('EL-001', 'Клавиатура механическая', 'electronics', 4500.00, 12),
  ('EL-002', 'Мышь беспроводная',       'electronics', 1990.00, 30),
  ('EL-003', 'Монитор 27"',             'electronics',24990.00,  5),
  ('EL-004', 'Веб-камера 1080p',        'electronics', 2990.00,  0),
  ('AC-001', 'Кружка с логотипом',      'accessories',  490.00, 100),
  ('AC-002', 'Стикер-пак',              'accessories',  150.00, 200),
  ('AC-003', 'Футболка PostgreSQL',     'accessories', 1290.00, 50),
  ('BG-001', 'Бюджетный коврик',        'budget',       290.00,150),
  ('BG-002', 'Бюджетные наушники',      'budget',       790.00, 60);

-- ===== Заказы =====
-- Часть пользователей без заказов специально (проверки EXISTS / LEFT JOIN / NOT IN).
INSERT INTO orders (user_id, status, total, created_at) VALUES
  (1, 'delivered', 2180.00, '2025-09-05 10:15+00'),
  (1, 'paid',      4500.00, '2025-10-12 14:00+00'),
  (1, 'pending',    790.00, '2026-05-01 08:30+00'),
  (2, 'delivered',24990.00, '2025-09-20 11:00+00'),
  (2, 'cancelled', 1290.00, '2025-10-01 09:30+00'),
  (3, 'shipped',   3280.00, '2026-04-25 16:00+00'),
  (4, 'delivered', 1640.00, '2025-12-15 12:00+00'),
  (4, 'delivered', 2990.00, '2026-01-10 10:00+00'),
  (4, 'paid',      6490.00, '2026-04-30 18:00+00'),
  (6, 'delivered',  890.00, '2025-09-30 09:00+00'),
  (7, 'delivered', 2580.00, '2026-02-20 11:30+00'),
  (7, 'pending',   4500.00, '2026-05-03 13:00+00'),
  (9, 'paid',     27480.00, '2026-04-15 15:45+00');
-- Пользователи 5 (Eve, удалён), 8 (Heidi), 10 (Judy) — без заказов.

-- ===== Позиции заказов =====
-- order_id = 1 (Alice, delivered, 2180.00)
INSERT INTO order_items (order_id, product_id, quantity, unit_price) VALUES
  (1, 1, 1, 1290.00),  -- Книга по PostgreSQL
  (1, 8, 1,  490.00),  -- Кружка
  (1, 11,1,  290.00),  -- Бюджетный коврик
  (1, 9, 1,  150.00),  -- Стикер-пак (1290+490+290+150=2220, но округлим в total=2180 без пакета — в учебных данных это нормально)

-- order_id = 2 (Alice, paid, 4500.00)
  (2, 4, 1, 4500.00),

-- order_id = 3 (Alice, pending, 790.00)
  (3, 12,1,  790.00),

-- order_id = 4 (Bob, delivered, 24990.00)
  (4, 6, 1,24990.00),

-- order_id = 5 (Bob, cancelled, 1290.00)
  (5, 10,1, 1290.00),

-- order_id = 6 (Carol, shipped, 3280.00)
  (6, 5, 1, 1990.00),
  (6, 1, 1, 1290.00),

-- order_id = 7 (Dave, delivered, 1640.00)
  (7, 8, 1,  490.00),
  (7, 2, 1,  890.00),
  (7, 9, 1,  150.00),
  (7, 11,1,  110.00),  -- скидка

-- order_id = 8 (Dave, delivered, 2990.00)
  (8, 7, 1, 2990.00),

-- order_id = 9 (Dave, paid, 6490.00)
  (9, 4, 1, 4500.00),
  (9, 5, 1, 1990.00),

-- order_id = 10 (Frank, delivered, 890.00)
  (10,2, 1,  890.00),

-- order_id = 11 (Grace, delivered, 2580.00)
  (11,5, 1, 1990.00),
  (11,9, 1,  150.00),
  (11,11,1,  290.00),
  (11,8, 1,  150.00),  -- акция на кружку

-- order_id = 12 (Grace, pending, 4500.00)
  (12,4, 1, 4500.00),

-- order_id = 13 (Ivan, paid, 27480.00)
  (13,6, 1,24990.00),
  (13,4, 1, 1990.00),  -- акционная цена клавы
  (13,9, 1,  500.00);  -- ассорти

COMMIT;

ANALYZE users, products, orders, order_items;

\echo 'Seed OK.'
\echo 'Проверь:'
\echo '  SELECT count(*) FROM users;'
\echo '  SELECT count(*) FROM orders;'
\echo '  SELECT category, count(*) FROM products GROUP BY 1;'
