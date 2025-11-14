-- Habilitar extensión PostGIS para manejo de geometrías
CREATE EXTENSION IF NOT EXISTS postgis;

-- Tabla para almacenar las geometrías de las rutas (trazado completo)
CREATE TABLE IF NOT EXISTS public.rutas_geometria (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES public.rutas(id) ON DELETE CASCADE,
  geom GEOMETRY(LINESTRING, 4326) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ruta_id)
);

-- Tabla para registrar cada recorrido realizado por un bus
CREATE TABLE IF NOT EXISTS public.recorridos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES public.rutas(id) ON DELETE CASCADE,
  vehiculo_id UUID NOT NULL REFERENCES public.vehiculos(id) ON DELETE CASCADE,
  conductor_id UUID NOT NULL REFERENCES public.conductores(id) ON DELETE CASCADE,
  viaje_id UUID REFERENCES public.viajes(id) ON DELETE SET NULL,
  geom_recorrido GEOMETRY(LINESTRING, 4326), -- Trazado real del recorrido
  fecha_inicio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  fecha_fin TIMESTAMP WITH TIME ZONE,
  estado VARCHAR(50) DEFAULT 'en_progreso', -- en_progreso, completado, interrumpido
  paraderos_visitados JSONB DEFAULT '[]'::jsonb, -- Array de paradero_id con timestamp
  distancia_recorrida_km NUMERIC(10, 2),
  tiene_desvio BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para registrar desvíos con evidencia multimedia
CREATE TABLE IF NOT EXISTS public.desvios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recorrido_id UUID NOT NULL REFERENCES public.recorridos(id) ON DELETE CASCADE,
  conductor_id UUID NOT NULL REFERENCES public.conductores(id) ON DELETE CASCADE,
  latitud NUMERIC(10, 8) NOT NULL,
  longitud NUMERIC(11, 8) NOT NULL,
  motivo TEXT NOT NULL,
  descripcion_detallada TEXT,
  evidencia_url TEXT[], -- Array de URLs a fotos/videos en storage
  estado_validacion VARCHAR(50) DEFAULT 'pendiente', -- pendiente, aprobado, rechazado
  validado_por UUID REFERENCES public.usuarios(id) ON DELETE SET NULL,
  fecha_validacion TIMESTAMP WITH TIME ZONE,
  comentarios_validacion TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabla para simular buses en circulación
CREATE TABLE IF NOT EXISTS public.buses_simulados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ruta_id UUID NOT NULL REFERENCES public.rutas(id) ON DELETE CASCADE,
  vehiculo_id UUID REFERENCES public.vehiculos(id) ON DELETE SET NULL,
  nombre_simulado VARCHAR(100) NOT NULL, -- Para fines de demostración
  latitud_actual NUMERIC(10, 8) NOT NULL,
  longitud_actual NUMERIC(11, 8) NOT NULL,
  velocidad_actual NUMERIC(5, 2) DEFAULT 0,
  progreso_ruta NUMERIC(5, 2) DEFAULT 0, -- Porcentaje de 0 a 100
  proximo_paradero_id UUID REFERENCES public.paraderos(id) ON DELETE SET NULL,
  tiempo_estimado_llegada INTEGER, -- minutos
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_rutas_geometria_ruta ON public.rutas_geometria(ruta_id);
CREATE INDEX IF NOT EXISTS idx_rutas_geometria_geom ON public.rutas_geometria USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_recorridos_ruta ON public.recorridos(ruta_id);
CREATE INDEX IF NOT EXISTS idx_recorridos_vehiculo ON public.recorridos(vehiculo_id);
CREATE INDEX IF NOT EXISTS idx_recorridos_conductor ON public.recorridos(conductor_id);
CREATE INDEX IF NOT EXISTS idx_recorridos_estado ON public.recorridos(estado);
CREATE INDEX IF NOT EXISTS idx_recorridos_geom ON public.recorridos USING GIST(geom_recorrido);
CREATE INDEX IF NOT EXISTS idx_desvios_recorrido ON public.desvios(recorrido_id);
CREATE INDEX IF NOT EXISTS idx_desvios_conductor ON public.desvios(conductor_id);
CREATE INDEX IF NOT EXISTS idx_desvios_estado ON public.desvios(estado_validacion);
CREATE INDEX IF NOT EXISTS idx_buses_simulados_ruta ON public.buses_simulados(ruta_id);
CREATE INDEX IF NOT EXISTS idx_buses_simulados_activo ON public.buses_simulados(activo);

