-- Разрешение анонимных заказов (без регистрации)
-- Делаем user_id опциональным в таблице orders

-- Удаляем ограничение NOT NULL с user_id
ALTER TABLE orders 
ALTER COLUMN user_id DROP NOT NULL;

-- Удаляем внешний ключ, так как теперь user_id может быть NULL
ALTER TABLE orders 
DROP CONSTRAINT IF EXISTS orders_user_id_fkey;

-- Добавляем внешний ключ с опцией ON DELETE SET NULL
ALTER TABLE orders 
ADD CONSTRAINT orders_user_id_fkey 
FOREIGN KEY (user_id) 
REFERENCES profiles(id) 
ON DELETE SET NULL;

-- Добавляем поле email для анонимных заказов (опционально)
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Создаем индекс для быстрого поиска по email
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

