-- Verify Database Setup
-- This script checks that all tables are properly created and accessible

-- Check all tables in the database
SELECT '=== ALL TABLES ===' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check Profile table structure
SELECT '=== PROFILE TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Profile' 
ORDER BY ordinal_position;

-- Check user_profiles table structure
SELECT '=== USER_PROFILES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check properties table structure
SELECT '=== PROPERTIES TABLE STRUCTURE ===' as info;
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Check data counts
SELECT '=== DATA COUNTS ===' as info;
SELECT 'Profile' as table_name, COUNT(*) as record_count FROM "Profile"
UNION ALL
SELECT 'user_profiles' as table_name, COUNT(*) as record_count FROM user_profiles
UNION ALL
SELECT 'properties' as table_name, COUNT(*) as record_count FROM properties;

-- Test inserting a sample property (optional - remove this if you don't want test data)
SELECT '=== TESTING PROPERTY INSERT ===' as info;
INSERT INTO properties (
  title, 
  description, 
  price, 
  type, 
  status, 
  builder_id, 
  builder_name,
  address_province,
  address_city,
  bedrooms,
  bathrooms,
  size
) VALUES (
  'Test Property',
  'This is a test property listing',
  500000,
  'Detached',
  'Active',
  '00000000-0000-0000-0000-000000000000', -- dummy UUID
  'test@example.com',
  'Ontario',
  'Toronto',
  3,
  2,
  1500
) ON CONFLICT DO NOTHING;

SELECT 'Database verification completed successfully!' as status; 