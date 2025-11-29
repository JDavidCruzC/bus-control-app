import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUsuarios } from "@/hooks/useUsuarios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Users, 
  UserCheck, 
  Calendar,
  CreditCard,
  ArrowRight,
  AlertCircle,
  DollarSign
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PagoDialog } from "@/components/empresa/PagoDialog";

export function EmpresaDashboard() {
  const { userData } = useAuth();
  const { usuarios } = useUsuarios();
  const navigate = useNavigate();
  const [pagoDialogOpen, setPagoDialogOpen] = useState(false);

  const empresa = userData?.empresa;
  const usuariosActivos = usuarios.filter(u => u.activo).length;
  const diasRestantes = empresa?.fecha_vencimiento_membresia 
    ? Math.ceil((new Date(empresa.fecha_vencimiento_membresia).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : 0;

  const getEstadoMembresia = () => {
    if (!empresa) return { color: "secondary", text: "No disponible" };
    
    switch (empresa.estado_membresia) {
      case 'activa':
        return { color: "default", text: "Activa" };
      case 'vencida':
        return { color: "destructive", text: "Vencida" };
      case 'suspendida':
        return { color: "secondary", text: "Suspendida" };
      default:
        return { color: "secondary", text: empresa.estado_membresia };
    }
  };

  const estadoMembresia = getEstadoMembresia();

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Bienvenido, Gerente</h1>
        <p className="text-muted-foreground">
          Panel de control de {empresa?.nombre || "tu empresa"}
        </p>
      </div>

      {/* Membership Alert */}
      {diasRestantes > 0 && diasRestantes <= 7 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu membresía vence en {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'}. Considera renovar pronto.
          </AlertDescription>
        </Alert>
      )}

      {diasRestantes <= 0 && empresa?.estado_membresia === 'vencida' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Tu membresía ha vencido. Contacta con soporte para renovar.
          </AlertDescription>
        </Alert>
      )}

      {/* Company Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Información de la Empresa
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-semibold">{empresa?.nombre || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">RUC</p>
              <p className="font-semibold">{empresa?.ruc || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{empresa?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teléfono</p>
              <p className="font-semibold">{empresa?.telefono || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{usuarios.length}</p>
                <p className="text-sm text-muted-foreground">Total Usuarios</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">{usuariosActivos}</p>
                <p className="text-sm text-muted-foreground">Usuarios Activos</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">{diasRestantes > 0 ? diasRestantes : 0}</p>
                <p className="text-sm text-muted-foreground">Días Restantes</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Estado de Membresía
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Plan Actual</p>
              <p className="font-semibold capitalize">{empresa?.tipo_plan || "N/A"}</p>
            </div>
            <Badge variant={estadoMembresia.color as any}>
              {estadoMembresia.text}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
            <p className="font-semibold">
              {empresa?.fecha_vencimiento_membresia 
                ? new Date(empresa.fecha_vencimiento_membresia).toLocaleDateString('es-ES')
                : "N/A"
              }
            </p>
          </div>
          <Button 
            onClick={() => setPagoDialogOpen(true)}
            className="w-full"
            variant="outline"
          >
            <DollarSign className="mr-2 h-4 w-4" />
            Registrar Pago de Membresía
          </Button>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button 
            onClick={() => navigate("/empresa/usuarios")}
            className="w-full justify-between"
            variant="outline"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Gestionar Usuarios
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button 
            onClick={() => navigate("/admin")}
            className="w-full justify-between"
          >
            <span className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Ir a Operaciones
            </span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      <PagoDialog open={pagoDialogOpen} onOpenChange={setPagoDialogOpen} />
    </div>
  );
}
