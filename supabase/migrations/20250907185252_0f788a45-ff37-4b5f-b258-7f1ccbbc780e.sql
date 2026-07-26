-- Delete the existing admin user and recreate properly
DELETE FROM auth.users WHERE email = 'admin@sistema.com';
DELETE FROM public.usuarios WHERE email = 'admin@sistema.com';