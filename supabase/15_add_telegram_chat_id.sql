-- ============================================
-- МИГРАЦИЯ 15: Добавление Telegram Chat ID для складов
-- ============================================

-- Добавляем поле для хранения Telegram Chat ID
ALTER TABLE restaurants 
ADD COLUMN IF NOT EXISTS telegram_chat_id TEXT;

-- Комментарий
COMMENT ON COLUMN restaurants.telegram_chat_id IS 'Telegram Chat ID для отправки уведомлений о новых заказах';

