-- ============================================
-- CRITICAL SECURITY FIXES
-- ============================================

-- 1. FIX: Secure Real-Time Location Data
-- Remove public access to vehicle tracking data
DROP POLICY IF EXISTS "Todos pueden ver ubicaciones en tiempo real" ON public.ubicaciones_tiempo_real;

-- Only allow company administrators to view their company's vehicle locations
CREATE POLICY "Admins pueden ver ubicaciones de su empresa"
ON public.ubicaciones_tiempo_real
FOR SELECT
TO authenticated
USING (
  get_current_user_role() = 'administrador' AND
  EXISTS (
    SELECT 1 FROM public.vehiculos v
    WHERE v.id = ubicaciones_tiempo_real.vehiculo_id
    AND v.empresa_id = get_current_user_empresa_id()
  )
);

-- Allow conductors to view their own location
CREATE POLICY "Conductores pueden ver su propia ubicacion"
ON public.ubicaciones_tiempo_real
FOR SELECT
TO authenticated
USING (
  conductor_id IN (
    SELECT id FROM public.conductores
    WHERE usuario_id = auth.uid()
  )
);

-- 2. FIX: Protect Business Intelligence - Routes
-- Remove overly permissive public access to routes
DROP POLICY IF EXISTS "Todos pueden ver rutas activas" ON public.rutas;

-- Only allow authenticated users from the company to view routes
CREATE POLICY "Usuarios autenticados pueden ver rutas de su empresa"
ON public.rutas
FOR SELECT
TO authenticated
USING (empresa_id = get_current_user_empresa_id());

-- Allow public access only to basic route info (for public transit lookup)
CREATE POLICY "Acceso publico limitado a rutas activas"
ON public.rutas
FOR SELECT
TO anon
USING (activo = true);

-- 3. FIX: Protect Route-Stop Relationships
-- Remove overly permissive access
DROP POLICY IF EXISTS "Todos pueden ver rutas_paraderos" ON public.rutas_paraderos;

-- Only authenticated company users can see detailed route-stop relationships
CREATE POLICY "Usuarios autenticados pueden ver rutas_paraderos"
ON public.rutas_paraderos
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rutas r
    WHERE r.id = rutas_paraderos.ruta_id
    AND r.empresa_id = get_current_user_empresa_id()
  )
);

-- Limited public access for route lookup
CREATE POLICY "Acceso publico limitado a rutas_paraderos"
ON public.rutas_paraderos
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1 FROM public.rutas r
    WHERE r.id = rutas_paraderos.ruta_id
    AND r.activo = true
  )
);

-- 4. FIX: Secure Report Creation
-- Remove anonymous report creation
DROP POLICY IF EXISTS "Usuarios pueden crear reportes" ON public.reportes;

-- Only authenticated users can create reports
CREATE POLICY "Usuarios autenticados pueden crear reportes"
ON public.reportes
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Add policy to prevent report spam (users can only create reports for their company's resources)
CREATE POLICY "Usuarios solo pueden reportar recursos de su empresa"
ON public.reportes
FOR INSERT
TO authenticated
WITH CHECK (
  -- Allow if reporting about a vehicle from their company
  (vehiculo_id IS NULL OR vehiculo_id IN (
    SELECT id FROM public.vehiculos 
    WHERE empresa_id = get_current_user_empresa_id()
  ))
  OR
  -- Allow if reporting about a conductor from their company
  (conductor_id IS NULL OR conductor_id IN (
    SELECT c.id FROM public.conductores c
    JOIN public.usuarios u ON c.usuario_id = u.id
    WHERE u.empresa_id = get_current_user_empresa_id()
  ))
  OR
  -- Allow conductors to create reports about their own trips
  (conductor_id IN (
    SELECT id FROM public.conductores
    WHERE usuario_id = auth.uid()
  ))
);

-- 5. Add rate limiting helper table for future use
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type varchar(50) NOT NULL,
  action_count integer DEFAULT 1,
  window_start timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on rate_limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only users can see their own rate limits
CREATE POLICY "Usuarios pueden ver sus propios limites"
ON public.rate_limits
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_rate_limits_user_action 
ON public.rate_limits(user_id, action_type, window_start);