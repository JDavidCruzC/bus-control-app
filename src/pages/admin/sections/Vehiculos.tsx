import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bus, Plus, Edit, Trash2, Search, Fuel, Settings } from "lucide-react";
import { useVehiculos, type Vehiculo } from "@/hooks/useVehiculos";
import { VehiculoDialog } from "@/components/admin/VehiculoDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export function Vehiculos() {
  const { vehiculos, loading, updateVehiculo } = useVehiculos();
  const [selectedVehiculo, setSelectedVehiculo] = useState<Vehiculo | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  const filteredVehiculos = vehiculos.filter(vehiculo => {
    const matchesSearch = vehiculo.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehiculo.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (vehiculo.numero_interno || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'activo' && vehiculo.activo) ||
                         (statusFilter === 'inactivo' && !vehiculo.activo);
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: vehiculos.length,
    activos: vehiculos.filter(v => v.activo).length,
    inactivos: vehiculos.filter(v => !v.activo).length,
    conGps: vehiculos.filter(v => v.tiene_gps).length,
    conAire: vehiculos.filter(v => v.tiene_aire).length,
  };

  const handleEdit = (vehiculo: Vehiculo) => {
    setSelectedVehiculo(vehiculo);
    setDialogOpen(true);
  };

  const handleNew = () => {
    setSelectedVehiculo(null);
    setDialogOpen(true);
  };

  const handleToggleStatus = async (vehiculo: Vehiculo) => {
    await updateVehiculo(vehiculo.id, { activo: !vehiculo.activo });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bus className="h-6 w-6 text-primary" />
            Gestión de Buses
          </h1>
          <p className="text-muted-foreground mt-1">
            Administrar la flota de buses de transporte
          </p>
        </div>
        <Button onClick={handleNew} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Bus
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por placa, marca o número interno..."
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
                <p className="text-2xl font-bold text-blue-600">{stats.conGps}</p>
                <p className="text-sm text-muted-foreground">Con GPS</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{stats.conAire}</p>
                <p className="text-sm text-muted-foreground">Con A/C</p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Vehiculos List */}
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
        ) : filteredVehiculos.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Bus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay vehículos</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron vehículos con los filtros aplicados'
                  : 'Comienza registrando tu primer vehículo'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVehiculos.map((vehiculo) => (
            <Card key={vehiculo.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{vehiculo.placa}</CardTitle>
                      {vehiculo.numero_interno && (
                        <Badge variant="outline">#{vehiculo.numero_interno}</Badge>
                      )}
                      <Badge variant={vehiculo.activo ? "default" : "secondary"}>
                        {vehiculo.activo ? "Activo" : "Inactivo"}
                      </Badge>
                    </div>
                    <CardDescription className="mt-1">
                      {vehiculo.marca && vehiculo.modelo ? `${vehiculo.marca} ${vehiculo.modelo}` : 'Sin información de marca/modelo'} 
                      {vehiculo.año && ` (${vehiculo.año})`}
                    </CardDescription>
                    <div className="flex gap-2 mt-2">
                      {vehiculo.tiene_gps && (
                        <Badge variant="outline" className="text-xs">GPS</Badge>
                      )}
                      {vehiculo.tiene_aire && (
                        <Badge variant="outline" className="text-xs">A/C</Badge>
                      )}
                      {vehiculo.capacidad_pasajeros && (
                        <Badge variant="outline" className="text-xs">{vehiculo.capacidad_pasajeros} asientos</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      {vehiculo.color && (
                        <span>Color: {vehiculo.color}</span>
                      )}
                      <span className="text-xs">
                        Registrado: {new Date(vehiculo.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEdit(vehiculo)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(vehiculo)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      {vehiculo.activo ? 'Desactivar' : 'Activar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <VehiculoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vehiculo={selectedVehiculo}
      />
    </div>
  );
}