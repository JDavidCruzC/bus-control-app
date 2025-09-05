import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  MapPin, 
  Map, 
  Eye, 
  Users, 
  UserCheck, 
  Route, 
  FileBarChart,
  Settings,
  TrendingUp,
  Bus,
  Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export function AdminDashboard() {
  const navigate = useNavigate();

  const quickActions = [
    {
      title: "Ver Paraderos",
      description: "Gestionar ubicaciones de paradas",
      icon: MapPin,
      action: () => navigate("/admin/paradero"),
      color: "bg-primary text-primary-foreground"
    },
    {
      title: "Monitoreo en Vivo",
      description: "Seguimiento de flota en tiempo real",
      icon: Map,
      action: () => navigate("/admin/mapa"),
      color: "bg-secondary text-secondary-foreground"
    },
    {
      title: "Gestión de Personal",
      description: "Administrar trabajadores y conductores",
      icon: Users,
      action: () => navigate("/admin/trabajadores"),
      color: "bg-accent text-accent-foreground"
    },
    {
      title: "Reportes",
      description: "Análisis y estadísticas del sistema",
      icon: FileBarChart,
      action: () => navigate("/admin/reportes"),
      color: "bg-muted text-muted-foreground"
    }
  ];

  const stats = [
    { label: "Buses Activos", value: "24", icon: Bus, trend: "+2" },
    { label: "Conductores", value: "18", icon: UserCheck, trend: "+1" },
    { label: "Rutas", value: "8", icon: Route, trend: "0" },
    { label: "Paraderos", value: "156", icon: MapPin, trend: "+5" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard Administrador</h1>
        <p className="text-muted-foreground mt-2">
          Gestión integral del sistema de transporte público
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <div className="flex items-center gap-1 text-xs text-green-600">
                    <TrendingUp className="h-3 w-3" />
                    <span>{stat.trend}</span>
                  </div>
                </div>
                <stat.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quickActions.map((action) => (
            <Card key={action.title} className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="pb-4">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${action.color} mb-3`}>
                  <action.icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{action.title}</CardTitle>
                <CardDescription>{action.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={action.action}
                >
                  Acceder
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <UserCheck className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo conductor registrado</p>
                <p className="text-xs text-muted-foreground">José García - Hace 2 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <Route className="h-4 w-4 text-secondary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Ruta actualizada</p>
                <p className="text-xs text-muted-foreground">Ruta Centro-Norte - Hace 4 horas</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-2 rounded-lg bg-muted/50">
              <MapPin className="h-4 w-4 text-accent" />
              <div className="flex-1">
                <p className="text-sm font-medium">Nuevo paradero agregado</p>
                <p className="text-xs text-muted-foreground">Plaza de Armas - Hace 1 día</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}