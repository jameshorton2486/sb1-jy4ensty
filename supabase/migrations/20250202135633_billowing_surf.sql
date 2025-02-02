/*
  # Fix users table ID generation

  1. Changes
    - Ensures users table has proper UUID generation
    - Adds proper constraints and defaults
    - Handles existing records gracefully
    
  2. Security
    - Maintains existing RLS policies
    - Preserves data integrity
*/

-- Wrap everything in a transaction
DO $$ 
DECLARE
  column_exists boolean;
BEGIN
  -- Check if id column exists
  SELECT EXISTS (
    SELECT FROM information_schema.columns 
    WHERE table_schema = 'auth' 
    AND table_name = 'users' 
    AND column_name = 'id'
  ) INTO column_exists;

  -- If column doesn't exist, create it
  IF NOT column_exists THEN
    -- Add UUID column with proper constraints
    ALTER TABLE auth.users
    ADD COLUMN id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY;
  ELSE
    -- If column exists, ensure it has proper constraints
    ALTER TABLE auth.users
    ALTER COLUMN id SET NOT NULL,
    ALTER COLUMN id SET DEFAULT gen_random_uuid();
    
    -- Add primary key if it doesn't exist
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE table_schema = 'auth'
      AND table_name = 'users'
      AND constraint_type = 'PRIMARY KEY'
    ) THEN
      ALTER TABLE auth.users
      ADD PRIMARY KEY (id);
    END IF;
  END IF;

  -- Generate IDs for any existing records that might have NULL ids
  UPDATE auth.users 
  SET id = gen_random_uuid() 
  WHERE id IS NULL;

END $$;

-- Add helpful comments
COMMENT ON COLUMN auth.users.id IS 'Unique identifier for the user';
COMMENT ON TABLE auth.users IS 'Authentication users table with UUID primary key';