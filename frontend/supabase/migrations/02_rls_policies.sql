-- RLS POLICIES

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE hotels ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE foods ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 1. PROFILES
-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Admins can view all profiles
CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- 2. HOTELS
-- Anyone can view active hotels
CREATE POLICY "Anyone can view active hotels" ON hotels
  FOR SELECT USING (is_active = true);

-- Admins can view all hotels and manage them
CREATE POLICY "Admins can manage hotels" ON hotels
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- 3. CATEGORIES
-- Anyone can view categories for active hotels
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM hotels WHERE hotels.id = categories.hotel_id AND hotels.is_active = true)
  );

-- Admins can manage categories
CREATE POLICY "Admins can manage categories" ON categories
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- 4. FOODS
-- Anyone can view available foods for active hotels
CREATE POLICY "Anyone can view available foods" ON foods
  FOR SELECT USING (
    is_available = true AND
    EXISTS (SELECT 1 FROM hotels WHERE hotels.id = foods.hotel_id AND hotels.is_active = true)
  );

-- Admins can manage foods
CREATE POLICY "Admins can manage foods" ON foods
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- 5. SETTINGS
-- Anyone can read settings
CREATE POLICY "Anyone can read settings" ON settings
  FOR SELECT USING (true);

-- Only Super Admins can update settings
CREATE POLICY "Super Admins can update settings" ON settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'SUPER_ADMIN')
  );

-- 6. ORDERS
-- Users can view their own orders
CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (user_id = auth.uid());

-- Users can insert their own orders (Now handled entirely by API using Service Role to prevent tampering)
-- CREATE POLICY "Users can insert own orders" ON orders
--   FOR INSERT WITH CHECK (user_id = auth.uid());

-- Admins can view all orders
CREATE POLICY "Admins can view all orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Admins can update orders
CREATE POLICY "Admins can update orders" ON orders
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- Delivery staff can view orders assigned to them or generally out for delivery (simplified for now: can view all)
CREATE POLICY "Delivery can view orders" ON orders
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'DELIVERY')
  );

-- 7. ORDER ITEMS
-- Users can view order items for their own orders
CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid())
  );

-- Admins and Delivery can view all order items
CREATE POLICY "Admins and Delivery can view all order items" ON order_items
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'DELIVERY'))
  );

-- 8. PAYMENTS
-- Users can view payments for their own orders
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM orders WHERE orders.id = payments.order_id AND orders.user_id = auth.uid())
  );

-- Admins can view all payments
CREATE POLICY "Admins can view all payments" ON payments
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );

-- 9. DELIVERY VERIFICATIONS
-- Admins and Delivery can manage delivery verifications
CREATE POLICY "Admins and Delivery can manage delivery verifications" ON delivery_verifications
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN', 'DELIVERY'))
  );

-- 10. AUDIT LOGS
-- Only Admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON audit_logs
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );
