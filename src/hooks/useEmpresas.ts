import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Empresa = {
  id: string;
  nombre: string;
  ruc: string | null;
  logo_url: string | null;
  telefono: string | null;
  email: string | null;
  activo: boolean;
};

export function useEmpresas() {
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('empresas')
        .select('id, nombre, ruc, logo_url, telefono, email, activo')
        .eq('activo', true)
        .order('nombre');

      if (fetchError) throw fetchError;

      setEmpresas(data || []);
    } catch (err: any) {
      setError(err.message || 'Error al cargar las empresas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  return {
    empresas,
    loading,
    error,
    refetch: fetchEmpresas
  };
}
