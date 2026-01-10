-- ============================================
-- МИГРАЦИЯ 10: Исправление политик Storage (удаление всех старых политик)
-- ============================================
-- ⚠️ ВАЖНО: Выполните этот скрипт ПЕРЕД выполнением 10_storage_policies.sql
-- Этот скрипт удалит ВСЕ существующие политики для buckets

-- Удаляем все политики для bucket "banners"
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%banners%') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Удаляем все политики для bucket "restaurants"
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%restaurants%') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Удаляем все политики для bucket "dishes"
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%dishes%') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Удаляем все политики для bucket "categories"
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage' AND policyname LIKE '%categories%') LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON storage.objects';
    END LOOP;
END $$;

-- Удаляем политики по точным именам (на всякий случай)
DROP POLICY IF EXISTS "Public Access for banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update banners" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete banners" ON storage.objects;

DROP POLICY IF EXISTS "Public Access for restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update restaurants" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete restaurants" ON storage.objects;

DROP POLICY IF EXISTS "Public Access for dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update dishes" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete dishes" ON storage.objects;

DROP POLICY IF EXISTS "Public Access for categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload to categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON storage.objects;

