DO $$
DECLARE
  admin_uuid uuid;
BEGIN
  -- First create the user if it doesn't exist
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
  VALUES (
    gen_random_uuid(),
    'jameshorton2486@gmail.com',
    crypt('Admin123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"name":"Admin User"}'::jsonb,
    true,
    'authenticated'
  )
  ON CONFLICT (email) DO NOTHING
  RETURNING id INTO admin_uuid;

  -- If user already existed, get their ID
  IF admin_uuid IS NULL THEN
    SELECT id INTO admin_uuid
    FROM auth.users
    WHERE email = 'jameshorton2486@gmail.com';
  END IF;

  -- Create admin user record
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
  ON CONFLICT (user_id) DO NOTHING;
END $$;