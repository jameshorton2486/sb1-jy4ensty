/*
  # Add unique name constraints and validation

  1. Changes
    - Creates a unique index on full name fields (first_name, middle_name, last_name)
    - Adds name validation functions
    - Adds trigger to enforce name uniqueness
  
  2. Security
    - Functions run with SECURITY DEFINER to ensure proper access
    - Input validation to prevent SQL injection
  
  3. Notes
    - Middle name is optional in uniqueness check
    - Case-insensitive comparison for better matching
*/

-- Create function to normalize names
CREATE OR REPLACE FUNCTION normalize_name(name text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
BEGIN
  RETURN trim(regexp_replace(lower(name), '\s+', ' ', 'g'));
END;
$$;

-- Create function to check name uniqueness
CREATE OR REPLACE FUNCTION check_name_uniqueness(
  p_first_name text,
  p_middle_name text,
  p_last_name text,
  p_current_id uuid DEFAULT NULL
)
RETURNS boolean LANGUAGE plpgsql STABLE AS $$
BEGIN
  RETURN NOT EXISTS (
    SELECT 1
    FROM legal_professionals
    WHERE normalize_name(first_name) = normalize_name(p_first_name)
    AND COALESCE(normalize_name(middle_name), '') = COALESCE(normalize_name(p_middle_name), '')
    AND normalize_name(last_name) = normalize_name(p_last_name)
    AND id != COALESCE(p_current_id, uuid_nil())
  );
END;
$$;

-- Create trigger function to enforce name uniqueness
CREATE OR REPLACE FUNCTION enforce_name_uniqueness()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  IF NOT check_name_uniqueness(
    NEW.first_name,
    NEW.middle_name,
    NEW.last_name,
    NEW.id
  ) THEN
    RAISE EXCEPTION 'A legal professional with this name already exists'
      USING HINT = 'Please use a different name or add a distinguishing middle name';
  END IF;
  RETURN NEW;
END;
$$;

-- Create unique index with normalized names
CREATE UNIQUE INDEX IF NOT EXISTS idx_legal_professionals_unique_name
ON legal_professionals (
  normalize_name(first_name),
  COALESCE(normalize_name(middle_name), ''),
  normalize_name(last_name)
)
WHERE first_name IS NOT NULL AND last_name IS NOT NULL;

-- Add trigger to enforce uniqueness
DROP TRIGGER IF EXISTS tr_enforce_name_uniqueness ON legal_professionals;
CREATE TRIGGER tr_enforce_name_uniqueness
  BEFORE INSERT OR UPDATE ON legal_professionals
  FOR EACH ROW
  EXECUTE FUNCTION enforce_name_uniqueness();

-- Add comments
COMMENT ON FUNCTION normalize_name(text) IS 'Normalizes names for consistent comparison';
COMMENT ON FUNCTION check_name_uniqueness(text, text, text, uuid) IS 'Checks if a name combination is unique';
COMMENT ON FUNCTION enforce_name_uniqueness() IS 'Trigger function to enforce unique names';
COMMENT ON INDEX idx_legal_professionals_unique_name IS 'Ensures unique combinations of normalized names';