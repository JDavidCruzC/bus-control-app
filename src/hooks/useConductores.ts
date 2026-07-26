import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const conductorSchema = z.object({
  placa: z.string().trim().min(1, 'La placa es requerida').max(20, 'La placa no puede exceder 20 caracteres').toUpperCase(),
  licencia_numero: z.string().trim().min(1, 'La licencia es requerida').max(50),
  activo: z.boolean().optional()
});

export type Conductor = {
  id: string;
  usuario_id: string;
  vehiculo_id: string | null;
  ruta_id: string | null;
  licencia_numero: string;
  placa: string;
  licencia_vencimiento: string | null;
  experiencia_años: number | null;
  calificacion_promedio: number;
  total_viajes: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
  usuario?: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
  ruta?: {
    nombre: string;
    codigo: string;
  };
};

export function useConductores() {
  const [conductores, setConductores] = useState<Conductor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConductores = async () => {
    try {
      const { data, error } = await supabase
        .from('conductores')
        .select(`
          *,
          usuario:usuarios(nombre, apellido, telefono, email),
          ruta:rutas(nombre, codigo)
        `)
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
        .from('conductores')
        .update(validated)
        .eq('id', id)
        .select(`
          *,
          usuario:usuarios(nombre, apellido, telefono, email),
          ruta:rutas(nombre, codigo)
        `)
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