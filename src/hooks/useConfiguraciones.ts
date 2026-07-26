import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Configuracion = {
  id: string;
  clave: string;
  valor?: string;
  descripcion?: string;
  categoria?: string;
  tipo: string;
  empresa_id?: string;
  created_at: string;
  updated_at: string;
};

export function useConfiguraciones() {
  const [configuraciones, setConfiguraciones] = useState<Configuracion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchConfiguraciones = async () => {
    try {
      const { data, error } = await supabase
        .from('configuraciones')
        .select('*')
        .order('categoria', { ascending: true });

      if (error) throw error;
      setConfiguraciones(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las configuraciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateConfiguracion = async (id: string, updates: Partial<Configuracion>) => {
    try {
      const { data, error } = await supabase
        .from('configuraciones')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setConfiguraciones(prev => prev.map(c => c.id === id ? data : c));
      toast({
        title: "Éxito",
        description: "Configuración actualizada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la configuración",
        variant: "destructive"
      });
      throw error;
    }
  };

  const createConfiguracion = async (config: Omit<Configuracion, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('configuraciones')
        .insert([config])
        .select()
        .single();

      if (error) throw error;

      setConfiguraciones(prev => [...prev, data]);
      toast({
        title: "Éxito",
        description: "Configuración creada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo crear la configuración",
        variant: "destructive"
      });
      throw error;
    }
  };

  const getConfigValue = (clave: string): string | undefined => {
    const config = configuraciones.find(c => c.clave === clave);
    return config?.valor;
  };

  useEffect(() => {
    fetchConfiguraciones();
  }, []);

  return {
    configuraciones,
    loading,
    updateConfiguracion,
    createConfiguracion,
    getConfigValue,
    refetch: fetchConfiguraciones
  };
}