-- МИГРАЦИЯ 20: Разрешение менеджерам управлять товарами своих складов

-- Удаляем старые политики, если они существуют
DROP POLICY IF EXISTS "Managers can view dishes for their warehouse" ON dishes;
DROP POLICY IF EXISTS "Managers can manage dishes for their warehouse" ON dishes;

-- Политика для просмотра: менеджеры могут видеть все товары своего склада (включая недоступные)
CREATE POLICY "Managers can view dishes for their warehouse"
  ON dishes FOR SELECT
  USING (
    -- Проверяем, что пользователь является менеджером
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
    AND
    -- Проверяем, что менеджер прикреплен к складу, к которому относится товар
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.manager_id = auth.uid()
    )
  );

-- Создаем политику для менеджеров: они могут управлять товарами своего склада
CREATE POLICY "Managers can manage dishes for their warehouse"
  ON dishes FOR ALL
  USING (
    -- Проверяем, что пользователь является менеджером
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
    AND
    -- Проверяем, что менеджер прикреплен к складу, к которому относится товар
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.manager_id = auth.uid()
    )
  )
  WITH CHECK (
    -- При создании/обновлении проверяем те же условия
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'manager'
    )
    AND
    EXISTS (
      SELECT 1 FROM restaurants
      WHERE restaurants.id = dishes.restaurant_id
      AND restaurants.manager_id = auth.uid()
    )
  );

-- Комментарий к политике
COMMENT ON POLICY "Managers can manage dishes for their warehouse" ON dishes IS 
  'Менеджеры могут создавать, обновлять и удалять товары для складов, к которым они прикреплены';

