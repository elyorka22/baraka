-- ============================================
-- МИГРАЦИЯ 14: Создание глобальных категорий
-- ============================================

-- Создаем таблицу для глобальных категорий (не привязанных к ресторану)
CREATE TABLE IF NOT EXISTS global_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Включаем RLS
ALTER TABLE global_categories ENABLE ROW LEVEL SECURITY;

-- Политика: все могут видеть активные категории
DROP POLICY IF EXISTS "Anyone can view active global categories" ON global_categories;
CREATE POLICY "Anyone can view active global categories"
  ON global_categories FOR SELECT
  USING (is_active = true);

-- Политика: супер-админ может управлять категориями
DROP POLICY IF EXISTS "Super admin can manage global categories" ON global_categories;
CREATE POLICY "Super admin can manage global categories"
  ON global_categories FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Создаем начальные категории
INSERT INTO global_categories (name, is_active) VALUES
  ('Mevalar', false),
  ('Sabzavotlar', false),
  ('Un-yog''', false),
  ('Nonushta uchun', false),
  ('Uy uchun', false),
  ('Bolalar uchun', false),
  ('Oila uchun', false)
ON CONFLICT (name) DO NOTHING;

-- Добавляем поле global_category_id в таблицу dishes (опциональное)
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS global_category_id UUID REFERENCES global_categories(id) ON DELETE SET NULL;

-- Комментарии
COMMENT ON TABLE global_categories IS 'Глобальные категории товаров, видимые на главной странице и в форме добавления товаров';
COMMENT ON COLUMN global_categories.is_active IS 'Если true, категория видна на главной странице и в форме добавления товаров';
COMMENT ON COLUMN dishes.global_category_id IS 'Связь с глобальной категорией для отображения на главной странице';

