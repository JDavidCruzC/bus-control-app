import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Membresia = {
  id: string;
  empresa_id: string;
  tipo_plan: string;
  precio: number;
  fecha_inicio: string;
  fecha_fin: string;
  estado: 'activa' | 'cancelada' | 'vencida';
  auto_renovacion: boolean;
  created_at: string;
  updated_at: string;
  empresa?: {
    nombre: string;
    ruc: string | null;
  };
};

export function useMembresias() {
  const [membresias, setMembresias] = useState<Membresia[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMembresias = async () => {
    try {
      const { data, error } = await supabase
        .from('membresias')
        .select(`
          *,
          empresa:empresas(nombre, ruc)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMembresias((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las membresías",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createMembresia = async (membresia: Omit<Membresia, 'id' | 'created_at' | 'updated_at' | 'empresa'>) => {
    try {
      const { data, error } = await supabase
        .from('membresias')
        .insert([membresia])
        .select()
        .single();

      if (error) throw error;
      
      await fetchMembresias();
      toast({
        title: "Éxito",
        description: "Membresía creada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear la membresía",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateMembresia = async (id: string, updates: Partial<Membresia>) => {
    try {
      const { data, error } = await supabase
        .from('membresias')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchMembresias();
      toast({
        title: "Éxito",
        description: "Membresía actualizada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la membresía",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchMembresias();
  }, []);

  return {
    membresias,
    loading,
    createMembresia,
    updateMembresia,
    refetch: fetchMembresias
  };
}