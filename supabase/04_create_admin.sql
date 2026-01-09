-- ============================================
-- Создание первого супер-админа
-- ============================================
-- ВЫПОЛНИТЕ ПОСЛЕ РЕГИСТРАЦИИ ПЕРВОГО ПОЛЬЗОВАТЕЛЯ
-- 
-- Инструкция:
-- 1. Зарегистрируйтесь через сайт /auth/register
-- 2. Найдите ваш user_id одним из способов ниже
-- 3. Выполните UPDATE запрос

-- Способ 1: Найти по email
SELECT id, email FROM auth.users WHERE email = 'ваш-email@example.com';

-- Способ 2: Посмотреть всех пользователей
SELECT id, email, created_at FROM auth.users ORDER BY created_at DESC;

-- После того как нашли ваш user_id, выполните:
-- UPDATE profiles
-- SET role = 'super_admin'
-- WHERE id = 'ваш-user-id-из-выше-запроса';

-- Пример (замените на ваш реальный user_id):
-- UPDATE profiles
-- SET role = 'super_admin'
-- WHERE id = '123e4567-e89b-12d3-a456-426614174000';

