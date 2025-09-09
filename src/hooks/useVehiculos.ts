import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
      const { data, error } = await supabase
        .from('vehiculos')
        .insert([vehiculo])
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
      const { data, error } = await supabase
        .from('vehiculos')
        .update(updates)
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