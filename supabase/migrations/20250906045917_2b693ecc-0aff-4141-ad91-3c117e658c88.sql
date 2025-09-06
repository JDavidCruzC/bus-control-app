-- Create main admin user and company
-- First, create a default company
INSERT INTO public.empresas (id, nombre, ruc, direccion, telefono, email, activo)
VALUES (
  gen_random_uuid(),
  'Empresa Principal',
  '1234567890001',
  'Dirección Principal',
  '0999999999',
  'admin@empresa.com',
  true
) ON CONFLICT DO NOTHING;

-- Create admin role if it doesn't exist
INSERT INTO public.roles (id, nombre, descripcion, permisos)
VALUES (
  gen_random_uuid(),
  'administrador',
  'Administrador del sistema con acceso completo',
  '{"all": true}'::jsonb
) ON CONFLICT (nombre) DO NOTHING;

-- Insert admin user in auth.users (this creates the authentication record)
-- Email: admin@sistema.com
-- Password: admin123 (you should change this after first login)
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'admin@sistema.com',
  crypt('admin123', gen_salt('bf')),
  now(),
  now(),
  now(),
  '',
  '',
  '',
  '',
  'authenticated',
  'authenticated'
) ON CONFLICT (email) DO NOTHING;

-- Create admin user in usuarios table
INSERT INTO public.usuarios (
  id,
  email,
  nombre,
  apellido,
  empresa_id,
  rol_id,
  activo,
  created_at,
  updated_at
)
SELECT 
  au.id,
  'admin@sistema.com',
  'Administrador',
  'Principal',
  e.id,
  r.id,
  true,
  now(),
  now()
FROM auth.users au
CROSS JOIN public.empresas e 
CROSS JOIN public.roles r
WHERE au.email = 'admin@sistema.com'
  AND e.nombre = 'Empresa Principal'
  AND r.nombre = 'administrador'
  AND NOT EXISTS (
    SELECT 1 FROM public.usuarios u WHERE u.email = 'admin@sistema.com'
  );