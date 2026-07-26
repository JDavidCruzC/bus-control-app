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
  placa?: string;
  ruta_id?: string;
  linea_id?: string;
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
  ruta?: {
    nombre: string;
    codigo: string;
  };
  linea?: {
    nombre: string;
    codigo: string;
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
        setLoading(false);
        return;
      }

      const { data: currentUser, error: userError } = await supabase
        .from('usuarios')
        .select('empresa_id, rol_id, rol:roles(nombre)')
        .eq('id', user.id)
        .single();

      if (userError || !currentUser) {
        console.error('Error obteniendo usuario actual:', userError);
        toast({
          title: "Error",
          description: "No se pudo obtener la información del usuario",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Usuario actual:', currentUser);

      // Si no es super_admin, debe tener empresa_id
      if (!currentUser.empresa_id) {
        if (currentUser.rol?.nombre === 'super_admin') {
          toast({
            title: "Acceso Restringido",
            description: "Los super administradores no pueden acceder a esta sección",
            variant: "destructive"
          });
        } else {
          toast({
            title: "Error",
            description: "Usuario sin empresa asignada",
            variant: "destructive"
          });
        }
        setLoading(false);
        return;
      }

      console.log('Filtrando por empresa_id:', currentUser.empresa_id);

      // Obtener usuarios de la misma empresa únicamente
      const { data, error } = await supabase
        .from('usuarios')
        .select(`
          *,
          rol:roles(*),
          empresa:empresas(nombre),
          conductor:conductores(placa, ruta_id, ruta:rutas(nombre, codigo)),
          linea:rutas!usuarios_linea_id_fkey(nombre, codigo)
        `)
        .eq('empresa_id', currentUser.empresa_id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error cargando usuarios:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los usuarios de la empresa",
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      console.log('Usuarios obtenidos de la base de datos:', data?.length, 'usuarios');

      // Obtener información de confirmación de email desde auth.users usando RPC
      const emailConfirmationMap = new Map<string, boolean>();
      
      // Obtener estado de confirmación para cada usuario
      for (const usuario of data || []) {
        if (usuario.email) {
          try {
            const { data: confirmData, error: confirmError } = await supabase
              .rpc('get_user_email_confirmation', { user_id_input: usuario.id });
            
            if (!confirmError && confirmData && confirmData.length > 0) {
              emailConfirmationMap.set(usuario.id, confirmData[0].email_confirmed);
            } else {
              // Si hay error o no hay datos, asumimos no confirmado
              emailConfirmationMap.set(usuario.id, false);
            }
          } catch (error) {
            console.error(`Error al obtener confirmación de email para usuario ${usuario.id}:`, error);
            emailConfirmationMap.set(usuario.id, false);
          }
        } else {
          emailConfirmationMap.set(usuario.id, false);
        }
      }

      // Filtrar usuarios que no sean super_admin manualmente por seguridad adicional
      const filteredData: Usuario[] = (data || [])
        .filter(usuario => {
          const isSuperAdmin = usuario.rol?.nombre === 'super_admin';
          const sameCompany = usuario.empresa_id === currentUser.empresa_id;
          
          if (isSuperAdmin) {
            console.log(`Filtrando super_admin: ${usuario.nombre}`);
          }
          
          return !isSuperAdmin && sameCompany;
        })
        .map(usuario => ({
          ...usuario,
          email_confirmed: emailConfirmationMap.get(usuario.id) ?? false,
          placa: Array.isArray(usuario.conductor) && usuario.conductor.length > 0 
            ? usuario.conductor[0].placa 
            : undefined,
          ruta_id: Array.isArray(usuario.conductor) && usuario.conductor.length > 0 
            ? usuario.conductor[0].ruta_id 
            : undefined,
          ruta: Array.isArray(usuario.conductor) && usuario.conductor.length > 0 && usuario.conductor[0].ruta
            ? usuario.conductor[0].ruta 
            : undefined,
          linea: usuario.linea || undefined
        }));

      console.log('Usuarios después de filtrar:', filteredData.length);
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
          rol:roles(*),
          empresa:empresas(nombre)
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
