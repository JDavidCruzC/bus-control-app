import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const lineaBusSchema = z.object({
  codigo: z.string().trim().min(1, 'El código de la línea es requerido').max(20, 'El código no puede exceder 20 caracteres'),
  nombre: z.string().trim().min(1, 'El nombre es requerido').max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  distancia_km: z.number().min(0, 'Distancia inválida').max(10000, 'Distancia inválida').optional(),
  tiempo_estimado_minutos: z.number().int().min(0, 'Tiempo inválido').max(1440, 'Tiempo inválido').optional(),
  precio: z.number().min(0, 'Precio inválido').max(1000000, 'Precio inválido').optional(),
  activo: z.boolean(),
  empresa_id: z.string().uuid('ID de empresa inválido').optional()
});

export type LineaBus = {
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

export function useLineasBuses() {
  const [lineasBuses, setLineasBuses] = useState<LineaBus[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLineasBuses = async () => {
    try {
      const { data, error } = await supabase
        .from('rutas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setLineasBuses(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las líneas de buses",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createLineaBus = async (lineaBus: Omit<LineaBus, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Validate input
      const validated = lineaBusSchema.parse(lineaBus) as Omit<LineaBus, 'id' | 'created_at' | 'updated_at'>;

      const { data, error } = await supabase
        .from('rutas')
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      
      setLineasBuses(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Línea de bus creada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear la línea de bus",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateLineaBus = async (id: string, updates: Partial<LineaBus>) => {
    try {
      // Validate input - only validate fields that are being updated
      const validated = lineaBusSchema.partial().parse(updates) as Partial<LineaBus>;

      const { data, error } = await supabase
        .from('rutas')
        .update(validated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setLineasBuses(prev => prev.map(r => r.id === id ? data : r));
      toast({
        title: "Éxito",
        description: "Línea de bus actualizada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la línea de bus",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchLineasBuses();
  }, []);

  return {
    lineasBuses,
    loading,
    createLineaBus,
    updateLineaBus,
    refetch: fetchLineasBuses
  };
}
