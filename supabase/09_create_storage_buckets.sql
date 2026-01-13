-- ============================================
-- МИГРАЦИЯ 9: Создание Storage buckets
-- ============================================
-- ⚠️ ВАЖНО: Buckets можно создать через Dashboard или через этот SQL скрипт
-- Если buckets уже созданы, этот скрипт можно пропустить

-- Создание bucket "banners"
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket "restaurants"
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurants', 'restaurants', true)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket "dishes"
INSERT INTO storage.buckets (id, name, public)
VALUES ('dishes', 'dishes', true)
ON CONFLICT (id) DO NOTHING;

-- Создание bucket "categories"
INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- Проверка созданных buckets
SELECT id, name, public, created_at 
FROM storage.buckets 
WHERE id IN ('banners', 'restaurants', 'dishes', 'categories')
ORDER BY id;



