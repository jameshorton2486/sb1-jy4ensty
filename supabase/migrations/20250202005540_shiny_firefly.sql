/*
  # Admin System Setup
  
  1. New Tables
    - admin_users: Stores admin user information and permissions
    - audit_logs: Tracks admin actions for security
  
  2. Security
    - Enable RLS
    - Add policies for admin access
    - Create audit logging functions
*/

-- Create admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  email text UNIQUE NOT NULL,
  super_admin boolean DEFAULT false,
  permissions jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create audit logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES admin_users NOT NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  changes jsonb NOT NULL,
  ip_address text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create admin policies
CREATE POLICY "Super admins can do everything"
  ON admin_users
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND super_admin = true
    )
  );

CREATE POLICY "Admins can view audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
    )
  );

-- Create audit logging function
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER AS $$
DECLARE
  admin_id uuid;
BEGIN
  SELECT id INTO admin_id
  FROM admin_users
  WHERE user_id = auth.uid();

  IF admin_id IS NOT NULL THEN
    INSERT INTO audit_logs (
      admin_id,
      action,
      table_name,
      record_id,
      changes,
      ip_address
    ) VALUES (
      admin_id,
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      jsonb_build_object(
        'old', to_jsonb(OLD),
        'new', to_jsonb(NEW)
      ),
      current_setting('request.headers')::jsonb->>'x-forwarded-for'
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers
CREATE TRIGGER audit_legal_professionals
  AFTER INSERT OR UPDATE OR DELETE
  ON legal_professionals
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

CREATE TRIGGER audit_depositions
  AFTER INSERT OR UPDATE OR DELETE
  ON deposition_forms
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

-- Create admin helper functions
CREATE OR REPLACE FUNCTION is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = $1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;