import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RutaPublica = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  distancia_km: number | null;
  tiempo_estimado_minutos: number | null;
  precio: number | null;
  empresa_id: string | null;
  empresa?: {
    id: string;
    nombre: string;
    logo_url: string | null;
    telefono: string | null;
  };
  paraderos: Array<{
    id: string;
    nombre: string;
    direccion: string | null;
    orden_secuencia: number;
    tiempo_llegada_estimado: string | null;
  }>;
};

export function useRutasPublicas(empresaId?: string | null) {
  const [rutas, setRutas] = useState<RutaPublica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRutas = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener rutas con sus paraderos y empresa
      let query = supabase
        .from('rutas')
        .select(`
          id,
          codigo,
          nombre,
          descripcion,
          distancia_km,
          tiempo_estimado_minutos,
          precio,
          empresa_id,
          empresa:empresas(
            id,
            nombre,
            logo_url,
            telefono
          )
        `)
        .eq('activo', true);

      // Filtrar por empresa si se proporciona
      if (empresaId) {
        query = query.eq('empresa_id', empresaId);
      }

      const { data: rutasData, error: rutasError } = await query.order('codigo');

      if (rutasError) throw rutasError;

      // Para cada ruta, obtener sus paraderos
      const rutasConParaderos = await Promise.all(
        (rutasData || []).map(async (ruta) => {
          const { data: paraderosData, error: paraderosError } = await supabase
            .from('rutas_paraderos')
            .select(`
              orden_secuencia,
              tiempo_llegada_estimado,
              paradero:paraderos(
                id,
                nombre,
                direccion
              )
            `)
            .eq('ruta_id', ruta.id)
            .order('orden_secuencia');

          if (paraderosError) {
            console.error('Error fetching paraderos:', paraderosError);
            return {
              ...ruta,
              paraderos: []
            };
          }

          return {
            ...ruta,
            paraderos: (paraderosData || []).map(item => ({
              id: item.paradero?.id || '',
              nombre: item.paradero?.nombre || '',
              direccion: item.paradero?.direccion || null,
              orden_secuencia: item.orden_secuencia,
              tiempo_llegada_estimado: item.tiempo_llegada_estimado
            }))
          };
        })
      );

      setRutas(rutasConParaderos);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las rutas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRutas();
  }, [empresaId]);

  return {
    rutas,
    loading,
    error,
    refetch: fetchRutas
  };
}