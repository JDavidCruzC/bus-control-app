import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { ChangePasswordDialog } from "@/components/admin/ChangePasswordDialog";
import { MapPin, Navigation, Clock, Users, AlertTriangle, CheckCircle, Play, Square, Lock, LogOut } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

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
  licencia_numero: string;
  activo: boolean;
  ruta_id: string | null;
  created_at: string;
  updated_at: string;
  usuario?: {
    nombre: string;
    apellido: string;
    telefono: string;
    email: string;
  };
};

type Paradero = {
  id: string;
  nombre: string;
  descripcion: string | null;
  direccion: string | null;
  latitud: number;
  longitud: number;
  orden_secuencia: number;
  tiempo_llegada_estimado: string | null;
};

export default function ConductorDashboard() {
  const { userData, signOut } = useAuth();
  const [conductor, setConductor] = useState<Conductor | null>(null);
  const [viajeActual, setViajeActual] = useState<Viaje | null>(null);
  const [paraderos, setParaderos] = useState<Paradero[]>([]);
  const [proximoParadero, setProximoParadero] = useState<Paradero | null>(null);
  const [ubicacionActiva, setUbicacionActiva] = useState(false);
  const [loading, setLoading] = useState(true);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConductorData();
    fetchViajeActual();
  }, []);

  useEffect(() => {
    if (conductor?.ruta_id || viajeActual?.ruta_id) {
      const rutaId = viajeActual?.ruta_id || conductor?.ruta_id;
      if (rutaId) {
        fetchParaderos(rutaId);
      }
    }
  }, [conductor, viajeActual]);

  const fetchConductorData = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data, error } = await supabase
        .from('conductores')
        .select(`
          *,
          usuario:usuarios(nombre, apellido, telefono, email)
        `)
        .eq('usuario_id', user.user.id)
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

  const fetchParaderos = async (rutaId: string) => {
    try {
      const { data, error } = await supabase
        .from('rutas_paraderos')
        .select(`
          id,
          orden_secuencia,
          tiempo_llegada_estimado,
          paradero:paraderos(
            id,
            nombre,
            descripcion,
            direccion,
            latitud,
            longitud
          )
        `)
        .eq('ruta_id', rutaId)
        .order('orden_secuencia', { ascending: true });

      if (error) throw error;

      const paraderosFormateados = data.map((item: any) => ({
        ...item.paradero,
        orden_secuencia: item.orden_secuencia,
        tiempo_llegada_estimado: item.tiempo_llegada_estimado
      }));

      setParaderos(paraderosFormateados);
      
      // Establecer el primer paradero como próximo si no hay viaje activo
      if (paraderosFormateados.length > 0) {
        setProximoParadero(paraderosFormateados[0]);
      }
    } catch (error: any) {
      console.error('Error al cargar paraderos:', error);
    }
  };

  const fetchViajeActual = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      // Buscar conductor primero
      const { data: conductorData } = await supabase
        .from('conductores')
        .select('id')
        .eq('usuario_id', user.user.id)
        .single();

      if (!conductorData) return;

      const { data, error } = await supabase
        .from('viajes')
        .select(`
          *,
          ruta:rutas(nombre, codigo)
        `)
        .eq('conductor_id', conductorData.id)
        .in('estado', ['en_curso', 'programado'])
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
          estado: 'en_curso',
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
          estado: 'completado',
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
        <ChangePasswordDialog 
          open={passwordDialogOpen} 
          onOpenChange={setPasswordDialogOpen} 
        />

        {/* Header del conductor */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Panel del Conductor
            </h1>
            {conductor && (
              <p className="text-muted-foreground">
                {conductor.usuario?.nombre} {conductor.usuario?.apellido} • Placa: {conductor.placa}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setPasswordDialogOpen(true)}
            >
              <Lock className="h-4 w-4 mr-2" />
              Cambiar Contraseña
            </Button>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={signOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
            <Badge variant={conductor?.activo ? 'default' : 'secondary'}>
              {conductor?.activo ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
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

        {/* Lista de paraderos de la ruta */}
        {paraderos.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Paraderos de la Ruta
              </CardTitle>
              <CardDescription>
                Recorrido completo con tiempos estimados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {proximoParadero && (
                <div className="mb-6 p-4 bg-primary/10 rounded-lg border-2 border-primary">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-primary">PRÓXIMO PARADERO</p>
                    <Badge variant="default">
                      #{proximoParadero.orden_secuencia}
                    </Badge>
                  </div>
                  <h3 className="text-xl font-bold mb-1">{proximoParadero.nombre}</h3>
                  {proximoParadero.direccion && (
                    <p className="text-sm text-muted-foreground mb-2">
                      {proximoParadero.direccion}
                    </p>
                  )}
                  {proximoParadero.tiempo_llegada_estimado && (
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4" />
                      <span>Llegada estimada: {proximoParadero.tiempo_llegada_estimado}</span>
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-3">
                  {paraderos.map((paradero, index) => (
                    <div 
                      key={paradero.id}
                      className={`p-4 rounded-lg border transition-all ${
                        proximoParadero?.id === paradero.id 
                          ? 'bg-primary/5 border-primary' 
                          : 'bg-card border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            proximoParadero?.id === paradero.id
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            <span className="text-sm font-bold">{paradero.orden_secuencia}</span>
                          </div>
                          <div>
                            <h4 className="font-semibold">{paradero.nombre}</h4>
                            {paradero.direccion && (
                              <p className="text-sm text-muted-foreground">
                                {paradero.direccion}
                              </p>
                            )}
                          </div>
                        </div>
                        {proximoParadero?.id === paradero.id && (
                          <Badge variant="default" className="ml-2">
                            Próximo
                          </Badge>
                        )}
                      </div>
                      
                      {paradero.descripcion && (
                        <p className="text-sm text-muted-foreground mb-2 ml-11">
                          {paradero.descripcion}
                        </p>
                      )}

                      <div className="flex items-center gap-4 ml-11 text-sm text-muted-foreground">
                        {paradero.tiempo_llegada_estimado && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{paradero.tiempo_llegada_estimado}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          <span>{paradero.latitud.toFixed(4)}, {paradero.longitud.toFixed(4)}</span>
                        </div>
                      </div>

                      {index < paraderos.length - 1 && (
                        <div className="ml-4 mt-2 h-6 border-l-2 border-dashed border-muted-foreground/30" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {paraderos.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No hay paraderos configurados para esta ruta</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

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