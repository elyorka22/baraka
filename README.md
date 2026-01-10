# Baraka - Система доставки продуктов

Современная система управления доставкой продуктов с поддержкой множественных ролей.

## Технологический стек

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Деплой**: Vercel (Frontend), Supabase (Backend), Railway (опционально)

## Роли пользователей

1. **Супер-админ** - следит за всеми процессами, управляет всем процессом, назначает менеджеров
2. **Менеджер** - может видеть заказы, распределяет между сборщиками
3. **Сборщик** - собирает заказы и может закрыть (заказ готов)
4. **Курьер** - может видеть все готовые заказы, принимает и доставляет
5. **Клиент** - оформление и отслеживание заказов

## Установка и настройка

### 1. Клонирование и установка зависимостей

```bash
npm install
```

### 2. Настройка Supabase

1. Создайте проект на [Supabase](https://supabase.com)
2. Скопируйте `.env.local.example` в `.env.local`
3. Заполните переменные окружения:
   - `NEXT_PUBLIC_SUPABASE_URL` - URL вашего Supabase проекта
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Anon ключ
   - `SUPABASE_SERVICE_ROLE_KEY` - Service Role ключ

### 3. Применение миграций базы данных

1. Откройте SQL Editor в Supabase Dashboard
2. Примените миграции в порядке:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
   - `supabase/migrations/003_enable_realtime.sql`

### 4. Настройка Storage

Создайте следующие buckets в Supabase Storage:
- `restaurants` - для изображений складов/магазинов
- `dishes` - для изображений продуктов
- `categories` - для изображений категорий продуктов

Настройте политики доступа для каждого bucket (публичный доступ на чтение).

### 5. Запуск проекта

```bash
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

### 6. Создание первого супер-админа

После регистрации первого пользователя, обновите его роль в Supabase:

```sql
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'ваш_user_id';
```

Подробные инструкции по деплою см. в [DEPLOYMENT.md](./DEPLOYMENT.md)

## Структура проекта

```
baraka/
├── app/                    # Next.js App Router
│   ├── admin/             # Страницы супер-админа
│   ├── manager/           # Страницы менеджера
│   ├── collector/         # Страницы сборщика
│   ├── courier/           # Страницы курьера
│   ├── customer/         # Страницы клиента
│   └── auth/              # Страницы аутентификации
├── components/            # React компоненты
├── lib/                   # Утилиты и конфигурация
│   └── supabase/         # Supabase клиенты
├── types/                 # TypeScript типы
└── supabase/             # Миграции базы данных
    └── migrations/
```

## Деплой

### Vercel (Frontend)

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения из `.env.local`
3. Деплой произойдет автоматически

### Supabase (Backend)

База данных и сервисы уже хостятся на Supabase.

### Railway (опционально)

Можно использовать для дополнительных сервисов или Edge Functions.

## Лицензия

MIT
