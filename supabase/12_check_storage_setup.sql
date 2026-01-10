-- ============================================
-- ПРОВЕРКА: Настройка Storage buckets и политик
-- ============================================
-- Этот скрипт проверяет, что все buckets созданы и политики настроены

-- Проверка buckets
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id IN ('banners', 'restaurants', 'dishes', 'categories')
ORDER BY id;

-- Проверка политик для bucket "dishes"
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
  AND policyname LIKE '%dishes%'
ORDER BY policyname;

-- Проверка всех политик Storage
SELECT 
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' 
  AND tablename = 'objects'
ORDER BY policyname;

