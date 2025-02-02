/*
  # Update Admin Password Migration
  
  1. Changes
    - Updates the password for the admin user (jameshorton2486@gmail.com)
    
  2. Security
    - Uses secure password hashing with bcrypt
*/

-- Update the admin user's password
UPDATE auth.users
SET encrypted_password = crypt('Admin123', gen_salt('bf'))
WHERE email = 'jameshorton2486@gmail.com';