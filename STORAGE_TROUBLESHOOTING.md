# Решение проблем с загрузкой изображений (ошибка 500)

## Проблема: Internal Server Error (500) при загрузке изображений

Если вы получаете ошибку 500 при загрузке изображений, выполните следующие шаги:

## Шаг 1: Проверка buckets

1. Откройте Supabase Dashboard → **Storage**
2. Убедитесь, что созданы все 4 bucket:
   - ✅ `banners`
   - ✅ `restaurants`
   - ✅ `dishes`
   - ✅ `categories`
3. Для каждого bucket проверьте:
   - **Public bucket**: должно быть включено (ON)
   - Bucket должен быть виден в списке

## Шаг 2: Выполните SQL проверку

1. Откройте SQL Editor в Supabase
2. Выполните файл `supabase/12_check_storage_setup.sql`
3. Проверьте результаты:
   - Должны быть видны все 4 bucket
   - Должны быть видны политики для каждого bucket

## Шаг 3: Создание buckets через SQL (если не созданы)

Если buckets не созданы, выполните:

```sql
-- Файл: supabase/09_create_storage_buckets.sql
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

## Шаг 4: Настройка политик

Выполните файл `supabase/STORAGE_POLICIES_COMPLETE.sql` - он удалит старые политики и создаст новые.

## Шаг 5: Проверка авторизации

Убедитесь, что вы авторизованы:
1. Войдите в систему как супер-админ
2. Попробуйте загрузить изображение снова

## Шаг 6: Проверка консоли браузера

Откройте консоль браузера (F12) и проверьте:
- Есть ли ошибки JavaScript
- Какой именно bucket используется
- Какой путь к файлу

## Альтернативное решение: Создание через Dashboard

Если SQL не работает, создайте buckets вручную:

1. Supabase Dashboard → **Storage** → **New bucket**
2. Для каждого bucket:
   - **Name**: `dishes` (или другое название)
   - **Public bucket**: ✅ Включите
   - **File size limit**: Оставьте по умолчанию
   - **Allowed MIME types**: Оставьте пустым (разрешить все)
3. После создания bucket:
   - Откройте bucket
   - Перейдите на вкладку **"Policies"**
   - Убедитесь, что политики созданы (или создайте их вручную)

## Создание политик вручную через Dashboard

Для каждого bucket создайте 4 политики:

### Политика 1: Публичный доступ на чтение
- **Policy name**: `Public Access`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  bucket_id = 'dishes'
  ```

### Политика 2: Загрузка для авторизованных
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'dishes' AND auth.role() = 'authenticated'
  ```

### Политика 3: Обновление для авторизованных
- **Policy name**: `Authenticated Update`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  bucket_id = 'dishes' AND auth.role() = 'authenticated'
  ```

### Политика 4: Удаление для авторизованных
- **Policy name**: `Authenticated Delete`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'dishes' AND auth.role() = 'authenticated'
  ```

Повторите для всех 4 buckets: `banners`, `restaurants`, `dishes`, `categories`.

## Проверка после настройки

1. Войдите в систему
2. Попробуйте загрузить изображение
3. Если ошибка сохраняется, проверьте логи в Supabase Dashboard → **Logs** → **Storage**

