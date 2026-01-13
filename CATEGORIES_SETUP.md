# Настройка категорий товаров

## Шаг 1: Выполните SQL миграцию

Откройте Supabase Dashboard → SQL Editor и выполните файл `supabase/14_create_global_categories.sql`

Или скопируйте и выполните следующий SQL:

```sql
-- Создаем таблицу для глобальных категорий
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

-- Добавляем поле global_category_id в таблицу dishes
ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS global_category_id UUID REFERENCES global_categories(id) ON DELETE SET NULL;

-- Создаем начальные категории (все неактивные по умолчанию)
INSERT INTO global_categories (name, is_active) VALUES
  ('Mevalar', false),
  ('Sabzavotlar', false),
  ('Un-yog''', false),
  ('Nonushta uchun', false),
  ('Uy uchun', false),
  ('Bolalar uchun', false),
  ('Oila uchun', false)
ON CONFLICT (name) DO NOTHING;
```

## Шаг 2: Активируйте категории

1. Войдите в админ-панель как супер-админ
2. Перейдите в **Mahsulotlar** → **Faol kategoriyalar**
3. Нажмите **"Ko'rsatish"** для категорий, которые должны быть видны на главной странице

## Шаг 3: Свяжите товары с категориями

При добавлении нового товара выберите категорию из списка активных категорий.

Для существующих товаров можно обновить через SQL:

```sql
-- Пример: связать товар с категорией "Mevalar"
UPDATE dishes 
SET global_category_id = (SELECT id FROM global_categories WHERE name = 'Mevalar' LIMIT 1)
WHERE id = 'ваш-id-товара';
```

## Проверка

После выполнения всех шагов:
- Категории должны быть видны на странице `/admin/products/categories`
- Активные категории должны отображаться на главной странице
- Товары должны группироваться по категориям

## Отладка

Если категории не видны:

1. Проверьте, что таблица создана:
```sql
SELECT * FROM global_categories;
```

2. Проверьте, что категории активны:
```sql
SELECT * FROM global_categories WHERE is_active = true;
```

3. Проверьте, что товары связаны с категориями:
```sql
SELECT d.name, gc.name as category_name 
FROM dishes d 
LEFT JOIN global_categories gc ON d.global_category_id = gc.id;
```

4. Проверьте RLS политики:
```sql
SELECT * FROM pg_policies WHERE tablename = 'global_categories';
```

