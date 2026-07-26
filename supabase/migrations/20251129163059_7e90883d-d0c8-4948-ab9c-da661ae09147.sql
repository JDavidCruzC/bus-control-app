-- Arreglar función de confirmación de email
-- No podemos actualizar confirmed_at a DEFAULT, debemos usar now()
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
  result_message TEXT;
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

  -- Actualizar el estado de confirmación en auth.users usando now() en lugar de DEFAULT
  UPDATE auth.users
  SET 
    email_confirmed_at = COALESCE(email_confirmed_at, now()),
    confirmed_at = COALESCE(confirmed_at, now())
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