-- Create a function to test auth context
CREATE OR REPLACE FUNCTION test_auth_context()
RETURNS TABLE (
  current_user_id uuid,
  is_authenticated boolean,
  user_role text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT 
    auth.uid() as current_user_id,
    (auth.uid() IS NOT NULL) as is_authenticated,
    COALESCE(current_setting('request.jwt.claims', true)::json->>'role', 'none') as user_role;
END;
$$;

-- Create a function to verify admin access
CREATE OR REPLACE FUNCTION verify_admin_access(user_email text)
RETURNS TABLE (
  user_exists boolean,
  is_admin boolean,
  auth_id uuid,
  admin_id uuid
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  WITH user_check AS (
    SELECT id, email 
    FROM auth.users 
    WHERE email = user_email
  ),
  admin_check AS (
    SELECT id, user_id 
    FROM admin_users 
    WHERE email = user_email
  )
  SELECT 
    (SELECT EXISTS (SELECT 1 FROM user_check)),
    (SELECT EXISTS (SELECT 1 FROM admin_check)),
    (SELECT id FROM user_check),
    (SELECT id FROM admin_check);
END;
$$;

-- Create a function to log authentication attempts
CREATE OR REPLACE FUNCTION log_auth_attempt(
  attempt_email text,
  success boolean,
  error_message text DEFAULT NULL
) RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (
    admin_id,
    action,
    table_name,
    record_id,
    changes,
    ip_address
  )
  SELECT 
    a.id,
    'AUTH_ATTEMPT',
    'auth.users',
    u.id,
    jsonb_build_object(
      'email', attempt_email,
      'success', success,
      'error', error_message,
      'timestamp', now()
    ),
    current_setting('request.headers', true)::jsonb->>'x-forwarded-for'
  FROM auth.users u
  LEFT JOIN admin_users a ON a.user_id = u.id
  WHERE u.email = attempt_email;
END;
$$;

-- Test the current auth context
DO $$
DECLARE
  auth_context record;
  admin_verification record;
BEGIN
  SELECT 
    current_user_id,
    is_authenticated,
    user_role 
  INTO auth_context 
  FROM test_auth_context();
  
  SELECT 
    user_exists,
    is_admin,
    auth_id,
    admin_id 
  INTO admin_verification 
  FROM verify_admin_access('jameshorton2486@gmail.com');
  
  RAISE NOTICE 'Current auth context: user_id=%, authenticated=%, role=%', 
    auth_context.current_user_id, 
    auth_context.is_authenticated, 
    auth_context.user_role;
    
  RAISE NOTICE 'Admin verification: exists=%, is_admin=%, auth_id=%, admin_id=%',
    admin_verification.user_exists,
    admin_verification.is_admin,
    admin_verification.auth_id,
    admin_verification.admin_id;
END $$;