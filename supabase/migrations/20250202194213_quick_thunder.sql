-- Create the admin user with proper UUID generation and error handling
DO $$
DECLARE
  admin_uuid uuid;
  v_error_msg text;
BEGIN
  -- Log start of operation
  RAISE NOTICE 'Starting admin user creation process...';

  BEGIN
    -- Generate a new UUID for the admin user
    admin_uuid := gen_random_uuid();
    RAISE NOTICE 'Generated new UUID: %', admin_uuid;

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

    GET DIAGNOSTICS v_error_msg = PG_CONTEXT;
    RAISE NOTICE 'User creation attempt completed. Context: %', v_error_msg;

    -- Get the user's UUID (either newly created or existing)
    IF NOT FOUND THEN
      RAISE NOTICE 'User already exists, fetching existing UUID...';
      SELECT id INTO admin_uuid
      FROM auth.users
      WHERE email = 'jameshorton2486@gmail.com';
      
      IF admin_uuid IS NULL THEN
        RAISE EXCEPTION 'Failed to retrieve existing user UUID';
      END IF;
      
      RAISE NOTICE 'Retrieved existing UUID: %', admin_uuid;
    ELSE
      RAISE NOTICE 'New user created with UUID: %', admin_uuid;
    END IF;

    -- Create the admin user record
    RAISE NOTICE 'Creating admin user record...';
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

    RAISE NOTICE 'Admin user setup completed successfully';

  EXCEPTION
    WHEN unique_violation THEN
      RAISE EXCEPTION 'Duplicate key violation: % (Error: %)', SQLERRM, SQLSTATE;
    WHEN foreign_key_violation THEN
      RAISE EXCEPTION 'Foreign key violation: % (Error: %)', SQLERRM, SQLSTATE;
    WHEN OTHERS THEN
      GET STACKED DIAGNOSTICS 
        v_error_msg = MESSAGE_TEXT;
      RAISE EXCEPTION 'Unexpected error during admin user creation: % (State: %)', v_error_msg, SQLSTATE;
  END;
END $$;