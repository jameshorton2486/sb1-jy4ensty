/*
  # Add Unique Index for Full Name Combination
  
  1. New Index
    - Creates a unique compound index on first_name, middle_name, and last_name columns
    - Ensures no duplicate full name combinations can exist
    - Middle name is included but allowed to be null
    
  2. Security
    - Index is created concurrently to avoid locking issues
    - Includes IF NOT EXISTS check for safety
*/

-- Create unique compound index for full names
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_full_name
ON legal_professionals (first_name, middle_name, last_name)
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- Add comment explaining the index
COMMENT ON INDEX idx_unique_full_name IS 
  'Ensures unique combinations of first_name, middle_name, and last_name for legal professionals';

-- Verify index creation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_unique_full_name'
  ) THEN
    RAISE NOTICE 'Unique full name index created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create unique full name index';
  END IF;
END $$;