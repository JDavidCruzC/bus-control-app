import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type BusEnRuta = {
  id: string;
  nombre: string;
  placa?: string;
  latitud: number;
  longitud: number;
  velocidad: number;
  progreso: number; // 0-100
  rutaId: string;
  rutaCodigo: string;
  rutaNombre: string;
  activo: boolean;
  empresaId: string;
  empresaNombre?: string;
};

/**
 * Hook para gestionar buses circulando en rutas con simulación realista
 */
export function useBusesEnRuta(empresaId?: string) {
  const [buses, setBuses] = useState<BusEnRuta[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Inicializar buses simulados
  const inicializarBusesSimulados = async () => {
    try {
      // Obtener todas las rutas con geometría
      let query = supabase
        .from('rutas_geometria')
        .select(`
          id,
          ruta_id,
          geom,
          ruta:rutas (
            id,
            codigo,
            nombre,
            empresa_id,
            empresa:empresas (
              id,
              nombre
            )
          )
        `);

      const { data: rutasGeom, error } = await query;
      if (error) throw error;

      const nuevosBuses: BusEnRuta[] = [];

      for (const rutaGeom of rutasGeom || []) {
        if (!rutaGeom.ruta || !rutaGeom.geom) continue;

        // Filtrar por empresa si se especifica
        if (empresaId && rutaGeom.ruta.empresa_id !== empresaId) continue;

        // Parsear geometría
        let coordinates: [number, number][] = [];
        if (typeof rutaGeom.geom === 'object' && rutaGeom.geom && 'coordinates' in rutaGeom.geom) {
          coordinates = (rutaGeom.geom as any).coordinates;
        }

        if (coordinates.length < 2) continue;

        // Crear 2-3 buses por ruta para simular tráfico realista
        const numBuses = Math.floor(Math.random() * 2) + 2; // 2 o 3 buses
        
        for (let i = 0; i < numBuses; i++) {
          const progresoInicial = (i * 33) % 100; // Distribuir buses a lo largo de la ruta
          const posicionEnRuta = Math.floor((coordinates.length - 1) * (progresoInicial / 100));
          const coord = coordinates[posicionEnRuta];

          nuevosBuses.push({
            id: `sim_${rutaGeom.ruta_id}_${i}`,
            nombre: `Bus ${rutaGeom.ruta.codigo}-${i + 1}`,
            placa: `${rutaGeom.ruta.codigo}${String(i + 1).padStart(2, '0')}`,
            latitud: coord[1],
            longitud: coord[0],
            velocidad: 20 + Math.random() * 30, // 20-50 km/h
            progreso: progresoInicial,
            rutaId: rutaGeom.ruta_id,
            rutaCodigo: rutaGeom.ruta.codigo,
            rutaNombre: rutaGeom.ruta.nombre,
            activo: true,
            empresaId: rutaGeom.ruta.empresa_id || '',
            empresaNombre: rutaGeom.ruta.empresa?.nombre
          });
        }
      }

      setBuses(nuevosBuses);
      setLoading(false);
    } catch (error: any) {
      console.error('Error inicializando buses:', error);
      setLoading(false);
    }
  };

  // Simular movimiento de buses
  useEffect(() => {
    const interval = setInterval(async () => {
      // Obtener rutas con geometría
      const { data: rutasGeom } = await supabase
        .from('rutas_geometria')
        .select(`
          id,
          ruta_id,
          geom
        `);

      setBuses(prevBuses => 
        prevBuses.map(bus => {
          const rutaGeom = rutasGeom?.find(rg => rg.ruta_id === bus.rutaId);
          if (!rutaGeom || !rutaGeom.geom) return bus;

          let coordinates: [number, number][] = [];
          if (typeof rutaGeom.geom === 'object' && rutaGeom.geom && 'coordinates' in rutaGeom.geom) {
            coordinates = (rutaGeom.geom as any).coordinates;
          }

          if (coordinates.length < 2) return bus;

          // Incrementar progreso (velocidad variable)
          const incremento = (bus.velocidad / 60) * 0.5; // Ajustado para movimiento más lento
          let nuevoProgreso = (bus.progreso + incremento) % 100;

          // Calcular nueva posición en la ruta
          const posicionEnRuta = Math.floor((coordinates.length - 1) * (nuevoProgreso / 100));
          const coord = coordinates[Math.min(posicionEnRuta, coordinates.length - 1)];

          // Variar velocidad ligeramente
          const nuevaVelocidad = Math.max(10, Math.min(50, bus.velocidad + (Math.random() - 0.5) * 5));

          return {
            ...bus,
            latitud: coord[1],
            longitud: coord[0],
            progreso: nuevoProgreso,
            velocidad: nuevaVelocidad
          };
        })
      );
    }, 2000); // Actualizar cada 2 segundos

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    inicializarBusesSimulados();
  }, [empresaId]);

  return {
    buses,
    loading,
    refetch: inicializarBusesSimulados
  };
}
