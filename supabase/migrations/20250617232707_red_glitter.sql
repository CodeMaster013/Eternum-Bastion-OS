-- Eternum Bastion Database Schema
-- This file contains the SQL schema for setting up the Supabase database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Souls table - Registry of all entities in the bastion
CREATE TABLE IF NOT EXISTS souls (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  original_form TEXT NOT NULL,
  current_form TEXT NOT NULL,
  status TEXT CHECK (status IN ('active', 'dormant', 'transformed', 'archived')) DEFAULT 'active',
  chamber TEXT NOT NULL,
  energy_signature INTEGER CHECK (energy_signature >= 0 AND energy_signature <= 100) DEFAULT 50,
  stability INTEGER CHECK (stability >= 0 AND stability <= 100) DEFAULT 80,
  notes TEXT DEFAULT '',
  access_level TEXT CHECK (access_level IN ('public', 'restricted', 'classified')) DEFAULT 'public',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transformation records - History of all transformations
CREATE TABLE IF NOT EXISTS transformation_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  soul_id UUID REFERENCES souls(id) ON DELETE CASCADE,
  from_form TEXT NOT NULL,
  to_form TEXT NOT NULL,
  chamber TEXT NOT NULL,
  operator TEXT NOT NULL,
  success BOOLEAN DEFAULT true,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Spells table - Crafted spells and rituals
CREATE TABLE IF NOT EXISTS spells (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  runes JSONB NOT NULL DEFAULT '[]',
  power INTEGER CHECK (power >= 0 AND power <= 100) DEFAULT 50,
  stability INTEGER CHECK (stability >= 0 AND stability <= 100) DEFAULT 80,
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Prophecies table - Mystical predictions and visions
CREATE TABLE IF NOT EXISTS prophecies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT CHECK (type IN ('warning', 'opportunity', 'transformation', 'dimensional', 'temporal')) NOT NULL,
  probability INTEGER CHECK (probability >= 0 AND probability <= 100) DEFAULT 50,
  timeframe TEXT NOT NULL,
  chamber TEXT,
  entities JSONB DEFAULT '[]',
  status TEXT CHECK (status IN ('active', 'fulfilled', 'averted', 'expired')) DEFAULT 'active',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System events table - Log of all system activities
CREATE TABLE IF NOT EXISTS system_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_type TEXT CHECK (event_type IN ('transformation', 'spell_cast', 'prophecy', 'system', 'error')) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  chamber TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Energy allocations table - Chamber power management
CREATE TABLE IF NOT EXISTS energy_allocations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  chamber TEXT UNIQUE NOT NULL,
  allocated INTEGER CHECK (allocated >= 0 AND allocated <= 100) DEFAULT 50,
  maximum INTEGER CHECK (maximum >= 0 AND maximum <= 100) DEFAULT 100,
  efficiency DECIMAL(3,2) CHECK (efficiency >= 0 AND efficiency <= 1) DEFAULT 0.85,
  updated_by UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE prophecies ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_allocations ENABLE ROW LEVEL SECURITY;

-- RLS Policies for souls table
CREATE POLICY "Users can view souls based on access level" ON souls
  FOR SELECT USING (
    CASE 
      WHEN access_level = 'public' THEN true
      WHEN access_level = 'restricted' THEN auth.jwt() ->> 'access_level' IN ('executor', 'root')
      WHEN access_level = 'classified' THEN auth.jwt() ->> 'access_level' = 'root'
      ELSE false
    END
  );

CREATE POLICY "Executors and above can insert souls" ON souls
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'access_level' IN ('executor', 'root')
  );

CREATE POLICY "Executors and above can update souls" ON souls
  FOR UPDATE USING (
    auth.jwt() ->> 'access_level' IN ('executor', 'root')
  );

CREATE POLICY "Only root can delete souls" ON souls
  FOR DELETE USING (
    auth.jwt() ->> 'access_level' = 'root'
  );

-- RLS Policies for transformation_records
CREATE POLICY "Users can view transformation records" ON transformation_records
  FOR SELECT USING (true);

CREATE POLICY "Executors and above can insert transformation records" ON transformation_records
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'access_level' IN ('executor', 'root')
  );

-- RLS Policies for spells
CREATE POLICY "Users can view their own spells" ON spells
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own spells" ON spells
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own spells" ON spells
  FOR DELETE USING (auth.uid() = created_by);

-- RLS Policies for prophecies
CREATE POLICY "Users can view prophecies based on access" ON prophecies
  FOR SELECT USING (
    auth.uid() = created_by OR 
    auth.jwt() ->> 'access_level' IN ('executor', 'root')
  );

CREATE POLICY "Executors and above can insert prophecies" ON prophecies
  FOR INSERT WITH CHECK (
    auth.jwt() ->> 'access_level' IN ('executor', 'root')
  );

CREATE POLICY "Users can update their own prophecies" ON prophecies
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    auth.jwt() ->> 'access_level' = 'root'
  );

-- RLS Policies for system_events
CREATE POLICY "Users can view system events" ON system_events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert system events" ON system_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for energy_allocations
CREATE POLICY "Users can view energy allocations" ON energy_allocations
  FOR SELECT USING (true);

CREATE POLICY "Executors and above can modify energy allocations" ON energy_allocations
  FOR ALL USING (
    auth.jwt() ->> 'access_level' IN ('executor', 'root')
  );

-- Insert default energy allocations
INSERT INTO energy_allocations (chamber, allocated, maximum, efficiency, updated_by) VALUES
  ('Prism Atrium', 75, 100, 0.92, (SELECT id FROM auth.users LIMIT 1)),
  ('Metamorphic Conclave', 60, 100, 0.88, (SELECT id FROM auth.users LIMIT 1)),
  ('Ember Ring', 85, 100, 0.95, (SELECT id FROM auth.users LIMIT 1)),
  ('Void Nexus', 40, 100, 0.65, (SELECT id FROM auth.users LIMIT 1)),
  ('Memory Sanctum', 70, 100, 0.90, (SELECT id FROM auth.users LIMIT 1)),
  ('Mirror Maze', 55, 100, 0.82, (SELECT id FROM auth.users LIMIT 1))
ON CONFLICT (chamber) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_souls_status ON souls(status);
CREATE INDEX IF NOT EXISTS idx_souls_chamber ON souls(chamber);
CREATE INDEX IF NOT EXISTS idx_souls_created_by ON souls(created_by);
CREATE INDEX IF NOT EXISTS idx_transformation_records_soul_id ON transformation_records(soul_id);
CREATE INDEX IF NOT EXISTS idx_spells_created_by ON spells(created_by);
CREATE INDEX IF NOT EXISTS idx_prophecies_status ON prophecies(status);
CREATE INDEX IF NOT EXISTS idx_prophecies_type ON prophecies(type);
CREATE INDEX IF NOT EXISTS idx_system_events_event_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON system_events(created_at);

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_souls_updated_at BEFORE UPDATE ON souls
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prophecies_updated_at BEFORE UPDATE ON prophecies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_energy_allocations_updated_at BEFORE UPDATE ON energy_allocations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();