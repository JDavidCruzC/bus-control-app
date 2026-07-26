-- Función para obtener email por código de usuario
CREATE OR REPLACE FUNCTION public.get_usuario_email_by_codigo(codigo_input VARCHAR)
RETURNS TABLE (
  user_id UUID,
  email VARCHAR,
  nombre VARCHAR,
  apellido VARCHAR
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id as user_id,
    u.email::VARCHAR,
    u.nombre::VARCHAR,
    u.apellido::VARCHAR
  FROM usuarios u
  WHERE u.codigo_usuario = codigo_input
    AND u.activo = true
  LIMIT 1;
END;
$$;