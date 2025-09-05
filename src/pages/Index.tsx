import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bus, Shield, Users, MapPin } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

const Index = () => {
  const modules = [
    {
      id: "auth",
      title: "Sistema de Autenticación",
      description: "Login y registro para administradores, conductores y clientes",
      icon: Shield,
      color: "bg-primary text-primary-foreground",
      route: "/auth"
    },
    {
      id: "admin",
      title: "Dashboard Administrador", 
      description: "Gestión de vehículos, conductores, rutas y empresas",
      icon: Users,
      color: "bg-secondary text-secondary-foreground",
      route: "/admin"
    },
    {
      id: "driver",
      title: "Interfaz Conductor",
      description: "Control de viajes, ubicación en tiempo real y reportes",
      icon: Bus,
      color: "bg-accent text-accent-foreground", 
      route: "/conductor"
    },
    {
      id: "public",
      title: "Interfaz Pública",
      description: "Consulta de rutas, paraderos y ubicaciones en tiempo real",
      icon: MapPin,
      color: "bg-muted text-muted-foreground",
      route: "/publico"
    }
  ];

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header con toggle de tema */}
        <div className="flex justify-end mb-6">
          <ThemeToggle />
        </div>
        
        {/* Header principal */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Sistema de Transporte Público
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Bahía del Sur - Plataforma Integral de Gestión
          </p>
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Bus className="h-5 w-5" />
            <span>Conectando tu ciudad</span>
          </div>
        </div>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {modules.map((module) => {
            const IconComponent = module.icon;
            return (
              <Card key={module.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="text-center pb-4">
                  <div className={`w-16 h-16 mx-auto rounded-lg flex items-center justify-center ${module.color} mb-4`}>
                    <IconComponent className="h-8 w-8" />
                  </div>
                  <CardTitle className="text-lg">{module.title}</CardTitle>
                  <CardDescription className="text-sm">
                    {module.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => {
                      if (module.id === "auth") {
                        // Mostrar opciones de autenticación
                        const userType = prompt("Seleccione tipo de usuario:\n1. Trabajadores (admin/conductores)\n2. Clientes\n\nIngrese 1 o 2:");
                        if (userType === "1") {
                          window.location.href = "/auth/trabajadores";
                        } else if (userType === "2") {
                          window.location.href = "/auth/clientes";
                        }
                      } else if (module.id === "public") {
                        window.location.href = "/publico";
                      } else {
                        alert(`Próximamente: ${module.title}`);
                      }
                    }}
                  >
                    Acceder
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Sobre el Sistema</CardTitle>
              <CardDescription>
                Plataforma completa para la gestión de transporte público con seguimiento en tiempo real,
                gestión de rutas, control de flota y atención al cliente.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
