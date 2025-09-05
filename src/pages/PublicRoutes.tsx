import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus, MapPin, Clock, Users } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const PublicRoutes = () => {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header con toggle de tema */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        
        {/* Header principal */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Consulta de Rutas y Horarios
          </h1>
          <p className="text-xl text-muted-foreground">
            Información en tiempo real del transporte público
          </p>
        </div>

        {/* Quick Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Bus className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Rutas Activas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">12</p>
              <CardDescription>Rutas en operación</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Paraderos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">45</p>
              <CardDescription>Paradas disponibles</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Horario</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-bold text-primary">5:00 - 22:00</p>
              <CardDescription>Lunes a Domingo</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Vehículos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">28</p>
              <CardDescription>Unidades activas</CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Routes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bus className="h-6 w-6" />
                Consultar Rutas
              </CardTitle>
              <CardDescription>
                Encuentra la mejor ruta para tu destino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                Ver Mapa de Rutas
              </Button>
              <Button className="w-full" variant="outline">
                Buscar por Destino
              </Button>
              <Button className="w-full" variant="outline">
                Horarios y Frecuencias
              </Button>
            </CardContent>
          </Card>

          {/* Real-time Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6" />
                Ubicación en Tiempo Real
              </CardTitle>
              <CardDescription>
                Rastrea tu autobús y conoce los tiempos de llegada
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full" variant="outline">
                Rastrear Vehículo
              </Button>
              <Button className="w-full" variant="outline">
                Paraderos Cercanos
              </Button>
              <Button className="w-full" variant="outline">
                Tiempos de Llegada
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>¿Necesitas más información?</CardTitle>
              <CardDescription>
                Contacta con nuestro servicio al cliente para reportes o consultas especiales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button variant="outline">
                  Reportar Incidencia
                </Button>
                <Button variant="outline">
                  Contacto y Soporte
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PublicRoutes;