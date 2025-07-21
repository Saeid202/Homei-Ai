-- Drop the table if it exists (be careful: this deletes all data!)
drop table if exists "Profile";

-- Create the Profile table with all required columns for comprehensive profile form
create table "Profile" (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
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
  profile_completed boolean default false,
  current_section integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Create a function to automatically update the updated_at timestamp
create or replace function update_profile_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create a trigger to automatically update updated_at on row updates
drop trigger if exists set_profile_updated_at on "Profile";
create trigger set_profile_updated_at
before update on "Profile"
for each row
execute procedure update_profile_updated_at();

-- Enable Row Level Security (RLS)
alter table "Profile" enable row level security;

-- Create RLS policies for security
-- Users can only view their own profile
create policy "Users can view their own profile" on "Profile"
  for select using (auth.uid() = id);

-- Users can update their own profile
create policy "Users can update their own profile" on "Profile"
  for update using (auth.uid() = id);

-- Users can insert their own profile
create policy "Users can insert their own profile" on "Profile"
  for insert with check (auth.uid() = id);

-- Users can delete their own profile
create policy "Users can delete their own profile" on "Profile"
  for delete using (auth.uid() = id);

-- Add helpful comments
comment on table "Profile" is 'Comprehensive user profile information table';
comment on column "Profile".id is 'Primary key, references auth.users(id)';
comment on column "Profile".email is 'User email address';
comment on column "Profile".user_role is 'User role in the system';
comment on column "Profile".account_type is 'Type of investment account';
comment on column "Profile".first_name is 'Legal first name';
comment on column "Profile".middle_name is 'Legal middle name';
comment on column "Profile".last_name is 'Legal last name';
comment on column "Profile".date_of_birth is 'Date of birth';
comment on column "Profile".sin is 'Social Insurance Number';
comment on column "Profile".gender is 'Gender';
comment on column "Profile".marital_status is 'Marital status';
comment on column "Profile".phone is 'Phone number';
comment on column "Profile".is_canadian_resident is 'Whether user is Canadian resident/citizen';
comment on column "Profile".country_of_origin is 'Country of origin if not Canadian resident';
comment on column "Profile".canadian_status is 'Status in Canada (International Student, Work Permit, etc.)';
comment on column "Profile".university_name is 'University name for international students';
comment on column "Profile".level_of_study is 'Level of study for international students';
comment on column "Profile".study_start_date is 'Study start date for international students';
comment on column "Profile".expected_graduation_date is 'Expected graduation date for international students';
comment on column "Profile".work_permit_start_date is 'Work permit start date';
comment on column "Profile".work_permit_end_date is 'Work permit end date';
comment on column "Profile".residential_province is 'Residential province';
comment on column "Profile".residential_city is 'Residential city';
comment on column "Profile".residential_street_number is 'Residential street number';
comment on column "Profile".residential_street_name is 'Residential street name';
comment on column "Profile".residential_postal_code is 'Residential postal code';
comment on column "Profile".residential_unit_number is 'Residential unit number';
comment on column "Profile".mailing_same_as_residential is 'Whether mailing address is same as residential';
comment on column "Profile".mailing_province is 'Mailing province';
comment on column "Profile".mailing_city is 'Mailing city';
comment on column "Profile".mailing_street_number is 'Mailing street number';
comment on column "Profile".mailing_street_name is 'Mailing street name';
comment on column "Profile".mailing_postal_code is 'Mailing postal code';
comment on column "Profile".mailing_unit_number is 'Mailing unit number';
comment on column "Profile".employment_type is 'Current employment type';
comment on column "Profile".employer_name is 'Employer name';
comment on column "Profile".job_title is 'Job title';
comment on column "Profile".monthly_income is 'Monthly income';
comment on column "Profile".employment_start_date is 'Employment start date';
comment on column "Profile".business_name is 'Business name for self-employed';
comment on column "Profile".business_start_date is 'Business start date for self-employed';
comment on column "Profile".yearly_income is 'Yearly income for self-employed';
comment on column "Profile".has_car is 'Whether user has a car';
comment on column "Profile".car_make is 'Car make';
comment on column "Profile".car_year is 'Car year';
comment on column "Profile".car_financing_type is 'Car financing type (lease/finance)';
comment on column "Profile".car_lease_start_date is 'Car lease start date';
comment on column "Profile".car_lease_end_date is 'Car lease end date';
comment on column "Profile".car_finance_amount is 'Car finance amount owed';
comment on column "Profile".has_loan is 'Whether user has any loan';
comment on column "Profile".budget is 'Current budget';
comment on column "Profile".owns_real_estate is 'Whether user owns real estate';
comment on column "Profile".comfortable_investment is 'Comfortable investment amount';
comment on column "Profile".has_emergency_savings is 'Whether user has emergency savings';
comment on column "Profile".has_family_backup is 'Whether user has family backup';
comment on column "Profile".has_property_backup is 'Whether user has property backup in home country';
comment on column "Profile".profile_completed is 'Whether profile is completed';
comment on column "Profile".current_section is 'Current section being filled (1 or 2)';
comment on column "Profile".created_at is 'Timestamp when record was created';
comment on column "Profile".updated_at is 'Timestamp when record was last updated'; 

-- Co-Investment Opportunities Table
create table if not exists co_investment_opportunities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  type text not null, -- 'residential' or 'commercial'
  title text not null,
  property_address text not null,
  description text not null,
  created_at timestamp with time zone default timezone('utc'::text, now())
); 

-- Add user_name column to property_group_messages for real name display in group chat
ALTER TABLE property_group_messages ADD COLUMN IF NOT EXISTS user_name TEXT; 

-- Add columns for advanced messaging features
ALTER TABLE messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reported BOOLEAN DEFAULT FALSE;

ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS edited_at TIMESTAMP;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE group_messages ADD COLUMN IF NOT EXISTS reported BOOLEAN DEFAULT FALSE; 

-- Table for group chat invitations
CREATE TABLE IF NOT EXISTS group_invitations (
  id SERIAL PRIMARY KEY,
  group_conversation_id UUID NOT NULL,
  property_id UUID NOT NULL,
  inviter_id UUID NOT NULL,
  invitee_id UUID NOT NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'pending', -- pending, accepted, declined
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (group_conversation_id, invitee_id)
); 

ALTER TABLE group_invitations ADD COLUMN IF NOT EXISTS read BOOLEAN DEFAULT FALSE;
ALTER TABLE group_invitations ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(); 