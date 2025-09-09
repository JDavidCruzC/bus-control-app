import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserCheck, Search, Phone, Edit, ToggleLeft, ToggleRight } from "lucide-react";
import { useConductores, type Conductor } from "@/hooks/useConductores";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export function Conductores() {
  const { conductores, loading, updateConductor } = useConductores();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<'all' | 'activo' | 'inactivo'>('all');

  const filteredConductores = conductores.filter(conductor => {
    const matchesSearch = conductor.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conductor.apellido.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conductor.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (conductor.telefono || '').includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'activo' && conductor.estado === 'activo') ||
                         (statusFilter === 'inactivo' && conductor.estado !== 'activo');
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: conductores.length,
    activos: conductores.filter(c => c.estado === 'activo').length,
    inactivos: conductores.filter(c => c.estado !== 'activo').length,
  };

  const handleToggleStatus = async (conductor: Conductor) => {
    const newStatus = conductor.estado === 'activo' ? 'inactivo' : 'activo';
    await updateConductor(conductor.id, { estado: newStatus });
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCheck className="h-6 w-6 text-primary" />
            Gestión de Conductores
          </h1>
          <p className="text-muted-foreground mt-1">
            Administrar conductores de la flota de transporte
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre, placa o teléfono..."
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
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
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
                <p className="text-sm text-muted-foreground">Total Conductores</p>
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
          </>
        )}
      </div>

      {/* Conductores List */}
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
        ) : filteredConductores.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <UserCheck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay conductores</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'No se encontraron conductores con los filtros aplicados'
                  : 'No hay conductores registrados en el sistema'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredConductores.map((conductor) => (
            <Card key={conductor.id}>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {getInitials(conductor.nombre, conductor.apellido)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">
                          {conductor.nombre} {conductor.apellido}
                        </CardTitle>
                        <Badge variant={conductor.estado === 'activo' ? "default" : "secondary"}>
                          {conductor.estado === 'activo' ? "Activo" : "Inactivo"}
                        </Badge>
                      </div>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <span>Placa: {conductor.placa}</span>
                        {conductor.telefono && (
                          <>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {conductor.telefono}
                            </span>
                          </>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="text-sm text-muted-foreground">
                    <span>Registrado: {new Date(conductor.created_at).toLocaleDateString()}</span>
                    {conductor.updated_at !== conductor.created_at && (
                      <span className="ml-4">
                        Actualizado: {new Date(conductor.updated_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleToggleStatus(conductor)}
                    >
                      {conductor.estado === 'activo' ? (
                        <ToggleRight className="h-4 w-4 mr-1" />
                      ) : (
                        <ToggleLeft className="h-4 w-4 mr-1" />
                      )}
                      {conductor.estado === 'activo' ? 'Desactivar' : 'Activar'}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      disabled
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}