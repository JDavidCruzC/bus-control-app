-- Reset SuperAdmin password
-- This updates the SuperAdmin user password to SuperAdmin2025!

-- First, ensure the user exists and get the ID
DO $$
DECLARE
  superadmin_id uuid;
BEGIN
  -- Get the superadmin user ID
  SELECT id INTO superadmin_id 
  FROM auth.users 
  WHERE email = 'superadmin@sistema.com';

  -- If user exists, update password using pgcrypto
  IF superadmin_id IS NOT NULL THEN
    -- Update the encrypted password
    -- Password: SuperAdmin2025!
    -- This uses Supabase's auth schema password hashing
    UPDATE auth.users
    SET 
      encrypted_password = crypt('SuperAdmin2025!', gen_salt('bf')),
      updated_at = now()
    WHERE id = superadmin_id;
    
    RAISE NOTICE 'SuperAdmin password updated successfully';
  ELSE
    RAISE NOTICE 'SuperAdmin user not found';
  END IF;
END $$;
