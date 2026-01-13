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

-- Система может создавать уведомления (через service role)
-- Это будет делаться через Edge Functions или серверные вызовы