-- Triggers para updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_rutas_geometria_updated_at BEFORE UPDATE ON public.rutas_geometria
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recorridos_updated_at BEFORE UPDATE ON public.recorridos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_desvios_updated_at BEFORE UPDATE ON public.desvios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_buses_simulados_updated_at BEFORE UPDATE ON public.buses_simulados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies para rutas_geometria
ALTER TABLE public.rutas_geometria ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver geometrías de rutas de su empresa"
  ON public.rutas_geometria FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rutas r
      WHERE r.id = rutas_geometria.ruta_id
      AND r.empresa_id = get_current_user_empresa_id()
    )
  );

CREATE POLICY "Administradores pueden gestionar geometrías de rutas"
  ON public.rutas_geometria FOR ALL
  USING (
    get_current_user_role() = 'administrador' AND
    EXISTS (
      SELECT 1 FROM public.rutas r
      WHERE r.id = rutas_geometria.ruta_id
      AND r.empresa_id = get_current_user_empresa_id()
    )
  );

-- RLS Policies para recorridos
ALTER TABLE public.recorridos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administradores pueden ver recorridos de su empresa"
  ON public.recorridos FOR SELECT
  USING (
    get_current_user_role() = 'administrador' AND
    EXISTS (
      SELECT 1 FROM public.vehiculos v
      WHERE v.id = recorridos.vehiculo_id
      AND v.empresa_id = get_current_user_empresa_id()
    )
  );

CREATE POLICY "Conductores pueden ver sus propios recorridos"
  ON public.recorridos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = recorridos.conductor_id
      AND c.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Conductores pueden crear recorridos"
  ON public.recorridos FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = recorridos.conductor_id
      AND c.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Conductores pueden actualizar sus propios recorridos"
  ON public.recorridos FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = recorridos.conductor_id
      AND c.usuario_id = auth.uid()
    )
  );

-- RLS Policies para desvios
ALTER TABLE public.desvios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Administradores pueden ver desvíos de su empresa"
  ON public.desvios FOR SELECT
  USING (
    get_current_user_role() = 'administrador' AND
    EXISTS (
      SELECT 1 FROM public.recorridos r
      JOIN public.vehiculos v ON v.id = r.vehiculo_id
      WHERE r.id = desvios.recorrido_id
      AND v.empresa_id = get_current_user_empresa_id()
    )
  );

CREATE POLICY "Conductores pueden ver sus propios desvíos"
  ON public.desvios FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = desvios.conductor_id
      AND c.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Conductores pueden registrar desvíos"
  ON public.desvios FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.conductores c
      WHERE c.id = desvios.conductor_id
      AND c.usuario_id = auth.uid()
    )
  );

CREATE POLICY "Administradores pueden validar desvíos"
  ON public.desvios FOR UPDATE
  USING (
    get_current_user_role() = 'administrador' AND
    EXISTS (
      SELECT 1 FROM public.recorridos r
      JOIN public.vehiculos v ON v.id = r.vehiculo_id
      WHERE r.id = desvios.recorrido_id
      AND v.empresa_id = get_current_user_empresa_id()
    )
  );

-- RLS Policies para buses_simulados
ALTER TABLE public.buses_simulados ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuarios autenticados pueden ver buses simulados de su empresa"
  ON public.buses_simulados FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.rutas r
      WHERE r.id = buses_simulados.ruta_id
      AND r.empresa_id = get_current_user_empresa_id()
    )
  );

CREATE POLICY "Administradores pueden gestionar buses simulados"
  ON public.buses_simulados FOR ALL
  USING (
    get_current_user_role() = 'administrador' AND
    EXISTS (
      SELECT 1 FROM public.rutas r
      WHERE r.id = buses_simulados.ruta_id
      AND r.empresa_id = get_current_user_empresa_id()
    )
  );

-- Crear bucket de storage para evidencias de desvíos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('desvios-evidencia', 'desvios-evidencia', false)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage para evidencias
CREATE POLICY "Conductores pueden subir evidencias"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'desvios-evidencia' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Usuarios autenticados pueden ver evidencias de su empresa"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'desvios-evidencia' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Conductores pueden actualizar sus evidencias"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'desvios-evidencia' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "Administradores pueden eliminar evidencias"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'desvios-evidencia' AND
  get_current_user_role() = 'administrador'
);