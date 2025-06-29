/*
  # Fix Permission Issues and Setup Core Schema

  1. Core Tables
    - `users` table with proper RLS
    - `souls` table for entity management
    - `transformation_records` for tracking changes
    - `spells` for spell crafting
    - `prophecies` for mystical visions
    - `system_events` for activity logging
    - `energy_allocations` for chamber management

  2. Security
    - Enable RLS on all tables
    - Add policies for proper access control
    - Use auth.uid() for user identification

  3. Functions
    - Helper functions for common operations
    - Trigger functions for automatic updates
*/

-- Create users table extension (since auth.users exists, we extend it with metadata)
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username text UNIQUE NOT NULL,
  access_level text NOT NULL DEFAULT 'guest' CHECK (access_level IN ('guest', 'executor', 'root')),
  mystical_essence integer DEFAULT 1000,
  current_title text DEFAULT 'Initiate',
  titles text[] DEFAULT ARRAY['Initiate'],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create souls table
CREATE TABLE IF NOT EXISTS public.souls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  original_form text NOT NULL,
  current_form text NOT NULL,
  status text DEFAULT 'active' CHECK (status IN ('active', 'dormant', 'transformed', 'archived')),
  chamber text NOT NULL,
  energy_signature integer DEFAULT 50 CHECK (energy_signature >= 0 AND energy_signature <= 100),
  stability integer DEFAULT 80 CHECK (stability >= 0 AND stability <= 100),
  notes text DEFAULT '',
  access_level text DEFAULT 'public' CHECK (access_level IN ('public', 'restricted', 'classified')),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create transformation records table
CREATE TABLE IF NOT EXISTS public.transformation_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  soul_id uuid REFERENCES public.souls(id) ON DELETE CASCADE,
  from_form text NOT NULL,
  to_form text NOT NULL,
  chamber text NOT NULL,
  operator text NOT NULL,
  success boolean DEFAULT true,
  notes text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create spells table
CREATE TABLE IF NOT EXISTS public.spells (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  runes jsonb DEFAULT '[]'::jsonb,
  power integer DEFAULT 50 CHECK (power >= 0 AND power <= 100),
  stability integer DEFAULT 80 CHECK (stability >= 0 AND stability <= 100),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Create prophecies table
CREATE TABLE IF NOT EXISTS public.prophecies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  type text NOT NULL CHECK (type IN ('warning', 'opportunity', 'transformation', 'dimensional', 'temporal')),
  probability integer DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
  timeframe text NOT NULL,
  chamber text,
  entities jsonb DEFAULT '[]'::jsonb,
  status text DEFAULT 'active' CHECK (status IN ('active', 'fulfilled', 'averted', 'expired')),
  created_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create system events table
CREATE TABLE IF NOT EXISTS public.system_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type text NOT NULL CHECK (event_type IN ('transformation', 'spell_cast', 'prophecy', 'system', 'error')),
  title text NOT NULL,
  description text NOT NULL,
  chamber text,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create energy allocations table
CREATE TABLE IF NOT EXISTS public.energy_allocations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chamber text UNIQUE NOT NULL,
  allocated integer DEFAULT 50 CHECK (allocated >= 0 AND allocated <= 100),
  maximum integer DEFAULT 100 CHECK (maximum >= 0 AND maximum <= 100),
  efficiency numeric(3,2) DEFAULT 0.85 CHECK (efficiency >= 0 AND efficiency <= 1),
  updated_by uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  updated_at timestamptz DEFAULT now()
);

-- Create update trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add update triggers
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_souls_updated_at ON public.souls;
CREATE TRIGGER update_souls_updated_at
    BEFORE UPDATE ON public.souls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_prophecies_updated_at ON public.prophecies;
CREATE TRIGGER update_prophecies_updated_at
    BEFORE UPDATE ON public.prophecies
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_energy_allocations_updated_at ON public.energy_allocations;
CREATE TRIGGER update_energy_allocations_updated_at
    BEFORE UPDATE ON public.energy_allocations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transformation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prophecies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.energy_allocations ENABLE ROW LEVEL SECURITY;

