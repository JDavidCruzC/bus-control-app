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
  const [rutasGeomCache, setRutasGeomCache] = useState<any[]>([]);
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

      // Guardar geometrías en cache
      setRutasGeomCache(rutasGeom || []);

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

        // Crear 3-4 buses por ruta para simular tráfico realista
        const numBuses = Math.floor(Math.random() * 2) + 3; // 3 o 4 buses
        
        for (let i = 0; i < numBuses; i++) {
          const progresoInicial = (i * 25) % 100; // Distribuir buses a lo largo de la ruta
          const posicionEnRuta = Math.floor((coordinates.length - 1) * (progresoInicial / 100));
          const coord = coordinates[posicionEnRuta];

          nuevosBuses.push({
            id: `sim_${rutaGeom.ruta_id}_${i}`,
            nombre: `Bus ${rutaGeom.ruta.codigo}-${i + 1}`,
            placa: `${rutaGeom.ruta.codigo}${String(i + 1).padStart(2, '0')}`,
            latitud: coord[1],
            longitud: coord[0],
            velocidad: 25 + Math.random() * 25, // 25-50 km/h
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

  // Simular movimiento de buses (optimizado sin queries)
  useEffect(() => {
    if (rutasGeomCache.length === 0) return;

    const interval = setInterval(() => {
      setBuses(prevBuses => 
        prevBuses.map(bus => {
          const rutaGeom = rutasGeomCache.find(rg => rg.ruta_id === bus.rutaId);
          if (!rutaGeom || !rutaGeom.geom) return bus;

          let coordinates: [number, number][] = [];
          if (typeof rutaGeom.geom === 'object' && rutaGeom.geom && 'coordinates' in rutaGeom.geom) {
            coordinates = (rutaGeom.geom as any).coordinates;
          }

          if (coordinates.length < 2) return bus;

          // Incrementar progreso suavemente
          const incremento = (bus.velocidad / 60) * 0.8; // Movimiento más visible
          let nuevoProgreso = (bus.progreso + incremento) % 100;

          // Calcular nueva posición en la ruta
          const posicionEnRuta = Math.floor((coordinates.length - 1) * (nuevoProgreso / 100));
          const coord = coordinates[Math.min(posicionEnRuta, coordinates.length - 1)];

          // Variar velocidad ligeramente para realismo
          const nuevaVelocidad = Math.max(20, Math.min(55, bus.velocidad + (Math.random() - 0.5) * 3));

          return {
            ...bus,
            latitud: coord[1],
            longitud: coord[0],
            progreso: nuevoProgreso,
            velocidad: nuevaVelocidad
          };
        })
      );
    }, 1500); // Actualizar cada 1.5 segundos para movimiento más fluido

    return () => clearInterval(interval);
  }, [rutasGeomCache]);

  useEffect(() => {
    inicializarBusesSimulados();
  }, [empresaId]);

  return {
    buses,
    loading,
    refetch: inicializarBusesSimulados
  };
}
