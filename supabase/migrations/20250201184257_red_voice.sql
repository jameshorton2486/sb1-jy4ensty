/*
  # Professional Registration Schema

  1. New Tables
    - legal_professionals (base table)
      - id (uuid, primary key)
      - user_id (uuid, references auth.users)
      - type (enum: attorney, court_reporter, videographer, scopist)
      - profile_photo_url (text)
      - emergency_contact_info (jsonb)
      - preferred_payment_methods (jsonb)
      - created_at, updated_at (timestamps)
    
    - professional_details (specific details for each type)
      - id (uuid, primary key)
      - professional_id (uuid, references legal_professionals)
      - details (jsonb - stores type-specific fields)
      - created_at, updated_at (timestamps)
    
    - certifications (for storing professional certifications)
      - id (uuid, primary key)
      - professional_id (uuid, references legal_professionals)
      - type (text)
      - number (text)
      - expiry_date (date)
      - created_at, updated_at (timestamps)
    
    - availability_schedules
      - id (uuid, primary key)
      - professional_id (uuid, references legal_professionals)
      - schedule (jsonb)
      - created_at, updated_at (timestamps)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create professional type enum
CREATE TYPE professional_type AS ENUM ('attorney', 'court_reporter', 'videographer', 'scopist');

-- Create legal professionals table
CREATE TABLE IF NOT EXISTS legal_professionals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  type professional_type NOT NULL,
  first_name text NOT NULL,
  middle_name text,
  last_name text NOT NULL,
  email text NOT NULL,
  phone_office text,
  phone_mobile text NOT NULL,
  profile_photo_url text,
  emergency_contact_info jsonb NOT NULL DEFAULT '{}'::jsonb,
  preferred_payment_methods jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create professional details table
CREATE TABLE IF NOT EXISTS professional_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  details jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create certifications table
CREATE TABLE IF NOT EXISTS certifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  type text NOT NULL,
  number text NOT NULL,
  expiry_date date,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create availability schedules table
CREATE TABLE IF NOT EXISTS availability_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  schedule jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE legal_professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE professional_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE certifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_schedules ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view own professional profile"
  ON legal_professionals
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own professional profile"
  ON legal_professionals
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view own professional details"
  ON professional_details
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own professional details"
  ON professional_details
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Add triggers for updated_at
CREATE TRIGGER update_legal_professionals_updated_at
  BEFORE UPDATE ON legal_professionals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_professional_details_updated_at
  BEFORE UPDATE ON professional_details
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_certifications_updated_at
  BEFORE UPDATE ON certifications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_availability_schedules_updated_at
  BEFORE UPDATE ON availability_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();