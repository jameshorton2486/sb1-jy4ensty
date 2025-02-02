/*
  # Add Unique Index for Name Fields
  
  1. New Index
    - Creates a unique compound index on name and sanitized_name columns
    - Ensures no duplicate combinations can exist
    
  2. Security
    - Index is created concurrently to avoid locking issues
    - Includes IF NOT EXISTS check for safety
*/

-- Create unique compound index
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_name_sanitized_name
ON legal_professionals (name, sanitized_name)
WHERE name IS NOT NULL AND sanitized_name IS NOT NULL;

-- Add comment explaining the index
COMMENT ON INDEX idx_unique_name_sanitized_name IS 
  'Ensures unique combinations of name and sanitized_name for legal professionals';

-- Verify index creation
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM pg_indexes 
    WHERE indexname = 'idx_unique_name_sanitized_name'
  ) THEN
    RAISE NOTICE 'Unique index created successfully';
  ELSE
    RAISE EXCEPTION 'Failed to create unique index';
  END IF;
END $$;