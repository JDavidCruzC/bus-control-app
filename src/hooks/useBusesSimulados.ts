import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type BusSimulado = {
  id: string;
  ruta_id: string;
  vehiculo_id?: string;
  nombre_simulado: string;
  latitud_actual: number;
  longitud_actual: number;
  velocidad_actual: number;
  progreso_ruta: number;
  proximo_paradero_id?: string;
  tiempo_estimado_llegada?: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  ruta?: {
    id: string;
    codigo: string;
    nombre: string;
  };
  proximo_paradero?: {
    id: string;
    nombre: string;
  };
};

export function useBusesSimulados(ruta_id?: string) {
  const [buses, setBuses] = useState<BusSimulado[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchBuses = async () => {
    try {
      let query = supabase
        .from('buses_simulados')
        .select(`
          *,
          ruta:rutas(id, codigo, nombre),
          proximo_paradero:paraderos(id, nombre)
        `);

      if (ruta_id) {
        query = query.eq('ruta_id', ruta_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setBuses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los buses simulados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createBusSimulado = async (busData: {
    ruta_id: string;
    nombre_simulado: string;
    latitud_actual: number;
    longitud_actual: number;
    vehiculo_id?: string;
    velocidad_actual?: number;
    progreso_ruta?: number;
    proximo_paradero_id?: string;
    tiempo_estimado_llegada?: number;
    activo?: boolean;
  }) => {
    try {
      const { data, error } = await supabase
        .from('buses_simulados')
        .insert([busData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchBuses();
      toast({
        title: "Éxito",
        description: "Bus simulado creado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear el bus simulado",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateBusSimulado = async (id: string, updates: Partial<BusSimulado>) => {
    try {
      const { data, error } = await supabase
        .from('buses_simulados')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setBuses(prev => prev.map(b => b.id === id ? data : b));
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el bus simulado",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteBusSimulado = async (id: string) => {
    try {
      const { error } = await supabase
        .from('buses_simulados')
        .delete()
        .eq('id', id);

      if (error) throw error;

      await fetchBuses();
      toast({
        title: "Éxito",
        description: "Bus simulado eliminado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el bus simulado",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Suscripción a cambios en tiempo real
  useEffect(() => {
    fetchBuses();

    const channel = supabase
      .channel('buses_simulados_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'buses_simulados'
        },
        () => {
          fetchBuses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [ruta_id]);

  return {
    buses,
    loading,
    createBusSimulado,
    updateBusSimulado,
    deleteBusSimulado,
    refetch: fetchBuses
  };
}
