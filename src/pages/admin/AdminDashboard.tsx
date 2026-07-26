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
  Clock,
  AlertTriangle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useStats } from "@/hooks/useStats";
import { Skeleton } from "@/components/ui/skeleton";

export function AdminDashboard() {
  const navigate = useNavigate();
  const { stats, loading } = useStats();

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

  const dashboardStats = [
    { 
      label: "Buses Activos", 
      value: loading ? "..." : stats.vehiculosActivos.toString(), 
      total: loading ? "..." : stats.totalVehiculos.toString(),
      icon: Bus, 
      color: "text-primary" 
    },
    { 
      label: "Conductores Activos", 
      value: loading ? "..." : stats.conductoresActivos.toString(), 
      total: loading ? "..." : stats.totalConductores.toString(),
      icon: UserCheck, 
      color: "text-secondary" 
    },
    { 
      label: "Rutas Activas", 
      value: loading ? "..." : stats.rutasActivas.toString(), 
      total: loading ? "..." : stats.totalRutas.toString(),
      icon: Route, 
      color: "text-accent" 
    },
    { 
      label: "Paraderos", 
      value: loading ? "..." : stats.paraderosActivos.toString(), 
      total: loading ? "..." : stats.totalParaderos.toString(),
      icon: MapPin, 
      color: "text-muted-foreground" 
    }
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
        {dashboardStats.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="p-4">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-baseline gap-2">
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-sm text-muted-foreground">/ {stat.total}</p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {stat.label === "Buses Activos" && `${stats.viajesHoy} viajes hoy`}
                      {stat.label === "Conductores Activos" && `En servicio`}
                      {stat.label === "Rutas Activas" && `En operación`}
                      {stat.label === "Paraderos" && `Habilitados`}
                    </p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alerts */}
      {!loading && stats.reportesPendientes > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="font-medium text-yellow-800 dark:text-yellow-200">
                  Reportes Pendientes
                </p>
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Tienes {stats.reportesPendientes} reportes pendientes de revisión
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="ml-auto border-yellow-300 text-yellow-700 hover:bg-yellow-100"
                onClick={() => navigate("/admin/reportes")}
              >
                Ver Reportes
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

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