/*
  # Fix Duplicate Policy Error

  1. Safety Checks
    - Drop existing policies if they exist
    - Recreate all policies with proper conditions
    - Ensure no conflicts with existing database objects

  2. Tables Covered
    - souls
    - transformation_records  
    - spells
    - prophecies
    - system_events
    - energy_allocations

  3. Security
    - Maintain proper RLS policies
    - Ensure access level checking works correctly
*/

-- Helper function to get user access level safely
CREATE OR REPLACE FUNCTION get_user_access_level()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN COALESCE(
    (auth.jwt() ->> 'user_metadata')::jsonb ->> 'access_level',
    'guest'
  );
END;
$$;

-- Helper function to get current user ID
CREATE OR REPLACE FUNCTION get_current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

-- Drop existing policies if they exist (souls table)
DROP POLICY IF EXISTS "Users can view souls based on access level" ON souls;
DROP POLICY IF EXISTS "Executors and above can insert souls" ON souls;
DROP POLICY IF EXISTS "Executors and above can update souls" ON souls;
DROP POLICY IF EXISTS "Only root can delete souls" ON souls;

-- Drop existing policies if they exist (transformation_records table)
DROP POLICY IF EXISTS "Users can view transformation records" ON transformation_records;
DROP POLICY IF EXISTS "Executors and above can insert transformation records" ON transformation_records;

-- Drop existing policies if they exist (spells table)
DROP POLICY IF EXISTS "Users can view their own spells" ON spells;
DROP POLICY IF EXISTS "Users can insert their own spells" ON spells;
DROP POLICY IF EXISTS "Users can delete their own spells" ON spells;

-- Drop existing policies if they exist (prophecies table)
DROP POLICY IF EXISTS "Users can view prophecies based on access" ON prophecies;
DROP POLICY IF EXISTS "Executors and above can insert prophecies" ON prophecies;
DROP POLICY IF EXISTS "Users can update their own prophecies" ON prophecies;

-- Drop existing policies if they exist (system_events table)
DROP POLICY IF EXISTS "Users can view system events" ON system_events;
DROP POLICY IF EXISTS "Authenticated users can insert system events" ON system_events;

-- Drop existing policies if they exist (energy_allocations table)
DROP POLICY IF EXISTS "Users can view energy allocations" ON energy_allocations;
DROP POLICY IF EXISTS "Executors and above can modify energy allocations" ON energy_allocations;

-- Recreate souls table policies
CREATE POLICY "souls_select_policy" ON souls
  FOR SELECT
  TO authenticated
  USING (
    CASE
      WHEN access_level = 'public' THEN true
      WHEN access_level = 'restricted' THEN get_user_access_level() IN ('executor', 'root')
      WHEN access_level = 'classified' THEN get_user_access_level() = 'root'
      ELSE false
    END
  );

CREATE POLICY "souls_insert_policy" ON souls
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_access_level() IN ('executor', 'root'));

CREATE POLICY "souls_update_policy" ON souls
  FOR UPDATE
  TO authenticated
  USING (get_user_access_level() IN ('executor', 'root'))
  WITH CHECK (get_user_access_level() IN ('executor', 'root'));

CREATE POLICY "souls_delete_policy" ON souls
  FOR DELETE
  TO authenticated
  USING (get_user_access_level() = 'root');

-- Recreate transformation_records table policies
CREATE POLICY "transformation_records_select_policy" ON transformation_records
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "transformation_records_insert_policy" ON transformation_records
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_access_level() IN ('executor', 'root'));

-- Recreate spells table policies
CREATE POLICY "spells_select_policy" ON spells
  FOR SELECT
  TO authenticated
  USING (get_current_user_id() = created_by);

CREATE POLICY "spells_insert_policy" ON spells
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = created_by);

CREATE POLICY "spells_delete_policy" ON spells
  FOR DELETE
  TO authenticated
  USING (get_current_user_id() = created_by);

-- Recreate prophecies table policies
CREATE POLICY "prophecies_select_policy" ON prophecies
  FOR SELECT
  TO authenticated
  USING (
    get_current_user_id() = created_by OR 
    get_user_access_level() IN ('executor', 'root')
  );

CREATE POLICY "prophecies_insert_policy" ON prophecies
  FOR INSERT
  TO authenticated
  WITH CHECK (get_user_access_level() IN ('executor', 'root'));

CREATE POLICY "prophecies_update_policy" ON prophecies
  FOR UPDATE
  TO authenticated
  USING (
    get_current_user_id() = created_by OR 
    get_user_access_level() = 'root'
  )
  WITH CHECK (
    get_current_user_id() = created_by OR 
    get_user_access_level() = 'root'
  );

-- Recreate system_events table policies
CREATE POLICY "system_events_select_policy" ON system_events
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "system_events_insert_policy" ON system_events
  FOR INSERT
  TO authenticated
  WITH CHECK (get_current_user_id() = user_id);

-- Recreate energy_allocations table policies
CREATE POLICY "energy_allocations_select_policy" ON energy_allocations
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "energy_allocations_all_policy" ON energy_allocations
  FOR ALL
  TO authenticated
  USING (get_user_access_level() IN ('executor', 'root'))
  WITH CHECK (get_user_access_level() IN ('executor', 'root'));

-- Ensure RLS is enabled on all tables
ALTER TABLE souls ENABLE ROW LEVEL SECURITY;
ALTER TABLE transformation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE spells ENABLE ROW LEVEL SECURITY;
ALTER TABLE prophecies ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE energy_allocations ENABLE ROW LEVEL SECURITY;

-- Insert default energy allocations if they don't exist
INSERT INTO energy_allocations (chamber, allocated, maximum, efficiency, updated_by)
SELECT 
  chamber_name,
  50,
  100,
  0.85,
  '00000000-0000-0000-0000-000000000000'::uuid
FROM (
  VALUES 
    ('Prism Atrium'),
    ('Metamorphic Conclave'),
    ('Ember Ring'),
    ('Void Nexus'),
    ('Memory Sanctum'),
    ('Mirror Maze')
) AS chambers(chamber_name)
WHERE NOT EXISTS (
  SELECT 1 FROM energy_allocations WHERE chamber = chamber_name
);