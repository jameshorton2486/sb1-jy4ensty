/*
  # Add Interpreter Profiles Schema

  1. New Tables
    - `interpreter_profiles`
      - All standard profile fields
      - Language pairs
      - Certifications
      - Specializations
      - Rates
  
  2. Security
    - Enable RLS
    - Add policies for authenticated users
    
  3. Indexes
    - Add performance indexes
*/

-- Create interpreter profiles table
CREATE TABLE IF NOT EXISTS interpreter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  
  -- Language Information
  primary_languages text[] NOT NULL DEFAULT '{}',
  secondary_languages text[] NOT NULL DEFAULT '{}',
  language_pairs jsonb NOT NULL DEFAULT '[]',
  
  -- Certifications and Qualifications
  certification_type text,
  certification_number text,
  certification_expiry date,
  court_certified boolean DEFAULT false,
  medical_certified boolean DEFAULT false,
  conference_certified boolean DEFAULT false,
  
  -- Specializations
  specializations text[] NOT NULL DEFAULT '{}',
  subject_matter_expertise text[] NOT NULL DEFAULT '{}',
  
  -- Service Details
  interpretation_types text[] NOT NULL DEFAULT '{}', -- simultaneous, consecutive, sight
  remote_services_offered boolean DEFAULT true,
  equipment_provided boolean DEFAULT false,
  minimum_booking_duration interval,
  travel_radius integer,
  
  -- Rates and Availability
  standard_rates jsonb NOT NULL DEFAULT '{}',
  rush_rates jsonb NOT NULL DEFAULT '{}',
  cancellation_policy text,
  availability_schedule jsonb NOT NULL DEFAULT '{}',
  
  -- Additional Information
  professional_memberships text[] NOT NULL DEFAULT '{}',
  insurance_information jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable Row Level Security
ALTER TABLE interpreter_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for interpreter profiles
CREATE POLICY "Users can view own interpreter profile"
  ON interpreter_profiles
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own interpreter profile"
  ON interpreter_profiles
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own interpreter profile"
  ON interpreter_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Add updated_at trigger
CREATE TRIGGER update_interpreter_profiles_updated_at
  BEFORE UPDATE ON interpreter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better query performance
CREATE INDEX idx_interpreter_profiles_professional_id 
  ON interpreter_profiles(professional_id);
CREATE INDEX idx_interpreter_profiles_languages 
  ON interpreter_profiles USING gin(primary_languages, secondary_languages);
CREATE INDEX idx_interpreter_profiles_specializations 
  ON interpreter_profiles USING gin(specializations);

-- Add comments
COMMENT ON TABLE interpreter_profiles IS 'Stores detailed information about interpreter professionals';
COMMENT ON COLUMN interpreter_profiles.language_pairs IS 'JSON array of source-target language pairs';
COMMENT ON COLUMN interpreter_profiles.standard_rates IS 'JSON object containing standard rate information';
COMMENT ON COLUMN interpreter_profiles.rush_rates IS 'JSON object containing rush rate information';
COMMENT ON COLUMN interpreter_profiles.availability_schedule IS 'JSON object containing availability schedule';