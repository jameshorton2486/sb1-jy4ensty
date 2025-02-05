/*
  # Create Initial Superuser

  1. Changes
    - Insert initial superuser admin record
    - Grant necessary permissions
  
  2. Security
    - Creates admin with full privileges
    - Links to authenticated user
*/

-- Insert superuser admin record
INSERT INTO admin_users (
  user_id,
  email,
  super_admin,
  permissions
)
SELECT 
  id as user_id,
  email,
  true as super_admin,
  jsonb_build_object(
    'users', jsonb_build_object('read', true, 'write', true, 'delete', true),
    'professionals', jsonb_build_object('read', true, 'write', true, 'delete', true),
    'depositions', jsonb_build_object('read', true, 'write', true, 'delete', true),
    'settings', jsonb_build_object('read', true, 'write', true),
    'roles', jsonb_build_object('read', true, 'write', true, 'delete', true)
  ) as permissions
FROM auth.users
WHERE email = 'jameshorton2486@gmail.com'
ON CONFLICT (user_id) DO UPDATE
SET 
  super_admin = true,
  permissions = EXCLUDED.permissions;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);