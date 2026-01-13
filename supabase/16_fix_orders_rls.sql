-- ============================================
-- МИГРАЦИЯ 16: Исправление RLS политик для заказов
-- ============================================

-- Обновляем политику создания заказов - разрешаем создание как авторизованным, так и неавторизованным пользователям
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    -- Разрешаем создание заказов авторизованными пользователями
    (
      auth.uid() IS NOT NULL AND
      auth.uid() = user_id
    ) OR
    -- Разрешаем создание заказов без авторизации (user_id = NULL)
    (
      auth.uid() IS NULL AND
      user_id IS NULL
    ) OR
    -- Разрешаем создание заказов авторизованными пользователями с любой ролью
    (
      auth.uid() IS NOT NULL AND
      auth.uid() = user_id
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
CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    -- Разрешаем создание для всех заказов (проверка будет на уровне заказа)
    true
  );

-- Также разрешаем создание order_items для анонимных заказов
DROP POLICY IF EXISTS "Anyone can create order items" ON order_items;
CREATE POLICY "Anyone can create order items"
  ON order_items FOR INSERT
  WITH CHECK (true);

