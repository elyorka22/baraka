# Инструкция по выполнению SQL миграций

## ⚠️ Если получаете ошибку "already exists"

Если при выполнении миграций вы получаете ошибки типа:
- `policy "..." already exists`
- `function "..." already exists`
- `table "..." already exists`

Это означает, что часть миграций уже была выполнена ранее.

## Решение

### Вариант 1: Использовать безопасную версию (рекомендуется)

Используйте файл `02_rls_policies_safe.sql` вместо `02_rls_policies.sql`

Этот файл автоматически удаляет существующие политики перед созданием новых.

### Вариант 2: Удалить все и начать заново

Если хотите начать с чистого листа, выполните:

```sql
-- ВНИМАНИЕ: Это удалит ВСЕ данные и структуру!

-- Удаление всех политик
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Super admin can manage profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Managers can view collectors and couriers" ON profiles;
DROP POLICY IF EXISTS "Anyone can view active restaurants" ON restaurants;
DROP POLICY IF EXISTS "Super admin can manage restaurants" ON restaurants;
DROP POLICY IF EXISTS "Anyone can view categories of active restaurants" ON categories;
DROP POLICY IF EXISTS "Super admin can manage categories" ON categories;
DROP POLICY IF EXISTS "Anyone can view available dishes" ON dishes;
DROP POLICY IF EXISTS "Super admin can manage dishes" ON dishes;
DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
DROP POLICY IF EXISTS "Super admin can manage banners" ON banners;
DROP POLICY IF EXISTS "Customers can create orders" ON orders;
DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
DROP POLICY IF EXISTS "Admins and managers can view all orders" ON orders;
DROP POLICY IF EXISTS "Collectors can view assigned orders" ON orders;
DROP POLICY IF EXISTS "Couriers can view ready and assigned orders" ON orders;
DROP POLICY IF EXISTS "Managers can update orders" ON orders;
DROP POLICY IF EXISTS "Collectors can mark orders as ready" ON orders;
DROP POLICY IF EXISTS "Couriers can update delivery status" ON orders;
DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Managers and collectors can view all order items" ON order_items;
DROP POLICY IF EXISTS "Customers can create order items" ON order_items;
DROP POLICY IF EXISTS "Managers can view all assignments" ON order_assignments;
DROP POLICY IF EXISTS "Collectors can view own assignments" ON order_assignments;
DROP POLICY IF EXISTS "Couriers can view own assignments" ON order_assignments;
DROP POLICY IF EXISTS "Managers can manage assignments" ON order_assignments;
DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Затем выполните 02_rls_policies.sql заново
```

### Вариант 3: Пропустить существующие

Если политика уже существует и работает правильно, просто пропустите её создание.

## Рекомендуемый порядок выполнения

### Для новой установки (доставка продуктов):

1. ✅ `01_initial_schema_products.sql` - создание таблиц (для продуктов, без баннеров)
2. ✅ `02_rls_policies_safe.sql` - безопасная версия с проверками (вместо 02_rls_policies.sql)
3. ✅ `03_enable_realtime.sql` - включение Realtime
4. ✅ `04_create_admin.sql` - создание админа (после регистрации)
5. ✅ `05_auto_confirm_email.sql` - автоматическое подтверждение email (опционально, для разработки)
6. ✅ `07_allow_anonymous_orders.sql` - разрешить анонимные заказы
7. ✅ `08_update_rls_for_anonymous_orders.sql` - обновление RLS для анонимных заказов

### Для существующей установки (миграция с доставки еды на продукты):

Если у вас уже есть база данных с доставкой еды и вы хотите перейти на доставку продуктов:

1. ✅ `09_remove_banners.sql` - удаление таблицы banners (опционально, если баннеры не нужны)
2. ⚠️ **Важно**: Структура таблиц `restaurants` и `dishes` не изменилась, только терминология в интерфейсе

### Для старой установки (доставка еды):

1. ✅ `01_initial_schema.sql` - создание таблиц (старая версия с баннерами)
2. ✅ `02_rls_policies_safe.sql` - безопасная версия с проверками
3. ✅ `03_enable_realtime.sql` - включение Realtime
4. ✅ `04_create_admin.sql` - создание админа (после регистрации)

## Проверка успешного выполнения

После выполнения всех миграций проверьте:

1. **Таблицы созданы**: Table Editor → должны быть видны все таблицы
2. **Политики созданы**: Database → Policies → должны быть политики для каждой таблицы
3. **Realtime включен**: Database → Replication → должны быть активны публикации

