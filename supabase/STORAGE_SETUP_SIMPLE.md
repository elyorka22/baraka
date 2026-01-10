# Простая настройка Storage: два SQL кода

## Шаг 1: Создание buckets

Скопируйте и выполните в Supabase SQL Editor:

```sql
-- Создание всех необходимых buckets
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurants', 'restaurants', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('dishes', 'dishes', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;
```

## Шаг 2: Настройка политик доступа

Скопируйте и выполните в Supabase SQL Editor содержимое файла `supabase/10_storage_policies.sql`

Или используйте упрощенную версию ниже.

