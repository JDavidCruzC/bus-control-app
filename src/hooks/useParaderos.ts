import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Paradero = {
  id: string;
  nombre: string;
  descripcion?: string;
  latitud: number;
  longitud: number;
  direccion?: string;
  activo: boolean;
  tiene_asientos: boolean;
  tiene_techado: boolean;
  empresa_id: string;
  created_at: string;
  updated_at: string;
};

export function useParaderos() {
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchParaderos = async () => {
    try {
      const { data, error } = await supabase
        .from('paraderos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setParaderos(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los paraderos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createParadero = async (paradero: Omit<Paradero, 'id' | 'created_at' | 'updated_at' | 'empresa_id'>) => {
    try {
      // Get current user's empresa_id
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (userError) throw userError;
      if (!userData?.empresa_id) throw new Error('Usuario sin empresa asignada');

      const { data, error } = await supabase
        .from('paraderos')
        .insert([{ ...paradero, empresa_id: userData.empresa_id }])
        .select()
        .single();

      if (error) throw error;
      
      setParaderos(prev => [data, ...prev]);
      toast({
        title: "Éxito",
        description: "Paradero creado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el paradero",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateParadero = async (id: string, updates: Partial<Paradero>) => {
    try {
      const { data, error } = await supabase
        .from('paraderos')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      setParaderos(prev => prev.map(p => p.id === id ? data : p));
      toast({
        title: "Éxito",
        description: "Paradero actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el paradero",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteParadero = async (id: string) => {
    try {
      const { error } = await supabase
        .from('paraderos')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setParaderos(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Éxito",
        description: "Paradero eliminado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el paradero",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchParaderos();
  }, []);

  return {
    paraderos,
    loading,
    createParadero,
    updateParadero,
    deleteParadero,
    refetch: fetchParaderos
  };
}