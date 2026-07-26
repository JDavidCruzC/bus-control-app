-- Create admin user directly in auth.users and usuarios table
DO $$
DECLARE
    admin_user_id uuid := gen_random_uuid();
    empresa_id_var uuid;
    rol_id_var uuid;
BEGIN
    -- Get empresa and role IDs
    SELECT id INTO empresa_id_var FROM public.empresas WHERE nombre = 'Empresa Principal' LIMIT 1;
    SELECT id INTO rol_id_var FROM public.roles WHERE nombre = 'administrador' LIMIT 1;
    
    -- Insert admin user in auth.users if not exists
    INSERT INTO auth.users (
        id,
        instance_id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        role,
        aud,
        confirmation_token,
        email_change_token_new,
        recovery_token,
        raw_app_meta_data,
        raw_user_meta_data,
        is_super_admin,
        last_sign_in_at,
        confirmation_sent_at,
        recovery_sent_at,
        email_change_token_current,
        email_change_confirm_status,
        banned_until,
        reauthentication_token,
        reauthentication_sent_at,
        is_sso_user,
        deleted_at
    ) 
    SELECT 
        admin_user_id,
        '00000000-0000-0000-0000-000000000000',
        'admin@sistema.com',
        crypt('admin123', gen_salt('bf')),
        now(),
        now(),
        now(),
        'authenticated',
        'authenticated',
        '',
        '',
        '',
        '{"provider": "email", "providers": ["email"]}',
        '{"user_type": "admin"}',
        false,
        now(),
        now(),
        now(),
        '',
        0,
        null,
        '',
        now(),
        false,
        null
    WHERE NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'admin@sistema.com');
    
    -- Get the actual user ID (in case it already existed)
    SELECT id INTO admin_user_id FROM auth.users WHERE email = 'admin@sistema.com' LIMIT 1;
    
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
        admin_user_id,
        'admin@sistema.com',
        'Administrador',
        'Principal',
        empresa_id_var,
        rol_id_var,
        true
    ) ON CONFLICT (id) DO NOTHING;
    
END $$;