DO $$
DECLARE sa uuid := 'e17f1058-703d-407c-aaa0-a15a01cfbcda';
BEGIN
  -- Datos operativos de prueba
  DELETE FROM public.desvios;
  DELETE FROM public.recorridos;
  DELETE FROM public.reportes;
  DELETE FROM public.ubicaciones_tiempo_real;
  DELETE FROM public.viajes;
  DELETE FROM public.buses_simulados;
  DELETE FROM public.conductores;
  DELETE FROM public.rutas_paraderos;
  DELETE FROM public.rutas_geometria;
  DELETE FROM public.rutas_publicas;
  UPDATE public.vehiculos SET ruta_id = NULL WHERE ruta_id IS NOT NULL;
  UPDATE public.usuarios SET linea_id = NULL WHERE linea_id IS NOT NULL;
  DELETE FROM public.rutas WHERE id IS NOT NULL;

  -- Usuarios (excepto super admin)
  DELETE FROM public.audit_logs WHERE user_id IS DISTINCT FROM sa;
  DELETE FROM public.rate_limits WHERE user_id IS DISTINCT FROM sa;
  DELETE FROM public.clientes WHERE id IS NOT NULL;
  DELETE FROM public.usuarios WHERE id <> sa;
  DELETE FROM auth.users WHERE id <> sa;

  -- Empresas sin acceso (membresía vencida/suspendida)
  DELETE FROM public.pagos WHERE empresa_id IN (SELECT id FROM public.empresas WHERE coalesce(estado_membresia,'') <> 'activa');
  DELETE FROM public.membresias WHERE empresa_id IN (SELECT id FROM public.empresas WHERE coalesce(estado_membresia,'') <> 'activa');
  DELETE FROM public.paraderos WHERE empresa_id IN (SELECT id FROM public.empresas WHERE coalesce(estado_membresia,'') <> 'activa');
  DELETE FROM public.vehiculos WHERE empresa_id IN (SELECT id FROM public.empresas WHERE coalesce(estado_membresia,'') <> 'activa');
  DELETE FROM public.configuraciones WHERE empresa_id IN (SELECT id FROM public.empresas WHERE coalesce(estado_membresia,'') <> 'activa');
  DELETE FROM public.empresas WHERE coalesce(estado_membresia,'') <> 'activa';
END $$;

-- Seguridad
CREATE POLICY "Publico puede ver geometrias de rutas publicadas" ON public.rutas_geometria
  FOR SELECT USING (EXISTS (SELECT 1 FROM public.rutas_publicas rp WHERE rp.ruta_id = rutas_geometria.ruta_id AND rp.visible_publico = true));
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas_geometria ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.paraderos ENABLE ROW LEVEL SECURITY;