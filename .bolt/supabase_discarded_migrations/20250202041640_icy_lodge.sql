/*
  # Fix admin user credentials

  1. Changes
    - Updates admin user password to match specified credentials
    - Ensures email is properly set
  
  2. Security
    - Uses proper password hashing
    - Maintains existing permissions
*/

DO $$
DECLARE
  admin_uuid uuid;
BEGIN
  -- First try to get existing user
  SELECT id INTO admin_uuid
  FROM auth.users
  WHERE email = 'jameshorton2486@gmail.com';

  IF admin_uuid IS NULL THEN
    -- Create new user if doesn't exist
    INSERT INTO auth.users (
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      role
    ) VALUES (
      'jameshorton2486@gmail.com',
      crypt('Admin', gen_salt('bf')), -- Set password to 'Admin'
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"name":"Admin User"}',
      true,
      'authenticated'
    )
    RETURNING id INTO admin_uuid;
  ELSE
    -- Update existing user's password
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Admin', gen_salt('bf')), -- Update password to 'Admin'
      updated_at = now()
    WHERE id = admin_uuid;
  END IF;

  -- Ensure admin user record exists with proper permissions
  INSERT INTO admin_users (
    user_id,
    email,
    super_admin,
    permissions
  ) VALUES (
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