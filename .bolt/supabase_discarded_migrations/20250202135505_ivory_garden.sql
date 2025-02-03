-- Fix users table id column
DO $$
BEGIN
  -- Check if users table exists
  IF EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'auth' 
    AND table_name = 'users'
  ) THEN
    -- Add id column with UUID default if it doesn't exist
    IF NOT EXISTS (
      SELECT FROM information_schema.columns 
      WHERE table_schema = 'auth' 
      AND table_name = 'users' 
      AND column_name = 'id'
    ) THEN
      ALTER TABLE auth.users 
      ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY;
    ELSE
      -- If column exists but needs default
      ALTER TABLE auth.users 
      ALTER COLUMN id SET DEFAULT gen_random_uuid();
    END IF;
  END IF;
END $$;

-- Ensure proper sequence for user IDs
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT FROM pg_sequences 
    WHERE schemaname = 'auth' 
    AND sequencename = 'users_id_seq'
  ) THEN
    CREATE SEQUENCE IF NOT EXISTS auth.users_id_seq;
    ALTER TABLE auth.users ALTER COLUMN id SET DEFAULT nextval('auth.users_id_seq');
  END IF;
END $$;

-- Add comment explaining the changes
COMMENT ON TABLE auth.users IS 'Authentication users table with auto-generated UUID primary key';