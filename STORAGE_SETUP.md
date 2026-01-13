# Настройка Supabase Storage для загрузки изображений

## Проблема: "Bucket not found" или ошибка 404/400

Если вы видите ошибку `StorageApiError: Bucket not found`, это означает, что нужные buckets не созданы в Supabase Storage.

## Решение: Создание buckets и настройка политик

### Шаг 1: Создание buckets в Supabase Dashboard

1. Откройте [Supabase Dashboard](https://app.supabase.com)
2. Выберите ваш проект
3. В левом меню нажмите **"Storage"**
4. Нажмите **"New bucket"** или **"Create bucket"**

#### Создайте следующие 4 buckets:

**1. Bucket "banners"**
- **Name**: `banners`
- **Public bucket**: ✅ Включите (ON)
- Нажмите **"Create bucket"**

**2. Bucket "restaurants"**
- Нажмите **"New bucket"**
- **Name**: `restaurants`
- **Public bucket**: ✅ Включите (ON)
- Нажмите **"Create bucket"**

**3. Bucket "dishes"**
- Нажмите **"New bucket"**
- **Name**: `dishes`
- **Public bucket**: ✅ Включите (ON)
- Нажмите **"Create bucket"**

**4. Bucket "categories"**
- Нажмите **"New bucket"**
- **Name**: `categories`
- **Public bucket**: ✅ Включите (ON)
- Нажмите **"Create bucket"**

### Шаг 2: Настройка политик доступа

После создания всех buckets нужно настроить политики доступа для загрузки файлов.

1. Перейдите в **"SQL Editor"** в Supabase Dashboard
2. Создайте новый запрос
3. Откройте файл `supabase/10_storage_policies.sql` из проекта
4. Скопируйте **весь** содержимое файла
5. Вставьте в SQL Editor
6. Нажмите **"Run"** или `Ctrl+Enter` / `Cmd+Enter`
7. Дождитесь успешного выполнения

### Шаг 3: Проверка

1. Вернитесь в **"Storage"**
2. Убедитесь, что все 4 bucket созданы:
   - ✅ `banners`
   - ✅ `restaurants`
   - ✅ `dishes`
   - ✅ `categories`
3. Для каждого bucket:
   - Откройте bucket (нажмите на название)
   - Перейдите на вкладку **"Policies"**
   - Должны быть видны политики для SELECT, INSERT, UPDATE, DELETE

### Шаг 4: Тестирование

1. Войдите в систему как супер-админ
2. Попробуйте загрузить изображение:
   - Создайте новый продукт (`/admin/products/new`)
   - Или отредактируйте существующий
   - Нажмите "Выбрать файл" и загрузите изображение
3. Если загрузка прошла успешно - всё настроено правильно!

## Альтернативный способ: Настройка политик через Dashboard

Если SQL не работает, можно настроить политики вручную:

### Для каждого bucket (banners, restaurants, dishes, categories):

1. Откройте bucket в Storage
2. Перейдите на вкладку **"Policies"**
3. Нажмите **"New Policy"** или **"Add Policy"**

#### Политика 1: Публичный доступ на чтение
- **Policy name**: `Public Access`
- **Allowed operation**: `SELECT`
- **Policy definition**: 
  ```sql
  bucket_id = 'название_bucket'
  ```
- Нажмите **"Save"**

#### Политика 2: Загрузка для авторизованных
- **Policy name**: `Authenticated Upload`
- **Allowed operation**: `INSERT`
- **Policy definition**:
  ```sql
  bucket_id = 'название_bucket' AND auth.role() = 'authenticated'
  ```
- Нажмите **"Save"**

#### Политика 3: Обновление для авторизованных
- **Policy name**: `Authenticated Update`
- **Allowed operation**: `UPDATE`
- **Policy definition**:
  ```sql
  bucket_id = 'название_bucket' AND auth.role() = 'authenticated'
  ```
- Нажмите **"Save"**

#### Политика 4: Удаление для авторизованных
- **Policy name**: `Authenticated Delete`
- **Allowed operation**: `DELETE`
- **Policy definition**:
  ```sql
  bucket_id = 'название_bucket' AND auth.role() = 'authenticated'
  ```
- Нажмите **"Save"**

Повторите для всех 4 buckets.

## Часто задаваемые вопросы

### Почему нужны публичные buckets?

Публичные buckets позволяют всем пользователям (включая неавторизованных) просматривать изображения. Это необходимо для отображения изображений продуктов, складов и баннеров на сайте.

### Безопасно ли это?

Да, безопасно. Политики доступа контролируют:
- **Чтение (SELECT)**: Доступно всем (публичные изображения)
- **Запись (INSERT/UPDATE/DELETE)**: Только для авторизованных пользователей

### Что делать, если bucket уже существует?

Если bucket уже существует, но политики не настроены:
1. Откройте bucket
2. Перейдите на вкладку **"Policies"**
3. Добавьте недостающие политики (см. Шаг 4 выше)

### Как проверить, что политики работают?

1. Войдите в систему
2. Попробуйте загрузить изображение
3. Если загрузка успешна - политики работают
4. Если ошибка - проверьте, что все политики созданы правильно

## Полезные ссылки

- [Supabase Storage Documentation](https://supabase.com/docs/guides/storage)
- [Storage Policies](https://supabase.com/docs/guides/storage/security/access-control)


