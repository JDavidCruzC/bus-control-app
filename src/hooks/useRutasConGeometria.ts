import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type RutaConGeometria = {
  id: string;
  ruta_id: string;
  geom: any; // GeoJSON LineString
  created_at: string;
  updated_at: string;
  ruta?: {
    id: string;
    codigo: string;
    nombre: string;
    descripcion?: string;
    activo: boolean;
  };
};

export function useRutasConGeometria() {
  const [rutasGeom, setRutasGeom] = useState<RutaConGeometria[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchRutasGeom = async () => {
    try {
      const { data, error } = await supabase
        .from('rutas_geometria')
        .select(`
          *,
          ruta:rutas(id, codigo, nombre, descripcion, activo)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRutasGeom(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar las geometrías de rutas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createRutaGeom = async (ruta_id: string, coordinates: [number, number][]) => {
    try {
      // Convertir coordenadas a formato WKT LINESTRING
      const wkt = `LINESTRING(${coordinates.map(c => `${c[0]} ${c[1]}`).join(', ')})`;
      
      const { data, error } = await supabase
        .from('rutas_geometria')
        .insert([{ 
          ruta_id,
          geom: wkt
        }])
        .select()
        .single();

      if (error) throw error;
      
      await fetchRutasGeom();
      toast({
        title: "Éxito",
        description: "Geometría de ruta guardada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo guardar la geometría de la ruta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateRutaGeom = async (ruta_id: string, coordinates: [number, number][]) => {
    try {
      const wkt = `LINESTRING(${coordinates.map(c => `${c[0]} ${c[1]}`).join(', ')})`;
      
      const { data, error } = await supabase
        .from('rutas_geometria')
        .update({ geom: wkt })
        .eq('ruta_id', ruta_id)
        .select()
        .single();

      if (error) throw error;

      await fetchRutasGeom();
      toast({
        title: "Éxito",
        description: "Geometría de ruta actualizada correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar la geometría de la ruta",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deleteRutaGeom = async (ruta_id: string) => {
    try {
      const { error } = await supabase
        .from('rutas_geometria')
        .delete()
        .eq('ruta_id', ruta_id);

      if (error) throw error;

      await fetchRutasGeom();
      toast({
        title: "Éxito",
        description: "Geometría de ruta eliminada correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo eliminar la geometría de la ruta",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchRutasGeom();
  }, []);

  return {
    rutasGeom,
    loading,
    createRutaGeom,
    updateRutaGeom,
    deleteRutaGeom,
    refetch: fetchRutasGeom
  };
}
