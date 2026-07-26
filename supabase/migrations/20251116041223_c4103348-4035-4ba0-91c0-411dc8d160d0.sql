-- Fix RLS policies for empresas table to allow registration

-- Drop existing INSERT policy if any
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON empresas;

-- Allow authenticated users to insert their company during registration
CREATE POLICY "Enable insert for authenticated users during registration"
ON empresas
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Ensure SELECT policy allows users to see their own empresa
DROP POLICY IF EXISTS "Users can view their own empresa" ON empresas;
CREATE POLICY "Users can view their own empresa"
ON empresas
FOR SELECT
TO authenticated
USING (
  id IN (
    SELECT empresa_id 
    FROM usuarios 
    WHERE id = auth.uid()
  )
);

-- Ensure UPDATE policy allows users to update their own empresa
DROP POLICY IF EXISTS "Users can update their own empresa" ON empresas;
CREATE POLICY "Users can update their own empresa"
ON empresas
FOR UPDATE
TO authenticated
USING (
  id IN (
    SELECT empresa_id 
    FROM usuarios 
    WHERE id = auth.uid()
  )
)
WITH CHECK (
  id IN (
    SELECT empresa_id 
    FROM usuarios 
    WHERE id = auth.uid()
  )
);

-- Fix usuarios table RLS to allow user creation during registration
DROP POLICY IF EXISTS "Enable insert for authenticated users during registration" ON usuarios;
CREATE POLICY "Enable insert for authenticated users during registration"
ON usuarios
FOR INSERT
TO authenticated
WITH CHECK (id = auth.uid());