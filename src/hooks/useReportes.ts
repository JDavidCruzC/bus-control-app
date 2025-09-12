import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Reporte = {
  id: string;
  tipo: string;
  titulo: string;
  descripcion?: string;
  estado: string;
  prioridad: string;
  conductor_id?: string;
  vehiculo_id?: string;
  viaje_id?: string;
  paradero_id?: string;
  ubicacion_lat?: number;
  ubicacion_lng?: number;
  fecha_reporte: string;
  fecha_resolucion?: string;
  resuelto_por?: string;
  created_at: string;
  updated_at: string;
};

export function useReportes() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReportes = async () => {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReportes(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los reportes",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReporte = async (id: string, updates: Partial<Reporte>) => {
    try {
      const { data, error } = await supabase
        .from('reportes')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setReportes(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: "Éxito",
        description: "Reporte actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el reporte",
        variant: "destructive"
      });
      throw error;
    }
  };

  const resolverReporte = async (id: string, resuelto_por: string) => {
    return updateReporte(id, {
      estado: 'resuelto',
      fecha_resolucion: new Date().toISOString(),
      resuelto_por
    });
  };

  useEffect(() => {
    fetchReportes();
  }, []);

  return {
    reportes,
    loading,
    updateReporte,
    resolverReporte,
    refetch: fetchReportes
  };
}