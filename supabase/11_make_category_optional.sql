-- ============================================
-- МИГРАЦИЯ 11: Сделать category_id необязательным для продуктов
-- ============================================
-- Эта миграция позволяет создавать продукты без категории

-- Удаляем ограничение NOT NULL для category_id
ALTER TABLE dishes
ALTER COLUMN category_id DROP NOT NULL;

-- Обновляем внешний ключ, чтобы разрешить NULL значения
-- (Внешний ключ уже должен поддерживать NULL, но убедимся)
-- Если нужно, можно удалить и пересоздать внешний ключ:
-- ALTER TABLE dishes DROP CONSTRAINT dishes_category_id_fkey;
-- ALTER TABLE dishes ADD CONSTRAINT dishes_category_id_fkey 
--   FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;
