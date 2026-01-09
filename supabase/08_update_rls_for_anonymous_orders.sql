-- Обновление RLS политик для разрешения анонимных заказов

-- Разрешаем создание заказов без авторизации (user_id может быть NULL)
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    -- Разрешаем создание заказов авторизованными пользователями с ролью customer
    (
      auth.uid() IS NOT NULL AND
      auth.uid() = user_id AND
      get_user_role(auth.uid()) = 'customer'
    ) OR
    -- Разрешаем создание заказов без авторизации (user_id = NULL)
    (
      auth.uid() IS NULL AND
      user_id IS NULL
    )
  );

-- Обновляем политику просмотра заказов - пользователи видят только свои заказы
-- (Политика для менеджеров и админов остается отдельной и позволяет видеть все заказы, включая анонимные)
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (
    -- Авторизованные пользователи видят свои заказы
    (auth.uid() IS NOT NULL AND auth.uid() = user_id) OR
    -- Анонимные пользователи не могут просматривать заказы (только через номер заказа)
    false
  );

-- Разрешаем создание order_items для анонимных заказов
DROP POLICY IF EXISTS "Customers can create order items" ON order_items;
CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    -- Для авторизованных пользователей
    (
      auth.uid() IS NOT NULL AND
      EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
      )
    ) OR
    -- Для анонимных заказов (проверяем, что заказ существует и user_id = NULL)
    (
      auth.uid() IS NULL AND
      EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND orders.user_id IS NULL
      )
    )
  );

