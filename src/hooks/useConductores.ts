import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Conductor = {
  id: string;
  user_id: string;
  placa: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  estado: string;
  created_at: string;
  updated_at: string;
};

export function useConductores() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConductores = async () => {
    try {
      const { data, error } = await supabase
        .from('conductors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConductores(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los conductores",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConductor = async (id: string, updates: Partial<Conductor>) => {
    try {
      const { data, error } = await supabase
        .from('conductors')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConductores(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Éxito",
        description: "Conductor actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el conductor",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchConductores();
  }, []);

  return {
    conductores,
    loading,
    updateConductor,
    refetch: fetchConductores
  };
}