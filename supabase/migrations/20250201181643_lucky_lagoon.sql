/*
  # Initial schema for deposition scheduling system

  1. New Tables
    - `attorneys`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `email` (text)
      - `firm_name` (text)
      - `firm_address` (text)
      - `firm_contact` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `depositions`
      - `id` (uuid, primary key)
      - `attorney_id` (uuid, references attorneys)
      - `cause_number` (text)
      - `case_name` (text)
      - `deponent_name` (text)
      - `deposition_date` (date)
      - `deposition_time` (time)
      - `deposition_location` (text)
      - `deposition_type` (enum)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
*/

-- Create enum for deposition types
CREATE TYPE deposition_type AS ENUM ('in-person', 'virtual', 'hybrid');

-- Create attorneys table
CREATE TABLE IF NOT EXISTS attorneys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  firm_name text NOT NULL,
  firm_address text NOT NULL,
  firm_contact text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create depositions table
CREATE TABLE IF NOT EXISTS depositions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attorney_id uuid REFERENCES attorneys NOT NULL,
  cause_number text NOT NULL,
  case_name text NOT NULL,
  deponent_name text NOT NULL,
  deposition_date date NOT NULL,
  deposition_time time NOT NULL,
  deposition_location text NOT NULL,
  deposition_type deposition_type NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE attorneys ENABLE ROW LEVEL SECURITY;
ALTER TABLE depositions ENABLE ROW LEVEL SECURITY;

-- Create policies for attorneys
CREATE POLICY "Users can view own attorney profile"
  ON attorneys
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own attorney profile"
  ON attorneys
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for depositions
CREATE POLICY "Attorneys can view own depositions"
  ON depositions
  FOR SELECT
  TO authenticated
  USING (
    attorney_id IN (
      SELECT id FROM attorneys 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Attorneys can insert own depositions"
  ON depositions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    attorney_id IN (
      SELECT id FROM attorneys 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Attorneys can update own depositions"
  ON depositions
  FOR UPDATE
  TO authenticated
  USING (
    attorney_id IN (
      SELECT id FROM attorneys 
      WHERE user_id = auth.uid()
    )
  );

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_attorneys_updated_at
  BEFORE UPDATE ON attorneys
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_depositions_updated_at
  BEFORE UPDATE ON depositions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();