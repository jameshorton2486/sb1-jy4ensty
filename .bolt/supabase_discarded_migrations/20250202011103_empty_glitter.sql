/*
  # Auth Debugging and Verification Functions
  
  1. New Functions
    - verify_auth_context: Tests complete auth context including session info
    - validate_admin_auth: Validates admin authentication and permissions
    - test_auth_chain: Tests the entire authentication chain
    
  2. Security
    - All functions are security definer
    - Includes comprehensive error handling
    - Provides detailed debugging information
*/

-- Function to verify complete auth context
CREATE OR REPLACE FUNCTION verify_auth_context()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result jsonb;
  v_user_id uuid;
  v_claims jsonb;
BEGIN
  -- Get current auth context
  v_user_id := auth.uid();
  v_claims := NULLIF(current_setting('request.jwt.claims', true), '')::jsonb;

  -- Build result
  v_result := jsonb_build_object(
    'timestamp', now(),
    'auth_status', jsonb_build_object(
      'user_id', v_user_id,
      'is_authenticated', v_user_id IS NOT NULL,
      'claims', v_claims
    ),
    'session_info', jsonb_build_object(
      'current_user', current_user,
      'current_role', current_role,
      'session_user', session_user
    ),
    'request_info', jsonb_build_object(
      'headers', current_setting('request.headers', true)::jsonb,
      'method', current_setting('request.method', true),
      'path', current_setting('request.path', true)
    )
  );

  RETURN v_result;
END;
$$;

-- Function to validate admin authentication
CREATE OR REPLACE FUNCTION validate_admin_auth(p_email text)
RETURNS TABLE (
  is_valid boolean,
  auth_details jsonb,
  error_message text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_admin_record record;
  v_auth_context jsonb;
BEGIN
  -- Get auth context
  v_auth_context := verify_auth_context();
  
  -- Check user exists
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN QUERY
    SELECT 
      false,
      v_auth_context,
      'User not found'::text;
    RETURN;
  END IF;
  
  -- Check admin record
  SELECT * INTO v_admin_record
  FROM admin_users
  WHERE user_id = v_user_id;
  
  IF v_admin_record IS NULL THEN
    RETURN QUERY
    SELECT 
      false,
      v_auth_context,
      'Not an admin user'::text;
    RETURN;
  END IF;
  
  -- All checks passed
  RETURN QUERY
  SELECT 
    true,
    v_auth_context || jsonb_build_object(
      'admin_info', to_jsonb(v_admin_record)
    ),
    NULL::text;
END;
$$;

-- Function to test the entire authentication chain
CREATE OR REPLACE FUNCTION test_auth_chain(p_email text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_result jsonb;
  v_start_time timestamptz;
  v_auth_uid uuid;
BEGIN
  v_start_time := clock_timestamp();
  
  -- Build comprehensive test result
  v_result := jsonb_build_object(
    'timestamp', now(),
    'test_duration_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000,
    'auth_context', verify_auth_context(),
    'admin_validation', (
      SELECT to_jsonb(t) 
      FROM validate_admin_auth(p_email) t
    )
  );

  -- Log test execution
  RAISE NOTICE 'Auth chain test completed: %', v_result;
  
  RETURN v_result;
END;
$$;

-- Create helper view for auth debugging
CREATE OR REPLACE VIEW auth_debug_view AS
SELECT 
  a.email,
  a.super_admin,
  a.permissions,
  verify_auth_context() as current_context
FROM admin_users a
WHERE a.user_id = auth.uid();

-- Test the authentication chain
DO $$
BEGIN
  -- Test with admin user
  RAISE NOTICE 'Testing admin authentication: %', (
    SELECT test_auth_chain('jameshorton2486@gmail.com')
  );
  
  -- Verify auth context
  RAISE NOTICE 'Current auth context: %', verify_auth_context();
END $$;