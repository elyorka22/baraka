-- Автоматическое подтверждение email для разработки
-- ⚠️ ВНИМАНИЕ: Используйте это только для разработки и тестирования!
-- В продакшене это небезопасно и не рекомендуется.

-- Функция для автоматического подтверждения email
CREATE OR REPLACE FUNCTION public.auto_confirm_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Автоматически подтверждаем email при создании пользователя
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, NOW())
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Удаляем старый триггер, если существует
DROP TRIGGER IF EXISTS on_auth_user_created_confirm ON auth.users;

-- Создаем триггер для автоматического подтверждения
CREATE TRIGGER on_auth_user_created_confirm
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_confirm_email();

-- Подтверждаем всех существующих пользователей, у которых email не подтвержден
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;



