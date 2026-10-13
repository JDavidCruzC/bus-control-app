import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Navigation, Route } from "lucide-react";
import { MapaRutasPublicas } from "@/components/MapaRutasPublicas";
import { useAuth } from "@/contexts/AuthContext";
import { useVehiculos } from "@/hooks/useVehiculos";
import { useParaderos } from "@/hooks/useParaderos";
import { useLineasBuses } from "@/hooks/useLineasBuses";
import { routeColor } from "@/lib/geometry";

export function Mapa() {
  const { userData } = useAuth();
  const empresaId = userData?.empresa_id ?? undefined;
  const { vehiculos } = useVehiculos();
  const { paraderos } = useParaderos();
  const { lineasBuses } = useLineasBuses();

  const activos = vehiculos.filter((v) => v.activo);
  const paraderosActivos = paraderos.filter((p) => p.activo);
  const lineas = [...lineasBuses].sort((a, b) => a.id.localeCompare(b.id));

  const stats = [
    { icon: Navigation, value: activos.length, label: "Buses activos" },
    { icon: MapPin, value: paraderosActivos.length, label: "Paraderos" },
    { icon: Route, value: lineas.filter((l) => l.activo).length, label: "Líneas" },
  ];

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">Mapa en Tiempo Real</h1>
        <p className="text-muted-foreground text-sm md:text-base">Líneas, buses y paraderos de tu empresa</p>
      </div>

      <div className="grid grid-cols-3 gap-2 md:gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-3 md:p-5 flex flex-col md:flex-row items-center gap-1 md:gap-3 text-center md:text-left">
              <s.icon className="h-5 w-5 md:h-7 md:w-7 text-primary" />
              <div>
                <p className="text-lg md:text-2xl font-bold text-primary leading-none">{s.value}</p>
                <p className="text-muted-foreground text-xs md:text-sm">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardContent className="p-0">
            <div className="h-[60vh] min-h-[360px]">
              <MapaRutasPublicas empresaId={empresaId} mostrarRutas mostrarParaderos mostrarBuses />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Route className="h-4 w-4" />Líneas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {lineas.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay líneas</p>}
              {lineas.map((l, i) => (
                <div key={l.id} className="flex items-center gap-2 text-sm">
                  <span className="h-3 w-6 rounded-full shrink-0" style={{ background: routeColor(i) }} />
                  <span className="font-medium">{l.codigo}</span>
                  <span className="text-muted-foreground truncate">{l.nombre}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2"><Navigation className="h-4 w-4" />Buses</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 max-h-64 overflow-y-auto">
              {vehiculos.length === 0 && <p className="text-sm text-muted-foreground">Aún no hay buses</p>}
              {vehiculos.map((v) => (
                <div key={v.id} className="flex items-center justify-between p-2 bg-muted rounded-md text-sm">
                  <span className="font-medium">{v.placa}</span>
                  <Badge variant={v.activo ? "default" : "secondary"}>{v.activo ? "Activo" : "Inactivo"}</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
