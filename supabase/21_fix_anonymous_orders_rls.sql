-- ============================================
-- МИГРАЦИЯ 21: Исправление RLS политик для анонимных заказов
-- ============================================

-- Шаг 1: Убеждаемся, что user_id может быть NULL (если миграция 07 не была выполнена)
DO $$ 
BEGIN
  -- Проверяем, является ли user_id NOT NULL
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'user_id' 
    AND is_nullable = 'NO'
  ) THEN
    -- Делаем user_id опциональным
    ALTER TABLE orders ALTER COLUMN user_id DROP NOT NULL;
  END IF;
END $$;

-- Шаг 2: Убеждаемся, что RLS включен
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Шаг 3: Удаляем ВСЕ существующие политики для orders (чтобы избежать конфликтов)
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;
DROP POLICY IF EXISTS "Super admin can manage orders" ON orders;
DROP POLICY IF EXISTS "Managers can update orders" ON orders;
DROP POLICY IF EXISTS "Collectors can mark orders as ready" ON orders;
DROP POLICY IF EXISTS "Couriers can update delivery status" ON orders;

-- Создаем новую политику для создания заказов
-- Разрешаем создание заказов как авторизованным, так и неавторизованным пользователям
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    -- Разрешаем создание заказов авторизованными пользователями
    (
      auth.uid() IS NOT NULL AND
      user_id IS NOT DISTINCT FROM auth.uid()
    ) OR
    -- Разрешаем создание заказов неавторизованными пользователями (user_id = NULL)
    (
      auth.uid() IS NULL AND
      user_id IS NULL
    )
  );

-- Обновляем политику просмотра заказов
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    -- Авторизованные пользователи видят свои заказы
    (auth.uid() IS NOT NULL AND user_id IS NOT DISTINCT FROM auth.uid())
  );

-- Удаляем все существующие политики для создания order_items
DROP POLICY IF EXISTS "Customers can create order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Создаем новую политику для создания order_items
-- Разрешаем создание элементов заказа для всех заказов (проверка на уровне заказа)
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    -- Проверяем, что заказ существует и соответствует политике создания заказов
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND (
        -- Для авторизованных пользователей
        (auth.uid() IS NOT NULL AND orders.user_id IS NOT DISTINCT FROM auth.uid()) OR
        -- Для анонимных заказов
        (auth.uid() IS NULL AND orders.user_id IS NULL)
      )
    )
  );

-- Шаг 4: Восстанавливаем политики для менеджеров и админов (если они нужны)
-- Политика для просмотра всех заказов менеджерами и админами
DROP POLICY IF EXISTS "Admins and managers can view all orders" ON orders;
CREATE POLICY "Admins and managers can view all orders"
  ON orders FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager')
    )
  );

-- Политика для обновления заказов менеджерами
DROP POLICY IF EXISTS "Managers can update orders" ON orders;
CREATE POLICY "Managers can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'manager')
    )
  );

-- Комментарии к политикам
COMMENT ON POLICY "Anyone can create orders" ON orders IS 
  'Разрешает создание заказов как авторизованным, так и неавторизованным пользователям';

COMMENT ON POLICY "Anyone can create order items" ON order_items IS 
  'Разрешает создание элементов заказа для всех заказов, соответствующих политике создания заказов';

