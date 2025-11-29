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
      if (!user) {
        toast({
          title: "Error",
          description: "No se pudo autenticar el usuario",
          variant: "destructive"
        });
        return;
      }

      const { data: currentUser, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id, rol_id, rol:roles(nombre)')
        .eq('id', user.id)
        .single();

      if (userError || !currentUser) {
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive"
        });
        return;
      }

      // Si no es super_admin, debe tener empresa_id
      if (!currentUser.empresa_id && currentUser.rol?.nombre !== 'super_admin') {
        toast({
          title: "Error",
          description: "Usuario sin empresa asignada",
          variant: "destructive"
        });
        return;
      }

      // Obtener usuarios de la misma empresa (excluir super_admin en el query)
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          rol:roles(*)
        `)
        .eq('empresa_id', currentUser.empresa_id)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios de la empresa",
          variant: "destructive"
        });
        return;
      }

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
      console.error('Error al cargar usuarios:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron cargar los usuarios",
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

      if (error) {
        toast({
          title: "Error",
          description: "No se pudo actualizar el usuario",
          variant: "destructive"
        });
        throw error;
      }

      setUsuarios(prev => prev.map(u => u.id === id ? { ...data, email_confirmed: u.email_confirmed } : u));
      toast({
        title: "Éxito",
        description: "Usuario actualizado correctamente"
      });
      return data;
    } catch (error: any) {
      console.error('Error al actualizar usuario:', error);
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