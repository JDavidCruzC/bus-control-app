-- Create function to get email by placa for conductor authentication
CREATE OR REPLACE FUNCTION public.get_conductor_email_by_placa(placa_input TEXT)
RETURNS TABLE (
  email TEXT,
  user_id UUID,
  conductor_id UUID,
  nombre TEXT,
  apellido TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY 
  SELECT 
    au.email::TEXT,
    c.user_id,
    c.id as conductor_id,
    c.nombre,
    c.apellido
  FROM public.conductors c
  JOIN auth.users au ON c.user_id = au.id
  WHERE c.placa = placa_input 
    AND c.estado = 'activo'
    AND au.email IS NOT NULL;
END;
$$;