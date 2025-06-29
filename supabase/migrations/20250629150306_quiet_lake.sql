/*
  # Eternum Bastion Database Schema - Complete Setup
  
  1. New Tables
    - `souls` - Registry of all entities in the bastion
    - `transformation_records` - History of all transformations
    - `spells` - Crafted spells and rituals
    - `prophecies` - Mystical predictions and visions
    - `system_events` - Log of all system activities
    - `energy_allocations` - Chamber power management
    
  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for different access levels
    - Implement proper user metadata access patterns
    
  3. Performance
    - Add indexes for frequently queried columns
    - Create triggers for automatic timestamp updates
    - Setup default data initialization
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Souls table - Registry of all entities in the bastion
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'souls') THEN
    CREATE TABLE souls (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      original_form text NOT NULL,
      current_form text NOT NULL,
      status text CHECK (status IN ('active', 'dormant', 'transformed', 'archived')) DEFAULT 'active',
      chamber text NOT NULL,
      energy_signature integer CHECK (energy_signature >= 0 AND energy_signature <= 100) DEFAULT 50,
      stability integer CHECK (stability >= 0 AND stability <= 100) DEFAULT 80,
      notes text DEFAULT '',
      access_level text CHECK (access_level IN ('public', 'restricted', 'classified')) DEFAULT 'public',
      created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Transformation records - History of all transformations
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'transformation_records') THEN
    CREATE TABLE transformation_records (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      soul_id uuid REFERENCES souls(id) ON DELETE CASCADE,
      from_form text NOT NULL,
      to_form text NOT NULL,
      chamber text NOT NULL,
      operator text NOT NULL,
      success boolean DEFAULT true,
      notes text DEFAULT '',
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Spells table - Crafted spells and rituals
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'spells') THEN
    CREATE TABLE spells (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      name text NOT NULL,
      description text NOT NULL,
      runes jsonb NOT NULL DEFAULT '[]',
      power integer CHECK (power >= 0 AND power <= 100) DEFAULT 50,
      stability integer CHECK (stability >= 0 AND stability <= 100) DEFAULT 80,
      created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Prophecies table - Mystical predictions and visions
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'prophecies') THEN
    CREATE TABLE prophecies (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      title text NOT NULL,
      content text NOT NULL,
      type text CHECK (type IN ('warning', 'opportunity', 'transformation', 'dimensional', 'temporal')) NOT NULL,
      probability integer CHECK (probability >= 0 AND probability <= 100) DEFAULT 50,
      timeframe text NOT NULL,
      chamber text,
      entities jsonb DEFAULT '[]',
      status text CHECK (status IN ('active', 'fulfilled', 'averted', 'expired')) DEFAULT 'active',
      created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- System events table - Log of all system activities
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'system_events') THEN
    CREATE TABLE system_events (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      event_type text CHECK (event_type IN ('transformation', 'spell_cast', 'prophecy', 'system', 'error')) NOT NULL,
      title text NOT NULL,
      description text NOT NULL,
      chamber text,
      user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      metadata jsonb DEFAULT '{}',
      created_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Energy allocations table - Chamber power management
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'energy_allocations') THEN
    CREATE TABLE energy_allocations (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      chamber text UNIQUE NOT NULL,
      allocated integer CHECK (allocated >= 0 AND allocated <= 100) DEFAULT 50,
      maximum integer CHECK (maximum >= 0 AND maximum <= 100) DEFAULT 100,
      efficiency decimal(3,2) CHECK (efficiency >= 0 AND efficiency <= 1) DEFAULT 0.85,
      updated_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
      updated_at timestamptz DEFAULT now()
    );
  END IF;
END $$;

-- Enable Row Level Security on all tables
ALTER TABLE souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE prophecies ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_allocations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist to avoid conflicts
DO $$
BEGIN
  -- Souls policies
  DROP POLICY IF EXISTS "Users can view souls based on access level" ON souls;
  DROP POLICY IF EXISTS "Executors and above can insert souls" ON souls;
  DROP POLICY IF EXISTS "Executors and above can update souls" ON souls;
  DROP POLICY IF EXISTS "Only root can delete souls" ON souls;
  
  -- Transformation records policies
  DROP POLICY IF EXISTS "Users can view transformation records" ON transformation_records;
  DROP POLICY IF EXISTS "Executors and above can insert transformation records" ON transformation_records;
  
  -- Spells policies
  DROP POLICY IF EXISTS "Users can view their own spells" ON spells;
  DROP POLICY IF EXISTS "Users can insert their own spells" ON spells;
  DROP POLICY IF EXISTS "Users can delete their own spells" ON spells;
  
  -- Prophecies policies
  DROP POLICY IF EXISTS "Users can view prophecies based on access" ON prophecies;
  DROP POLICY IF EXISTS "Executors and above can insert prophecies" ON prophecies;
  DROP POLICY IF EXISTS "Users can update their own prophecies" ON prophecies;
  
  -- System events policies
  DROP POLICY IF EXISTS "Users can view system events" ON system_events;
  DROP POLICY IF EXISTS "Authenticated users can insert system events" ON system_events;
  
  -- Energy allocations policies
  DROP POLICY IF EXISTS "Users can view energy allocations" ON energy_allocations;
  DROP POLICY IF EXISTS "Executors and above can modify energy allocations" ON energy_allocations;
END $$;

-- RLS Policies for souls table
CREATE POLICY "Users can view souls based on access level" ON souls
  FOR SELECT USING (
    CASE 
      WHEN access_level = 'public' THEN true
      WHEN access_level = 'restricted' THEN (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
      WHEN access_level = 'classified' THEN (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = 'root'::text
      ELSE false
    END
  );

CREATE POLICY "Executors and above can insert souls" ON souls
  FOR INSERT WITH CHECK (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
  );

CREATE POLICY "Executors and above can update souls" ON souls
  FOR UPDATE USING (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
  );

CREATE POLICY "Only root can delete souls" ON souls
  FOR DELETE USING (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = 'root'::text
  );

-- RLS Policies for transformation_records
CREATE POLICY "Users can view transformation records" ON transformation_records
  FOR SELECT USING (true);

CREATE POLICY "Executors and above can insert transformation records" ON transformation_records
  FOR INSERT WITH CHECK (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
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
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
  );

CREATE POLICY "Executors and above can insert prophecies" ON prophecies
  FOR INSERT WITH CHECK (
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
  );

CREATE POLICY "Users can update their own prophecies" ON prophecies
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = 'root'::text
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
    (((auth.jwt() ->> 'user_metadata'::text))::jsonb ->> 'access_level'::text) = ANY (ARRAY['executor'::text, 'root'::text])
  );

-- Create functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic timestamp updates
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_souls_updated_at'
  ) THEN
    CREATE TRIGGER update_souls_updated_at 
      BEFORE UPDATE ON souls
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_prophecies_updated_at'
  ) THEN
    CREATE TRIGGER update_prophecies_updated_at 
      BEFORE UPDATE ON prophecies
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_energy_allocations_updated_at'
  ) THEN
    CREATE TRIGGER update_energy_allocations_updated_at 
      BEFORE UPDATE ON energy_allocations
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END $$;

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

-- Insert default energy allocations (will be populated after first user signs up)
-- Using a function to safely insert default data
CREATE OR REPLACE FUNCTION insert_default_energy_allocations()
RETURNS void AS $$
BEGIN
  -- Only insert if the table is empty
  IF NOT EXISTS (SELECT 1 FROM energy_allocations LIMIT 1) THEN
    INSERT INTO energy_allocations (chamber, allocated, maximum, efficiency, updated_by) 
    SELECT 
      chamber_name,
      allocated_value,
      100,
      efficiency_value,
      (SELECT id FROM auth.users ORDER BY created_at LIMIT 1)
    FROM (VALUES
      ('Prism Atrium', 75, 0.92),
      ('Metamorphic Conclave', 60, 0.88),
      ('Ember Ring', 85, 0.95),
      ('Void Nexus', 40, 0.65),
      ('Memory Sanctum', 70, 0.90),
      ('Mirror Maze', 55, 0.82)
    ) AS defaults(chamber_name, allocated_value, efficiency_value)
    WHERE (SELECT id FROM auth.users ORDER BY created_at LIMIT 1) IS NOT NULL;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically set up default energy allocations when first user signs up
CREATE OR REPLACE FUNCTION setup_default_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Call the function to insert default energy allocations
  PERFORM insert_default_energy_allocations();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger on auth.users (if it doesn't exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'setup_default_data_trigger'
  ) THEN
    CREATE TRIGGER setup_default_data_trigger
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION setup_default_data();
  END IF;
EXCEPTION
  WHEN others THEN
    -- Ignore errors if we can't create the trigger (auth.users might not be accessible)
    NULL;
END $$;