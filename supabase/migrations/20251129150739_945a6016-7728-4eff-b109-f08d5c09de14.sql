-- Agregar el campo codigo_usuario a la tabla usuarios
ALTER TABLE public.usuarios 
ADD COLUMN IF NOT EXISTS codigo_usuario VARCHAR(50);