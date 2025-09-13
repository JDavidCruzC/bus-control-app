import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { MapPin, Navigation, Clock, Users, AlertTriangle, CheckCircle, Play, Square } from "lucide-react";

type Viaje = {
  id: string;
  ruta_id: string;
  estado: string;
  fecha_hora_inicio: string;
  fecha_hora_fin: string | null;
  pasajeros_subidos: number;
  direccion: string;
  observaciones: string | null;
  ruta?: {
    nombre: string;
    codigo: string;
  };
};

type Conductor = {
  id: string;
  placa: string;
  nombre: string;
  apellido: string;
  estado: string;
};

export default function ConductorDashboard() {
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [viajeActual, setViajeActual] = useState<Viaje | null>(null);
  const [ubicacionActiva, setUbicacionActiva] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchConductorData();
    fetchViajeActual();
  }, []);

  const fetchConductorData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('conductors')
        .select('*')
        .eq('user_id', user.user.id)
        .single();

      if (error) throw error;
      setConductor(data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo cargar la información del conductor",
        variant: "destructive"
      });
    }
  };

  const fetchViajeActual = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Buscar conductor primero
      const { data: conductorData } = await supabase
        .from('conductors')
        .select('id')
        .eq('user_id', user.user.id)
        .single();

      if (!conductorData) return;

      const { data, error } = await supabase
        .from('viajes')
        .select(`
          *,
          ruta:rutas(nombre, codigo)
        `)
        .eq('conductor_id', conductorData.id)
        .in('estado', ['en_curso', 'iniciado'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setViajeActual(data);
    } catch (error: any) {
      console.error('Error fetching viaje:', error);
    } finally {
      setLoading(false);
    }
  };

  const iniciarViaje = async () => {
    if (!conductor) return;

    try {
      const { data, error } = await supabase
        .from('viajes')
        .insert({
          conductor_id: conductor.id,
          estado: 'iniciado',
          fecha_hora_inicio: new Date().toISOString(),
          pasajeros_subidos: 0,
          direccion: 'ida'
        })
        .select(`
          *,
          ruta:rutas(nombre, codigo)
        `)
        .single();

      if (error) throw error;

      setViajeActual(data);
      toast({
        title: "Viaje iniciado",
        description: "Has iniciado un nuevo viaje exitosamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo iniciar el viaje",
        variant: "destructive"
      });
    }
  };

  const finalizarViaje = async () => {
    if (!viajeActual) return;

    try {
      const { error } = await supabase
        .from('viajes')
        .update({
          estado: 'finalizado',
          fecha_hora_fin: new Date().toISOString()
        })
        .eq('id', viajeActual.id);

      if (error) throw error;

      setViajeActual(null);
      toast({
        title: "Viaje finalizado",
        description: "El viaje se ha finalizado correctamente"
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "No se pudo finalizar el viaje",
        variant: "destructive"
      });
    }
  };

  const actualizarUbicacion = async () => {
    if (!conductor || !navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { error } = await supabase
            .from('ubicaciones_tiempo_real')
            .insert({
              conductor_id: conductor.id,
              latitud: position.coords.latitude,
              longitud: position.coords.longitude,
              velocidad: position.coords.speed || 0,
              precision_metros: position.coords.accuracy,
              timestamp_gps: new Date().toISOString()
            });

          if (error) throw error;

          toast({
            title: "Ubicación actualizada",
            description: "Tu ubicación se ha enviado correctamente"
          });
        } catch (error: any) {
          toast({
            title: "Error",
            description: "No se pudo actualizar la ubicación",
            variant: "destructive"
          });
        }
      },
      (error) => {
        toast({
          title: "Error GPS",
          description: "No se pudo obtener tu ubicación",
          variant: "destructive"
        });
      }
    );
  };

  const toggleUbicacionAutomatica = () => {
    setUbicacionActiva(!ubicacionActiva);
    
    if (!ubicacionActiva) {
      // Iniciar seguimiento automático cada 30 segundos
      const interval = setInterval(actualizarUbicacion, 30000);
      // Guardar el interval en localStorage para poder limpiarlo después
      localStorage.setItem('ubicacionInterval', interval.toString());
      
      toast({
        title: "Seguimiento activado",
        description: "Tu ubicación se actualizará automáticamente cada 30 segundos"
      });
    } else {
      // Detener seguimiento automático
      const interval = localStorage.getItem('ubicacionInterval');
      if (interval) {
        clearInterval(parseInt(interval));
        localStorage.removeItem('ubicacionInterval');
      }
      
      toast({
        title: "Seguimiento desactivado",
        description: "Se ha detenido el seguimiento automático de ubicación"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header del conductor */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Panel del Conductor
            </h1>
            {conductor && (
              <p className="text-muted-foreground">
                {conductor.nombre} {conductor.apellido} • Placa: {conductor.placa}
              </p>
            )}
          </div>
          <Badge variant={conductor?.estado === 'activo' ? 'default' : 'secondary'}>
            {conductor?.estado === 'activo' ? 'Activo' : 'Inactivo'}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Estado del viaje */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Estado del Viaje
              </CardTitle>
              <CardDescription>
                Control y monitoreo de tu viaje actual
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {viajeActual ? (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Viaje en curso</p>
                      {viajeActual.ruta && (
                        <p className="text-sm text-muted-foreground">
                          Ruta: {viajeActual.ruta.codigo} - {viajeActual.ruta.nombre}
                        </p>
                      )}
                    </div>
                    <Badge variant="default">
                      {viajeActual.estado}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Inicio: {new Date(viajeActual.fecha_hora_inicio).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">
                        Pasajeros: {viajeActual.pasajeros_subidos}
                      </span>
                    </div>
                  </div>

                  <Separator />

                  <Button 
                    onClick={finalizarViaje}
                    variant="destructive"
                    className="w-full"
                  >
                    <Square className="h-4 w-4 mr-2" />
                    Finalizar Viaje
                  </Button>
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    No tienes ningún viaje activo
                  </p>
                  <Button onClick={iniciarViaje} className="w-full">
                    <Play className="h-4 w-4 mr-2" />
                    Iniciar Nuevo Viaje
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Control de ubicación */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Ubicación GPS
              </CardTitle>
              <CardDescription>
                Seguimiento en tiempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Seguimiento automático</span>
                <Badge variant={ubicacionActiva ? 'default' : 'secondary'}>
                  {ubicacionActiva ? 'Activo' : 'Inactivo'}
                </Badge>
              </div>

              <Button 
                onClick={toggleUbicacionAutomatica}
                variant={ubicacionActiva ? 'destructive' : 'default'}
                className="w-full"
              >
                {ubicacionActiva ? 'Desactivar GPS' : 'Activar GPS'}
              </Button>

              <Button 
                onClick={actualizarUbicacion}
                variant="outline" 
                className="w-full"
              >
                <Navigation className="h-4 w-4 mr-2" />
                Enviar Ubicación Ahora
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium">Reportar Estado OK</p>
                  <p className="text-sm text-muted-foreground">Todo funcionando bien</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <div>
                  <p className="font-medium">Reportar Incidente</p>
                  <p className="text-sm text-muted-foreground">Problema en la ruta</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium">Gestionar Pasajeros</p>
                  <p className="text-sm text-muted-foreground">Contar subidas/bajadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}