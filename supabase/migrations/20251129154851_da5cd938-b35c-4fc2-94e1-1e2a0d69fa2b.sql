-- Crear función para setup de super admin
CREATE OR REPLACE FUNCTION setup_super_admin()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_super_admin_role_id uuid;
  v_temp_password text := 'SuperAdmin2025!';
BEGIN
  -- Obtener el ID del rol super_admin
  SELECT id INTO v_super_admin_role_id
  FROM roles
  WHERE nombre = 'super_admin';

  -- Verificar si ya existe un super admin
  IF EXISTS (
    SELECT 1 FROM usuarios u
    WHERE u.rol_id = v_super_admin_role_id
  ) THEN
    RAISE NOTICE 'Super admin already exists';
    RETURN;
  END IF;

  -- Crear usuario en auth.users si no existe
  SELECT id INTO v_user_id
  FROM auth.users
  WHERE email = 'superadmin@sistema.com';

  IF v_user_id IS NULL THEN
    -- Crear usuario en auth
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      confirmation_token,
      recovery_token
    )
    VALUES (
      '00000000-0000-0000-0000-000000000000',
      gen_random_uuid(),
      'authenticated',
      'authenticated',
      'superadmin@sistema.com',
      crypt(v_temp_password, gen_salt('bf')),
      now(),
      now(),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"user_type":"super_admin"}',
      false,
      '',
      ''
    )
    RETURNING id INTO v_user_id;
  END IF;

  -- Crear registro en usuarios
  INSERT INTO usuarios (
    id,
    nombre,
    apellido,
    email,
    codigo_usuario,
    rol_id,
    activo,
    empresa_id
  )
  VALUES (
    v_user_id,
    'Super',
    'Administrador',
    'superadmin@sistema.com',
    'SUPERADMIN',
    v_super_admin_role_id,
    true,
    NULL
  )
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Super admin created successfully';
  RAISE NOTICE 'Email: superadmin@sistema.com';
  RAISE NOTICE 'Temporary Password: %', v_temp_password;
END;
$$;

-- Ejecutar la función para crear el super admin
SELECT setup_super_admin();