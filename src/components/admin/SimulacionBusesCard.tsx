import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Play, Pause, MapPin, Gauge } from "lucide-react";
import { useBusesSimulados } from "@/hooks/useBusesSimulados";
import { useRutas } from "@/hooks/useRutas";
import { Progress } from "@/components/ui/progress";

interface SimulacionBusesCardProps {
  rutaId?: string;
}

export function SimulacionBusesCard({ rutaId }: SimulacionBusesCardProps) {
  const { buses, loading, updateBusSimulado } = useBusesSimulados(rutaId);
  const { rutas } = useRutas();
  const [simulationActive, setSimulationActive] = useState(false);

  // Simulación de movimiento de buses
  useEffect(() => {
    if (!simulationActive) return;

    const interval = setInterval(() => {
      buses.forEach(async (bus) => {
        if (!bus.activo) return;

        // Incrementar progreso (simulación simple)
        const newProgreso = (bus.progreso_ruta + 1) % 101;
        const newVelocidad = Math.random() * 40 + 20; // 20-60 km/h

        await updateBusSimulado(bus.id, {
          progreso_ruta: newProgreso,
          velocidad_actual: Math.round(newVelocidad),
          tiempo_estimado_llegada: Math.round((100 - newProgreso) / 5)
        });
      });
    }, 3000); // Actualizar cada 3 segundos

    return () => clearInterval(interval);
  }, [simulationActive, buses]);

  const toggleSimulation = () => {
    setSimulationActive(!simulationActive);
  };

  const activeBuses = buses.filter(b => b.activo);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bus className="h-5 w-5 text-primary" />
              Simulación de Buses en Circulación
            </CardTitle>
            <CardDescription>
              {activeBuses.length} buses activos circulando
            </CardDescription>
          </div>
          <Button
            variant={simulationActive ? "destructive" : "default"}
            size="sm"
            onClick={toggleSimulation}
          >
            {simulationActive ? (
              <>
                <Pause className="h-4 w-4 mr-2" />
                Pausar
              </>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Iniciar
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Cargando buses...
          </div>
        ) : activeBuses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay buses en circulación
          </div>
        ) : (
          <div className="space-y-4">
            {activeBuses.map((bus) => {
              const ruta = rutas.find(r => r.id === bus.ruta_id);
              
              return (
                <div key={bus.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bus className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-semibold">{bus.nombre_simulado}</p>
                        <p className="text-sm text-muted-foreground">
                          {ruta?.codigo || 'Sin ruta'} - {ruta?.nombre || 'N/A'}
                        </p>
                      </div>
                    </div>
                    <Badge variant={simulationActive ? "default" : "secondary"}>
                      {simulationActive ? 'En Movimiento' : 'Detenido'}
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progreso de ruta</span>
                      <span className="font-medium">{Math.round(bus.progreso_ruta)}%</span>
                    </div>
                    <Progress value={bus.progreso_ruta} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Gauge className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Velocidad:</span>
                      <span className="font-medium">{bus.velocidad_actual} km/h</span>
                    </div>
                    {bus.proximo_paradero && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">ETA:</span>
                        <span className="font-medium">{bus.tiempo_estimado_llegada} min</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
