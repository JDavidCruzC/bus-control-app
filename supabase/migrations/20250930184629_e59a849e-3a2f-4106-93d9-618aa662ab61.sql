-- Agregar campo estado_membresia a empresas
ALTER TABLE public.empresas 
ADD COLUMN estado_membresia VARCHAR(20) DEFAULT 'activa' 
CHECK (estado_membresia IN ('activa', 'suspendida', 'vencida', 'prueba'));

ALTER TABLE public.empresas 
ADD COLUMN fecha_vencimiento_membresia TIMESTAMP WITH TIME ZONE;

ALTER TABLE public.empresas 
ADD COLUMN tipo_plan VARCHAR(50) DEFAULT 'basico';

-- Crear tabla de membresías
CREATE TABLE public.membresias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  tipo_plan VARCHAR(50) NOT NULL,
  precio DECIMAL(10,2) NOT NULL,
  fecha_inicio TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  fecha_fin TIMESTAMP WITH TIME ZONE NOT NULL,
  estado VARCHAR(20) DEFAULT 'activa' CHECK (estado IN ('activa', 'cancelada', 'vencida')),
  auto_renovacion BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Crear tabla de pagos
CREATE TABLE public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID REFERENCES public.empresas(id) ON DELETE CASCADE,
  membresia_id UUID REFERENCES public.membresias(id),
  monto DECIMAL(10,2) NOT NULL,
  metodo_pago VARCHAR(50),
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'completado', 'fallido', 'reembolsado')),
  fecha_pago TIMESTAMP WITH TIME ZONE,
  referencia_pago VARCHAR(255),
  descripcion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Agregar rol de super_admin
INSERT INTO public.roles (nombre, descripcion, permisos)
VALUES (
  'super_admin',
  'Super Administrador del Sistema',
  '{"manage_empresas": true, "manage_membresias": true, "view_all": true, "manage_users": true}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Habilitar RLS en nuevas tablas
ALTER TABLE public.membresias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para membresias
CREATE POLICY "Super admins pueden ver todas las membresias"
ON public.membresias FOR SELECT
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins pueden gestionar membresias"
ON public.membresias FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Admins pueden ver membresias de su empresa"
ON public.membresias FOR SELECT
USING (
  get_current_user_role() = 'administrador' 
  AND empresa_id = get_current_user_empresa_id()
);

-- Políticas RLS para pagos
CREATE POLICY "Super admins pueden ver todos los pagos"
ON public.pagos FOR SELECT
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins pueden gestionar pagos"
ON public.pagos FOR ALL
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Admins pueden ver pagos de su empresa"
ON public.pagos FOR SELECT
USING (
  get_current_user_role() = 'administrador' 
  AND empresa_id = get_current_user_empresa_id()
);

-- Actualizar políticas de empresas para super_admin
CREATE POLICY "Super admins pueden ver todas las empresas"
ON public.empresas FOR SELECT
USING (get_current_user_role() = 'super_admin');

CREATE POLICY "Super admins pueden gestionar todas las empresas"
ON public.empresas FOR ALL
USING (get_current_user_role() = 'super_admin');

-- Trigger para actualizar updated_at en membresias
CREATE TRIGGER update_membresias_updated_at
BEFORE UPDATE ON public.membresias
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para actualizar updated_at en pagos
CREATE TRIGGER update_pagos_updated_at
BEFORE UPDATE ON public.pagos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Función para verificar estado de membresía
CREATE OR REPLACE FUNCTION public.verificar_estado_membresia()
RETURNS TRIGGER AS $$
BEGIN
  -- Si la fecha de vencimiento pasó, actualizar estado
  IF NEW.fecha_vencimiento_membresia < now() THEN
    NEW.estado_membresia = 'vencida';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_membresia_estado
BEFORE INSERT OR UPDATE ON public.empresas
FOR EACH ROW
EXECUTE FUNCTION public.verificar_estado_membresia();