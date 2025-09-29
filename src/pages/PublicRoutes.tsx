import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useRutasPublicas } from "@/hooks/useRutasPublicas";
import { 
  MapPin, 
  Clock, 
  Users, 
  Car,
  Route,
  Navigation,
  Phone,
  AlertTriangle,
  Building2
} from "lucide-react";

const PublicRoutes = () => {
  const { empresas, loading: loadingEmpresas } = useEmpresas();
  const { rutas, loading: loadingRutas } = useRutasPublicas();
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
                <Building2 className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Empresas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{loadingEmpresas ? "..." : empresas.length}</p>
              <CardDescription>Operando en el sistema</CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Rutas Activas</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-primary">{loadingRutas ? "..." : rutas.length}</p>
              <CardDescription>En toda la ciudad</CardDescription>
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

        {/* Empresas Disponibles */}
        {empresas.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              Empresas de Transporte
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {empresas.map((empresa) => (
                <Card key={empresa.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {empresa.logo_url ? (
                        <img 
                          src={empresa.logo_url} 
                          alt={empresa.nombre}
                          className="h-8 w-8 object-contain rounded"
                        />
                      ) : (
                        <Building2 className="h-6 w-6" />
                      )}
                      {empresa.nombre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm text-muted-foreground">
                      {empresa.telefono && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4" />
                          {empresa.telefono}
                        </div>
                      )}
                      <Badge variant="outline" className="mt-2">
                        {rutas.filter(r => r.empresa_id === empresa.id).length} rutas
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Main Features */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Routes Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Route className="h-6 w-6" />
                Consultar Rutas
              </CardTitle>
              <CardDescription>
                Encuentra la mejor ruta para tu destino
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/publico/rutas">
                  <Route className="mr-2 h-5 w-5" />
                  Ver Todas las Rutas
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/publico/rutas">
                  <MapPin className="mr-2 h-5 w-5" />
                  Buscar Paradero
                </Link>
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
              <Button size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/publico/ubicacion">
                  <Navigation className="mr-2 h-5 w-5" />
                  Ver Mapa en Vivo
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="w-full sm:w-auto" asChild>
                <Link to="/publico/ubicacion">
                  <Clock className="mr-2 h-5 w-5" />
                  Tiempos de Llegada
                </Link>
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