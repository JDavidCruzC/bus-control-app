import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type DashboardStats = {
  totalVehiculos: number;
  vehiculosActivos: number;
  totalConductores: number;
  conductoresActivos: number;
  totalRutas: number;
  rutasActivas: number;
  totalParaderos: number;
  paraderosActivos: number;
  viajesHoy: number;
  reportesPendientes: number;
};

export function useStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehiculos: 0,
    vehiculosActivos: 0,
    totalConductores: 0,
    conductoresActivos: 0,
    totalRutas: 0,
    rutasActivas: 0,
    totalParaderos: 0,
    paraderosActivos: 0,
    viajesHoy: 0,
    reportesPendientes: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);

      // Fetch vehicle stats
      const { data: vehiculos, error: vehiculosError } = await supabase
        .from('vehiculos')
        .select('activo');
      
      // Fetch conductor stats
      const { data: conductores, error: conductoresError } = await supabase
        .from('conductors')
        .select('estado');

      // Fetch route stats
      const { data: rutas, error: rutasError } = await supabase
        .from('rutas')
        .select('activo');

      // Fetch paradero stats
      const { data: paraderos, error: paraderosError } = await supabase
        .from('paraderos')
        .select('activo');

      // Fetch today's trips
      const today = new Date().toISOString().split('T')[0];
      const { data: viajes, error: viajesError } = await supabase
        .from('viajes')
        .select('id')
        .gte('created_at', `${today}T00:00:00`)
        .lte('created_at', `${today}T23:59:59`);

      // Fetch pending reports
      const { data: reportes, error: reportesError } = await supabase
        .from('reportes')
        .select('id')
        .eq('estado', 'pendiente');

      if (vehiculosError || conductoresError || rutasError || paraderosError || viajesError || reportesError) {
        throw new Error('Error fetching stats');
      }

      setStats({
        totalVehiculos: vehiculos?.length || 0,
        vehiculosActivos: vehiculos?.filter(v => v.activo).length || 0,
        totalConductores: conductores?.length || 0,
        conductoresActivos: conductores?.filter(c => c.estado === 'activo').length || 0,
        totalRutas: rutas?.length || 0,
        rutasActivas: rutas?.filter(r => r.activo).length || 0,
        totalParaderos: paraderos?.length || 0,
        paraderosActivos: paraderos?.filter(p => p.activo).length || 0,
        viajesHoy: viajes?.length || 0,
        reportesPendientes: reportes?.length || 0,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    refetch: fetchStats
  };
}