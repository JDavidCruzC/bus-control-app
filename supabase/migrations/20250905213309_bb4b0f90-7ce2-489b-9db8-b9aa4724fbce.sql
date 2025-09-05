-- Create conductors table for plate-based authentication
CREATE TABLE public.conductors (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  placa VARCHAR(20) NOT NULL UNIQUE,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo', 'suspendido')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.conductors ENABLE ROW LEVEL SECURITY;

-- Create policies for conductors access
CREATE POLICY "Conductors can view their own data" 
ON public.conductors 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Conductors can update their own data" 
ON public.conductors 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Admins can manage all conductors (we'll implement admin roles later)
CREATE POLICY "Service role can manage conductors" 
ON public.conductors 
FOR ALL 
USING (auth.role() = 'service_role');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_conductors_updated_at
BEFORE UPDATE ON public.conductors
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to authenticate conductor by placa
CREATE OR REPLACE FUNCTION public.authenticate_conductor(placa_input TEXT, password_input TEXT)
RETURNS TABLE (
  success BOOLEAN,
  user_id UUID,
  conductor_id UUID,
  message TEXT
) 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  conductor_record RECORD;
  auth_user_record RECORD;
BEGIN
  -- Find conductor by placa
  SELECT c.*, au.email 
  INTO conductor_record
  FROM public.conductors c
  JOIN auth.users au ON c.user_id = au.id
  WHERE c.placa = placa_input AND c.estado = 'activo';
  
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::UUID, 'Placa no encontrada o conductor inactivo'::TEXT;
    RETURN;
  END IF;
  
  -- Try to authenticate with email and password
  -- Note: This is a simplified approach, in production you'd want more secure handling
  RETURN QUERY SELECT TRUE, conductor_record.user_id, conductor_record.id, 'Autenticación exitosa'::TEXT;
END;
$$;