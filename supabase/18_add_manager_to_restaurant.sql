-- ============================================
-- МИГРАЦИЯ 18: Добавление связи менеджера со складом
-- ============================================

-- Добавляем поле manager_id в таблицу restaurants
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Создаем индекс для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_restaurants_manager_id ON restaurants(manager_id);

-- Обновляем RLS политики для менеджеров
DROP POLICY IF EXISTS "Managers can view their restaurant" ON restaurants;
CREATE POLICY "Managers can view their restaurant"
  ON restaurants FOR SELECT
  USING (
    manager_id = auth.uid() OR
    is_super_admin() OR
    is_active = true
  );

DROP POLICY IF EXISTS "Managers can manage their restaurant" ON restaurants;
CREATE POLICY "Managers can manage their restaurant"
  ON restaurants FOR ALL
  USING (
    manager_id = auth.uid() OR
    is_super_admin()
  );

COMMENT ON COLUMN restaurants.manager_id IS 'ID менеджера, прикрепленного к складу';

