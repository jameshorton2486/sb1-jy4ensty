-- Enhanced security policies with comprehensive error handling
DO $$
DECLARE
  v_error_msg text;
  v_error_detail text;
  v_error_context text;
  v_start_time timestamptz;
BEGIN
  v_start_time := clock_timestamp();
  RAISE NOTICE 'Starting security policy enhancement at %', v_start_time;

  BEGIN
    -- Drop existing conflicting policies safely
    RAISE NOTICE 'Dropping existing policies...';
    DROP POLICY IF EXISTS "Super admins can do everything" ON admin_users;
    DROP POLICY IF EXISTS "Admin users can view own profile" ON admin_users;
    DROP POLICY IF EXISTS "Super admins can manage all admin users" ON admin_users;
    RAISE NOTICE 'Successfully dropped existing policies';

    -- Create enhanced policies with proper conditions
    RAISE NOTICE 'Creating new enhanced policies...';
    
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

        RAISE NOTICE 'Policy change logged successfully for admin %', v_admin_id;
      ELSE
        RAISE NOTICE 'No super admin found for current user';
      END IF;
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'Error logging policy change: % (%)', SQLERRM, SQLSTATE;
    END;
    $$;

    -- Create event trigger for policy changes
    DROP EVENT TRIGGER IF EXISTS policy_change_trigger;
    CREATE EVENT TRIGGER policy_change_trigger
      ON ddl_command_end
      WHEN TAG IN ('CREATE POLICY', 'ALTER POLICY', 'DROP POLICY')
      EXECUTE FUNCTION log_policy_change();

    RAISE NOTICE 'Security enhancement completed successfully. Duration: % ms',
      EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;

  EXCEPTION
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS 
        v_error_msg = MESSAGE_TEXT,
        v_error_detail = PG_EXCEPTION_DETAIL,
        v_error_context = PG_CONTEXT;

      RAISE WARNING 'Error during security enhancement: %', v_error_msg;
      RAISE WARNING 'Error detail: %', v_error_detail;
      RAISE WARNING 'Error context: %', v_error_context;
      RAISE WARNING 'Error occurred after % ms',
        EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
      RAISE EXCEPTION 'Security enhancement failed: %', v_error_msg;
  END;
END $$;