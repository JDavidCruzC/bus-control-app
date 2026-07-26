import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2, CreditCard, FileText, TrendingUp } from "lucide-react";
import { useEmpresas } from "@/hooks/useEmpresas";
import { useMembresias } from "@/hooks/useMembresias";
import { usePagos } from "@/hooks/usePagos";

export function SuperAdminDashboard() {
  const { empresas, loading: loadingEmpresas } = useEmpresas();
  const { membresias, loading: loadingMembresias } = useMembresias();
  const { pagos, loading: loadingPagos } = usePagos();

  const empresasActivas = empresas.filter(e => e.estado_membresia === 'activa').length;
  const membresiasActivas = membresias.filter(m => m.estado === 'activa').length;
  const pagosCompletados = pagos.filter(p => p.estado === 'completado').length;
  const ingresoTotal = pagos
    .filter(p => p.estado === 'completado')
    .reduce((sum, p) => sum + Number(p.monto), 0);

  const stats = [
    {
      title: "Empresas Activas",
      value: loadingEmpresas ? "..." : empresasActivas,
      icon: Building2,
      description: `de ${empresas.length} totales`,
    },
    {
      title: "Membresías Activas",
      value: loadingMembresias ? "..." : membresiasActivas,
      icon: FileText,
      description: `de ${membresias.length} totales`,
    },
    {
      title: "Pagos Completados",
      value: loadingPagos ? "..." : pagosCompletados,
      icon: CreditCard,
      description: `de ${pagos.length} totales`,
    },
    {
      title: "Ingresos Totales",
      value: loadingPagos ? "..." : `$${ingresoTotal.toFixed(2)}`,
      icon: TrendingUp,
      description: "Histórico",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Super Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Panel de control del ecosistema de buses
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Empresas por Estado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Activas:</span>
                <span className="font-medium text-green-600">
                  {empresas.filter(e => e.estado_membresia === 'activa').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Vencidas:</span>
                <span className="font-medium text-red-600">
                  {empresas.filter(e => e.estado_membresia === 'vencida').length}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Suspendidas:</span>
                <span className="font-medium text-yellow-600">
                  {empresas.filter(e => e.estado_membresia === 'suspendida').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span className="text-sm">Sistema operando normalmente</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-sm">{empresas.length} empresas registradas</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500" />
                <span className="text-sm">{membresias.length} membresías gestionadas</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}