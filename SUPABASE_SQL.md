# SQL запросы для Supabase

Скопируйте и выполните эти запросы в Supabase SQL Editor по порядку.

## ⚠️ ВАЖНО: Выполняйте запросы по порядку!

---

## Шаг 1: Создание схемы базы данных

Скопируйте весь блок ниже и выполните в SQL Editor:

```sql
-- ============================================
-- МИГРАЦИЯ 1: Создание схемы базы данных
-- ============================================

-- Создание enum типов
CREATE TYPE user_role AS ENUM ('super_admin', 'manager', 'collector', 'courier', 'customer');
CREATE TYPE order_status AS ENUM (
  'pending',
  'assigned_to_collector',
  'collecting',
  'ready',
  'assigned_to_courier',
  'delivering',
  'delivered',
  'cancelled'
);

-- Таблица profiles (расширенная информация о пользователях)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  role user_role NOT NULL DEFAULT 'customer',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица restaurants (рестораны)
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  address TEXT,
  phone TEXT,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица categories (категории блюд)
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица dishes (блюда)
CREATE TABLE dishes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  image_url TEXT,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  is_available BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица banners (баннеры)
CREATE TABLE banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  link_url TEXT,
  position INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица orders (заказы)
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  status order_status NOT NULL DEFAULT 'pending',
  total_price NUMERIC(10, 2) NOT NULL,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Таблица order_items (позиции заказа)
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  dish_id UUID NOT NULL REFERENCES dishes(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(10, 2) NOT NULL
);

-- Таблица order_assignments (назначения заказов)
CREATE TABLE order_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  collector_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  courier_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  assigned_by UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'assigned'
);

-- Таблица notifications (уведомления)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Индексы для оптимизации запросов
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_is_active ON profiles(is_active);
CREATE INDEX idx_restaurants_is_active ON restaurants(is_active);
CREATE INDEX idx_dishes_restaurant_id ON dishes(restaurant_id);
CREATE INDEX idx_dishes_category_id ON dishes(category_id);
CREATE INDEX idx_dishes_is_available ON dishes(is_available);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_assignments_order_id ON order_assignments(order_id);
CREATE INDEX idx_order_assignments_collector_id ON order_assignments(collector_id);
CREATE INDEX idx_order_assignments_courier_id ON order_assignments(courier_id);
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Триггер для автоматического обновления updated_at в orders
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, role)
  VALUES (NEW.id, 'customer');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для автоматического создания профиля
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**После выполнения должно появиться сообщение: "Success. No rows returned"**

---

## Шаг 2: Настройка Row Level Security (RLS)

Скопируйте весь блок ниже и выполните в SQL Editor:

```sql
-- ============================================
-- МИГРАЦИЯ 2: Row Level Security политики
-- ============================================

-- Включение Row Level Security для всех таблиц
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Функция для получения роли пользователя
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = user_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- Функция для проверки является ли пользователь супер-админом
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT get_user_role(auth.uid()) = 'super_admin';
$$ LANGUAGE sql SECURITY DEFINER;

-- Функция для проверки является ли пользователь менеджером
CREATE OR REPLACE FUNCTION is_manager()
RETURNS BOOLEAN AS $$
  SELECT get_user_role(auth.uid()) IN ('super_admin', 'manager');
$$ LANGUAGE sql SECURITY DEFINER;

-- ============================================
-- POLICIES ДЛЯ PROFILES
-- ============================================

-- Супер-админ может видеть всех пользователей
CREATE POLICY "Super admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_super_admin());

-- Супер-админ может создавать и обновлять профили
CREATE POLICY "Super admin can manage profiles"
  ON profiles FOR ALL
  USING (is_super_admin());

-- Пользователи могут видеть свой профиль
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Пользователи могут обновлять свой профиль
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Менеджеры могут видеть сборщиков и курьеров
CREATE POLICY "Managers can view collectors and couriers"
  ON profiles FOR SELECT
  USING (
    is_manager() AND 
    get_user_role(id) IN ('collector', 'courier')
  );

