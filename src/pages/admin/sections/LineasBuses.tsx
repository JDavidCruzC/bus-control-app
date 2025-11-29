import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, Plus, Edit, Search, Clock, DollarSign, Trash2, Power, PowerOff } from "lucide-react";
import { useLineasBuses, type LineaBus } from "@/hooks/useLineasBuses";
import { LineaBusDialog } from "@/components/admin/LineaBusDialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SimulacionBusesCard } from "@/components/admin/SimulacionBusesCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export function LineasBuses() {
  const { lineasBuses, loading, updateLineaBus, refetch } = useLineasBuses();
  const { toast } = useToast();
  const [selectedLineaBus, setSelectedLineaBus] = useState<LineaBus | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [lineaToDelete, setLineaToDelete] = useState<LineaBus | null>(null);

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

  const handleToggleActivo = async (linea: LineaBus) => {
    try {
      await updateLineaBus(linea.id, { activo: !linea.activo });
      toast({
        title: "Éxito",
        description: `Línea ${linea.activo ? 'desactivada' : 'activada'} correctamente`
      });
      refetch();
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el estado de la línea",
        variant: "destructive"
      });
    }
  };

  const handleDeleteClick = (linea: LineaBus) => {
    setLineaToDelete(linea);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!lineaToDelete) return;
    
    try {
      // Check if there are any dependencies
      const { data: vehiculos } = await supabase
        .from('vehiculos')
        .select('id')
        .eq('ruta_id', lineaToDelete.id)
        .limit(1);
      
      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('id')
        .eq('linea_id', lineaToDelete.id)
        .limit(1);

      if (vehiculos && vehiculos.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "Esta línea tiene vehículos asignados. Reasígnalos o elimínalos primero.",
          variant: "destructive"
        });
        return;
      }

      if (usuarios && usuarios.length > 0) {
        toast({
          title: "No se puede eliminar",
          description: "Esta línea tiene usuarios asignados. Reasígnalos primero.",
          variant: "destructive"
        });
        return;
      }

      // Delete route geometry first
      await supabase
        .from('rutas_geometria')
        .delete()
        .eq('ruta_id', lineaToDelete.id);

      // Delete the line
      const { error } = await supabase
        .from('rutas')
        .delete()
        .eq('id', lineaToDelete.id);

      if (error) throw error;

      toast({
        title: "Éxito",
        description: "Línea eliminada correctamente"
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar la línea",
        variant: "destructive"
      });
    } finally {
      setDeleteDialogOpen(false);
      setLineaToDelete(null);
    }
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

                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleEdit(linea)}
                    className="flex-1"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant={linea.activo ? "secondary" : "default"}
                    size="sm"
                    onClick={() => handleToggleActivo(linea)}
                    title={linea.activo ? "Desactivar línea" : "Activar línea"}
                  >
                    {linea.activo ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDeleteClick(linea)}
                    title="Eliminar línea"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la línea <strong>{lineaToDelete?.codigo} - {lineaToDelete?.nombre}</strong> y su trayecto.
              <br /><br />
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
