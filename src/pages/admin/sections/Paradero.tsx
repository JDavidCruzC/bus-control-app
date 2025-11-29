import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Plus, Edit, Trash2, Navigation, Search, Filter } from "lucide-react";
import { useParaderos, type Paradero } from "@/hooks/useParaderos";
import { ParaderoDialog } from "@/components/admin/ParaderoDialog";
import { GestionRutasDialog } from "@/components/admin/GestionRutasDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { RutaSelector } from "@/components/admin/RutaSelector";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function Paradero() {
  const { paraderos, loading, deleteParadero } = useParaderos();
  const [selectedParadero, setSelectedParadero] = useState<Paradero | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');
  const [selectedRutaId, setSelectedRutaId] = useState<string>("");

  const filteredParaderos = paraderos.filter(paradero => {
    const matchesSearch = paradero.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (paradero.direccion || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'activo' && paradero.activo) ||
                         (statusFilter === 'inactivo' && !paradero.activo);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: paraderos.length,
    activos: paraderos.filter(p => p.activo).length,
    inactivos: paraderos.filter(p => !p.activo).length,
    conAsientos: paraderos.filter(p => p.tiene_asientos).length,
    conTechado: paraderos.filter(p => p.tiene_techado).length,
  };

  const handleEdit = (paradero: Paradero) => {
    setSelectedParadero(paradero);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedParadero(null);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    await deleteParadero(id);
  };

  const [rutasDialogOpen, setRutasDialogOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Gestión de Paraderos y Rutas
          </h1>
          <p className="text-muted-foreground mt-1">
            Administrar ubicaciones de paradas y trazado completo de rutas
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button 
            onClick={() => setRutasDialogOpen(true)} 
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Gestionar Rutas
          </Button>
          <Button 
            onClick={handleNew} 
            className="flex-1 sm:flex-none"
            disabled={!selectedRutaId}
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Paradero
          </Button>
        </div>
      </div>

      {/* Route Selector */}
      <Card>
        <CardContent className="pt-6">
          <RutaSelector
            value={selectedRutaId}
            onChange={setSelectedRutaId}
            label="Selecciona la Ruta"
            placeholder="Selecciona la ruta para gestionar sus paraderos"
            showDescription={true}
          />
          {selectedRutaId && (
            <Alert className="mt-4">
              <Navigation className="h-4 w-4" />
              <AlertDescription>
                Estás gestionando paraderos para la ruta seleccionada. Los nuevos paraderos se crearán en esta ruta.
              </AlertDescription>
            </Alert>
          )}
          {!selectedRutaId && (
            <Alert className="mt-4">
              <AlertDescription>
                Selecciona una ruta para ver y gestionar sus paraderos
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar paraderos..."
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
            Todos
          </Button>
          <Button 
            variant={statusFilter === 'activo' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('activo')}
          >
            Activos
          </Button>
          <Button 
            variant={statusFilter === 'inactivo' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setStatusFilter('inactivo')}
          >
            Inactivos
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
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
                <p className="text-sm text-muted-foreground">Total</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-green-600">{stats.activos}</p>
                <p className="text-sm text-muted-foreground">Activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-red-600">{stats.inactivos}</p>
                <p className="text-sm text-muted-foreground">Inactivos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-blue-600">{stats.conAsientos}</p>
                <p className="text-sm text-muted-foreground">Con Asientos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.conTechado}</p>
                <p className="text-sm text-muted-foreground">Techados</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Paraderos List */}
      <div className="grid gap-4">
        {loading ? (
          Array.from({ length: 4 }).map((_, i) => (
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
        ) : filteredParaderos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay paraderos</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron paraderos con los filtros aplicados'
                  : 'Comienza agregando tu primer paradero'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredParaderos.map((paradero) => (
            <Card key={paradero.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{paradero.nombre}</CardTitle>
                      <Badge variant={paradero.activo ? "default" : "secondary"}>
                        {paradero.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center gap-1 mt-1">
                      <Navigation className="h-3 w-3" />
                      {paradero.direccion || 'Sin dirección'}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {paradero.tiene_asientos && (
                        <Badge variant="outline" className="text-xs">Con Asientos</Badge>
                      )}
                      {paradero.tiene_techado && (
                        <Badge variant="outline" className="text-xs">Techado</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    <p>Lat: {paradero.latitud.toFixed(6)}, Lng: {paradero.longitud.toFixed(6)}</p>
                    {paradero.descripcion && (
                      <p className="mt-1">{paradero.descripcion}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(paradero)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open(`https://www.google.com/maps?q=${paradero.latitud},${paradero.longitud}`, '_blank')}
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Ver en Mapa
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive hover:text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar paradero?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. El paradero "{paradero.nombre}" será eliminado permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction 
                            onClick={() => handleDelete(paradero.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <ParaderoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paradero={selectedParadero}
        rutaId={selectedRutaId}
      />

      <GestionRutasDialog
        open={rutasDialogOpen}
        onOpenChange={setRutasDialogOpen}
      />
    </div>
  );
}