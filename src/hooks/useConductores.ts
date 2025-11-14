import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const conductorSchema = z.object({
  placa: z.string().trim().min(1, 'La placa es requerida').max(20, 'La placa no puede exceder 20 caracteres').toUpperCase(),
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  apellido: z.string().trim().min(1, 'El apellido es requerido').max(100, 'El apellido no puede exceder 100 caracteres'),
  telefono: z.string().max(20, 'El teléfono no puede exceder 20 caracteres').optional(),
  estado: z.string().max(20, 'El estado no puede exceder 20 caracteres')
});

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
      // Validate input - only validate fields that are being updated
      const validated = conductorSchema.partial().parse(updates) as Partial<Conductor>;

      const { data, error } = await supabase
        .from('conductors')
        .update(validated)
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