import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Ruta = {
  id: string;
  codigo: string;
  nombre: string;
  descripcion?: string;
  distancia_km?: number;
  tiempo_estimado_minutos?: number;
  precio?: number;
  activo: boolean;
  empresa_id?: string;
  created_at: string;
  updated_at: string;
};

export function useRutas() {
  const [rutas, setRutas] = useState<Ruta[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRutas = async () => {
    try {
      const { data, error } = await supabase
        .from('rutas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRutas(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las rutas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRuta = async (ruta: Omit<Ruta, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('rutas')
        .insert([ruta])
        .select()
        .single();

      if (error) throw error;
      
      setRutas(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Ruta creada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear la ruta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateRuta = async (id: string, updates: Partial<Ruta>) => {
    try {
      const { data, error } = await supabase
        .from('rutas')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setRutas(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: "Éxito",
        description: "Ruta actualizada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la ruta",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchRutas();
  }, []);

  return {
    rutas,
    loading,
    createRuta,
    updateRuta,
    refetch: fetchRutas
  };
}