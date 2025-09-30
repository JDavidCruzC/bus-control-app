import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Pago = {
  id: string;
  empresa_id: string;
  membresia_id: string | null;
  monto: number;
  metodo_pago: string | null;
  estado: 'pendiente' | 'completado' | 'fallido' | 'reembolsado';
  fecha_pago: string | null;
  referencia_pago: string | null;
  descripcion: string | null;
  created_at: string;
  updated_at: string;
  empresa?: {
    nombre: string;
  };
};

export function usePagos() {
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchPagos = async () => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .select(`
          *,
          empresa:empresas(nombre)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPagos((data as any) || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los pagos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createPago = async (pago: Omit<Pago, 'id' | 'created_at' | 'updated_at' | 'empresa'>) => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .insert([pago])
        .select()
        .single();

      if (error) throw error;
      
      await fetchPagos();
      toast({
        title: "Éxito",
        description: "Pago registrado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo registrar el pago",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updatePago = async (id: string, updates: Partial<Pago>) => {
    try {
      const { data, error } = await supabase
        .from('pagos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchPagos();
      toast({
        title: "Éxito",
        description: "Pago actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el pago",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  return {
    pagos,
    loading,
    createPago,
    updatePago,
    refetch: fetchPagos
  };
}