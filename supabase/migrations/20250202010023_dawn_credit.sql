/*
  # Admin User Setup Migration
  
  1. New Tables
    - Creates admin_settings table for configuration
    - Adds admin_roles table for role management
  
  2. Security
    - Enables RLS on new tables
    - Adds policies for admin access
    
  3. Changes
    - Adds admin configuration settings
    - Creates default admin role
*/

-- Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text UNIQUE NOT NULL,
  value jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create admin roles table
CREATE TABLE IF NOT EXISTS admin_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text UNIQUE NOT NULL,
  permissions jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for admin settings
CREATE POLICY "Admins can view settings"
  ON admin_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage settings"
  ON admin_settings
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND super_admin = true
    )
  );

-- Create policies for admin roles
CREATE POLICY "Admins can view roles"
  ON admin_roles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Super admins can manage roles"
  ON admin_roles
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND super_admin = true
    )
  );

-- Insert default admin role
INSERT INTO admin_roles (name, permissions)
VALUES (
  'Super Admin',
  '{
    "users": {"read": true, "write": true, "delete": true},
    "professionals": {"read": true, "write": true, "delete": true},
    "depositions": {"read": true, "write": true, "delete": true},
    "settings": {"read": true, "write": true},
    "roles": {"read": true, "write": true, "delete": true}
  }'
) ON CONFLICT (name) DO NOTHING;

-- Insert default settings
INSERT INTO admin_settings (key, value)
VALUES 
  ('auth_settings', '{"session_duration": "24h", "max_login_attempts": 5}'::jsonb),
  ('email_settings', '{"from_name": "Admin System", "from_email": "admin@system.com"}'::jsonb)
ON CONFLICT (key) DO NOTHING;