import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const vehiculoSchema = z.object({
  placa: z.string().trim().min(1, 'La placa es requerida').max(20, 'La placa no puede exceder 20 caracteres').toUpperCase(),
  marca: z.string().max(50, 'La marca no puede exceder 50 caracteres').optional(),
  modelo: z.string().max(50, 'El modelo no puede exceder 50 caracteres').optional(),
  año: z.number().int().min(1900, 'Año inválido').max(new Date().getFullYear() + 1, 'Año inválido').optional(),
  color: z.string().max(30, 'El color no puede exceder 30 caracteres').optional(),
  numero_interno: z.string().max(20, 'El número interno no puede exceder 20 caracteres').optional(),
  capacidad_pasajeros: z.number().int().min(1, 'Capacidad inválida').max(100, 'Capacidad inválida').optional(),
  tiene_gps: z.boolean(),
  tiene_aire: z.boolean(),
  activo: z.boolean(),
  empresa_id: z.string().uuid('ID de empresa inválido').optional()
});

export type Vehiculo = {
  id: string;
  placa: string;
  marca?: string;
  modelo?: string;
  año?: number;
  color?: string;
  numero_interno?: string;
  capacidad_pasajeros?: number;
  tiene_gps: boolean;
  tiene_aire: boolean;
  activo: boolean;
  empresa_id?: string;
  created_at: string;
  updated_at: string;
};

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchVehiculos = async () => {
    try {
      const { data, error } = await supabase
        .from('vehiculos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setVehiculos(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los vehículos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createVehiculo = async (vehiculo: Omit<Vehiculo, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Validate input
      const validated = vehiculoSchema.parse(vehiculo) as Omit<Vehiculo, 'id' | 'created_at' | 'updated_at'>;

      const { data, error } = await supabase
        .from('vehiculos')
        .insert([validated])
        .select()
        .single();

      if (error) throw error;
      
      setVehiculos(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Vehículo registrado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo registrar el vehículo",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateVehiculo = async (id: string, updates: Partial<Vehiculo>) => {
    try {
      // Validate input - only validate fields that are being updated
      const validated = vehiculoSchema.partial().parse(updates) as Partial<Vehiculo>;

      const { data, error } = await supabase
        .from('vehiculos')
        .update(validated)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setVehiculos(prev => prev.map(v => v.id === id ? data : v));
      toast({
        title: "Éxito",
        description: "Vehículo actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el vehículo",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchVehiculos();
  }, []);

  return {
    vehiculos,
    loading,
    createVehiculo,
    updateVehiculo,
    refetch: fetchVehiculos
  };
}