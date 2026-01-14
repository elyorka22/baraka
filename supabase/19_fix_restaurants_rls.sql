-- ============================================
-- МИГРАЦИЯ 19: Исправление RLS политик для складов
-- ============================================
-- Эта миграция исправляет возможные конфликты политик

-- Удаляем все существующие политики для restaurants (кроме базовой)
DROP POLICY IF EXISTS "Managers can view their restaurant" ON restaurants;
DROP POLICY IF EXISTS "Managers can manage their restaurant" ON restaurants;

-- Создаем политику для просмотра: супер-админ видит все, менеджеры - свой склад, остальные - активные
CREATE POLICY "Managers can view their restaurant"
  ON restaurants FOR SELECT
  USING (
    is_super_admin() OR
    manager_id = auth.uid() OR
    is_active = true
  );

-- Политика для UPDATE: супер-админ и менеджер своего склада
CREATE POLICY "Managers can update their restaurant"
  ON restaurants FOR UPDATE
  USING (
    is_super_admin() OR
    manager_id = auth.uid()
  );

-- Политика "Super admin can manage restaurants" уже должна существовать
-- Она покрывает INSERT и DELETE для супер-админа

-- Проверяем, что политика для супер-админа существует
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'restaurants' 
    AND policyname = 'Super admin can manage restaurants'
  ) THEN
    CREATE POLICY "Super admin can manage restaurants"
      ON restaurants FOR ALL
      USING (is_super_admin());
  END IF;
END $$;

COMMENT ON POLICY "Managers can view their restaurant" ON restaurants IS 'Менеджеры могут видеть свой склад, супер-админ - все';
COMMENT ON POLICY "Managers can update their restaurant" ON restaurants IS 'Менеджеры могут обновлять свой склад, супер-админ - все';

