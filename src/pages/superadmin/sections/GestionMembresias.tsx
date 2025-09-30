import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useMembresias } from "@/hooks/useMembresias";
import { FileText, Plus } from "lucide-react";
import { MembresiaDialog } from "@/components/superadmin/MembresiaDialog";

export function GestionMembresias() {
  const { membresias, loading } = useMembresias();
  const [dialogOpen, setDialogOpen] = useState(false);

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'activa':
        return <Badge className="bg-green-500">Activa</Badge>;
      case 'vencida':
        return <Badge variant="destructive">Vencida</Badge>;
      case 'cancelada':
        return <Badge variant="secondary">Cancelada</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  if (loading) {
    return <div>Cargando membresías...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Membresías</h1>
          <p className="text-muted-foreground mt-2">
            Administra los planes de las empresas
          </p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nueva Membresía
        </Button>
      </div>

      <div className="grid gap-4">
        {membresias.map((membresia) => (
          <Card key={membresia.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <FileText className="h-6 w-6 text-primary mt-1" />
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      {membresia.empresa?.nombre || 'Empresa desconocida'}
                      {getEstadoBadge(membresia.estado)}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Plan: {membresia.tipo_plan}
                    </p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Precio</p>
                  <p className="font-medium">${Number(membresia.precio).toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Inicio</p>
                  <p className="font-medium">
                    {new Date(membresia.fecha_inicio).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Fin</p>
                  <p className="font-medium">
                    {new Date(membresia.fecha_fin).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Auto-renovación</p>
                  <p className="font-medium">{membresia.auto_renovacion ? 'Sí' : 'No'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {membresias.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No hay membresías registradas</p>
          </CardContent>
        </Card>
      )}

      <MembresiaDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}