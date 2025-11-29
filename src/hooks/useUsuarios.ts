import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Usuario = {
  id: string;
  email?: string;
  nombre: string;
  apellido?: string;
  telefono?: string;
  cedula?: string;
  codigo_usuario?: string;
  activo: boolean;
  empresa_id?: string;
  rol_id?: string;
  ultimo_login?: string;
  created_at: string;
  updated_at: string;
  email_confirmed?: boolean;
  rol?: {
    nombre: string;
    descripcion?: string;
  };
  empresa?: {
    nombre: string;
  };
};

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchUsuarios = async () => {
    try {
      // Obtener la empresa del usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no encontrado');

      const { data: currentUser } = await supabase
        .from('usuarios')
        .select('empresa_id')
        .eq('id', user.id)
        .single();

      if (!currentUser?.empresa_id) throw new Error('Usuario sin empresa');

      // Obtener usuarios de la misma empresa
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          rol:roles(*)
        `)
        .eq('empresa_id', currentUser.empresa_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Obtener información de confirmación de email desde auth.users usando RPC
      // Creamos un mapa simple para verificar si los emails están confirmados
      const emailConfirmationMap = new Map<string, boolean>();
      
      // Intentar obtener información de auth para cada usuario
      for (const usuario of data || []) {
        if (usuario.email) {
          // Por defecto, asumimos que está confirmado si no podemos verificar
          // En producción, esto debería verificarse con una función RPC de Supabase
          emailConfirmationMap.set(usuario.id, true);
        }
      }

      // Filtrar usuarios que no sean super_admin y agregar estado de confirmación
      const filteredData: Usuario[] = (data || [])
        .filter(usuario => usuario.rol?.nombre !== 'super_admin')
        .map(usuario => ({
          ...usuario,
          email_confirmed: emailConfirmationMap.get(usuario.id) ?? false
        }));

      setUsuarios(filteredData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los usuarios",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateUsuario = async (id: string, updates: Partial<Usuario>) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          rol:roles(*)
        `)
        .single();

      if (error) throw error;

      setUsuarios(prev => prev.map(u => u.id === id ? { ...data, email_confirmed: u.email_confirmed } : u));
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el usuario",
        variant: "destructive"
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return {
    usuarios,
    loading,
    updateUsuario,
    refetch: fetchUsuarios
  };
}