import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userType: 'trabajador' | 'cliente' | 'conductor' | null;
  userData: any;
  loading: boolean;
  signInWorker: (email: string, password: string) => Promise<{ error: any }>;
  signInConductor: (placa: string, password: string) => Promise<{ error: any }>;
  signInClient: (email: string, password: string) => Promise<{ error: any }>;
  signUpClient: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userType, setUserType] = useState<'trabajador' | 'cliente' | 'conductor' | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async (userId: string) => {
    try {
      // Intentar obtener datos de trabajador primero
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
        setUserType('trabajador');
        setUserData(trabajadorData);
        return;
      }

      // Intentar obtener datos de conductor
      const { data: conductorData } = await supabase
        .from('conductors')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (conductorData) {
        setUserType('conductor');
        setUserData(conductorData);
        return;
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
        return;
      }

      // Si no se encuentra en ninguna tabla
      setUserType(null);
      setUserData(null);
    } catch (error) {
      console.error('Error fetching user data:', error);
      setUserType(null);
      setUserData(null);
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

  const signInWorker = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    return { error };
  };

  const signInConductor = async (placa: string, password: string) => {
    try {
      // Primero buscar el conductor por placa
      const { data: conductorData, error: conductorError } = await supabase
        .from('conductors')
        .select('user_id, placa, nombre, apellido, estado')
        .eq('placa', placa)
        .eq('estado', 'activo')
        .maybeSingle();

      if (conductorError || !conductorData) {
        return { error: { message: 'Placa no encontrada o conductor inactivo' } };
      }

      // Obtener el email del usuario de auth
      const { data: userData, error: userError } = await supabase.auth.admin.getUserById(conductorData.user_id);
      
      if (userError || !userData.user?.email) {
        return { error: { message: 'Error al obtener datos del usuario' } };
      }

      // Usar el email del conductor para autenticar
      const { error } = await supabase.auth.signInWithPassword({
        email: userData.user.email,
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
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setUserType(null);
    setUserData(null);
  };

  const value = {
    user,
    session,
    userType,
    userData,
    loading,
    signInWorker,
    signInConductor,
    signInClient,
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