-- ============================================
-- POLICIES ДЛЯ RESTAURANTS
-- ============================================

-- Все могут видеть активные рестораны
CREATE POLICY "Anyone can view active restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true);

-- Супер-админ может управлять ресторанами
CREATE POLICY "Super admin can manage restaurants"
  ON restaurants FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ CATEGORIES
-- ============================================

-- Все могут видеть категории активных ресторанов
CREATE POLICY "Anyone can view categories of active restaurants"
  ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = categories.restaurant_id 
      AND restaurants.is_active = true
    )
  );

-- Супер-админ может управлять категориями
CREATE POLICY "Super admin can manage categories"
  ON categories FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ DISHES
-- ============================================

-- Все могут видеть доступные блюда активных ресторанов
CREATE POLICY "Anyone can view available dishes"
  ON dishes FOR SELECT
  USING (
    is_available = true AND
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = dishes.restaurant_id 
      AND restaurants.is_active = true
    )
  );

-- Супер-админ может управлять блюдами
CREATE POLICY "Super admin can manage dishes"
  ON dishes FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ BANNERS
-- ============================================

-- Все могут видеть активные баннеры
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  USING (is_active = true);

-- Супер-админ может управлять баннерами
CREATE POLICY "Super admin can manage banners"
  ON banners FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ ORDERS
-- ============================================

-- Клиенты могут создавать заказы
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

-- Клиенты могут видеть свои заказы
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

-- Супер-админ и менеджер могут видеть все заказы
CREATE POLICY "Admins and managers can view all orders"
  ON orders FOR SELECT
  USING (is_manager());

-- Сборщики могут видеть назначенные им заказы
CREATE POLICY "Collectors can view assigned orders"
  ON orders FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'collector' AND
    EXISTS (
      SELECT 1 FROM order_assignments
      WHERE order_assignments.order_id = orders.id
      AND order_assignments.collector_id = auth.uid()
    )
  );

-- Курьеры могут видеть готовые заказы и назначенные им
CREATE POLICY "Couriers can view ready and assigned orders"
  ON orders FOR SELECT
  USING (
    get_user_role(auth.uid()) = 'courier' AND
    (
      status = 'ready' OR
      EXISTS (
        SELECT 1 FROM order_assignments
        WHERE order_assignments.order_id = orders.id
        AND order_assignments.courier_id = auth.uid()
      )
    )
  );

-- Менеджеры могут обновлять заказы
CREATE POLICY "Managers can update orders"
  ON orders FOR UPDATE
  USING (is_manager());

-- Сборщики могут обновлять статус заказа на 'ready'
CREATE POLICY "Collectors can mark orders as ready"
  ON orders FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'collector' AND
    EXISTS (
      SELECT 1 FROM order_assignments
      WHERE order_assignments.order_id = orders.id
      AND order_assignments.collector_id = auth.uid()
    )
  )
  WITH CHECK (
    status = 'ready' OR status = 'collecting'
  );

-- Курьеры могут обновлять статус заказа на 'delivering' и 'delivered'
CREATE POLICY "Couriers can update delivery status"
  ON orders FOR UPDATE
  USING (
    get_user_role(auth.uid()) = 'courier' AND
    (
      status = 'ready' OR
      EXISTS (
        SELECT 1 FROM order_assignments
        WHERE order_assignments.order_id = orders.id
        AND order_assignments.courier_id = auth.uid()
      )
    )
  )
  WITH CHECK (
    status IN ('assigned_to_courier', 'delivering', 'delivered')
  );

-- ============================================
-- POLICIES ДЛЯ ORDER_ITEMS
-- ============================================

-- Пользователи могут видеть позиции своих заказов
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Менеджеры и сборщики могут видеть все позиции заказов
CREATE POLICY "Managers and collectors can view all order items"
  ON order_items FOR SELECT
  USING (
    is_manager() OR
    get_user_role(auth.uid()) = 'collector' OR
    get_user_role(auth.uid()) = 'courier'
  );

