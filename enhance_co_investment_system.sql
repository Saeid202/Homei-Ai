-- =====================================================
-- ENHANCED CO-INVESTMENT SYSTEM DATABASE MIGRATION
-- =====================================================

-- 1.1 Update Property Interests Table with Enhanced Fields
ALTER TABLE property_interests 
ADD COLUMN IF NOT EXISTS display_real_name BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS show_profile_to_others BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS interest_level VARCHAR(20) DEFAULT 'interested',
ADD COLUMN IF NOT EXISTS investment_amount DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS preferred_role VARCHAR(50) DEFAULT 'co_investor';

-- 1.2 Create Co-Investment Groups Table
CREATE TABLE IF NOT EXISTS co_investment_groups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  property_id UUID REFERENCES properties(id) ON DELETE CASCADE,
  group_name VARCHAR(255) NOT NULL,
  lead_investor_id UUID REFERENCES auth.users(id),
  status VARCHAR(20) DEFAULT 'forming',
  max_investors INTEGER DEFAULT 10,
  min_investment DECIMAL(12,2),
  total_investment_target DECIMAL(12,2),
  current_investment_total DECIMAL(12,2) DEFAULT 0,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 1.3 Create Group Members Table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES co_investment_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  investment_amount DECIMAL(12,2),
  role VARCHAR(50) DEFAULT 'co_investor',
  status VARCHAR(20) DEFAULT 'pending',
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- 1.4 Create Group Messages Table
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  group_id UUID REFERENCES co_investment_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  user_name VARCHAR(255),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- 2.1 Property Interests RLS Policies
CREATE POLICY "Users can view interests based on privacy settings" ON property_interests
FOR SELECT USING (
  -- Builder can see all interests for their properties
  EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = property_interests.property_id 
    AND properties.builder_id = auth.uid()
  )
  OR
  -- Users can see interests where show_profile_to_others is true
  property_interests.show_profile_to_others = true
  OR
  -- Users can see their own interests
  property_interests.user_id = auth.uid()
);

CREATE POLICY "Users can insert their own interests" ON property_interests
FOR INSERT WITH CHECK (property_interests.user_id = auth.uid());

CREATE POLICY "Users can update their own interests" ON property_interests
FOR UPDATE USING (property_interests.user_id = auth.uid());

CREATE POLICY "Users can delete their own interests" ON property_interests
FOR DELETE USING (property_interests.user_id = auth.uid());

-- 2.2 Co-Investment Groups RLS Policies
CREATE POLICY "Group members can view their groups" ON co_investment_groups
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = co_investment_groups.id 
    AND group_members.user_id = auth.uid()
  )
  OR co_investment_groups.lead_investor_id = auth.uid()
  OR EXISTS (
    SELECT 1 FROM properties 
    WHERE properties.id = co_investment_groups.property_id 
    AND properties.builder_id = auth.uid()
  )
);

CREATE POLICY "Authenticated users can create groups" ON co_investment_groups
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Lead investor can update their groups" ON co_investment_groups
FOR UPDATE USING (co_investment_groups.lead_investor_id = auth.uid());

-- 2.3 Group Members RLS Policies
CREATE POLICY "Group members can view group members" ON group_members
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members gm2
    WHERE gm2.group_id = group_members.group_id 
    AND gm2.user_id = auth.uid()
  )
  OR EXISTS (
    SELECT 1 FROM co_investment_groups cig
    WHERE cig.id = group_members.group_id 
    AND cig.lead_investor_id = auth.uid()
  )
);

CREATE POLICY "Lead investor can manage group members" ON group_members
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM co_investment_groups
    WHERE co_investment_groups.id = group_members.group_id 
    AND co_investment_groups.lead_investor_id = auth.uid()
  )
);

-- 2.4 Group Messages RLS Policies
CREATE POLICY "Group members can view messages" ON group_messages
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can send messages" ON group_messages
FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members 
    WHERE group_members.group_id = group_messages.group_id 
    AND group_members.user_id = auth.uid()
  )
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_property_interests_property_id ON property_interests(property_id);
CREATE INDEX IF NOT EXISTS idx_property_interests_user_id ON property_interests(user_id);
CREATE INDEX IF NOT EXISTS idx_co_investment_groups_property_id ON co_investment_groups(property_id);
CREATE INDEX IF NOT EXISTS idx_co_investment_groups_lead_investor_id ON co_investment_groups(lead_investor_id);
CREATE INDEX IF NOT EXISTS idx_group_members_group_id ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user_id ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update group investment total
CREATE OR REPLACE FUNCTION update_group_investment_total()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE co_investment_groups 
    SET current_investment_total = current_investment_total + NEW.investment_amount
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    UPDATE co_investment_groups 
    SET current_investment_total = current_investment_total - OLD.investment_amount + NEW.investment_amount
    WHERE id = NEW.group_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE co_investment_groups 
    SET current_investment_total = current_investment_total - OLD.investment_amount
    WHERE id = OLD.group_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update group investment totals
CREATE TRIGGER trigger_update_group_investment_total
  AFTER INSERT OR UPDATE OR DELETE ON group_members
  FOR EACH ROW EXECUTE FUNCTION update_group_investment_total();

-- Function to update group status based on investment total
CREATE OR REPLACE FUNCTION update_group_status()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.current_investment_total >= NEW.total_investment_target THEN
    NEW.status = 'active';
  ELSIF NEW.current_investment_total > 0 THEN
    NEW.status = 'forming';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update group status
CREATE TRIGGER trigger_update_group_status
  BEFORE UPDATE ON co_investment_groups
  FOR EACH ROW EXECUTE FUNCTION update_group_status(); 