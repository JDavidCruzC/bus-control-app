-- Actualizar la contraseña del Super Admin usando el método correcto
UPDATE auth.users
SET encrypted_password = crypt('SuperAdmin2025!', gen_salt('bf', 10))
WHERE email = 'superadmin@sistema.com';