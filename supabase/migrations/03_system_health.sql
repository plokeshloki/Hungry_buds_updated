-- SYSTEM SETTINGS TABLE (Emergency Controls & Health)
CREATE TABLE system_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  website_enabled BOOLEAN DEFAULT true NOT NULL,
  ordering_enabled BOOLEAN DEFAULT true NOT NULL,
  payments_enabled BOOLEAN DEFAULT true NOT NULL,
  maintenance_mode BOOLEAN DEFAULT false NOT NULL,
  maintenance_message TEXT,
  ordering_pause_reason TEXT,
  manual_order_pause BOOLEAN DEFAULT false NOT NULL,
  updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default system settings row
INSERT INTO system_settings (
  website_enabled, 
  ordering_enabled, 
  payments_enabled, 
  maintenance_mode, 
  manual_order_pause
) VALUES (
  true, 
  true, 
  true, 
  false, 
  false
);

-- RLS POLICIES FOR SYSTEM SETTINGS
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read system settings (needed for middleware and frontend checks)
CREATE POLICY "Anyone can read system settings" ON system_settings
  FOR SELECT USING (true);

-- Only ADMIN and SUPER_ADMIN can update system settings
CREATE POLICY "Admins can update system settings" ON system_settings
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN'))
  );
