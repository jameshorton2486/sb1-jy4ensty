-- Drop existing conflicting policies safely
DO $$
BEGIN
  -- Drop policies if they exist
  DROP POLICY IF EXISTS "Super admins can do everything" ON admin_users;
  DROP POLICY IF EXISTS "Admin users can view own profile" ON admin_users;
  DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
END $$;

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

-- Add logging function for policy changes
CREATE OR REPLACE FUNCTION log_policy_change()
RETURNS event_trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
    AND super_admin = true
  ) THEN
    INSERT INTO audit_logs (
      admin_id,
      action,
      table_name,
      record_id,
      changes
    )
    SELECT
      a.id,
      TG_TAG,
      object_identity,
      gen_random_uuid(),
      jsonb_build_object(
        'command_tag', TG_TAG,
        'object_type', TG_OBJECT_TYPE,
        'schema', TG_SCHEMA,
        'timestamp', now()
      )
    FROM admin_users a
    WHERE a.user_id = auth.uid();
  END IF;
END;
$$;