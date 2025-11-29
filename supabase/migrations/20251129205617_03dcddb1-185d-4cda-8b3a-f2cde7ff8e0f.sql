-- Add linea_id column to usuarios table
-- This allows all users (administrators, conductors, cobradores) to be assigned to a specific bus line
ALTER TABLE public.usuarios
ADD COLUMN linea_id uuid REFERENCES public.rutas(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX idx_usuarios_linea_id ON public.usuarios(linea_id);

-- Add comment
COMMENT ON COLUMN public.usuarios.linea_id IS 'Línea de bus a la que pertenece el usuario (aplica a todos los roles)';