-- Función para confirmar manualmente el email de un usuario
-- Solo puede ser ejecutada por gerentes y administradores de la misma empresa
CREATE OR REPLACE FUNCTION confirmar_email_usuario(usuario_id_input UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_user_id UUID;
  current_empresa_id UUID;
  target_empresa_id UUID;
  current_user_role TEXT;
  target_user_email TEXT;
  result JSON;
BEGIN
  -- Obtener el ID del usuario actual
  current_user_id := auth.uid();
  
  IF current_user_id IS NULL THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No autenticado'
    );
  END IF;

  -- Obtener el rol y empresa del usuario actual
  SELECT u.empresa_id, r.nombre INTO current_empresa_id, current_user_role
  FROM usuarios u
  LEFT JOIN roles r ON u.rol_id = r.id
  WHERE u.id = current_user_id;

  -- Verificar que el usuario actual sea gerente o administrador
  IF current_user_role NOT IN ('gerente', 'administrador') THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No tienes permisos para confirmar emails'
    );
  END IF;

  -- Obtener la empresa del usuario objetivo
  SELECT empresa_id, email INTO target_empresa_id, target_user_email
  FROM usuarios
  WHERE id = usuario_id_input;

  -- Verificar que pertenezcan a la misma empresa
  IF current_empresa_id != target_empresa_id THEN
    RETURN json_build_object(
      'success', false,
      'message', 'No puedes confirmar usuarios de otras empresas'
    );
  END IF;

  -- Confirmar el email en auth.users
  UPDATE auth.users
  SET email_confirmed_at = NOW(),
      confirmed_at = NOW()
  WHERE id = usuario_id_input;

  IF FOUND THEN
    RETURN json_build_object(
      'success', true,
      'message', 'Email confirmado exitosamente'
    );
  ELSE
    RETURN json_build_object(
      'success', false,
      'message', 'Usuario no encontrado en el sistema de autenticación'
    );
  END IF;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'message', 'Error al confirmar email: ' || SQLERRM
    );
END;
$$;