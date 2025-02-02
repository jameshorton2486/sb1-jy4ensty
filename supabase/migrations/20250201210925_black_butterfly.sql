/*
  # User Profiles Schema Update

  1. New Tables
    - `attorney_profiles`
      - Personal and professional details for attorneys
      - Links to legal_professionals table
      - Includes bar information and specializations
    
    - `court_reporter_profiles`
      - Details specific to court reporters
      - Certification and equipment information
      - Experience and specialties
    
    - `videographer_profiles`
      - Equipment and technical specifications
      - Experience and certifications
      - Special skills
    
    - `scopist_profiles`
      - Software proficiency
      - Specializations
      - Experience levels

  2. Security
    - Enable RLS on all tables
    - Add policies for user access control
    - Ensure data privacy and security

  3. Relationships
    - All profile tables link to legal_professionals
    - Maintain referential integrity
*/

-- Attorney Profiles
CREATE TABLE IF NOT EXISTS attorney_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  bar_number text NOT NULL,
  bar_state text NOT NULL,
  bar_status text NOT NULL,
  admission_date date NOT NULL,
  practice_areas text[] NOT NULL DEFAULT '{}',
  specializations text[] NOT NULL DEFAULT '{}',
  languages text[] NOT NULL DEFAULT '{}',
  education jsonb NOT NULL DEFAULT '[]',
  professional_associations text[] NOT NULL DEFAULT '{}',
  malpractice_insurance jsonb,
  billing_rate decimal(10,2),
  retainer_requirements text,
  case_types_handled text[] NOT NULL DEFAULT '{}',
  court_admissions jsonb NOT NULL DEFAULT '[]',
  pro_bono_interest boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id)
);

-- Court Reporter Profiles
CREATE TABLE IF NOT EXISTS court_reporter_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  certification_number text NOT NULL,
  certification_state text NOT NULL,
  certification_expiry date NOT NULL,
  realtime_certified boolean DEFAULT false,
  csr_number text,
  ncra_member boolean DEFAULT false,
  machine_type text,
  software_used text[] NOT NULL DEFAULT '{}',
  specializations text[] NOT NULL DEFAULT '{}',
  average_turnaround_time interval,
  rush_availability boolean DEFAULT true,
  daily_availability jsonb NOT NULL DEFAULT '{}',
  travel_radius integer,
  remote_services_offered boolean DEFAULT true,
  standard_rates jsonb NOT NULL DEFAULT '{}',
  rush_rates jsonb NOT NULL DEFAULT '{}',
  minimum_notice_period interval,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id)
);

-- Videographer Profiles
CREATE TABLE IF NOT EXISTS videographer_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  equipment_list jsonb NOT NULL DEFAULT '[]',
  backup_equipment_available boolean DEFAULT true,
  video_formats text[] NOT NULL DEFAULT '{}',
  delivery_methods text[] NOT NULL DEFAULT '{}',
  specializations text[] NOT NULL DEFAULT '{}',
  streaming_capabilities boolean DEFAULT false,
  editing_services_offered boolean DEFAULT false,
  travel_radius integer,
  setup_time interval,
  standard_rates jsonb NOT NULL DEFAULT '{}',
  rush_rates jsonb NOT NULL DEFAULT '{}',
  insurance_coverage jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id)
);

-- Scopist Profiles
CREATE TABLE IF NOT EXISTS scopist_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id uuid REFERENCES legal_professionals NOT NULL,
  software_proficiency text[] NOT NULL DEFAULT '{}',
  specializations text[] NOT NULL DEFAULT '{}',
  experience_years integer NOT NULL,
  average_turnaround_time interval,
  rush_availability boolean DEFAULT true,
  proofreading_offered boolean DEFAULT true,
  medical_terminology_certified boolean DEFAULT false,
  legal_terminology_certified boolean DEFAULT false,
  technical_terminology_certified boolean DEFAULT false,
  standard_rates jsonb NOT NULL DEFAULT '{}',
  rush_rates jsonb NOT NULL DEFAULT '{}',
  minimum_page_rate decimal(10,2),
  preferred_file_formats text[] NOT NULL DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(professional_id)
);

-- Enable Row Level Security
ALTER TABLE attorney_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE court_reporter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE videographer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE scopist_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for attorney profiles
CREATE POLICY "Users can view own attorney profile"
  ON attorney_profiles
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own attorney profile"
  ON attorney_profiles
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for court reporter profiles
CREATE POLICY "Users can view own court reporter profile"
  ON court_reporter_profiles
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own court reporter profile"
  ON court_reporter_profiles
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for videographer profiles
CREATE POLICY "Users can view own videographer profile"
  ON videographer_profiles
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own videographer profile"
  ON videographer_profiles
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Create policies for scopist profiles
CREATE POLICY "Users can view own scopist profile"
  ON scopist_profiles
  FOR SELECT
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own scopist profile"
  ON scopist_profiles
  FOR UPDATE
  TO authenticated
  USING (
    professional_id IN (
      SELECT id FROM legal_professionals 
      WHERE user_id = auth.uid()
    )
  );

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_attorney_profiles_updated_at
  BEFORE UPDATE ON attorney_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_court_reporter_profiles_updated_at
  BEFORE UPDATE ON court_reporter_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_videographer_profiles_updated_at
  BEFORE UPDATE ON videographer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_scopist_profiles_updated_at
  BEFORE UPDATE ON scopist_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();