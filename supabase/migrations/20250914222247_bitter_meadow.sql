/*
  # Delningssystem för B.Keeper

  1. Nya tabeller
    - `profiles` - Användarprofiler
    - `apiaries` - Bigårdar (samlingar av kupor)
    - `apiary_members` - Medlemskap i bigårdar
    - `hives` - Kupor (kopplade till bigårdar)
    - `inspections` - Inspektioner
    - `tasks` - Uppgifter

  2. Säkerhet
    - RLS aktiverat på alla tabeller
    - Policies för läs/skriv baserat på medlemskap
    - Endast medlemmar kan se och redigera bigårdens data

  3. Funktioner
    - Skapa och hantera bigårdar
    - Bjuda in andra användare
    - Synkronisera data i realtid
*/

-- Skapa profiles tabell
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Skapa apiaries (bigårdar) tabell
CREATE TABLE IF NOT EXISTS apiaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  location text,
  owner_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  invite_code text UNIQUE DEFAULT substring(gen_random_uuid()::text from 1 for 8),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE apiaries ENABLE ROW LEVEL SECURITY;

-- Skapa apiary_members tabell
CREATE TABLE IF NOT EXISTS apiary_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id uuid REFERENCES apiaries(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(apiary_id, profile_id)
);

ALTER TABLE apiary_members ENABLE ROW LEVEL SECURITY;

-- Skapa hives tabell
CREATE TABLE IF NOT EXISTS hives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id uuid REFERENCES apiaries(id) ON DELETE CASCADE,
  name text NOT NULL,
  location text,
  frames text DEFAULT '0/20',
  status text DEFAULT 'good' CHECK (status IN ('excellent', 'good', 'warning', 'critical')),
  population text DEFAULT 'Medel',
  varroa text DEFAULT '0.0/dag',
  honey text DEFAULT '0 kg',
  has_queen boolean DEFAULT true,
  queen_marked boolean DEFAULT false,
  queen_color text,
  queen_wing_clipped boolean DEFAULT false,
  queen_added_date timestamptz,
  is_nucleus boolean DEFAULT false,
  is_wintered boolean DEFAULT false,
  notes text,
  last_inspection timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE hives ENABLE ROW LEVEL SECURITY;

-- Skapa inspections tabell
CREATE TABLE IF NOT EXISTS inspections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hive_id uuid REFERENCES hives(id) ON DELETE CASCADE,
  inspector_id uuid REFERENCES profiles(id),
  date date NOT NULL,
  time time,
  weather text,
  temperature numeric,
  duration text,
  brood_frames integer,
  total_frames integer,
  queen_seen boolean,
  temperament text,
  varroa_count numeric,
  varroa_days numeric,
  varroa_per_day numeric,
  varroa_level text,
  observations jsonb DEFAULT '[]',
  notes text,
  is_wintering boolean DEFAULT false,
  winter_feed numeric,
  is_varroa_treatment boolean DEFAULT false,
  treatment_type text,
  new_queen_added boolean DEFAULT false,
  new_queen_marked boolean,
  new_queen_color text,
  new_queen_wing_clipped boolean,
  rating integer DEFAULT 3 CHECK (rating >= 1 AND rating <= 5),
  findings jsonb DEFAULT '[]',
  ai_analysis jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE inspections ENABLE ROW LEVEL SECURITY;

-- Skapa tasks tabell
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  apiary_id uuid REFERENCES apiaries(id) ON DELETE CASCADE,
  hive_id uuid REFERENCES hives(id) ON DELETE SET NULL,
  creator_id uuid REFERENCES profiles(id),
  assigned_to uuid REFERENCES profiles(id),
  title text NOT NULL,
  description text,
  due_date date,
  due_time time,
  priority text DEFAULT 'medel' CHECK (priority IN ('låg', 'medel', 'hög')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  enable_reminder boolean DEFAULT true,
  notification_id text,
  completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- RLS Policies för profiles
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- RLS Policies för apiaries
CREATE POLICY "Members can read apiaries"
  ON apiaries
  FOR SELECT
  TO authenticated
  USING (
    id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners can update apiaries"
  ON apiaries
  FOR UPDATE
  TO authenticated
  USING (
    owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create apiaries"
  ON apiaries
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- RLS Policies för apiary_members
CREATE POLICY "Members can read apiary membership"
  ON apiary_members
  FOR SELECT
  TO authenticated
  USING (
    apiary_id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Owners can manage membership"
  ON apiary_members
  FOR ALL
  TO authenticated
  USING (
    apiary_id IN (
      SELECT id FROM apiaries 
      WHERE owner_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies för hives
CREATE POLICY "Members can read hives"
  ON hives
  FOR SELECT
  TO authenticated
  USING (
    apiary_id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can modify hives"
  ON hives
  FOR ALL
  TO authenticated
  USING (
    apiary_id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- RLS Policies för inspections
CREATE POLICY "Members can read inspections"
  ON inspections
  FOR SELECT
  TO authenticated
  USING (
    hive_id IN (
      SELECT id FROM hives 
      WHERE apiary_id IN (
        SELECT apiary_id FROM apiary_members 
        WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

CREATE POLICY "Members can create inspections"
  ON inspections
  FOR INSERT
  TO authenticated
  WITH CHECK (
    hive_id IN (
      SELECT id FROM hives 
      WHERE apiary_id IN (
        SELECT apiary_id FROM apiary_members 
        WHERE profile_id IN (
          SELECT id FROM profiles WHERE user_id = auth.uid()
        )
      )
    )
  );

-- RLS Policies för tasks
CREATE POLICY "Members can read tasks"
  ON tasks
  FOR SELECT
  TO authenticated
  USING (
    apiary_id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can create tasks"
  ON tasks
  FOR INSERT
  TO authenticated
  WITH CHECK (
    apiary_id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Members can update tasks"
  ON tasks
  FOR UPDATE
  TO authenticated
  USING (
    apiary_id IN (
      SELECT apiary_id FROM apiary_members 
      WHERE profile_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )
  );

-- Funktioner för att hantera profiler
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger för att skapa profil när ny användare registreras
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Funktion för att gå med i bigård via inbjudningskod
CREATE OR REPLACE FUNCTION join_apiary_by_invite_code(invite_code_param text)
RETURNS jsonb AS $$
DECLARE
  apiary_record apiaries%ROWTYPE;
  profile_record profiles%ROWTYPE;
  existing_member apiary_members%ROWTYPE;
BEGIN
  -- Hitta bigården
  SELECT * INTO apiary_record FROM apiaries WHERE invite_code = invite_code_param;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Ogiltig inbjudningskod');
  END IF;
  
  -- Hitta användarens profil
  SELECT * INTO profile_record FROM profiles WHERE user_id = auth.uid();
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Profil hittades inte');
  END IF;
  
  -- Kolla om användaren redan är medlem
  SELECT * INTO existing_member FROM apiary_members 
  WHERE apiary_id = apiary_record.id AND profile_id = profile_record.id;
  
  IF FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'Du är redan medlem i denna bigård');
  END IF;
  
  -- Lägg till som medlem
  INSERT INTO apiary_members (apiary_id, profile_id, role)
  VALUES (apiary_record.id, profile_record.id, 'member');
  
  RETURN jsonb_build_object(
    'success', true, 
    'apiary_name', apiary_record.name,
    'apiary_id', apiary_record.id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;