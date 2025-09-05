import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Plus, Edit, Trash2, Navigation } from "lucide-react";

export function Paradero() {
  const paraderos = [
    { id: 1, nombre: "Plaza de Armas", direccion: "Av. Principal 123", estado: "Activo", rutas: 3 },
    { id: 2, nombre: "Terminal Central", direccion: "Calle Central 456", estado: "Activo", rutas: 5 },
    { id: 3, nombre: "Hospital Regional", direccion: "Av. Salud 789", estado: "Activo", rutas: 2 },
    { id: 4, nombre: "Universidad", direccion: "Campus Norte", estado: "Mantenimiento", rutas: 4 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <MapPin className="h-6 w-6 text-primary" />
            Gestión de Paraderos
          </h1>
          <p className="text-muted-foreground mt-1">
            Administrar ubicaciones y estado de las paradas de autobús
          </p>
        </div>
        <Button className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Paradero
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">156</p>
              <p className="text-sm text-muted-foreground">Total Paraderos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">148</p>
              <p className="text-sm text-muted-foreground">Activos</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">6</p>
              <p className="text-sm text-muted-foreground">Mantenimiento</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-red-600">2</p>
              <p className="text-sm text-muted-foreground">Fuera de Servicio</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paraderos List */}
      <div className="grid gap-4">
        {paraderos.map((paradero) => (
          <Card key={paradero.id}>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <CardTitle className="text-lg">{paradero.nombre}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Navigation className="h-3 w-3" />
                    {paradero.direccion}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    paradero.estado === 'Activo' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {paradero.estado}
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="text-sm text-muted-foreground">
                  <span className="font-medium">{paradero.rutas}</span> rutas conectadas
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Button>
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4 mr-1" />
                    Ver en Mapa
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}