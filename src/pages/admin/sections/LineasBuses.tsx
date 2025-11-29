import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, Plus, Edit, Search, Clock, DollarSign } from "lucide-react";
import { useLineasBuses, type LineaBus } from "@/hooks/useLineasBuses";
import { LineaBusDialog } from "@/components/admin/LineaBusDialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimulacionBusesCard } from "@/components/admin/SimulacionBusesCard";

export function LineasBuses() {
  const { lineasBuses, loading } = useLineasBuses();
  const [selectedLineaBus, setSelectedLineaBus] = useState<LineaBus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  const filteredLineas = lineasBuses.filter(linea => {
    const matchesSearch = linea.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         linea.nombre.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'activo' && linea.activo) ||
                         (statusFilter === 'inactivo' && !linea.activo);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: lineasBuses.length,
    activas: lineasBuses.filter(l => l.activo).length,
    tiempoPromedio: lineasBuses.length > 0 
      ? Math.round(lineasBuses.reduce((acc, l) => acc + (l.tiempo_estimado_minutos || 0), 0) / lineasBuses.length)
      : 0,
    precioPromedio: lineasBuses.length > 0
      ? (lineasBuses.reduce((acc, l) => acc + (l.precio || 0), 0) / lineasBuses.length).toFixed(2)
      : '0.00'
  };

  const handleEdit = (linea: LineaBus) => {
    setSelectedLineaBus(linea);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedLineaBus(null);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            Gestión de Líneas de Buses
          </h1>
          <p className="text-muted-foreground mt-1">
            Administra las líneas de transporte de tu empresa (ej: Línea D, Línea 14)
          </p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Línea
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código o nombre de línea..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={statusFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('all')}
          >
            Todas
          </Button>
          <Button 
            variant={statusFilter === 'activo' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('activo')}
          >
            Activas
          </Button>
          <Button 
            variant={statusFilter === 'inactivo' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('inactivo')}
          >
            Inactivas
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))
        ) : (
          <>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-primary">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total de Líneas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.activas}</p>
                <p className="text-sm text-muted-foreground">Líneas Activas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <p className="text-2xl font-bold text-blue-600">{stats.tiempoPromedio}</p>
                </div>
                <p className="text-sm text-muted-foreground">Minutos Promedio</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <p className="text-2xl font-bold text-purple-600">S/. {stats.precioPromedio}</p>
                </div>
                <p className="text-sm text-muted-foreground">Precio Promedio</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Simulation Card */}
      <SimulacionBusesCard />

      {/* Lines List */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-60" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-32" />
              </CardContent>
            </Card>
          ))
        ) : filteredLineas.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="p-8 text-center">
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay líneas de buses</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron líneas con los filtros aplicados'
                  : 'Comienza registrando tu primera línea de bus'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button onClick={handleNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Primera Línea
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredLineas.map((linea) => (
            <Card key={linea.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-xl">Línea {linea.codigo}</CardTitle>
                      <Badge variant={linea.activo ? "default" : "secondary"}>
                        {linea.activo ? "Activa" : "Inactiva"}
                      </Badge>
                    </div>
                    <CardDescription className="font-medium text-foreground/80">
                      {linea.nombre}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {linea.descripcion && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {linea.descripcion}
                  </p>
                )}
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {linea.distancia_km !== undefined && linea.distancia_km > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="text-muted-foreground">Distancia:</span>
                      <span className="font-medium">{linea.distancia_km.toFixed(2)} km</span>
                    </div>
                  )}
                  
                  {linea.tiempo_estimado_minutos !== undefined && linea.tiempo_estimado_minutos > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">{linea.tiempo_estimado_minutos} min</span>
                    </div>
                  )}
                  
                  {linea.precio !== undefined && linea.precio > 0 && (
                    <div className="flex items-center gap-1">
                      <DollarSign className="h-3 w-3 text-muted-foreground" />
                      <span className="font-medium">S/. {linea.precio.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEdit(linea)}
                  className="w-full"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Editar Línea
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <LineaBusDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        lineaBus={selectedLineaBus}
      />
    </div>
  );
}
