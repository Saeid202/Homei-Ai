-- Fix Database Schema - Comprehensive Solution
-- This script will ensure we have the correct table structure

-- Step 1: Drop existing tables to start fresh
DROP TABLE IF EXISTS "Profile" CASCADE;
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Step 2: Create the main Profile table with all required columns
CREATE TABLE "Profile" (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  user_role text,
  
  -- Section 1: Personal Details
  account_type text,
  first_name text,
  middle_name text,
  last_name text,
  date_of_birth date,
  sin text,
  gender text,
  marital_status text,
  phone text,
  
  -- Section 2: Residency & Citizenship
  is_canadian_resident boolean,
  country_of_origin text,
  canadian_status text,
  university_name text,
  level_of_study text,
  study_start_date date,
  expected_graduation_date date,
  work_permit_start_date date,
  work_permit_end_date date,
  
  -- Section 3: Address Information
  residential_province text,
  residential_city text,
  residential_street_number text,
  residential_street_name text,
  residential_postal_code text,
  residential_unit_number text,
  mailing_same_as_residential boolean,
  mailing_province text,
  mailing_city text,
  mailing_street_number text,
  mailing_street_name text,
  mailing_postal_code text,
  mailing_unit_number text,
  
  -- Section 4: Employment and Financial Status
  employment_type text,
  employer_name text,
  job_title text,
  monthly_income numeric,
  employment_start_date date,
  business_name text,
  business_start_date date,
  yearly_income numeric,
  
  -- Section 5: Debt & Financial Obligations
  has_car boolean,
  car_make text,
  car_year text,
  car_financing_type text,
  car_lease_start_date date,
  car_lease_end_date date,
  car_finance_amount numeric,
  has_loan boolean,
  
  -- Section 6: Investment Capacity
  budget numeric,
  owns_real_estate boolean,
  comfortable_investment numeric,
  
  -- Section 7: Backup Plans
  has_emergency_savings boolean,
  has_family_backup boolean,
  has_property_backup boolean,
  
  -- Metadata
  profile_completed boolean DEFAULT false,
  current_section integer DEFAULT 1,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Step 3: Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_profile_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Create a trigger to automatically update updated_at on row updates
CREATE TRIGGER set_profile_updated_at
  BEFORE UPDATE ON "Profile"
  FOR EACH ROW
  EXECUTE PROCEDURE update_profile_updated_at();

-- Step 5: Enable Row Level Security (RLS)
ALTER TABLE "Profile" ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for security
-- Users can only view their own profile
CREATE POLICY "Users can view their own profile" ON "Profile"
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile" ON "Profile"
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile" ON "Profile"
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can delete their own profile
CREATE POLICY "Users can delete their own profile" ON "Profile"
  FOR DELETE USING (auth.uid() = id);

-- Step 7: Create a simple user_profiles table for basic user info (for compatibility)
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE,
  user_role text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Step 8: Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Step 9: Create RLS policies for user_profiles
CREATE POLICY "Users can view their own user profile" ON user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own user profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own user profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can delete their own user profile" ON user_profiles
  FOR DELETE USING (auth.uid() = id);

-- Step 10: Add helpful comments
COMMENT ON TABLE "Profile" IS 'Comprehensive user profile information table';
COMMENT ON TABLE user_profiles IS 'Basic user profile information for authentication';

-- Step 11: Verify the tables were created
SELECT 'Profile table created successfully' as status;
SELECT 'user_profiles table created successfully' as status; 