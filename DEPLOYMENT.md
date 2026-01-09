# Инструкции по деплою

## Деплой на Vercel (Frontend)

### 1. Подготовка

1. Убедитесь, что ваш код находится в Git репозитории (GitHub, GitLab, Bitbucket)
2. Убедитесь, что у вас есть аккаунт на [Vercel](https://vercel.com)

### 2. Деплой через Vercel Dashboard

1. Зайдите на [Vercel Dashboard](https://vercel.com/dashboard)
2. Нажмите "Add New Project"
3. Импортируйте ваш Git репозиторий
4. Настройте проект:
   - **Framework Preset**: Next.js
   - **Root Directory**: `./` (если проект в корне)
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
5. Добавьте переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon ключ из Supabase
   - `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ (для серверных операций)
   - `NEXT_PUBLIC_APP_URL` - URL вашего приложения (например, `https://your-app.vercel.app`)
6. Нажмите "Deploy"

### 3. Деплой через CLI

```bash
# Установите Vercel CLI
npm i -g vercel

# Войдите в аккаунт
vercel login

# Деплой
vercel

# Для production деплоя
vercel --prod
```

## Настройка Supabase

### 1. Создание проекта

1. Зайдите на [Supabase Dashboard](https://app.supabase.com)
2. Создайте новый проект
3. Дождитесь завершения инициализации (обычно 1-2 минуты)

### 2. Применение миграций

1. Откройте SQL Editor в Supabase Dashboard
2. Примените миграции в порядке:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_enable_realtime.sql`

### 3. Настройка Storage

1. Перейдите в Storage в Supabase Dashboard
2. Создайте следующие buckets:
   - `banners` - публичный доступ на чтение
   - `restaurants` - публичный доступ на чтение
   - `dishes` - публичный доступ на чтение
   - `categories` - публичный доступ на чтение

Для каждого bucket:
- Нажмите "Create bucket"
- Введите имя bucket
- Выберите "Public bucket" для публичного доступа
- Создайте политику доступа (опционально, если нужны ограничения)

### 4. Получение ключей API

1. Перейдите в Settings > API
2. Скопируйте:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** ключ → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** ключ → `SUPABASE_SERVICE_ROLE_KEY` (НЕ публикуйте этот ключ!)

## Деплой на Railway (опционально)

Railway можно использовать для дополнительных сервисов или Edge Functions.

### 1. Подготовка

1. Создайте аккаунт на [Railway](https://railway.app)
2. Установите Railway CLI (опционально):
   ```bash
   npm i -g @railway/cli
   ```

### 2. Деплой через Dashboard

1. Зайдите на [Railway Dashboard](https://railway.app/dashboard)
2. Нажмите "New Project"
3. Выберите "Deploy from GitHub repo" или "Empty Project"
4. Если используете GitHub:
   - Подключите репозиторий
   - Railway автоматически определит Next.js
5. Добавьте переменные окружения (те же, что и для Vercel)
6. Railway автоматически задеплоит проект

### 3. Деплой через CLI

```bash
# Войдите в аккаунт
railway login

# Инициализируйте проект
railway init

# Добавьте переменные окружения
railway variables set NEXT_PUBLIC_SUPABASE_URL=your_url
railway variables set NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
railway variables set SUPABASE_SERVICE_ROLE_KEY=your_service_key

# Деплой
railway up
```

## Создание первого супер-админа

После деплоя нужно создать первого супер-админа:

1. Зарегистрируйтесь через форму регистрации (`/auth/register`)
2. В Supabase Dashboard откройте SQL Editor
3. Выполните запрос:
   ```sql
   UPDATE profiles
   SET role = 'super_admin'
   WHERE id = 'ваш_user_id';
   ```
   (замените `ваш_user_id` на ID пользователя из таблицы `auth.users`)

4. Выйдите и войдите снова - теперь у вас будет доступ к админ-панели

## Проверка деплоя

После деплоя проверьте:

1. ✅ Главная страница открывается
2. ✅ Регистрация работает
3. ✅ Вход работает
4. ✅ Редиректы по ролям работают
5. ✅ Админ-панель доступна для супер-админа
6. ✅ Realtime обновления работают (если реализованы)

## Мониторинг

### Vercel
- Логи доступны в Vercel Dashboard
- Метрики производительности в Analytics

### Supabase
- Логи доступны в Supabase Dashboard > Logs
- Метрики использования в Settings > Usage

### Railway
- Логи доступны в Railway Dashboard
- Метрики в разделе Metrics

## Обновление

Для обновления проекта:

1. Сделайте изменения в коде
2. Закоммитьте и запушьте в Git
3. Vercel/Railway автоматически задеплоят обновления
4. Для миграций БД: примените новые миграции в Supabase SQL Editor

