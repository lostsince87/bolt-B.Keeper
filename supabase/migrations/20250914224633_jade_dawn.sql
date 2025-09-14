/*
  # Lägg till individuell delning för bigårdar och kupor

  1. Nya tabeller
    - `sharing_codes` - Unika delningskoder för bigårdar och kupor
    - `shared_access` - Spårar vem som har tillgång till vad

  2. Säkerhet
    - Enable RLS på alla nya tabeller
    - Policies för att hantera delning säkert

  3. Funktioner
    - Generera unika 8-siffriga koder
    - Hantera både bigård- och kupdelning
*/

-- Tabell för delningskoder
CREATE TABLE IF NOT EXISTS sharing_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL DEFAULT SUBSTRING((gen_random_uuid())::text FROM 1 FOR 8),
  resource_type text NOT NULL CHECK (resource_type IN ('apiary', 'hive')),
  resource_id uuid NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE CASCADE,
  expires_at timestamptz DEFAULT (now() + interval '30 days'),
  max_uses integer DEFAULT NULL,
  current_uses integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Tabell för delad åtkomst
CREATE TABLE IF NOT EXISTS shared_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sharing_code_id uuid REFERENCES sharing_codes(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  resource_type text NOT NULL,
  resource_id uuid NOT NULL,
  access_level text DEFAULT 'member' CHECK (access_level IN ('member', 'admin')),
  joined_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, resource_type, resource_id)
);

-- Enable RLS
ALTER TABLE sharing_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_access ENABLE ROW LEVEL SECURITY;

-- Policies för sharing_codes
CREATE POLICY "Users can create sharing codes for their resources"
  ON sharing_codes
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (resource_type = 'apiary' AND resource_id IN (
      SELECT id FROM apiaries WHERE owner_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    )) OR
    (resource_type = 'hive' AND resource_id IN (
      SELECT h.id FROM hives h
      JOIN apiaries a ON h.apiary_id = a.id
      WHERE a.owner_id IN (
        SELECT id FROM profiles WHERE user_id = auth.uid()
      )
    ))
  );

CREATE POLICY "Users can read sharing codes for their resources"
  ON sharing_codes
  FOR SELECT
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their sharing codes"
  ON sharing_codes
  FOR UPDATE
  TO authenticated
  USING (
    created_by IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Policies för shared_access
CREATE POLICY "Users can read their shared access"
  ON shared_access
  FOR SELECT
  TO authenticated
  USING (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert shared access via codes"
  ON shared_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    profile_id IN (
      SELECT id FROM profiles WHERE user_id = auth.uid()
    )
  );

-- Funktion för att gå med via delningskod
CREATE OR REPLACE FUNCTION join_via_sharing_code(sharing_code_param text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  code_record sharing_codes%ROWTYPE;
  user_profile_id uuid;
  result json;
BEGIN
  -- Hämta användarens profil
  SELECT id INTO user_profile_id
  FROM profiles
  WHERE user_id = auth.uid();

  IF user_profile_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Användarprofil hittades inte');
  END IF;

  -- Hitta delningskoden
  SELECT * INTO code_record
  FROM sharing_codes
  WHERE code = sharing_code_param
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now())
    AND (max_uses IS NULL OR current_uses < max_uses);

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ogiltig eller utgången delningskod');
  END IF;

  -- Kontrollera om användaren redan har åtkomst
  IF EXISTS (
    SELECT 1 FROM shared_access
    WHERE profile_id = user_profile_id
      AND resource_type = code_record.resource_type
      AND resource_id = code_record.resource_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Du har redan åtkomst till denna resurs');
  END IF;

  -- Lägg till åtkomst
  INSERT INTO shared_access (sharing_code_id, profile_id, resource_type, resource_id)
  VALUES (code_record.id, user_profile_id, code_record.resource_type, code_record.resource_id);

  -- Uppdatera användningsräknare
  UPDATE sharing_codes
  SET current_uses = current_uses + 1
  WHERE id = code_record.id;

  -- För bigårdar, lägg även till i apiary_members
  IF code_record.resource_type = 'apiary' THEN
    INSERT INTO apiary_members (apiary_id, profile_id, role)
    VALUES (code_record.resource_id, user_profile_id, 'member')
    ON CONFLICT (apiary_id, profile_id) DO NOTHING;
  END IF;

  RETURN json_build_object('success', true, 'resource_type', code_record.resource_type);
END;
$$;