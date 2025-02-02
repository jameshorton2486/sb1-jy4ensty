/*
  # Fix admin policies

  1. Changes
    - Drops existing conflicting policies
    - Recreates policies with proper conditions
    - Adds comprehensive admin access controls
  
  2. Security
    - Maintains strict RLS enforcement
    - Ensures proper access scoping
    - Preserves audit logging
*/

-- Drop existing conflicting policies
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Super admins can do everything" ON admin_users;
  DROP POLICY IF EXISTS "Admin users can view own profile" ON admin_users;
  DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
END $$;

-- Recreate policies with proper conditions
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

-- Add comments
COMMENT ON POLICY "Super admins can manage admin users" ON admin_users IS 
  'Allows super admins full control over admin user management';
COMMENT ON POLICY "Admin users can view own profile" ON admin_users IS 
  'Allows admin users to view their own profile information';