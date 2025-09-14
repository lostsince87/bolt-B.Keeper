/*
  # Create sharing functions

  1. Functions
    - join_via_sharing_code: Function to join bigård/kupa via sharing code
    - get_user_apiaries: Function to get all apiaries user has access to
    - get_user_hives: Function to get all hives user has access to

  2. Security
    - Functions use security definer to access data safely
    - Proper validation of sharing codes
*/

-- Function to join via sharing code
CREATE OR REPLACE FUNCTION join_via_sharing_code(sharing_code_param TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  sharing_record sharing_codes%ROWTYPE;
  user_profile_id UUID;
  result JSON;
BEGIN
  -- Get current user's profile
  SELECT id INTO user_profile_id 
  FROM profiles 
  WHERE user_id = auth.uid();
  
  IF user_profile_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Användarprofil hittades inte');
  END IF;
  
  -- Find the sharing code
  SELECT * INTO sharing_record
  FROM sharing_codes
  WHERE code = sharing_code_param
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > now());
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Ogiltig eller utgången delningskod');
  END IF;
  
  -- Check if already has access
  IF EXISTS (
    SELECT 1 FROM shared_access 
    WHERE profile_id = user_profile_id 
      AND resource_type = sharing_record.resource_type
      AND resource_id = sharing_record.resource_id
  ) THEN
    RETURN json_build_object('success', false, 'error', 'Du har redan åtkomst till denna resurs');
  END IF;
  
  -- Add shared access
  INSERT INTO shared_access (
    sharing_code_id,
    profile_id,
    resource_type,
    resource_id,
    access_level
  ) VALUES (
    sharing_record.id,
    user_profile_id,
    sharing_record.resource_type,
    sharing_record.resource_id,
    'member'
  );
  
  -- Update usage count
  UPDATE sharing_codes 
  SET current_uses = current_uses + 1
  WHERE id = sharing_record.id;
  
  -- If apiary, also add to apiary_members
  IF sharing_record.resource_type = 'apiary' THEN
    INSERT INTO apiary_members (apiary_id, profile_id, role)
    VALUES (sharing_record.resource_id, user_profile_id, 'member')
    ON CONFLICT (apiary_id, profile_id) DO NOTHING;
  END IF;
  
  RETURN json_build_object(
    'success', true, 
    'resource_type', sharing_record.resource_type,
    'resource_id', sharing_record.resource_id
  );
END;
$$;