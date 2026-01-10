-- ============================================
-- МИГРАЦИЯ 13: Добавление поля badge_text в таблицу dishes
-- ============================================
-- Это поле позволяет настраивать текст бейджа на карточках товаров
-- Например: "Mavjud", "-15%", "Top", и т.д.

ALTER TABLE dishes 
ADD COLUMN IF NOT EXISTS badge_text TEXT;

-- Устанавливаем значение по умолчанию для существующих записей
UPDATE dishes 
SET badge_text = 'Mavjud' 
WHERE badge_text IS NULL AND is_available = true;

UPDATE dishes 
SET badge_text = NULL 
WHERE badge_text IS NULL AND is_available = false;

-- Комментарий к колонке
COMMENT ON COLUMN dishes.badge_text IS 'Текст бейджа на карточке товара (например: "Mavjud", "-15%", "Top"). Если NULL, бейдж не отображается.';

