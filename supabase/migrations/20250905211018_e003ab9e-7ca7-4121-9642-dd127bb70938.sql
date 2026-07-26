-- Crear tabla de clientes que se pueden registrar públicamente
CREATE TABLE public.clientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR NOT NULL UNIQUE,
  nombre VARCHAR NOT NULL,
  apellido VARCHAR,
  telefono VARCHAR,
  cedula VARCHAR,
  activo BOOLEAN DEFAULT true,
  fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT now(),
  ultimo_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS para clientes
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Política para que los clientes puedan ver y actualizar sus propios datos
CREATE POLICY "Clientes pueden ver sus propios datos" 
ON public.clientes 
FOR SELECT 
USING (id = auth.uid());

CREATE POLICY "Clientes pueden actualizar sus propios datos" 
ON public.clientes 
FOR UPDATE 
USING (id = auth.uid());

-- Política para permitir registro de nuevos clientes
CREATE POLICY "Permitir registro de nuevos clientes" 
ON public.clientes 
FOR INSERT 
WITH CHECK (id = auth.uid());

-- Los clientes pueden crear reportes (ya está permitido)
-- Los clientes pueden ver rutas, paraderos y ubicaciones (ya está permitido)

-- Trigger para actualizar updated_at en clientes
CREATE TRIGGER update_clientes_updated_at
BEFORE UPDATE ON public.clientes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para crear perfil de cliente automáticamente tras registro
CREATE OR REPLACE FUNCTION public.handle_new_client_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  -- Solo crear perfil de cliente si los metadatos indican que es un cliente
  IF NEW.raw_user_meta_data ->> 'user_type' = 'cliente' THEN
    INSERT INTO public.clientes (
      id, 
      email, 
      nombre, 
      apellido, 
      telefono, 
      cedula
    ) VALUES (
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data ->> 'nombre',
      NEW.raw_user_meta_data ->> 'apellido',
      NEW.raw_user_meta_data ->> 'telefono',
      NEW.raw_user_meta_data ->> 'cedula'
    );
  END IF;
  RETURN NEW;
END;
$$;

-- Trigger para crear perfil automático al registrarse
CREATE TRIGGER on_auth_user_created_client
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_new_client_user();