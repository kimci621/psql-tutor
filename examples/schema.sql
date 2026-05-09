-- psql-tutor: учебная схема
-- Сквозной набор таблиц, на котором построены все примеры на сайте.
-- Применяй из psql:  \i examples/schema.sql
--
-- Таблицы:
--   users        — учётные записи
--   products     — товары
--   orders       — заказы пользователей
--   order_items  — позиции в заказе (M:N между orders и products)
--
-- Идемпотентно: можно перезапускать. Сначала чистим, потом создаём.

BEGIN;

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders      CASCADE;
DROP TABLE IF EXISTS products    CASCADE;
DROP TABLE IF EXISTS users       CASCADE;

CREATE TABLE users (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  email       text   UNIQUE NOT NULL,
  full_name   text,
  nickname    text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  deleted_at  timestamptz
);

COMMENT ON TABLE  users           IS 'учётные записи пользователей';
COMMENT ON COLUMN users.email     IS 'нормализованный e-mail (lowercase)';
COMMENT ON COLUMN users.deleted_at IS 'мягкое удаление: NULL = активный';

CREATE TABLE products (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  sku         text   UNIQUE NOT NULL,
  name        text   NOT NULL,
  category    text   NOT NULL,
  price       numeric(12,2) NOT NULL CHECK (price >= 0),
  in_stock    integer NOT NULL DEFAULT 0 CHECK (in_stock >= 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE products IS 'каталог товаров';

CREATE TABLE orders (
  id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id     bigint NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status      text   NOT NULL CHECK (status IN ('pending','paid','shipped','delivered','cancelled')),
  total       numeric(12,2) NOT NULL CHECK (total >= 0),
  created_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE orders IS 'заказы пользователей';

-- Индекс на FK не строится автоматически; для JOIN и ON DELETE он нужен.
CREATE INDEX idx_orders_user_id     ON orders (user_id);
CREATE INDEX idx_orders_created_at  ON orders (created_at DESC);
CREATE INDEX idx_orders_status      ON orders (status) WHERE status IN ('pending','paid');

CREATE TABLE order_items (
  order_id    bigint NOT NULL REFERENCES orders(id)   ON DELETE CASCADE,
  product_id  bigint NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity    integer NOT NULL CHECK (quantity > 0),
  unit_price  numeric(12,2) NOT NULL CHECK (unit_price >= 0),
  PRIMARY KEY (order_id, product_id)
);

COMMENT ON TABLE order_items IS 'позиции внутри заказа (M:N orders × products)';

CREATE INDEX idx_order_items_product ON order_items (product_id);

COMMIT;

\echo 'Schema OK. Запусти теперь:  \i examples/seed.sql'
