-- ============================================
-- МИГРАЦИЯ 21: Исправление RLS политик для анонимных заказов
-- ============================================

-- Удаляем все существующие политики для создания заказов
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Anyone can create orders" ON orders;

-- Создаем новую политику для создания заказов
-- Разрешаем создание заказов как авторизованным, так и неавторизованным пользователям
CREATE POLICY "Anyone can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    -- Разрешаем создание заказов авторизованными пользователями
    (
      auth.uid() IS NOT NULL AND
      user_id = auth.uid()
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
    (auth.uid() IS NOT NULL AND auth.uid() = user_id)
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
        (auth.uid() IS NOT NULL AND orders.user_id = auth.uid()) OR
        -- Для анонимных заказов
        (auth.uid() IS NULL AND orders.user_id IS NULL)
      )
    )
  );

-- Комментарии к политикам
COMMENT ON POLICY "Anyone can create orders" ON orders IS 
  'Разрешает создание заказов как авторизованным, так и неавторизованным пользователям';

COMMENT ON POLICY "Anyone can create order items" ON order_items IS 
  'Разрешает создание элементов заказа для всех заказов, соответствующих политике создания заказов';

