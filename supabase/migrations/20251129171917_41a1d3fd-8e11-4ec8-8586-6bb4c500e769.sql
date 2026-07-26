-- Resetear la contraseña del Super Admin a "SuperAdmin2025!"
-- Usando crypt para hashear la contraseña correctamente
UPDATE auth.users
SET 
  encrypted_password = crypt('SuperAdmin2025!', gen_salt('bf')),
  updated_at = now()
WHERE email = 'superadmin@sistema.com';