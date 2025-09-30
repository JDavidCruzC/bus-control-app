import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Bus, MapPin, Clock, Building2, ShieldCheck } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Bus className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-4xl font-bold">Sistema Multi-Empresa de Transporte</h1>
          <p className="text-xl text-muted-foreground">
            Plataforma integral para gestión de múltiples empresas de buses
          </p>
        </div>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button size="lg" onClick={() => navigate("/rutas-publicas")}>
            <MapPin className="mr-2 h-4 w-4" />
            Ver Rutas Disponibles
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/empresa/auth")}>
            <Building2 className="mr-2 h-4 w-4" />
            Portal Empresas
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/superadmin")}>
            <ShieldCheck className="mr-2 h-4 w-4" />
            Super Admin
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/auth/trabajadores")}>
            Acceso Trabajadores
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader>
              <MapPin className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Rutas Públicas</CardTitle>
              <CardDescription>
                Consulta todas las rutas disponibles de todas las empresas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Building2 className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Portal Empresas</CardTitle>
              <CardDescription>
                Registra tu empresa y gestiona tus rutas y vehículos
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Tiempo Real</CardTitle>
              <CardDescription>
                Ubicación en vivo de todos los buses del sistema
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
