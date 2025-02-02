/*
  # Admin User Setup
  
  1. Creates the admin user in auth.users
  2. Creates corresponding admin_users record
  3. Ensures proper permissions and super admin status
*/

-- Create the admin user if it doesn't exist
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
)
SELECT
  'jameshorton2486@gmail.com',
  crypt('Admin123\', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin User"}',
  true,
  'authenticated'
WHERE NOT EXISTS (
  SELECT 1 FROM auth.users WHERE email = 'jameshorton2486@gmail.com'
);

-- Create the admin user record
INSERT INTO admin_users (
  user_id,
  email,
  super_admin,
  permissions
)
SELECT
  id,
  'jameshorton2486@gmail.com',
  true,
  '{
    "users": {"read": true, "write": true, "delete": true},
    "professionals": {"read": true, "write": true, "delete": true},
    "depositions": {"read": true, "write": true, "delete": true},
    "settings": {"read": true, "write": true}
  }'::jsonb
FROM auth.users
WHERE email = 'jameshorton2486@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM admin_users WHERE email = 'jameshorton2486@gmail.com'
);