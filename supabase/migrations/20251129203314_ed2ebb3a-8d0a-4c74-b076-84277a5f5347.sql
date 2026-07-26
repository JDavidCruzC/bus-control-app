-- Corregir tipos de datos en función get_conductor_email_by_placa
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
    u.nombre::TEXT,  -- Convertir a TEXT
    u.apellido::TEXT  -- Convertir a TEXT
  FROM public.conductores c
  JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.placa = placa_input
    AND c.activo = true
    AND u.activo = true
    AND u.email IS NOT NULL;
END;
$function$;