# Пошаговая инструкция по настройке Supabase

## Шаг 1: Создание проекта Supabase

1. Перейдите на сайт [Supabase](https://supabase.com)
2. Нажмите кнопку **"Start your project"** или **"Sign in"** (если уже есть аккаунт)
3. Войдите через GitHub, Google или создайте новый аккаунт
4. После входа нажмите **"New Project"** или **"Create a new project"**

## Шаг 2: Заполнение информации о проекте

1. **Organization**: Выберите существующую организацию или создайте новую
2. **Name**: Введите название проекта (например, `baraka` или `food-delivery`)
3. **Database Password**: 
   - Придумайте надежный пароль для базы данных
   - ⚠️ **ВАЖНО**: Сохраните этот пароль! Он понадобится для прямого доступа к БД
   - Минимум 8 символов, рекомендуется использовать генератор паролей
4. **Region**: Выберите ближайший регион (например, `West US (North California)` для США или `West EU (Ireland)` для Европы)
5. **Pricing Plan**: Выберите **Free** план (достаточно для начала)
6. Нажмите **"Create new project"**

## Шаг 3: Ожидание инициализации

- Процесс создания проекта займет 1-2 минуты
- Дождитесь сообщения **"Your project is ready"**
- Не закрывайте страницу во время инициализации

## Шаг 4: Получение API ключей

После создания проекта:

1. В левом меню найдите и нажмите на **"Settings"** (шестеренка ⚙️)
2. В подменю выберите **"API"**
3. На странице API Settings вы увидите:

### 4.1. Project URL
- Это ваш **NEXT_PUBLIC_SUPABASE_URL**
- Скопируйте значение из поля **"Project URL"**
- Пример: `https://xxxxxxxxxxxxx.supabase.co`

### 4.2. API Keys

Найдите секцию **"Project API keys"**:

#### anon public (публичный ключ)
- Это ваш **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- Скопируйте значение из поля **"anon public"**
- ⚠️ Этот ключ безопасно использовать в клиентском коде
- Пример: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

#### service_role (секретный ключ)
- Это ваш **SUPABASE_SERVICE_ROLE_KEY**
- Скопируйте значение из поля **"service_role"**
- ⚠️ **КРИТИЧЕСКИ ВАЖНО**: Этот ключ НИКОГДА не публикуйте в клиентском коде!
- Он используется только на сервере и имеет полный доступ к БД
- Пример: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Шаг 5: Применение миграций базы данных

1. В левом меню нажмите **"SQL Editor"**
2. Нажмите **"New query"** или **"+"** для создания нового запроса

### 5.1. Применение первой миграции

1. Откройте файл `supabase/migrations/001_initial_schema.sql` из вашего проекта
2. Скопируйте **весь** содержимое файла
3. Вставьте в SQL Editor в Supabase
4. Нажмите **"Run"** или `Ctrl+Enter` (Windows) / `Cmd+Enter` (Mac)
5. Дождитесь сообщения **"Success. No rows returned"**

### 5.2. Применение второй миграции

1. Очистите редактор (или создайте новый запрос)
2. Откройте файл `supabase/migrations/002_rls_policies.sql`
3. Скопируйте **весь** содержимое
4. Вставьте в SQL Editor
5. Нажмите **"Run"**
6. Дождитесь успешного выполнения

### 5.3. Применение третьей миграции

1. Создайте новый запрос
2. Откройте файл `supabase/migrations/003_enable_realtime.sql`
3. Скопируйте содержимое
4. Вставьте и выполните

## Шаг 6: Настройка Storage (хранилище файлов)

1. В левом меню нажмите **"Storage"**
2. Нажмите **"New bucket"** или **"Create bucket"**

### 6.1. Создание bucket для баннеров

1. **Name**: `banners`
2. **Public bucket**: Включите переключатель (сделать публичным)
3. Нажмите **"Create bucket"**

### 6.2. Создание bucket для ресторанов

1. Нажмите **"New bucket"**
2. **Name**: `restaurants`
3. **Public bucket**: Включите
4. Нажмите **"Create bucket"**

### 6.3. Создание bucket для блюд

1. Нажмите **"New bucket"**
2. **Name**: `dishes`
3. **Public bucket**: Включите
4. Нажмите **"Create bucket"**

### 6.4. Создание bucket для категорий

1. Нажмите **"New bucket"**
2. **Name**: `categories`
3. **Public bucket**: Включите
4. Нажмите **"Create bucket"**

### 6.5. Настройка политик доступа (опционально)

Для каждого bucket можно настроить политики:

1. Откройте bucket (нажмите на его название)
2. Перейдите на вкладку **"Policies"**
3. По умолчанию публичные bucket доступны для чтения всем
4. Для записи можно добавить политику (но это не обязательно для начала)

## Шаг 7: Проверка настройки

### 7.1. Проверка таблиц

1. В левом меню нажмите **"Table Editor"**
2. Вы должны увидеть следующие таблицы:
   - `profiles`
   - `restaurants`
   - `categories`
   - `dishes`
   - `banners`
   - `orders`
   - `order_items`
   - `order_assignments`
   - `notifications`

### 7.2. Проверка Storage

1. Перейдите в **"Storage"**
2. Убедитесь, что созданы все 4 bucket:
   - `banners`
   - `restaurants`
   - `dishes`
   - `categories`

## Шаг 8: Настройка переменных окружения

### 8.1. Для локальной разработки

Создайте файл `.env.local` в корне проекта:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-ключ
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-ключ

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Пример заполненного файла:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxOTMxODE1MDIyfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjE2MjM5MDIyLCJleHAiOjE5MzE4MTUwMjJ9.yyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyy
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 8.2. Для Vercel (деплой)

1. Откройте [Vercel Dashboard](https://vercel.com/dashboard)
2. Выберите ваш проект `baraka`
3. Перейдите в **Settings** → **Environment Variables**
4. Добавьте каждую переменную:
   - **Key**: `NEXT_PUBLIC_SUPABASE_URL`
   - **Value**: ваш URL из Supabase
   - **Environment**: Production, Preview, Development (выберите все)
   - Нажмите **"Save"**
5. Повторите для остальных переменных:
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_APP_URL` (укажите URL вашего Vercel проекта)

## Шаг 9: Создание первого супер-админа

После настройки проекта:

1. Запустите локальный сервер: `npm run dev`
2. Откройте `http://localhost:3000`
3. Зарегистрируйтесь через `/auth/register`
4. После регистрации откройте Supabase Dashboard
5. Перейдите в **"SQL Editor"**
6. Создайте новый запрос и выполните:

```sql
-- Сначала узнайте ваш user_id
-- Перейдите в Authentication → Users и скопируйте ID пользователя
-- Или выполните этот запрос для поиска по email:

SELECT id, email FROM auth.users WHERE email = 'ваш-email@example.com';

-- Затем обновите роль:
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'ваш-user-id-из-выше-запроса';
```

**Альтернативный способ (через Table Editor):**
1. Перейдите в **"Table Editor"** → **"profiles"**
2. Найдите вашу запись (по email из auth.users)
3. Нажмите на строку для редактирования
4. Измените поле `role` на `super_admin`
5. Сохраните

## Шаг 10: Проверка работы

1. Выйдите из системы (если были залогинены)
2. Войдите снова через `/auth/login`
3. Вы должны быть перенаправлены на `/admin/dashboard`
4. Если видите панель администратора - всё настроено правильно!

## Часто задаваемые вопросы

### Где найти Project ID?
- Project ID находится в URL вашего проекта
- Пример: `https://abcdefghijklmnop.supabase.co` → ID: `abcdefghijklmnop`

### Что делать, если забыл пароль базы данных?
- Перейдите в **Settings** → **Database**
- Нажмите **"Reset database password"**
- ⚠️ Это сбросит пароль, убедитесь, что обновите его везде, где используется

### Как проверить, что Realtime работает?
- После применения миграции `003_enable_realtime.sql`
- Realtime автоматически включен для таблиц `orders`, `order_assignments`, `notifications`
- Проверить можно в **Database** → **Replication** (должны быть активны публикации)

### Безопасно ли использовать anon key в клиентском коде?
- Да, anon key безопасен для использования в клиентском коде
- Row Level Security (RLS) политики защищают ваши данные
- service_role key НИКОГДА не используйте в клиентском коде!

## Полезные ссылки

- [Supabase Dashboard](https://app.supabase.com)
- [Supabase Documentation](https://supabase.com/docs)
- [Vercel Dashboard](https://vercel.com/dashboard)

## Поддержка

Если возникли проблемы:
1. Проверьте, что все миграции применены успешно
2. Убедитесь, что переменные окружения установлены правильно
3. Проверьте логи в Supabase Dashboard → Logs
4. Проверьте логи в Vercel Dashboard → Deployments → Logs


