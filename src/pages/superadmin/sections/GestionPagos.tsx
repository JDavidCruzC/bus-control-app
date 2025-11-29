import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { usePagos, Pago } from "@/hooks/usePagos";
import { CreditCard, CheckCircle } from "lucide-react";
import { ValidarPagoDialog } from "@/components/superadmin/ValidarPagoDialog";

export function GestionPagos() {
  const { pagos, loading } = usePagos();
  const [estadoFilter, setEstadoFilter] = useState("todos");
  const [validarDialogOpen, setValidarDialogOpen] = useState(false);
  const [selectedPago, setSelectedPago] = useState<Pago | null>(null);

  const filteredPagos = pagos.filter(p => 
    estadoFilter === "todos" || p.estado === estadoFilter
  );

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'completado':
        return <Badge className="bg-green-500">Completado</Badge>;
      case 'pendiente':
        return <Badge className="bg-yellow-500">Pendiente</Badge>;
      case 'fallido':
        return <Badge variant="destructive">Fallido</Badge>;
      case 'reembolsado':
        return <Badge variant="secondary">Reembolsado</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loading) {
    return <div>Cargando pagos...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestión de Pagos</h1>
        <p className="text-muted-foreground mt-2">
          Historial de pagos del ecosistema
        </p>
      </div>

      <div className="flex gap-2">
        <Button 
          variant={estadoFilter === "todos" ? "default" : "outline"}
          onClick={() => setEstadoFilter("todos")}
        >
          Todos
        </Button>
        <Button 
          variant={estadoFilter === "completado" ? "default" : "outline"}
          onClick={() => setEstadoFilter("completado")}
        >
          Completados
        </Button>
        <Button 
          variant={estadoFilter === "pendiente" ? "default" : "outline"}
          onClick={() => setEstadoFilter("pendiente")}
        >
          Pendientes
        </Button>
        <Button 
          variant={estadoFilter === "fallido" ? "default" : "outline"}
          onClick={() => setEstadoFilter("fallido")}
        >
          Fallidos
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredPagos.map((pago) => (
          <Card key={pago.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <CreditCard className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {pago.empresa?.nombre || 'Empresa desconocida'}
                      {getEstadoBadge(pago.estado)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {pago.descripcion || 'Sin descripción'}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${Number(pago.monto).toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">
                    {pago.metodo_pago || 'Sin método'}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-muted-foreground">Fecha de Pago</p>
                  <p className="font-medium">
                    {pago.fecha_pago 
                      ? new Date(pago.fecha_pago).toLocaleDateString()
                      : 'Pendiente'}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Referencia</p>
                  <p className="font-medium">{pago.referencia_pago || 'N/A'}</p>
                </div>
              </div>
              {pago.estado === 'pendiente' && (
                <Button 
                  onClick={() => {
                    setSelectedPago(pago);
                    setValidarDialogOpen(true);
                  }}
                  className="w-full"
                  size="sm"
                >
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Validar Pago
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredPagos.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <CreditCard className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay pagos registrados</p>
          </CardContent>
        </Card>
      )}

      <ValidarPagoDialog 
        open={validarDialogOpen}
        onOpenChange={setValidarDialogOpen}
        pago={selectedPago}
      />
    </div>
  );
}