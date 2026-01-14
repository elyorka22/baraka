-- ============================================
-- МИГРАЦИЯ 17: Создание таблицы для настроек Telegram бота
-- ============================================

-- Создаем таблицу для настроек бота
CREATE TABLE IF NOT EXISTS bot_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by UUID REFERENCES profiles(id)
);

-- Включаем RLS
ALTER TABLE bot_settings ENABLE ROW LEVEL SECURITY;

-- Политика: все могут читать настройки (для бота)
DROP POLICY IF EXISTS "Anyone can view bot settings" ON bot_settings;
CREATE POLICY "Anyone can view bot settings"
  ON bot_settings FOR SELECT
  USING (true);

-- Политика: только супер-админ может управлять настройками
DROP POLICY IF EXISTS "Super admin can manage bot settings" ON bot_settings;
CREATE POLICY "Super admin can manage bot settings"
  ON bot_settings FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'super_admin'
    )
  );

-- Создаем начальные настройки
INSERT INTO bot_settings (key, value, description) VALUES
  ('button_about_text', 'ℹ️ Bot haqida', 'Текст кнопки "О боте"'),
  ('button_seller_text', '🏪 Sotuvchi bo''lish', 'Текст кнопки "Стать продавцом"'),
  ('welcome_message', 'Assalomu alaykum, {firstName}! 👋

Bazar + - mahsulotlar yetkazib berish xizmati botiga xush kelibsiz! 🛒

Bu bot orqali siz:
• Mahsulotlar haqida ma''lumot olishingiz mumkin
• Buyurtma berishingiz mumkin
• Sotuvchi bo''lishingiz mumkin

Quyidagi tugmalardan birini tanlang:', 'Приветственное сообщение при /start. {firstName} будет заменен на имя пользователя'),
  ('about_message', '📱 **Bazar + Bot haqida**

Bu bot Bazar + mahsulotlar yetkazib berish xizmati uchun yaratilgan.

**Xizmatlar:**
• Mahsulotlar katalogini ko''rish
• Buyurtma berish
• Buyurtma holatini kuzatish
• Sotuvchi bo''lish

**Veb-sayt:** [Bazar +](https://baraka.vercel.app)

Savollaringiz bo''lsa, bizga yozing! 💬', 'Сообщение при нажатии на кнопку "О боте"'),
  ('seller_message', '🏪 **Sotuvchi bo''lish**

Sotuvchi bo''lish uchun quyidagi qadamlarni bajaring:

1. Veb-saytimizga kiring: [Bazar +](https://baraka.vercel.app)
2. Ro''yxatdan o''ting yoki tizimga kiring
3. Admin bilan bog''laning va sotuvchi bo''lish uchun ariza bering

**Afzalliklari:**
• O''z mahsulotlaringizni qo''shish
• Buyurtmalarni boshqarish
• Daromad olish

Qo''shimcha ma''lumot uchun admin bilan bog''laning! 📞', 'Сообщение при нажатии на кнопку "Стать продавцом"')
ON CONFLICT (key) DO NOTHING;

-- Комментарии
COMMENT ON TABLE bot_settings IS 'Настройки Telegram бота, редактируемые через админ-панель';
COMMENT ON COLUMN bot_settings.key IS 'Ключ настройки (уникальный)';
COMMENT ON COLUMN bot_settings.value IS 'Значение настройки';
COMMENT ON COLUMN bot_settings.description IS 'Описание настройки для админ-панели';

