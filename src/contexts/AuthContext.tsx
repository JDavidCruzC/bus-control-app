import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: 'trabajador' | 'cliente' | 'conductor' | null;
  userData: any;
  userRole: string | null;
  loading: boolean;
  signInWorker: (codigoUsuario: string, password: string) => Promise<{ error: any }>;
  signInConductor: (placa: string, password: string) => Promise<{ error: any }>;
  signInClient: (email: string, password: string) => Promise<{ error: any }>;
  signInEmpresa: (email: string, password: string) => Promise<{ error: any }>;
  signInSuperAdmin: (email: string, password: string) => Promise<{ error: any }>;
  signUpClient: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<'trabajador' | 'cliente' | 'conductor' | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Primero obtener datos de trabajador para conocer su rol
      const { data: trabajadorData } = await supabase
        .from('usuarios')
        .select(`
          *,
          rol:roles(*),
          empresa:empresas(*)
        `)
        .eq('id', userId)
        .maybeSingle();

      if (trabajadorData) {
        const rolNombre = trabajadorData.rol?.nombre;
        
        // Si es conductor o cobrador, buscar en la tabla conductores
        if (rolNombre === 'conductor' || rolNombre === 'cobrador') {
          const { data: conductorData } = await supabase
            .from('conductores')
            .select('*')
            .eq('usuario_id', userId)
            .maybeSingle();

          if (conductorData) {
            setUserType('conductor');
            setUserData({ ...trabajadorData, conductor: conductorData });
            setUserRole(rolNombre);
            return;
          }
        }
        
        // Si es administrador o gerente
        if (rolNombre === 'administrador' || rolNombre === 'gerente') {
          setUserType('trabajador');
          setUserData(trabajadorData);
          setUserRole(rolNombre);
          return;
        }
      }

      // Si no es trabajador ni conductor, intentar obtener datos de cliente
      const { data: clienteData } = await supabase
        .from('clientes')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (clienteData) {
        setUserType('cliente');
        setUserData(clienteData);
        setUserRole('cliente');
        return;
      }

      // Si no se encuentra en ninguna tabla
      setUserType(null);
      setUserData(null);
      setUserRole(null);
    } catch (error) {
      setUserType(null);
      setUserData(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Configurar listener de cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Usar setTimeout para evitar bloquear el renderizado
          setTimeout(() => {
            fetchUserData(session.user.id);
          }, 0);
        } else {
          setUserType(null);
          setUserData(null);
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    // Obtener sesión actual
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInWorker = async (codigoUsuario: string, password: string) => {
    try {
      // Usar la función de base de datos para obtener el email por código de usuario
      const { data: usuarioInfo, error: usuarioError } = await supabase
        .rpc('get_usuario_email_by_codigo', { codigo_input: codigoUsuario });

      if (usuarioError || !usuarioInfo || usuarioInfo.length === 0) {
        return { error: { message: 'Código de usuario no encontrado o usuario inactivo' } };
      }

      const email = usuarioInfo[0].email;

      // Usar el email del usuario para autenticar
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (err: any) {
      return { error: { message: err.message || 'Error al iniciar sesión' } };
    }
  };

  const signInConductor = async (placa: string, password: string) => {
    try {
      // Usar la función de base de datos para obtener el email por placa
      const { data: conductorInfo, error: conductorError } = await supabase
        .rpc('get_conductor_email_by_placa', { placa_input: placa });

      if (conductorError || !conductorInfo || conductorInfo.length === 0) {
        return { error: { message: 'Placa no encontrada o conductor inactivo' } };
      }

      const email = conductorInfo[0].email;

      // Usar el email del conductor para autenticar
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      return { error };
    } catch (error) {
      return { error: { message: 'Error al iniciar sesión con placa' } };
    }
  };

  const signInClient = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInEmpresa = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInSuperAdmin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: { message: error.message || "Error al iniciar sesión" } };
      }

      if (!data.user) {
        return { error: { message: "Usuario no encontrado" } };
      }

      // Verificar que el usuario sea super_admin
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('rol:roles(nombre)')
        .eq('id', data.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error al verificar rol:', userError);
        await supabase.auth.signOut();
        return { error: { message: "Error al verificar permisos" } };
      }

      // Si no existe el usuario en la tabla usuarios, verificar si es el super admin inicial
      if (!userData) {
        // Verificar si es el email del super admin
        if (email === 'superadmin@sistema.com') {
          // Usuario super admin sin registro en tabla usuarios (primer login)
          return { error: null };
        }
        await supabase.auth.signOut();
        return { error: { message: "Usuario no autorizado como Super Admin" } };
      }

      if (userData.rol?.nombre !== 'super_admin') {
        await supabase.auth.signOut();
        return { error: { message: "No tienes permisos de Super Admin" } };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Error al iniciar sesión como super admin:', error);
      return { error: { message: error.message || "Error al iniciar sesión" } };
    }
  };

  const signUpClient = async (email: string, password: string, clientData: any) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: 'cliente',
          nombre: clientData.nombre,
          apellido: clientData.apellido,
          telefono: clientData.telefono,
          cedula: clientData.cedula
        }
      }
    });
    return { error };
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setUserType(null);
      setUserData(null);
      setUserRole(null);
      // Limpiar localStorage y redirigir al inicio
      localStorage.clear();
      window.location.href = '/';
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const value = {
    user,
    session,
    userType,
    userData,
    userRole,
    loading,
    signInWorker,
    signInConductor,
    signInClient,
    signInEmpresa,
    signInSuperAdmin,
    signUpClient,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}