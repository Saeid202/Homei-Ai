-- Check what tables exist in the database
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check if Profile table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'Profile' 
ORDER BY ordinal_position;

-- Check if user_profiles table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'user_profiles' 
ORDER BY ordinal_position;

-- Check for any data in Profile table
SELECT COUNT(*) as profile_count FROM "Profile";

-- Check for any data in user_profiles table
SELECT COUNT(*) as user_profiles_count FROM user_profiles;

-- Check if properties table exists and its structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position;

-- Check for any data in properties table
SELECT COUNT(*) as properties_count FROM properties; 

## Step 3: Clear Supabase Cache (if needed)

Sometimes Supabase caches the schema. If the table exists but you still get the error:

1. **Refresh your Supabase dashboard**
2. **Restart your React development server:**

-- Check if properties table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'properties';

-- Check the structure of the properties table
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'properties' 
ORDER BY ordinal_position; 