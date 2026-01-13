-- ============================================
-- МИГРАЦИЯ 16: Исправление RLS политик для заказов
-- ============================================

-- Обновляем политику создания заказов - разрешаем создание как авторизованным, так и неавторизованным пользователям
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    -- Разрешаем создание заказов авторизованными пользователями (user_id должен совпадать с auth.uid())
    (
      auth.uid() IS NOT NULL AND
      auth.uid() = user_id
    ) OR
    -- Разрешаем создание заказов без авторизации (user_id = NULL и auth.uid() = NULL)
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

-- Обновляем политику создания order_items - разрешаем создание для всех заказов
DROP POLICY IF EXISTS "Customers can create order items" ON order_items;
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;

-- Разрешаем создание order_items для всех заказов (проверка будет на уровне заказа)
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

