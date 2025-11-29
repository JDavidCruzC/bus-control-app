-- Función para obtener el estado de confirmación de email desde auth.users
-- Solo accesible por gerentes y administradores de la misma empresa
CREATE OR REPLACE FUNCTION get_user_email_confirmation(user_id_input UUID)
RETURNS TABLE(email_confirmed BOOLEAN) 
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
    RAISE EXCEPTION 'Solo gerentes y administradores pueden consultar el estado de confirmación de email';
  END IF;

  -- Obtener empresa_id del usuario objetivo
  SELECT u.empresa_id INTO target_user_empresa_id
  FROM usuarios u
  WHERE u.id = user_id_input;

  -- Verificar que ambos usuarios pertenezcan a la misma empresa
  IF requesting_user_empresa_id IS NULL OR 
     target_user_empresa_id IS NULL OR 
     requesting_user_empresa_id != target_user_empresa_id THEN
    RAISE EXCEPTION 'No tienes permiso para consultar este usuario';
  END IF;

  -- Retornar el estado de confirmación desde auth.users
  RETURN QUERY
  SELECT (au.email_confirmed_at IS NOT NULL) AS email_confirmed
  FROM auth.users au
  WHERE au.id = user_id_input;
END;
$$;