-- Клиенты могут создавать позиции заказа
CREATE POLICY "Customers can create order items"
  ON order_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- ============================================
-- POLICIES ДЛЯ ORDER_ASSIGNMENTS
-- ============================================

-- Менеджеры могут видеть все назначения
CREATE POLICY "Managers can view all assignments"
  ON order_assignments FOR SELECT
  USING (is_manager());

-- Сборщики могут видеть свои назначения
CREATE POLICY "Collectors can view own assignments"
  ON order_assignments FOR SELECT
  USING (collector_id = auth.uid());

-- Курьеры могут видеть свои назначения
CREATE POLICY "Couriers can view own assignments"
  ON order_assignments FOR SELECT
  USING (courier_id = auth.uid());

-- Менеджеры могут создавать и обновлять назначения
CREATE POLICY "Managers can manage assignments"
  ON order_assignments FOR ALL
  USING (is_manager());

-- ============================================
-- POLICIES ДЛЯ NOTIFICATIONS
-- ============================================

-- Пользователи могут видеть свои уведомления
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователи могут обновлять свои уведомления
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);
```

**После выполнения должно появиться сообщение: "Success. No rows returned"**

---

## Шаг 3: Включение Realtime

Скопируйте весь блок ниже и выполните в SQL Editor:

```sql
-- ============================================
-- МИГРАЦИЯ 3: Включение Realtime
-- ============================================

-- Включение Realtime для таблицы orders
ALTER PUBLICATION supabase_realtime ADD TABLE orders;

-- Включение Realtime для таблицы order_assignments
ALTER PUBLICATION supabase_realtime ADD TABLE order_assignments;

-- Включение Realtime для таблицы notifications
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
```

**После выполнения должно появиться сообщение: "Success. No rows returned"**

---

## Дополнительные SQL запросы

### Создание первого супер-админа

После регистрации первого пользователя выполните:

```sql
-- Найти пользователя по email
SELECT id, email FROM auth.users WHERE email = 'ваш-email@example.com';

-- Обновить роль на супер-админа (замените 'user-id' на реальный ID)
UPDATE profiles
SET role = 'super_admin'
WHERE id = 'user-id-из-выше-запроса';
```

### Проверка созданных таблиц

```sql
-- Показать все таблицы
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### Проверка RLS политик

```sql
-- Показать все политики
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

### Очистка данных (для тестирования)

⚠️ **ВНИМАНИЕ**: Эти запросы удалят все данные!

```sql
-- Удалить все данные (в правильном порядке из-за внешних ключей)
DELETE FROM order_items;
DELETE FROM order_assignments;
DELETE FROM orders;
DELETE FROM notifications;
DELETE FROM dishes;
DELETE FROM categories;
DELETE FROM banners;
DELETE FROM restaurants;
DELETE FROM profiles WHERE role != 'super_admin';
```

---

## Порядок выполнения

1. ✅ **Сначала**: Выполните Шаг 1 (создание схемы)
2. ✅ **Затем**: Выполните Шаг 2 (RLS политики)
3. ✅ **В конце**: Выполните Шаг 3 (Realtime)

## Проверка успешного выполнения

После выполнения всех миграций:

1. Перейдите в **Table Editor** - должны быть видны все таблицы
2. Перейдите в **Storage** - создайте buckets (banners, restaurants, dishes, categories)
3. Перейдите в **Database** → **Replication** - должны быть активны публикации для orders, order_assignments, notifications

## Если возникли ошибки

- Если видите ошибку "already exists" - это нормально, значит таблица/функция уже создана
- Если видите ошибку с внешними ключами - убедитесь, что выполнили миграции по порядку
- Если видите ошибку с правами доступа - убедитесь, что вы вошли в Supabase Dashboard

