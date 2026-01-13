-- ============================================
-- МИГРАЦИЯ 2: Row Level Security политики (БЕЗОПАСНАЯ ВЕРСИЯ)
-- ============================================
-- Эта версия безопасна для повторного выполнения
-- Используйте эту версию, если получаете ошибки "already exists"

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

-- Удаляем политики, если они существуют, затем создаем заново
DROP POLICY IF EXISTS "Super admin can view all profiles" ON profiles;
CREATE POLICY "Super admin can view all profiles"
  ON profiles FOR SELECT
  USING (is_super_admin());

DROP POLICY IF EXISTS "Super admin can manage profiles" ON profiles;
CREATE POLICY "Super admin can manage profiles"
  ON profiles FOR ALL
  USING (is_super_admin());

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Managers can view collectors and couriers" ON profiles;
CREATE POLICY "Managers can view collectors and couriers"
  ON profiles FOR SELECT
  USING (
    is_manager() AND 
    get_user_role(id) IN ('collector', 'courier')
  );

-- ============================================
-- POLICIES ДЛЯ RESTAURANTS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active restaurants" ON restaurants;
CREATE POLICY "Anyone can view active restaurants"
  ON restaurants FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Super admin can manage restaurants" ON restaurants;
CREATE POLICY "Super admin can manage restaurants"
  ON restaurants FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ CATEGORIES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view categories of active restaurants" ON categories;
CREATE POLICY "Anyone can view categories of active restaurants"
  ON categories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM restaurants 
      WHERE restaurants.id = categories.restaurant_id 
      AND restaurants.is_active = true
    )
  );

DROP POLICY IF EXISTS "Super admin can manage categories" ON categories;
CREATE POLICY "Super admin can manage categories"
  ON categories FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ DISHES
-- ============================================

DROP POLICY IF EXISTS "Anyone can view available dishes" ON dishes;
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

DROP POLICY IF EXISTS "Super admin can manage dishes" ON dishes;
CREATE POLICY "Super admin can manage dishes"
  ON dishes FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ BANNERS
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active banners" ON banners;
CREATE POLICY "Anyone can view active banners"
  ON banners FOR SELECT
  USING (is_active = true);

DROP POLICY IF EXISTS "Super admin can manage banners" ON banners;
CREATE POLICY "Super admin can manage banners"
  ON banners FOR ALL
  USING (is_super_admin());

-- ============================================
-- POLICIES ДЛЯ ORDERS
-- ============================================

DROP POLICY IF EXISTS "Customers can create orders" ON orders;
CREATE POLICY "Customers can create orders"
  ON orders FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    get_user_role(auth.uid()) = 'customer'
  );

DROP POLICY IF EXISTS "Customers can view own orders" ON orders;
CREATE POLICY "Customers can view own orders"
  ON orders FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins and managers can view all orders" ON orders;
CREATE POLICY "Admins and managers can view all orders"
  ON orders FOR SELECT
  USING (is_manager());

DROP POLICY IF EXISTS "Collectors can view assigned orders" ON orders;
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

DROP POLICY IF EXISTS "Couriers can view ready and assigned orders" ON orders;
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

DROP POLICY IF EXISTS "Managers can update orders" ON orders;
CREATE POLICY "Managers can update orders"
  ON orders FOR UPDATE
  USING (is_manager());

DROP POLICY IF EXISTS "Collectors can mark orders as ready" ON orders;
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

DROP POLICY IF EXISTS "Couriers can update delivery status" ON orders;
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

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
CREATE POLICY "Users can view own order items"
  ON order_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Managers and collectors can view all order items" ON order_items;
CREATE POLICY "Managers and collectors can view all order items"
  ON order_items FOR SELECT
  USING (
    is_manager() OR
    get_user_role(auth.uid()) = 'collector' OR
    get_user_role(auth.uid()) = 'courier'
  );

DROP POLICY IF EXISTS "Customers can create order items" ON order_items;
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

DROP POLICY IF EXISTS "Managers can view all assignments" ON order_assignments;
CREATE POLICY "Managers can view all assignments"
  ON order_assignments FOR SELECT
  USING (is_manager());

DROP POLICY IF EXISTS "Collectors can view own assignments" ON order_assignments;
CREATE POLICY "Collectors can view own assignments"
  ON order_assignments FOR SELECT
  USING (collector_id = auth.uid());

DROP POLICY IF EXISTS "Couriers can view own assignments" ON order_assignments;
CREATE POLICY "Couriers can view own assignments"
  ON order_assignments FOR SELECT
  USING (courier_id = auth.uid());

DROP POLICY IF EXISTS "Managers can manage assignments" ON order_assignments;
CREATE POLICY "Managers can manage assignments"
  ON order_assignments FOR ALL
  USING (is_manager());

-- ============================================
-- POLICIES ДЛЯ NOTIFICATIONS
-- ============================================

DROP POLICY IF EXISTS "Users can view own notifications" ON notifications;
CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;
CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);



