/*
  # Deposition Form Schema Update

  1. New Tables
    - `deposition_forms`
      - Case information
      - Deposition details
      - Attorney information
      - Timestamps and metadata
    
    - `deposition_participants`
      - Stores information about all participants
      - Links to deposition_forms
      - Includes role and contact details

  2. Security
    - Enable RLS on all tables
    - Add policies for data access control
    - Ensure data privacy

  3. Relationships
    - Forms link to legal_professionals
    - Participants link to forms
*/

-- Create enum for participant roles
CREATE TYPE participant_role AS ENUM (
  'attorney',
  'witness',
  'court_reporter',
  'videographer',
  'interpreter',
  'other'
);

-- Create deposition forms table
CREATE TABLE IF NOT EXISTS deposition_forms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attorney_id uuid REFERENCES legal_professionals NOT NULL,
  
  -- Case Information
  case_number text NOT NULL,
  case_style text NOT NULL,
  court text NOT NULL,
  cause_number text NOT NULL,
  
  -- Deposition Information
  deponent_name text NOT NULL,
  deponent_type text NOT NULL,
  deposition_date date NOT NULL,
  deposition_time time NOT NULL,
  deposition_location text NOT NULL,
  
  -- Attorney and Law Firm Information
  law_firm_name text NOT NULL,
  attorney_name text NOT NULL,
  attorney_address text NOT NULL,
  attorney_phone text NOT NULL,
  attorney_bar_number text NOT NULL,
  
  -- Additional Information
  special_instructions text,
  exhibits_count integer DEFAULT 0,
  estimated_duration interval,
  remote_participation boolean DEFAULT false,
  recording_requested boolean DEFAULT false,
  interpreter_needed boolean DEFAULT false,
  interpreter_language text,
  
  -- Metadata
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  scheduled_by uuid REFERENCES auth.users NOT NULL,
  last_modified_by uuid REFERENCES auth.users NOT NULL
);

-- Create deposition participants table
CREATE TABLE IF NOT EXISTS deposition_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deposition_id uuid REFERENCES deposition_forms NOT NULL,
  role participant_role NOT NULL,
  name text NOT NULL,
  email text,
  phone text,
  firm_name text,
  bar_number text, -- For attorneys
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE deposition_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposition_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for deposition forms
CREATE POLICY "Users can view own deposition forms"
  ON deposition_forms
  FOR SELECT
  TO authenticated
  USING (
    attorney_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own deposition forms"
  ON deposition_forms
  FOR INSERT
  TO authenticated
  WITH CHECK (
    attorney_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own deposition forms"
  ON deposition_forms
  FOR UPDATE
  TO authenticated
  USING (
    attorney_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for deposition participants
CREATE POLICY "Users can view participants of own depositions"
  ON deposition_participants
  FOR SELECT
  TO authenticated
  USING (
    deposition_id IN (
      SELECT id FROM deposition_forms 
      WHERE attorney_id IN (
        SELECT id FROM legal_professionals 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert participants to own depositions"
  ON deposition_participants
  FOR INSERT
  TO authenticated
  WITH CHECK (
    deposition_id IN (
      SELECT id FROM deposition_forms 
      WHERE attorney_id IN (
        SELECT id FROM legal_professionals 
        WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update participants of own depositions"
  ON deposition_participants
  FOR UPDATE
  TO authenticated
  USING (
    deposition_id IN (
      SELECT id FROM deposition_forms 
      WHERE attorney_id IN (
        SELECT id FROM legal_professionals 
        WHERE user_id = auth.uid()
      )
    )
  );

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_deposition_forms_updated_at
  BEFORE UPDATE ON deposition_forms
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_deposition_participants_updated_at
  BEFORE UPDATE ON deposition_participants
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_deposition_forms_attorney_id ON deposition_forms(attorney_id);
CREATE INDEX idx_deposition_forms_deponent_name ON deposition_forms(deponent_name);
CREATE INDEX idx_deposition_forms_case_number ON deposition_forms(case_number);
CREATE INDEX idx_deposition_participants_deposition_id ON deposition_participants(deposition_id);
CREATE INDEX idx_deposition_participants_role ON deposition_participants(role);