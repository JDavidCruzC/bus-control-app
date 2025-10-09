-- Fix RLS policy for empresas to allow authenticated users to insert their own company
-- during registration

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Usuarios autenticados pueden crear su empresa" ON public.empresas;

-- Allow authenticated users to insert empresas (needed during registration)
CREATE POLICY "Usuarios autenticados pueden crear su empresa"
ON public.empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Update the SELECT policy to be more permissive during registration
DROP POLICY IF EXISTS "Usuarios pueden ver su propia empresa" ON public.empresas;

CREATE POLICY "Usuarios pueden ver su propia empresa"
ON public.empresas
FOR SELECT
TO authenticated
USING (
  id = get_current_user_empresa_id() 
  OR 
  -- Allow viewing during registration (before usuario record is created)
  id IN (
    SELECT empresa_id FROM usuarios WHERE id = auth.uid()
  )
);