-- Helper function to get user access level
CREATE OR REPLACE FUNCTION get_user_access_level(user_id uuid)
RETURNS text AS $$
BEGIN
  RETURN COALESCE(
    (SELECT access_level FROM public.user_profiles WHERE id = user_id),
    'guest'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- User profiles policies
CREATE POLICY "Users can view their own profile" ON public.user_profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Souls policies
CREATE POLICY "Users can view souls based on access level" ON public.souls
  FOR SELECT USING (
    CASE
      WHEN access_level = 'public' THEN true
      WHEN access_level = 'restricted' THEN get_user_access_level(auth.uid()) IN ('executor', 'root')
      WHEN access_level = 'classified' THEN get_user_access_level(auth.uid()) = 'root'
      ELSE false
    END
  );

CREATE POLICY "Executors and above can insert souls" ON public.souls
  FOR INSERT WITH CHECK (get_user_access_level(auth.uid()) IN ('executor', 'root'));

CREATE POLICY "Executors and above can update souls" ON public.souls
  FOR UPDATE USING (get_user_access_level(auth.uid()) IN ('executor', 'root'));

CREATE POLICY "Only root can delete souls" ON public.souls
  FOR DELETE USING (get_user_access_level(auth.uid()) = 'root');

-- Transformation records policies
CREATE POLICY "Users can view transformation records" ON public.transformation_records
  FOR SELECT USING (true);

CREATE POLICY "Executors and above can insert transformation records" ON public.transformation_records
  FOR INSERT WITH CHECK (get_user_access_level(auth.uid()) IN ('executor', 'root'));

-- Spells policies
CREATE POLICY "Users can view their own spells" ON public.spells
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can insert their own spells" ON public.spells
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can delete their own spells" ON public.spells
  FOR DELETE USING (auth.uid() = created_by);

-- Prophecies policies
CREATE POLICY "Users can view prophecies based on access" ON public.prophecies
  FOR SELECT USING (
    auth.uid() = created_by OR 
    get_user_access_level(auth.uid()) IN ('executor', 'root')
  );

CREATE POLICY "Executors and above can insert prophecies" ON public.prophecies
  FOR INSERT WITH CHECK (get_user_access_level(auth.uid()) IN ('executor', 'root'));

CREATE POLICY "Users can update their own prophecies" ON public.prophecies
  FOR UPDATE USING (
    auth.uid() = created_by OR 
    get_user_access_level(auth.uid()) = 'root'
  );

-- System events policies
CREATE POLICY "Users can view system events" ON public.system_events
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert system events" ON public.system_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Energy allocations policies
CREATE POLICY "Users can view energy allocations" ON public.energy_allocations
  FOR SELECT USING (true);

CREATE POLICY "Executors and above can modify energy allocations" ON public.energy_allocations
  FOR ALL USING (get_user_access_level(auth.uid()) IN ('executor', 'root'));

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_souls_chamber ON public.souls(chamber);
CREATE INDEX IF NOT EXISTS idx_souls_status ON public.souls(status);
CREATE INDEX IF NOT EXISTS idx_souls_created_by ON public.souls(created_by);
CREATE INDEX IF NOT EXISTS idx_transformation_records_soul_id ON public.transformation_records(soul_id);
CREATE INDEX IF NOT EXISTS idx_spells_created_by ON public.spells(created_by);
CREATE INDEX IF NOT EXISTS idx_prophecies_type ON public.prophecies(type);
CREATE INDEX IF NOT EXISTS idx_prophecies_status ON public.prophecies(status);
CREATE INDEX IF NOT EXISTS idx_system_events_event_type ON public.system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_created_at ON public.system_events(created_at);

-- Insert default energy allocations
INSERT INTO public.energy_allocations (chamber, allocated, maximum, efficiency) VALUES
  ('Prism Atrium', 75, 100, 0.92),
  ('Metamorphic Conclave', 60, 100, 0.88),
  ('Ember Ring', 85, 100, 0.95),
  ('Void Nexus', 40, 100, 0.65),
  ('Memory Sanctum', 70, 100, 0.90),
  ('Mirror Maze', 55, 100, 0.82)
ON CONFLICT (chamber) DO NOTHING;

-- Function to setup default data for new users
CREATE OR REPLACE FUNCTION setup_default_data()
RETURNS trigger AS $$
BEGIN
  -- Insert default user profile
  INSERT INTO public.user_profiles (id, username, access_level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'access_level', 'guest')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to setup default data for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION setup_default_data();