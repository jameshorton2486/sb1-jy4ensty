/*
  # Column Name and String Value Handling

  1. Changes
    - Add helper functions for safe column and value handling
    - Add example queries with proper quoting
    - Add documentation comments
  
  2. Security
    - Functions are marked as SECURITY DEFINER to run with creator's privileges
    - Input validation is performed
*/

-- Create function to safely quote column names
CREATE OR REPLACE FUNCTION safe_quote_column(column_name text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Validate input
  IF column_name IS NULL OR column_name = '' THEN
    RAISE EXCEPTION 'Column name cannot be null or empty';
  END IF;

  -- Return properly quoted column name
  RETURN quote_ident(column_name);
END;
$$;

-- Create function to safely quote string values
CREATE OR REPLACE FUNCTION safe_quote_value(value text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Return NULL if input is NULL
  IF value IS NULL THEN
    RETURN NULL;
  END IF;

  -- Return properly quoted string value
  RETURN quote_literal(value);
END;
$$;

-- Add helpful comments
COMMENT ON FUNCTION safe_quote_column(text) IS 
  'Safely quotes column names using double quotes for use in dynamic SQL';
COMMENT ON FUNCTION safe_quote_value(text) IS 
  'Safely quotes string values using single quotes for use in dynamic SQL';

-- Create example table for demonstration
CREATE TABLE IF NOT EXISTS example_queries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  query_name text NOT NULL,
  query_text text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now()
);

-- Insert example queries showing proper usage
INSERT INTO example_queries (query_name, query_text, description) VALUES
(
  'Select with quoted columns',
  'SELECT "id", "user_name" FROM "users" WHERE "email" = ''example@email.com'';',
  'Example of properly quoting both column names (double quotes) and string values (single quotes)'
),
(
  'Insert with quoted values',
  'INSERT INTO "users" ("name", "email") VALUES (''John Smith'', ''john@example.com'');',
  'Example of properly quoting string values in INSERT statement'
),
(
  'Update with mixed quotes',
  'UPDATE "user_profiles" SET "full_name" = ''Jane Doe'' WHERE "user_id" = ''123'';',
  'Example of quoting column names and string values in UPDATE statement'
);

-- Enable RLS
ALTER TABLE example_queries ENABLE ROW LEVEL SECURITY;

-- Create policy for example queries
CREATE POLICY "Allow read access to example queries"
  ON example_queries
  FOR SELECT
  TO authenticated
  USING (true);

-- Add helpful index
CREATE INDEX idx_example_queries_name ON example_queries(query_name);