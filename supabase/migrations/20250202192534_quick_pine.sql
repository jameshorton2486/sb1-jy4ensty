-- Function to test auth status
CREATE OR REPLACE FUNCTION test_auth_status()
RETURNS TABLE (
  auth_uid uuid,
  is_authenticated boolean,
  jwt_role text,
  jwt_claims jsonb
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    auth.uid(),
    auth.uid() IS NOT NULL,
    COALESCE(current_setting('request.jwt.claims', true)::json->>'role', 'none'),
    COALESCE(current_setting('request.jwt.claims', true)::jsonb, '{}'::jsonb);
END;
$$;

-- Function to verify user authentication
CREATE OR REPLACE FUNCTION verify_user_auth(check_email text)
RETURNS TABLE (
  user_found boolean,
  user_id uuid,
  auth_status text,
  error_details text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_user_id uuid;
  v_error text;
BEGIN
  -- Get user ID and handle errors
  BEGIN
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = check_email;
    
    RETURN QUERY
    SELECT
      v_user_id IS NOT NULL,
      v_user_id,
      CASE
        WHEN v_user_id IS NOT NULL THEN 'authenticated'
        ELSE 'not_found'
      END,
      NULL::text;
  EXCEPTION WHEN OTHERS THEN
    GET STACKED DIAGNOSTICS v_error = MESSAGE_TEXT;
    
    RETURN QUERY
    SELECT
      false,
      NULL::uuid,
      'error',
      v_error;
  END;
END;
$$;

-- Function to debug auth context
CREATE OR REPLACE FUNCTION debug_auth_context()
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  debug_info jsonb;
BEGIN
  SELECT jsonb_build_object(
    'timestamp', now(),
    'auth_uid', auth.uid(),
    'jwt_claims', current_setting('request.jwt.claims', true)::jsonb,
    'request_headers', current_setting('request.headers', true)::jsonb,
    'current_user', current_user,
    'current_role', current_role
  ) INTO debug_info;

  RETURN debug_info;
END;
$$;

-- Test the functions
DO $$
DECLARE
  auth_status record;
  user_verification record;
  debug_ctx jsonb;
BEGIN
  -- Test auth status
  SELECT 
    auth_uid,
    is_authenticated,
    jwt_role,
    jwt_claims
  INTO auth_status 
  FROM test_auth_status();
  
  RAISE NOTICE 'Auth Status: auth_uid=%, authenticated=%, role=%, claims=%',
    auth_status.auth_uid,
    auth_status.is_authenticated,
    auth_status.jwt_role,
    auth_status.jwt_claims;
  
  -- Test user verification
  SELECT 
    user_found,
    user_id,
    auth_status,
    error_details
  INTO user_verification 
  FROM verify_user_auth('jameshorton2486@gmail.com');
  
  RAISE NOTICE 'User Verification: found=%, id=%, status=%, error=%',
    user_verification.user_found,
    user_verification.user_id,
    user_verification.auth_status,
    user_verification.error_details;
  
  -- Debug auth context
  debug_ctx := debug_auth_context();
  RAISE NOTICE 'Auth Context: %', debug_ctx;
END $$;

-- Create helper view for auth debugging
CREATE OR REPLACE VIEW auth_debug_info AS
SELECT
  a.auth_uid,
  a.is_authenticated,
  a.jwt_role,
  a.jwt_claims,
  debug_auth_context() as context_info
FROM test_auth_status() a;

COMMENT ON VIEW auth_debug_info IS 'View for debugging authentication issues';