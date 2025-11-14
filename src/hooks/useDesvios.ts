import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Desvio = {
  id: string;
  recorrido_id: string;
  conductor_id: string;
  latitud: number;
  longitud: number;
  motivo: string;
  descripcion_detallada?: string;
  evidencia_url?: string[];
  estado_validacion: 'pendiente' | 'aprobado' | 'rechazado';
  validado_por?: string;
  fecha_validacion?: string;
  comentarios_validacion?: string;
  created_at: string;
  updated_at: string;
  recorrido?: any;
  conductor?: {
    id: string;
    licencia_numero: string;
    usuario?: {
      nombre: string;
      apellido: string;
    };
  };
};

export function useDesvios(recorrido_id?: string) {
  const [desvios, setDesvios] = useState<Desvio[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchDesvios = async () => {
    try {
      let query = supabase
        .from('desvios')
        .select(`
          *,
          recorrido:recorridos(*),
          conductor:conductores(
            id,
            licencia_numero,
            usuario:usuarios(nombre, apellido)
          )
        `);

      if (recorrido_id) {
        query = query.eq('recorrido_id', recorrido_id);
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDesvios((data || []) as Desvio[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los desvíos",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createDesvio = async (desvioData: {
    recorrido_id: string;
    conductor_id: string;
    latitud: number;
    longitud: number;
    motivo: string;
    descripcion_detallada?: string;
    evidencia_url?: string[];
  }) => {
    try {
      const { data, error } = await supabase
        .from('desvios')
        .insert([desvioData])
        .select()
        .single();

      if (error) throw error;
      
      await fetchDesvios();
      toast({
        title: "Éxito",
        description: "Desvío registrado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo registrar el desvío",
        variant: "destructive"
      });
      throw error;
    }
  };

  const validarDesvio = async (
    id: string, 
    estado: 'aprobado' | 'rechazado',
    comentarios?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const { data, error } = await supabase
        .from('desvios')
        .update({
          estado_validacion: estado,
          validado_por: user.id,
          fecha_validacion: new Date().toISOString(),
          comentarios_validacion: comentarios
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      await fetchDesvios();
      toast({
        title: "Éxito",
        description: `Desvío ${estado === 'aprobado' ? 'aprobado' : 'rechazado'} correctamente`
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo validar el desvío",
        variant: "destructive"
      });
      throw error;
    }
  };

  const uploadEvidencia = async (file: File, desvio_id: string): Promise<string> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${desvio_id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('desvios-evidencia')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('desvios-evidencia')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo subir la evidencia",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchDesvios();
  }, [recorrido_id]);

  return {
    desvios,
    loading,
    createDesvio,
    validarDesvio,
    uploadEvidencia,
    refetch: fetchDesvios
  };
}
