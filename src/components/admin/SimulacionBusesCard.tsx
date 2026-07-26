import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bus, Play, Pause, MapPin, Gauge } from "lucide-react";
import { useLineasBuses } from "@/hooks/useLineasBuses";
import { useBusesEnRuta } from "@/hooks/useBusesEnRuta";
import { Progress } from "@/components/ui/progress";
import { MapaRutasPublicas } from "@/components/MapaRutasPublicas";

interface SimulacionBusesCardProps {
  rutaId?: string;
}

export function SimulacionBusesCard({ rutaId }: SimulacionBusesCardProps) {
  const { lineasBuses } = useLineasBuses();
  const { buses, loading } = useBusesEnRuta();
  const [mostrarMapa, setMostrarMapa] = useState(true);

  const busesFiltered = rutaId ? buses.filter(b => b.rutaId === rutaId) : buses;
  const activeBuses = busesFiltered.filter(b => b.activo);

  return (
    <div className="space-y-4">
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
              variant={mostrarMapa ? "default" : "outline"}
              size="sm"
              onClick={() => setMostrarMapa(!mostrarMapa)}
            >
              {mostrarMapa ? "Ocultar Mapa" : "Mostrar Mapa"}
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
              No hay buses en circulación para esta ruta
            </div>
          ) : (
            <div className="space-y-4">
              {activeBuses.map((bus) => {
                const linea = lineasBuses.find(l => l.id === bus.rutaId);
                
                return (
                  <div key={bus.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bus className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-semibold">{bus.nombre}</p>
                          <p className="text-sm text-muted-foreground">
                            {linea ? `Línea ${linea.codigo} - ${linea.nombre}` : `Línea ${bus.rutaCodigo}`}
                          </p>
                        </div>
                      </div>
                      <Badge variant="default" className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                        En Movimiento
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Progreso de ruta</span>
                        <span className="font-medium">{Math.round(bus.progreso)}%</span>
                      </div>
                      <Progress value={bus.progreso} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Gauge className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Velocidad:</span>
                        <span className="font-medium">{Math.round(bus.velocidad)} km/h</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Posición:</span>
                        <span className="font-mono text-xs">{bus.latitud.toFixed(4)}, {bus.longitud.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Mapa de simulación */}
      {mostrarMapa && activeBuses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Visualización en Mapa
            </CardTitle>
            <CardDescription>
              Buses circulando en tiempo real por sus rutas asignadas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapaRutasPublicas 
                mostrarRutas={true}
                mostrarParaderos={true}
                mostrarBuses={true}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
