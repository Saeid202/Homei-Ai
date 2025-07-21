-- Create Properties Table for Property Listings
-- This table stores all property listings from builders

-- Drop the table if it exists (be careful: this deletes all data!)
DROP TABLE IF EXISTS properties CASCADE;

-- Create the properties table with all required columns
CREATE TABLE properties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  price numeric,
  type text,
  status text DEFAULT 'Active',
  builder_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  builder_name text,
  
  -- Address fields
  address_province text,
  address_city text,
  address_street text,
  address_street_num text,
  address_postal_code text,
  address_unit text,
  
  -- Property details
  bedrooms integer,
  bathrooms integer,
  size integer, -- in square feet
  amenities text[], -- array of amenities
  
  -- Media
  photo_url text,
  
  -- Availability
  available_date date,
  
  -- Metadata
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Create a function to automatically update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_properties_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at on row updates
CREATE TRIGGER set_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW
  EXECUTE PROCEDURE update_properties_updated_at();

-- Enable Row Level Security (RLS)
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for security
-- Builders can view all properties (for now - you might want to restrict this later)
CREATE POLICY "Anyone can view properties" ON properties
  FOR SELECT USING (true);

-- Builders can insert their own properties
CREATE POLICY "Builders can insert properties" ON properties
  FOR INSERT WITH CHECK (auth.uid() = builder_id);

-- Builders can update their own properties
CREATE POLICY "Builders can update their own properties" ON properties
  FOR UPDATE USING (auth.uid() = builder_id);

-- Builders can delete their own properties
CREATE POLICY "Builders can delete their own properties" ON properties
  FOR DELETE USING (auth.uid() = builder_id);

-- Add helpful comments
COMMENT ON TABLE properties IS 'Property listings table for real estate properties';
COMMENT ON COLUMN properties.id IS 'Primary key, auto-generated UUID';
COMMENT ON COLUMN properties.title IS 'Property listing title';
COMMENT ON COLUMN properties.description IS 'Property description';
COMMENT ON COLUMN properties.price IS 'Property price in dollars';
COMMENT ON COLUMN properties.type IS 'Property type (Detached, Condo, etc.)';
COMMENT ON COLUMN properties.status IS 'Listing status (Active, Pending, Sold, Off Market)';
COMMENT ON COLUMN properties.builder_id IS 'Reference to the builder/user who created this listing';
COMMENT ON COLUMN properties.builder_name IS 'Builder name/email for display';
COMMENT ON COLUMN properties.address_province IS 'Property province';
COMMENT ON COLUMN properties.address_city IS 'Property city';
COMMENT ON COLUMN properties.address_street IS 'Property street name';
COMMENT ON COLUMN properties.address_street_num IS 'Property street number';
COMMENT ON COLUMN properties.address_postal_code IS 'Property postal code';
COMMENT ON COLUMN properties.address_unit IS 'Property unit number';
COMMENT ON COLUMN properties.bedrooms IS 'Number of bedrooms';
COMMENT ON COLUMN properties.bathrooms IS 'Number of bathrooms';
COMMENT ON COLUMN properties.size IS 'Property size in square feet';
COMMENT ON COLUMN properties.amenities IS 'Array of amenities (Pool, Gym, etc.)';
COMMENT ON COLUMN properties.photo_url IS 'URL to property photo';
COMMENT ON COLUMN properties.available_date IS 'Date when property becomes available';
COMMENT ON COLUMN properties.created_at IS 'Timestamp when record was created';
COMMENT ON COLUMN properties.updated_at IS 'Timestamp when record was last updated';

-- Verify the table was created
SELECT 'Properties table created successfully' as status; 