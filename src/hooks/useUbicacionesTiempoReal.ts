import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UbicacionTiempoReal = {
  id: string;
  latitud: number;
  longitud: number;
  velocidad: number | null;
  timestamp_gps: string;
  conductor_id: string | null;
  vehiculo_id: string | null;
  conductor?: {
    placa: string;
    usuario: {
      nombre: string;
      apellido: string;
    };
  };
  vehiculo?: {
    placa: string;
    marca: string | null;
    modelo: string | null;
    empresa_id: string | null;
    empresa?: {
      id: string;
      nombre: string;
      logo_url: string | null;
    };
  };
};

export function useUbicacionesTiempoReal() {
  const [ubicaciones, setUbicaciones] = useState<UbicacionTiempoReal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUbicaciones = async () => {
    try {
      setError(null);

      // Obtener ubicaciones de las últimas 2 horas
      const dosHorasAtras = new Date();
      dosHorasAtras.setHours(dosHorasAtras.getHours() - 2);

      const { data, error: fetchError } = await supabase
        .from('ubicaciones_tiempo_real')
        .select(`
          id,
          latitud,
          longitud,
          velocidad,
          timestamp_gps,
          conductor_id,
          vehiculo_id
        `)
        .gte('timestamp_gps', dosHorasAtras.toISOString())
        .order('timestamp_gps', { ascending: false });

      if (fetchError) throw fetchError;

      // Obtener información adicional de conductores y vehículos
      if (data && data.length > 0) {
        const conductorIds = [...new Set(data.map(u => u.conductor_id).filter(Boolean))];
        const vehiculoIds = [...new Set(data.map(u => u.vehiculo_id).filter(Boolean))];

        // Obtener datos de conductores
        const { data: conductoresData } = await supabase
          .from('conductores')
          .select('id, placa, usuario:usuarios(nombre, apellido)')
          .in('id', conductorIds);

        // Obtener datos de vehículos con empresa
        const { data: vehiculosData } = await supabase
          .from('vehiculos')
          .select(`
            id, 
            placa, 
            marca, 
            modelo,
            empresa_id,
            empresa:empresas(
              id,
              nombre,
              logo_url
            )
          `)
          .in('id', vehiculoIds);

        // Combinar datos
        const ubicacionesConInfo = data.map(ubicacion => ({
          ...ubicacion,
          conductor: conductoresData?.find(c => c.id === ubicacion.conductor_id),
          vehiculo: vehiculosData?.find(v => v.id === ubicacion.vehiculo_id)
        }));

        setUbicaciones(ubicacionesConInfo);
      } else {
        setUbicaciones([]);
      }
    } catch (err: any) {
      setError(err.message || 'Error al cargar ubicaciones');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();

    // Actualizar cada 30 segundos
    const interval = setInterval(fetchUbicaciones, 30000);

    return () => clearInterval(interval);
  }, []);

  return {
    ubicaciones,
    loading,
    error,
    refetch: fetchUbicaciones
  };
}