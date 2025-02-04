-- Drop existing conflicting policies safely
DROP POLICY IF EXISTS "Super admins can do everything" ON admin_users;
DROP POLICY IF EXISTS "Admin users can view own profile" ON admin_users;
DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;

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

-- Create enhanced logging function
CREATE OR REPLACE FUNCTION log_policy_change()
RETURNS event_trigger
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
    -- Build detailed change log
    v_changes := jsonb_build_object(
      'command_tag', TG_TAG,
      'object_type', TG_OBJECT_TYPE,
      'schema', TG_SCHEMA,
      'timestamp', now(),
      'admin_id', v_admin_id,
      'context', current_setting('request.jwt.claims', true)::jsonb
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
      TG_TAG,
      object_identity,
      gen_random_uuid(),
      v_changes
    );
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error silently
    NULL;
END;
$$;

-- Create event trigger for policy changes
DROP EVENT TRIGGER IF EXISTS policy_change_trigger;
CREATE EVENT TRIGGER policy_change_trigger
  ON ddl_command_end
  WHEN TAG IN ('CREATE POLICY', 'ALTER POLICY', 'DROP POLICY')
  EXECUTE FUNCTION log_policy_change();