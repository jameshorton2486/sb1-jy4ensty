-- Create the admin user with proper UUID generation
DO $$
DECLARE
  admin_uuid uuid;
BEGIN
  -- Generate a new UUID for the admin user
  admin_uuid := gen_random_uuid();

  -- Create the admin user if it doesn't exist
  INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data,
    is_super_admin,
    role
  )
  SELECT
    admin_uuid,
    'jameshorton2486@gmail.com',
    crypt('Admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin User"}'::jsonb,
    true,
    'authenticated'
  WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'jameshorton2486@gmail.com'
  );

  -- Get the user's UUID (either newly created or existing)
  IF NOT FOUND THEN
    SELECT id INTO admin_uuid
    FROM auth.users
    WHERE email = 'jameshorton2486@gmail.com';
  END IF;

  -- Create the admin user record
  INSERT INTO admin_users (
    user_id,
    email,
    super_admin,
    permissions
  )
  VALUES (
    admin_uuid,
    'jameshorton2486@gmail.com',
    true,
    '{
      "users": {"read": true, "write": true, "delete": true},
      "professionals": {"read": true, "write": true, "delete": true},
      "depositions": {"read": true, "write": true, "delete": true},
      "settings": {"read": true, "write": true}
    }'::jsonb
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    super_admin = true,
    permissions = '{
      "users": {"read": true, "write": true, "delete": true},
      "professionals": {"read": true, "write": true, "delete": true},
      "depositions": {"read": true, "write": true, "delete": true},
      "settings": {"read": true, "write": true}
    }'::jsonb,
    updated_at = now();
END $$;