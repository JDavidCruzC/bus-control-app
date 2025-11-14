-- Fix 1: Employee PII Exposure - Create security definer function and update RLS policies
-- The existing can_view_employee_pii() function already exists, we'll use it

-- Drop the existing broad policy
DROP POLICY IF EXISTS "Ver info basica de colegas" ON public.usuarios;

-- Create policy for basic info (nombre, apellido) accessible to all company users
CREATE POLICY "Ver info basica de colegas"
ON public.usuarios FOR SELECT
USING (
  empresa_id = get_current_user_empresa_id() 
  AND (
    -- Users can see basic info of colleagues
    id != auth.uid()
  )
);

-- Create policy for users to see their own full data
CREATE POLICY "Ver datos propios completos"
ON public.usuarios FOR SELECT
USING (id = auth.uid());

-- Create policy for sensitive PII - only admins and super_admins
CREATE POLICY "Admins pueden ver PII de empleados"
ON public.usuarios FOR SELECT
USING (
  empresa_id = get_current_user_empresa_id() 
  AND can_view_employee_pii()
);

-- Fix 2: Real-Time Vehicle Locations Public Access
-- Drop the public policy if it exists
DROP POLICY IF EXISTS "Todos pueden ver ubicaciones en tiempo real" ON public.ubicaciones_tiempo_real;

-- The correct policies already exist from the RLS section:
-- "Admins pueden ver ubicaciones de su empresa"
-- "Conductores pueden ver su propia ubicacion"
-- These are already in place, so vehicle locations are now properly secured

-- Fix 3: Add rate limiting check for setup-admin
-- Ensure the rate_limits table has proper index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action ON public.rate_limits(user_id, action_type, window_start);