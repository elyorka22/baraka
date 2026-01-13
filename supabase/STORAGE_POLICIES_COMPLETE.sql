-- ============================================
-- ПОЛНЫЙ СКРИПТ: Удаление старых и создание новых политик Storage
-- ============================================
-- Выполните этот скрипт целиком - он сначала удалит все старые политики,
-- а потом создаст новые

-- ========== УДАЛЕНИЕ ВСЕХ СТАРЫХ ПОЛИТИК ==========

-- Удаляем политики для "banners"
DROP POLICY IF EXISTS "Public Access for banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete banners" ON storage.objects;

-- Удаляем политики для "restaurants"
DROP POLICY IF EXISTS "Public Access for restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete restaurants" ON storage.objects;

-- Удаляем политики для "dishes"
DROP POLICY IF EXISTS "Public Access for dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dishes" ON storage.objects;

-- Удаляем политики для "categories"
DROP POLICY IF EXISTS "Public Access for categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON storage.objects;

-- ========== СОЗДАНИЕ НОВЫХ ПОЛИТИК ==========

-- Политики для bucket "banners"
CREATE POLICY "Public Access for banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

CREATE POLICY "Authenticated users can upload to banners"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can update banners"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Authenticated users can delete banners"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'banners' AND
  auth.role() = 'authenticated'
);

-- Политики для bucket "restaurants"
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


