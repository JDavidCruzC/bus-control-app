-- Arreglar función de confirmación de email
-- Solo actualizar email_confirmed_at, NO tocar confirmed_at (es columna generada)
CREATE OR REPLACE FUNCTION confirmar_email_usuario(usuario_id_input UUID)
RETURNS JSON
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
  requesting_user_empresa_id UUID;
  target_user_empresa_id UUID;
  requesting_user_role TEXT;
BEGIN
  -- Obtener empresa_id y rol del usuario que hace la solicitud
  SELECT u.empresa_id, r.nombre INTO requesting_user_empresa_id, requesting_user_role
  FROM usuarios u
  LEFT JOIN roles r ON u.rol_id = r.id
  WHERE u.id = auth.uid();

  -- Verificar que el usuario que solicita sea gerente o administrador
  IF requesting_user_role NOT IN ('gerente', 'administrador') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Solo gerentes y administradores pueden confirmar emails'
    );
  END IF;

  -- Obtener empresa_id del usuario objetivo
  SELECT u.empresa_id INTO target_user_empresa_id
  FROM usuarios u
  WHERE u.id = usuario_id_input;

  -- Verificar que ambos usuarios pertenezcan a la misma empresa
  IF requesting_user_empresa_id IS NULL OR 
     target_user_empresa_id IS NULL OR 
     requesting_user_empresa_id != target_user_empresa_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No tienes permiso para confirmar el email de este usuario'
    );
  END IF;

  -- SOLO actualizar email_confirmed_at, NO tocar confirmed_at
  UPDATE auth.users
  SET email_confirmed_at = COALESCE(email_confirmed_at, now())
  WHERE id = usuario_id_input;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Email confirmado exitosamente'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'No se encontró el usuario'
    );
  END IF;
END;
$$;

-- Verificar si existe el super admin en auth.users
-- Si no existe, crearlo
DO $$
DECLARE
  super_admin_id UUID;
BEGIN
  -- Buscar si ya existe el super admin
  SELECT id INTO super_admin_id
  FROM auth.users
  WHERE email = 'superadmin@sistema.com';

  -- Si no existe, crearlo
  IF super_admin_id IS NULL THEN
    -- Crear el usuario en auth.users
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      recovery_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      confirmation_token,
      email_change,
      email_change_token_new,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@sistema.com',
      crypt('SuperAdmin2025!', gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{}',
      now(),
      now(),
      '',
      '',
      '',
      ''
    )
    RETURNING id INTO super_admin_id;

    -- Crear identidad en auth.identities
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    )
    VALUES (
      gen_random_uuid(),
      super_admin_id,
      super_admin_id::text,
      format('{"sub":"%s","email":"superadmin@sistema.com"}', super_admin_id)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    RAISE NOTICE 'Super Admin creado con ID: %', super_admin_id;
  ELSE
    RAISE NOTICE 'Super Admin ya existe con ID: %', super_admin_id;
  END IF;
END $$;