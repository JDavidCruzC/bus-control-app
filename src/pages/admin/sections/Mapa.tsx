import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Navigation, 
  Layers,
  Zap,
  Users,
  Route,
  RefreshCw,
  Settings
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Mapa() {
  const [selectedLayer, setSelectedLayer] = useState("vehiculos");
  const [isRealTime, setIsRealTime] = useState(true);

  // Datos de ejemplo para el mapa
  const vehiculosEnRuta = [
    { id: "1", placa: "ABC-123", ruta: "Ruta Norte", pasajeros: 25, lat: -12.0464, lng: -77.0428 },
    { id: "2", placa: "DEF-456", ruta: "Ruta Sur", pasajeros: 18, lat: -12.0564, lng: -77.0328 },
    { id: "3", placa: "GHI-789", ruta: "Ruta Este", pasajeros: 30, lat: -12.0364, lng: -77.0528 }
  ];

  const paraderos = [
    { id: "1", nombre: "Terminal Principal", pasajeros_esperando: 12, lat: -12.0464, lng: -77.0428 },
    { id: "2", nombre: "Plaza Central", pasajeros_esperando: 8, lat: -12.0564, lng: -77.0328 },
    { id: "3", nombre: "Universidad", pasajeros_esperando: 15, lat: -12.0364, lng: -77.0528 }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mapa en Tiempo Real</h1>
          <p className="text-muted-foreground">
            Monitoreo de vehículos y rutas en tiempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurar
          </Button>
          <Button 
            variant={isRealTime ? "default" : "outline"}
            onClick={() => setIsRealTime(!isRealTime)}
            className="flex items-center gap-2"
          >
            <Zap className="h-4 w-4" />
            {isRealTime ? "En Vivo" : "Pausado"}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Navigation className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{vehiculosEnRuta.length}</p>
                <p className="text-muted-foreground text-sm">Vehículos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{paraderos.length}</p>
                <p className="text-muted-foreground text-sm">Paraderos Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Users className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold text-orange-600">
                  {vehiculosEnRuta.reduce((acc, v) => acc + v.pasajeros, 0)}
                </p>
                <p className="text-muted-foreground text-sm">Pasajeros Transportándose</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Route className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">3</p>
                <p className="text-muted-foreground text-sm">Rutas Operativas</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Mapa Principal */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapa Interactivo
                </CardTitle>
                <div className="flex gap-2">
                  <Select value={selectedLayer} onValueChange={setSelectedLayer}>
                    <SelectTrigger className="w-40">
                      <Layers className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="vehiculos">Vehículos</SelectItem>
                      <SelectItem value="paraderos">Paraderos</SelectItem>
                      <SelectItem value="rutas">Rutas</SelectItem>
                      <SelectItem value="todos">Todos</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Placeholder del mapa - aquí iría el componente Mapbox */}
              <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/25">
                <div className="text-center space-y-2">
                  <MapPin className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-semibold text-muted-foreground">Mapa en Tiempo Real</h3>
                  <p className="text-sm text-muted-foreground">
                    Aquí se mostraría el mapa interactivo con las ubicaciones en tiempo real
                  </p>
                  <Button variant="outline" className="mt-4">
                    Configurar Mapbox Token
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Panel de Información */}
        <div className="space-y-6">
          {/* Vehículos en Ruta */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Navigation className="h-5 w-5" />
                Vehículos en Ruta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {vehiculosEnRuta.map((vehiculo) => (
                <div key={vehiculo.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{vehiculo.placa}</p>
                    <p className="text-sm text-muted-foreground">{vehiculo.ruta}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="secondary">{vehiculo.pasajeros} pax</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Paraderos Activos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Paraderos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {paraderos.map((paradero) => (
                <div key={paradero.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{paradero.nombre}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={paradero.pasajeros_esperando > 10 ? "destructive" : "secondary"}>
                      {paradero.pasajeros_esperando} esperando
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Estado del Sistema */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Estado del Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">GPS</span>
                <Badge variant="default">Activo</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Comunicación</span>
                <Badge variant="default">Estable</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Base de Datos</span>
                <Badge variant="default">Conectado</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Última Actualización</span>
                <span className="text-xs text-muted-foreground">Hace 2s</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}