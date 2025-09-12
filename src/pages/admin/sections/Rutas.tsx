import { useState } from "react";
import { useRutas } from "@/hooks/useRutas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RutaDialog } from "@/components/admin/RutaDialog";
import { 
  Search, 
  Plus, 
  Route,
  Clock,
  MapPin,
  DollarSign,
  Filter,
  Edit
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function Rutas() {
  const { rutas, loading, createRuta, updateRuta } = useRutas();
  const [searchTerm, setSearchTerm] = useState("");
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRuta, setSelectedRuta] = useState(null);

  const filteredRutas = rutas.filter(ruta => {
    const matchesSearch = ruta.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ruta.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEstado = estadoFilter === "todos" || 
                         (estadoFilter === "activo" && ruta.activo) ||
                         (estadoFilter === "inactivo" && !ruta.activo);
    return matchesSearch && matchesEstado;
  });

  const handleEdit = (ruta) => {
    setSelectedRuta(ruta);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedRuta(null);
    setDialogOpen(true);
  };


  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestión de Rutas</h1>
          <p className="text-muted-foreground">
            Administra las rutas del sistema de transporte
          </p>
        </div>
        <Button onClick={handleCreate} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Ruta
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={estadoFilter} onValueChange={setEstadoFilter}>
                <SelectTrigger className="w-40">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="activo">Activos</SelectItem>
                  <SelectItem value="inactivo">Inactivos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Route className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{rutas.length}</p>
                <p className="text-muted-foreground text-sm">Total Rutas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {rutas.filter(r => r.activo).length}
                </p>
                <p className="text-muted-foreground text-sm">Activas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {Math.round(rutas.reduce((acc, r) => acc + (r.tiempo_estimado_minutos || 0), 0) / rutas.length || 0)}
                </p>
                <p className="text-muted-foreground text-sm">Tiempo Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <DollarSign className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold text-yellow-600">
                  ${Math.round(rutas.reduce((acc, r) => acc + (r.precio || 0), 0) / rutas.length * 100) / 100 || 0}
                </p>
                <p className="text-muted-foreground text-sm">Precio Promedio</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Rutas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRutas.map((ruta) => (
          <Card key={ruta.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{ruta.nombre}</CardTitle>
                  <p className="text-muted-foreground text-sm">Código: {ruta.codigo}</p>
                </div>
                <Badge variant={ruta.activo ? "default" : "secondary"}>
                  {ruta.activo ? "Activa" : "Inactiva"}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {ruta.descripcion && (
                <p className="text-sm text-muted-foreground">{ruta.descripcion}</p>
              )}
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                {ruta.distancia_km && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{ruta.distancia_km} km</span>
                  </div>
                )}
                {ruta.tiempo_estimado_minutos && (
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{ruta.tiempo_estimado_minutos} min</span>
                  </div>
                )}
                {ruta.precio && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>${ruta.precio}</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={() => handleEdit(ruta)}
                variant="outline"
                size="sm"
                className="w-full"
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRutas.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Route className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron rutas</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || estadoFilter !== "todos" 
                ? "Intenta ajustar los filtros de búsqueda"
                : "Comienza creando tu primera ruta"
              }
            </p>
            {!searchTerm && estadoFilter === "todos" && (
              <Button onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Crear Primera Ruta
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      <RutaDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ruta={selectedRuta}
      />
    </div>
  );
}