-- Actualizar con contraseña temporal más simple
UPDATE auth.users
SET encrypted_password = crypt('admin123', gen_salt('bf', 10))
WHERE email = 'superadmin@sistema.com';