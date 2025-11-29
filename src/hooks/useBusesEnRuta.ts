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

        // Crear 6-8 buses por ruta para simular tráfico realista
        const numBuses = Math.floor(Math.random() * 3) + 6; // 6, 7 u 8 buses
        
        for (let i = 0; i < numBuses; i++) {
          const progresoInicial = (i * (100 / numBuses)) % 100; // Distribuir buses uniformemente
          const posicionEnRuta = Math.floor((coordinates.length - 1) * (progresoInicial / 100));
          const coord = coordinates[posicionEnRuta];

          nuevosBuses.push({
            id: `sim_${rutaGeom.ruta_id}_${i}`,
            nombre: `Bus ${rutaGeom.ruta.codigo}-${i + 1}`,
            placa: `${rutaGeom.ruta.codigo}${String(i + 1).padStart(2, '0')}`,
            latitud: coord[1],
            longitud: coord[0],
            velocidad: 30 + Math.random() * 20, // 30-50 km/h
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

  // Simular movimiento de buses con interpolación suave
  useEffect(() => {
    if (rutasGeomCache.length === 0 || buses.length === 0) return;

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

          // Incremento muy pequeño para movimiento ultra suave (simulación km por km)
          // Velocidad en km/h convertida a porcentaje de ruta por segundo, con factor de suavizado
          const incrementoPorSegundo = (bus.velocidad / 3600) * 0.15; // Movimiento muy gradual
          let nuevoProgreso = (bus.progreso + incrementoPorSegundo) % 100;

          // Calcular posición exacta con interpolación entre puntos
          const posicionExacta = ((coordinates.length - 1) * nuevoProgreso) / 100;
          const indiceInferior = Math.floor(posicionExacta);
          const indiceSuperior = Math.min(indiceInferior + 1, coordinates.length - 1);
          const factor = posicionExacta - indiceInferior; // Factor de interpolación (0-1)

          // Interpolación lineal entre dos puntos consecutivos
          const coordInferior = coordinates[indiceInferior];
          const coordSuperior = coordinates[indiceSuperior];
          
          const longitudInterpolada = coordInferior[0] + (coordSuperior[0] - coordInferior[0]) * factor;
          const latitudInterpolada = coordInferior[1] + (coordSuperior[1] - coordInferior[1]) * factor;

          // Variar velocidad muy ligeramente para realismo
          const nuevaVelocidad = Math.max(30, Math.min(50, bus.velocidad + (Math.random() - 0.5) * 1));

          return {
            ...bus,
            latitud: latitudInterpolada,
            longitud: longitudInterpolada,
            progreso: nuevoProgreso,
            velocidad: nuevaVelocidad
          };
        })
      );
    }, 1000); // Actualizar cada 1 segundo para movimiento más fluido

    return () => clearInterval(interval);
  }, [rutasGeomCache, buses.length]);

  useEffect(() => {
    inicializarBusesSimulados();
  }, [empresaId]);

  return {
    buses,
    loading,
    refetch: inicializarBusesSimulados
  };
}
