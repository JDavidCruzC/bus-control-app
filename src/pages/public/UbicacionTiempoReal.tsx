import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { useUbicacionesTiempoReal } from "@/hooks/useUbicacionesTiempoReal";
import { useEmpresas } from "@/hooks/useEmpresas";
import MapboxMap from "@/components/MapboxMap";
import { RefreshCw, MapPin, Clock, Gauge, AlertCircle, Building2, Filter } from "lucide-react";

// Colores por empresa
const EMPRESA_COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899"];

export default function UbicacionTiempoReal() {
  const { ubicaciones, loading, error, refetch } = useUbicacionesTiempoReal();
  const { empresas } = useEmpresas();
  const [empresaFiltro, setEmpresaFiltro] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  let vehiculosActivos = ubicaciones.filter(u => {
    const now = new Date();
    const locationTime = new Date(u.timestamp_gps);
    const diffMinutes = (now.getTime() - locationTime.getTime()) / (1000 * 60);
    return diffMinutes <= 30;
  });

  // Filtrar por empresa
  if (empresaFiltro) {
    vehiculosActivos = vehiculosActivos.filter(u => u.vehiculo?.empresa_id === empresaFiltro);
  }

  // Agrupar por empresa
  const vehiculosPorEmpresa = vehiculosActivos.reduce((acc, ub) => {
    const empresaId = ub.vehiculo?.empresa_id || 'sin_empresa';
    if (!acc[empresaId]) acc[empresaId] = [];
    acc[empresaId].push(ub);
    return acc;
  }, {} as Record<string, typeof vehiculosActivos>);

  const empresaColorMap = new Map<string, string>();
  empresas.forEach((emp, idx) => {
    empresaColorMap.set(emp.id, EMPRESA_COLORS[idx % EMPRESA_COLORS.length]);
  });

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Ahora mismo';
    if (diffMinutes === 1) return 'Hace 1 minuto';
    if (diffMinutes < 60) return `Hace ${diffMinutes} minutos`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours === 1) return 'Hace 1 hora';
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    
    return time.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild>
              <Link to="/publico">
                ← Regresar al Inicio
              </Link>
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-foreground">
                Ubicación en Tiempo Real
              </h1>
              <p className="text-xl text-muted-foreground mt-2">
                Seguimiento en vivo de nuestra flota de vehículos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-sm text-muted-foreground">
              <p>Última actualización:</p>
              <p>{lastUpdate.toLocaleTimeString()}</p>
            </div>
            
            <Button 
              onClick={() => {
                refetch();
                setLastUpdate(new Date());
              }}
              variant="outline"
              size="sm"
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            
            <ThemeToggle />
          </div>
        </div>

        {/* Filtro de Empresa */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <Select value={empresaFiltro || "todas"} onValueChange={(v) => setEmpresaFiltro(v === "todas" ? null : v)}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Todas las empresas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas las empresas</SelectItem>
              {empresas.map((empresa) => (
                <SelectItem key={empresa.id} value={empresa.id}>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: empresaColorMap.get(empresa.id) }} />
                    {empresa.nombre}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Error al cargar ubicaciones: {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <MapPin className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {vehiculosActivos.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Vehículos Activos</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{ubicaciones.length}</p>
                  <p className="text-sm text-muted-foreground">Total Ubicaciones</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <Gauge className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {vehiculosActivos.length > 0 
                      ? Math.round(vehiculosActivos.reduce((acc, u) => acc + (u.velocidad || 0), 0) / vehiculosActivos.length)
                      : 0
                    }
                  </p>
                  <p className="text-sm text-muted-foreground">Velocidad Promedio</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                  <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">30s</p>
                  <p className="text-sm text-muted-foreground">Actualización Auto</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Mapa y Lista */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Mapa */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Mapa en Tiempo Real Multi-Empresa
              </CardTitle>
              <CardDescription>
                Ubicación de vehículos con colores por empresa
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-96 rounded-lg overflow-hidden">
                <MapboxMap 
                  selectedLayer="vehiculos"
                  isRealTime={true}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de vehículos por empresa */}
        <div className="space-y-6">
          {Object.entries(vehiculosPorEmpresa).map(([empresaId, vehiculos]) => {
            const empresa = empresas.find(e => e.id === empresaId);
            const color = empresaColorMap.get(empresaId) || "#6b7280";
            
            return (
              <Card key={empresaId}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
                    {empresa ? (
                      <>
                        <Building2 className="h-5 w-5" />
                        {empresa.nombre}
                      </>
                    ) : "Sin Empresa"}
                    <Badge variant="secondary">{vehiculos.length} vehículos</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehiculos.map((ubicacion) => (
                      <div key={ubicacion.id} className="p-3 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge variant="default">
                            {ubicacion.vehiculo?.placa || 'Sin placa'}
                          </Badge>
                          <Badge variant="secondary" className="text-green-600">
                            Activo
                          </Badge>
                        </div>

                        {ubicacion.conductor && (
                          <p className="text-sm font-medium">
                            {ubicacion.conductor.nombre} {ubicacion.conductor.apellido}
                          </p>
                        )}

                        <div className="text-xs text-muted-foreground space-y-1">
                          <div className="flex items-center gap-1">
                            <Gauge className="h-3 w-3" />
                            <span>{ubicacion.velocidad || 0} km/h</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimeAgo(ubicacion.timestamp_gps)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {vehiculosActivos.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  No hay vehículos activos{empresaFiltro && " para la empresa seleccionada"}
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información del Sistema</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">¿Cómo funciona el seguimiento?</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Los vehículos envían su ubicación cada 30 segundos</li>
                  <li>• La información se actualiza automáticamente</li>
                  <li>• Los vehículos inactivos se ocultan después de 30 minutos</li>
                  <li>• Las velocidades se muestran en tiempo real</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Leyenda del Mapa</h4>
                <div className="space-y-2 text-sm">
                  {empresas.map((empresa, idx) => (
                    <div key={empresa.id} className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: EMPRESA_COLORS[idx % EMPRESA_COLORS.length] }}
                      />
                      <span>{empresa.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}