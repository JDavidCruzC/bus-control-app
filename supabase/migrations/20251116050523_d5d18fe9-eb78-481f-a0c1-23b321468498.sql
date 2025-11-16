-- Eliminar inconsistencias en la base de datos
-- Problema detectado: Hay dos tablas de conductores (conductores y conductors)

-- 1. Primero, migrar datos de conductors a conductores si existen registros
DO $$
DECLARE
  conductor_record RECORD;
BEGIN
  -- Migrar datos de conductors a conductores
  FOR conductor_record IN 
    SELECT * FROM public.conductors
  LOOP
    -- Insertar en conductores si no existe
    INSERT INTO public.conductores (
      id,
      usuario_id,
      licencia_numero,
      activo,
      created_at,
      updated_at
    )
    SELECT 
      conductor_record.id,
      conductor_record.user_id,
      conductor_record.placa, -- usar placa como licencia_numero temporalmente
      conductor_record.estado = 'activo',
      conductor_record.created_at,
      conductor_record.updated_at
    WHERE NOT EXISTS (
      SELECT 1 FROM public.conductores WHERE id = conductor_record.id
    );
  END LOOP;
END $$;

-- 2. Actualizar función authenticate_conductor para usar conductores en lugar de conductors
DROP FUNCTION IF EXISTS public.authenticate_conductor(text, text);
CREATE OR REPLACE FUNCTION public.authenticate_conductor(placa_input text, password_input text)
RETURNS TABLE(success boolean, user_id uuid, conductor_id uuid, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  conductor_record RECORD;
BEGIN
  -- Buscar conductor por número de licencia (que ahora almacena la placa)
  SELECT c.*, u.email, u.id as uid
  INTO conductor_record
  FROM public.conductores c
  JOIN public.usuarios u ON c.usuario_id = u.id
  WHERE c.licencia_numero = placa_input AND c.activo = true;
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Placa no encontrada o conductor inactivo'::TEXT;
    RETURN;
  END IF;
  
  RETURN QUERY SELECT TRUE, conductor_record.uid, conductor_record.id, 'Autenticación exitosa'::TEXT;
END;
$function$;

-- 3. Actualizar función get_conductor_email_by_placa para usar conductores
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
  WHERE c.licencia_numero = placa_input 
    AND c.activo = true
    AND u.email IS NOT NULL;
END;
$function$;

-- 4. Eliminar la tabla conductors
DROP TABLE IF EXISTS public.conductors CASCADE;

-- 5. Agregar columna placa a conductores si no existe para facilitar migración
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'conductores' AND column_name = 'placa'
  ) THEN
    ALTER TABLE public.conductores ADD COLUMN placa character varying;
    -- Copiar licencia_numero a placa para mantener consistencia
    UPDATE public.conductores SET placa = licencia_numero WHERE placa IS NULL;
  END IF;
END $$;