-- =====================================================
-- PROFILE FORM ENHANCEMENTS MIGRATION
-- =====================================================

-- 1.1 Add new columns to Profile table for enhanced functionality
ALTER TABLE "Profile" 
ADD COLUMN IF NOT EXISTS pr_application_date DATE,
ADD COLUMN IF NOT EXISTS employment_duration_years INTEGER,
ADD COLUMN IF NOT EXISTS employment_end_date DATE,
ADD COLUMN IF NOT EXISTS currently_working_here BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS business_duration_years INTEGER;

-- 1.2 Create job history table for multiple job entries
CREATE TABLE IF NOT EXISTS user_job_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  employer_name TEXT NOT NULL,
  job_title TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE,
  currently_working BOOLEAN DEFAULT FALSE,
  monthly_income NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 1.3 Enable RLS for job history table
ALTER TABLE user_job_history ENABLE ROW LEVEL SECURITY;

-- 1.4 Create RLS policies for job history
CREATE POLICY "Users can view their own job history" ON user_job_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own job history" ON user_job_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own job history" ON user_job_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own job history" ON user_job_history
  FOR DELETE USING (auth.uid() = user_id);

-- 1.5 Create function to update job history updated_at timestamp
CREATE OR REPLACE FUNCTION update_job_history_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1.6 Create trigger for job history updated_at
CREATE TRIGGER set_job_history_updated_at
  BEFORE UPDATE ON user_job_history
  FOR EACH ROW
  EXECUTE PROCEDURE update_job_history_updated_at();

-- 1.7 Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_job_history_user_id ON user_job_history(user_id);
CREATE INDEX IF NOT EXISTS idx_user_job_history_start_date ON user_job_history(start_date);

-- 1.8 Add helpful comments
COMMENT ON TABLE user_job_history IS 'User job history for employment tracking';
COMMENT ON COLUMN user_job_history.id IS 'Primary key';
COMMENT ON COLUMN user_job_history.user_id IS 'Reference to auth.users(id)';
COMMENT ON COLUMN user_job_history.employer_name IS 'Name of the employer';
COMMENT ON COLUMN user_job_history.job_title IS 'Job title/position';
COMMENT ON COLUMN user_job_history.start_date IS 'Employment start date';
COMMENT ON COLUMN user_job_history.end_date IS 'Employment end date (null if currently working)';
COMMENT ON COLUMN user_job_history.currently_working IS 'Whether user is currently working at this job';
COMMENT ON COLUMN user_job_history.monthly_income IS 'Monthly income at this job';

-- 1.9 Add comments for new Profile columns
COMMENT ON COLUMN "Profile".pr_application_date IS 'Date when PR application was submitted';
COMMENT ON COLUMN "Profile".employment_duration_years IS 'Duration of current employment in years';
COMMENT ON COLUMN "Profile".employment_end_date IS 'End date of current employment';
COMMENT ON COLUMN "Profile".currently_working_here IS 'Whether user is currently working at this job';
COMMENT ON COLUMN "Profile".business_duration_years IS 'Duration of self-employed business in years'; 