-- Desactivar RLS en todas las tablas
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.buses_simulados DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.conductores DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuraciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.desvios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.empresas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.membresias DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.paraderos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.recorridos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reportes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas_geometria DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas_paraderos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rutas_publicas DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ubicaciones_tiempo_real DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vehiculos DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.viajes DISABLE ROW LEVEL SECURITY;

-- Función para crear buses simulados automáticamente cuando se crea una ruta
CREATE OR REPLACE FUNCTION create_simulated_buses_for_route()
RETURNS TRIGGER AS $$
DECLARE
  vehiculo RECORD;
  contador INTEGER := 0;
  total_vehiculos INTEGER;
BEGIN
  -- Contar vehículos activos de la empresa
  SELECT COUNT(*) INTO total_vehiculos 
  FROM vehiculos 
  WHERE empresa_id = NEW.empresa_id AND activo = true;

  -- Si hay vehículos, crear buses simulados (máximo 3 por ruta para no saturar)
  IF total_vehiculos > 0 THEN
    FOR vehiculo IN 
      SELECT * FROM vehiculos 
      WHERE empresa_id = NEW.empresa_id AND activo = true 
      LIMIT LEAST(total_vehiculos, 3)
    LOOP
      contador := contador + 1;
      
      -- Insertar bus simulado con posición inicial aleatoria en Ecuador (zona de Guayaquil)
      INSERT INTO buses_simulados (
        ruta_id,
        vehiculo_id,
        nombre_simulado,
        latitud_actual,
        longitud_actual,
        velocidad_actual,
        progreso_ruta,
        activo
      ) VALUES (
        NEW.id,
        vehiculo.id,
        'Bus ' || contador || ' - ' || vehiculo.placa,
        -2.17 + (RANDOM() - 0.5) * 0.2, -- Latitud alrededor de Guayaquil
        -79.92 + (RANDOM() - 0.5) * 0.2, -- Longitud alrededor de Guayaquil
        20 + RANDOM() * 40, -- Velocidad entre 20-60 km/h
        RANDOM() * 100, -- Progreso aleatorio
        true
      );
    END LOOP;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear trigger para ejecutar la función después de insertar una ruta
DROP TRIGGER IF EXISTS trigger_create_simulated_buses ON rutas;
CREATE TRIGGER trigger_create_simulated_buses
  AFTER INSERT ON rutas
  FOR EACH ROW
  EXECUTE FUNCTION create_simulated_buses_for_route();