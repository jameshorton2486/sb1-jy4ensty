-- Function to test auth status with enhanced error handling
CREATE OR REPLACE FUNCTION test_auth_status()
RETURNS TABLE (
  auth_uid uuid,
  is_authenticated boolean,
  jwt_role text,
  jwt_claims jsonb,
  error_info jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_error_msg text;
  v_error_detail text;
  v_error_hint text;
BEGIN
  BEGIN
    RETURN QUERY
    SELECT
      auth.uid(),
      auth.uid() IS NOT NULL,
      COALESCE(current_setting('request.jwt.claims', true)::json->>'role', 'none'),
      COALESCE(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb),
      NULL::jsonb;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS 
      v_error_msg = MESSAGE_TEXT,
      v_error_detail = PG_EXCEPTION_DETAIL,
      v_error_hint = PG_EXCEPTION_HINT;
      
    RETURN QUERY
    SELECT
      NULL::uuid,
      false,
      'error'::text,
      '{}'::jsonb,
      jsonb_build_object(
        'error', v_error_msg,
        'detail', v_error_detail,
        'hint', v_error_hint,
        'state', SQLSTATE
      );
  END;
END;
$$;

-- Function to verify user authentication with detailed logging
CREATE OR REPLACE FUNCTION verify_user_auth(check_email text)
RETURNS TABLE (
  user_found boolean,
  user_id uuid,
  auth_status text,
  error_details jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_error_msg text;
  v_error_detail text;
  v_error_context text;
BEGIN
  RAISE NOTICE 'Starting user authentication verification for email: %', check_email;
  
  BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = check_email;
    
    RAISE NOTICE 'User lookup completed. Found ID: %', v_user_id;
    
    RETURN QUERY
    SELECT
      v_user_id IS NOT NULL,
      v_user_id,
      CASE
        WHEN v_user_id IS NOT NULL THEN 'authenticated'
        ELSE 'not_found'
      END,
      NULL::jsonb;
      
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS 
      v_error_msg = MESSAGE_TEXT,
      v_error_detail = PG_EXCEPTION_DETAIL,
      v_error_context = PG_CONTEXT;
      
    RAISE WARNING 'Error during authentication verification: %', v_error_msg;
    
    RETURN QUERY
    SELECT
      false,
      NULL::uuid,
      'error',
      jsonb_build_object(
        'message', v_error_msg,
        'detail', v_error_detail,
        'context', v_error_context,
        'state', SQLSTATE
      );
  END;
END;
$$;

-- Function to debug auth context with comprehensive logging
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  debug_info jsonb;
  v_start_time timestamptz;
  v_error_info jsonb;
BEGIN
  v_start_time := clock_timestamp();
  RAISE NOTICE 'Starting auth context debug at %', v_start_time;
  
  BEGIN
    SELECT jsonb_build_object(
      'timestamp', now(),
      'auth_uid', auth.uid(),
      'jwt_claims', COALESCE(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb),
      'request_headers', COALESCE(current_setting('request.headers', true)::jsonb, '{}'::jsonb),
      'current_user', current_user,
      'current_role', current_role,
      'execution_time_ms', EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000
    ) INTO debug_info;

    RAISE NOTICE 'Auth context debug completed successfully: %', debug_info;
    RETURN debug_info;
    
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS 
      v_error_info = PG_CONTEXT;
      
    RAISE WARNING 'Error during auth context debug: % (State: %)', SQLERRM, SQLSTATE;
    
    RETURN jsonb_build_object(
      'error', SQLERRM,
      'state', SQLSTATE,
      'context', v_error_info,
      'timestamp', now()
    );
  END;
END;
$$;

-- Test the functions with comprehensive error handling
DO $$
DECLARE
  auth_status record;
  user_verification record;
  debug_ctx jsonb;
  v_start_time timestamptz;
BEGIN
  v_start_time := clock_timestamp();
  RAISE NOTICE 'Starting authentication tests at %', v_start_time;

  BEGIN
    -- Test auth status
    SELECT 
      auth_uid,
      is_authenticated,
      jwt_role,
      jwt_claims,
      error_info
    INTO auth_status 
    FROM test_auth_status();
    
    RAISE NOTICE E'\nAuth Status Results:';
    RAISE NOTICE 'Auth UID: %', auth_status.auth_uid;
    RAISE NOTICE 'Authenticated: %', auth_status.is_authenticated;
    RAISE NOTICE 'Role: %', auth_status.jwt_role;
    RAISE NOTICE 'Claims: %', auth_status.jwt_claims;
    IF auth_status.error_info IS NOT NULL THEN
      RAISE WARNING 'Auth status errors: %', auth_status.error_info;
    END IF;
    
    -- Test user verification
    SELECT 
      user_found,
      user_id,
      auth_status,
      error_details
    INTO user_verification 
    FROM verify_user_auth('jameshorton2486@gmail.com');
    
    RAISE NOTICE E'\nUser Verification Results:';
    RAISE NOTICE 'User found: %', user_verification.user_found;
    RAISE NOTICE 'User ID: %', user_verification.user_id;
    RAISE NOTICE 'Auth status: %', user_verification.auth_status;
    IF user_verification.error_details IS NOT NULL THEN
      RAISE WARNING 'Verification errors: %', user_verification.error_details;
    END IF;
    
    -- Debug auth context
    debug_ctx := debug_auth_context();
    RAISE NOTICE E'\nAuth Context Debug Results:';
    RAISE NOTICE 'Debug info: %', debug_ctx;
    
    -- Log execution time
    RAISE NOTICE E'\nTotal execution time: % ms', 
      EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;

  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING 'Critical error during authentication tests: % (State: %)', SQLERRM, SQLSTATE;
    RAISE WARNING 'Error occurred after % ms', 
      EXTRACT(EPOCH FROM (clock_timestamp() - v_start_time)) * 1000;
  END;
END $$;

-- Create enhanced helper view for auth debugging
CREATE OR REPLACE VIEW auth_debug_info AS
WITH auth_test AS (
  SELECT
    a.auth_uid,
    a.is_authenticated,
    a.jwt_role,
    a.jwt_claims,
    a.error_info,
    debug_auth_context() as context_info
  FROM test_auth_status() a
)
SELECT 
  *,
  CASE 
    WHEN error_info IS NOT NULL THEN 'ERROR'
    WHEN NOT is_authenticated THEN 'NOT_AUTHENTICATED'
    ELSE 'OK'
  END as status,
  now() as checked_at
FROM auth_test;

COMMENT ON VIEW auth_debug_info IS 'Enhanced view for debugging authentication issues with status tracking';