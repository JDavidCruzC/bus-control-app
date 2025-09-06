-- Create main company and admin role
-- First, create a default company if it doesn't exist
INSERT INTO public.empresas (nombre, ruc, direccion, telefono, email, activo)
SELECT 'Empresa Principal', '1234567890001', 'Dirección Principal', '0999999999', 'admin@empresa.com', true
WHERE NOT EXISTS (SELECT 1 FROM public.empresas WHERE nombre = 'Empresa Principal');

-- Create admin role if it doesn't exist  
INSERT INTO public.roles (nombre, descripcion, permisos)
SELECT 'administrador', 'Administrador del sistema con acceso completo', '{"all": true}'::jsonb
WHERE NOT EXISTS (SELECT 1 FROM public.roles WHERE nombre = 'administrador');

-- Create a function to setup admin user after auth signup
CREATE OR REPLACE FUNCTION public.setup_admin_user(user_id_param uuid, email_param text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    empresa_id_var uuid;
    rol_id_var uuid;
BEGIN
    -- Get empresa and role IDs
    SELECT id INTO empresa_id_var FROM public.empresas WHERE nombre = 'Empresa Principal' LIMIT 1;
    SELECT id INTO rol_id_var FROM public.roles WHERE nombre = 'administrador' LIMIT 1;
    
    -- Insert admin user in usuarios table
    INSERT INTO public.usuarios (
        id,
        email,
        nombre,
        apellido,
        empresa_id,
        rol_id,
        activo
    ) VALUES (
        user_id_param,
        email_param,
        'Administrador',
        'Principal',
        empresa_id_var,
        rol_id_var,
        true
    ) ON CONFLICT (id) DO NOTHING;
END;
$$;