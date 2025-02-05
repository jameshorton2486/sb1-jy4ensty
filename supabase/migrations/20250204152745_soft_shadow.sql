/*
  # Enhanced Admin Security Policies

  1. Changes
    - Drop existing policies safely
    - Create enhanced admin policies
    - Add policy documentation
  
  2. Security
    - Restricts admin access appropriately
    - Ensures proper user isolation
    - Maintains audit trail
*/

-- Drop existing policies safely
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
RETURNS TRIGGER AS $$
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
      'action', TG_OP,
      'table', TG_TABLE_NAME,
      'timestamp', now(),
      'admin_id', v_admin_id
    );

    -- Log the change
    INSERT INTO audit_logs (
      admin_id,
      action,
      table_name,
      record_id,
      changes
    )
    VALUES (
      v_admin_id,
      TG_OP,
      TG_TABLE_NAME,
      NEW.id,
      v_changes
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger for admin_users table
DROP TRIGGER IF EXISTS admin_users_audit ON admin_users;
CREATE TRIGGER admin_users_audit
  AFTER INSERT OR UPDATE OR DELETE
  ON admin_users
  FOR EACH ROW
  EXECUTE FUNCTION log_admin_action();