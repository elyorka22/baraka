-- Подтверждение email для всех существующих пользователей
-- Используйте этот скрипт, если у вас уже есть пользователи без подтвержденного email

-- Подтверждаем всех пользователей, у которых email не подтвержден
UPDATE auth.users
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Проверяем результат
SELECT 
  id,
  email,
  email_confirmed_at,
  created_at
FROM auth.users
ORDER BY created_at DESC;



