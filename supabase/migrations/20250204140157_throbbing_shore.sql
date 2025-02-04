/*
  # Admin Policies Update

  1. Changes
    - Drop and recreate admin user policies
    - Add policy documentation
    - Add audit logging via triggers
  
  2. Security
    - Policies enforce proper access control
    - Audit logging for policy changes
    - No superuser privileges required
*/

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Super admins can manage admin users" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view own profile" ON admin_users;

-- Create enhanced policies with proper conditions
CREATE POLICY "Super admins can manage admin users"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND super_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE user_id = auth.uid()
      AND super_admin = true
    )
  );

CREATE POLICY "Admin users can view own profile"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Add helpful comments
COMMENT ON POLICY "Super admins can manage admin users" ON admin_users IS 
  'Allows super admins full control over admin user management';
COMMENT ON POLICY "Admin users can view own profile" ON admin_users IS 
  'Allows admin users to view their own profile information';

-- Create audit logging function for policy changes
CREATE OR REPLACE FUNCTION log_admin_action()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_admin_id uuid;
  v_changes jsonb;
BEGIN
  -- Get admin ID
  SELECT id INTO v_admin_id
  FROM admin_users
  WHERE user_id = auth.uid()
  AND super_admin = true;

  IF v_admin_id IS NOT NULL THEN
    -- Build change log
    v_changes := jsonb_build_object(
      'table', TG_TABLE_NAME,
      'action', TG_OP,
      'timestamp', now(),
      'old_data', to_jsonb(OLD),
      'new_data', to_jsonb(NEW)
    );

    -- Log the change
    INSERT INTO audit_logs (
      admin_id,
      action,
      table_name,
      record_id,
      changes
    ) VALUES (
      v_admin_id,
      TG_OP,
      TG_TABLE_NAME,
      COALESCE(NEW.id, OLD.id),
      v_changes
    );
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger for admin_users table changes
DROP TRIGGER IF EXISTS admin_users_audit_trigger ON admin_users;
CREATE TRIGGER admin_users_audit_trigger
  AFTER INSERT OR UPDATE OR DELETE
  ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_user_id ON admin_users(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs(admin_id);