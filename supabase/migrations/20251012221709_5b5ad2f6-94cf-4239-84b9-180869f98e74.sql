-- Add empresa_id to paraderos table
ALTER TABLE public.paraderos 
ADD COLUMN empresa_id UUID REFERENCES public.empresas(id);

-- Update existing paraderos to belong to the first empresa (for backward compatibility)
UPDATE public.paraderos 
SET empresa_id = (SELECT id FROM public.empresas LIMIT 1)
WHERE empresa_id IS NULL;

-- Make empresa_id NOT NULL after setting values
ALTER TABLE public.paraderos 
ALTER COLUMN empresa_id SET NOT NULL;

-- Drop old RLS policies
DROP POLICY IF EXISTS "Administradores pueden gestionar paraderos" ON public.paraderos;
DROP POLICY IF EXISTS "Todos pueden ver paraderos activos" ON public.paraderos;

-- Create new RLS policies
CREATE POLICY "Administradores pueden gestionar paraderos de su empresa"
ON public.paraderos
FOR ALL
USING (
  get_current_user_role() = 'administrador' 
  AND empresa_id = get_current_user_empresa_id()
);

CREATE POLICY "Usuarios pueden ver paraderos de su empresa"
ON public.paraderos
FOR SELECT
USING (empresa_id = get_current_user_empresa_id());

CREATE POLICY "Acceso publico a paraderos activos"
ON public.paraderos
FOR SELECT
USING (activo = true);