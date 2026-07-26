-- Corregir función get_conductor_email_by_placa para buscar por placa en lugar de licencia_numero
DROP FUNCTION IF EXISTS public.get_conductor_email_by_placa(text);

CREATE OR REPLACE FUNCTION public.get_conductor_email_by_placa(placa_input text)
RETURNS TABLE(email text, user_id uuid, conductor_id uuid, nombre text, apellido text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY 
  SELECT 
    u.email::TEXT,
    c.usuario_id,
    c.id as conductor_id,
    u.nombre,
    u.apellido
  FROM public.conductores c
  JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.placa = placa_input  -- Corregido: buscar por placa en lugar de licencia_numero
    AND c.activo = true
    AND u.activo = true
    AND u.email IS NOT NULL;
END;
$function$;