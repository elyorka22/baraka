-- ============================================
-- МИГРАЦИЯ 10: Политики доступа для Storage (загрузка изображений)
-- ============================================
-- ⚠️ ВАЖНО: Сначала создайте все buckets в Supabase Dashboard (Storage → New bucket)
-- Buckets должны быть созданы: banners, restaurants, dishes, categories
-- Все buckets должны быть публичными (Public bucket = ON)

-- Политики для bucket "banners"
-- Разрешаем всем читать изображения
CREATE POLICY IF NOT EXISTS "Public Access for banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- Разрешаем авторизованным пользователям загружать изображения
CREATE POLICY IF NOT EXISTS "Authenticated users can upload to banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Разрешаем авторизованным пользователям обновлять свои изображения
CREATE POLICY IF NOT EXISTS "Authenticated users can update banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Разрешаем авторизованным пользователям удалять изображения
CREATE POLICY IF NOT EXISTS "Authenticated users can delete banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "restaurants"
CREATE POLICY IF NOT EXISTS "Public Access for restaurants"
ON storage.objects FOR SELECT
USING (bucket_id = 'restaurants');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to restaurants"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'restaurants' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can update restaurants"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'restaurants' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete restaurants"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'restaurants' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "dishes"
CREATE POLICY IF NOT EXISTS "Public Access for dishes"
ON storage.objects FOR SELECT
USING (bucket_id = 'dishes');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to dishes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'dishes' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can update dishes"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'dishes' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete dishes"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'dishes' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "categories"
CREATE POLICY IF NOT EXISTS "Public Access for categories"
ON storage.objects FOR SELECT
USING (bucket_id = 'categories');

CREATE POLICY IF NOT EXISTS "Authenticated users can upload to categories"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can update categories"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

CREATE POLICY IF NOT EXISTS "Authenticated users can delete categories"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'categories' AND
  auth.role() = 'authenticated'
);

