-- ============================================
-- МИГРАЦИЯ 9: Удаление таблицы banners (баннеры)
-- ============================================
-- ⚠️ ВНИМАНИЕ: Эта миграция удаляет таблицу banners и все связанные данные!
-- Используйте только если вы уверены, что баннеры больше не нужны.

-- Удаление политик RLS для таблицы banners (если они существуют)
DROP POLICY IF EXISTS "Super admin can view all banners" ON banners;
DROP POLICY IF EXISTS "Super admin can create banners" ON banners;
DROP POLICY IF EXISTS "Super admin can update banners" ON banners;
DROP POLICY IF EXISTS "Super admin can delete banners" ON banners;
DROP POLICY IF EXISTS "Admins can view all banners" ON banners;
DROP POLICY IF EXISTS "Admins can create banners" ON banners;
DROP POLICY IF EXISTS "Admins can update banners" ON banners;
DROP POLICY IF EXISTS "Admins can delete banners" ON banners;
DROP POLICY IF EXISTS "Public can view active banners" ON banners;

-- Отключение RLS для таблицы banners
ALTER TABLE IF EXISTS banners DISABLE ROW LEVEL SECURITY;

-- Удаление таблицы banners
DROP TABLE IF EXISTS banners CASCADE;

-- Примечание: Если вы используете Supabase Storage для изображений баннеров,
-- не забудьте удалить bucket 'banners' вручную через Supabase Dashboard.



