-- ============================================
-- МИГРАЦИЯ 10: Политики доступа для Storage (загрузка изображений) - БЕЗОПАСНАЯ ВЕРСИЯ
-- ============================================
-- ⚠️ ВАЖНО: Сначала выполните 09_create_storage_buckets.sql для создания buckets
-- Эта версия безопасна для повторного выполнения

-- Политики для bucket "banners"
-- Удаляем все возможные политики (если есть)
DROP POLICY IF EXISTS "Public Access for banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete banners" ON storage.objects;

-- Разрешаем всем читать изображения
CREATE POLICY "Public Access for banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Разрешаем авторизованным пользователям загружать изображения
CREATE POLICY "Authenticated users can upload to banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Разрешаем авторизованным пользователям обновлять свои изображения
CREATE POLICY "Authenticated users can update banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Разрешаем авторизованным пользователям удалять изображения
CREATE POLICY "Authenticated users can delete banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "restaurants"
DROP POLICY IF EXISTS "Public Access for restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete restaurants" ON storage.objects;

CREATE POLICY "Public Access for restaurants"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurants');

CREATE POLICY "Authenticated users can upload to restaurants"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurants' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update restaurants"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurants' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete restaurants"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurants' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "dishes"
DROP POLICY IF EXISTS "Public Access for dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dishes" ON storage.objects;

CREATE POLICY "Public Access for dishes"
ON storage.objects FOR SELECT
USING (bucket_id = 'dishes');

CREATE POLICY "Authenticated users can upload to dishes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dishes' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update dishes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dishes' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete dishes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dishes' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "categories"
DROP POLICY IF EXISTS "Public Access for categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON storage.objects;

CREATE POLICY "Public Access for categories"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

CREATE POLICY "Authenticated users can upload to categories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update categories"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete categories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

